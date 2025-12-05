import { BrowserWindow, BrowserWindowConstructorOptions, ipcMain } from 'electron';
import { WindowContext } from '../core/WindowContext';
import { ClassRef, WindowConfig, WindowRef } from '../declaration'; // Ajuste conforme seu arquivo de tipos
import { Registry } from '../core/WindowRegistry';

/**
 * **[CONTROLLER]** Maestro de Janelas.
 * * Responsável por orquestrar a criação, configuração, eventos e ciclo de vida das janelas.
 * @description
 * Atua como o ponto central da biblioteca. Ele lê as configurações definidas pelos Builders,
 * cria as janelas nativas do Electron, aplica as estratégias de segurança (IPC escopado)
 * e gerencia o registro de instâncias para permitir o roteamento.
 */
export class WindowController {
  /** Mapa de instâncias Singleton ativas (Classe -> Instância). */
  private singletons = new Map<ClassRef<any>, any>();
  
  /** Configurações padrão aplicadas a todas as janelas (ex: ícone, cor de fundo). */
  private defaults: BrowserWindowConstructorOptions;

  /**
   * Cria uma nova instância do controlador.
   * @param config Configurações globais opcionais.
   */
  constructor(config?: { defaults?: BrowserWindowConstructorOptions }) {
    this.defaults = config?.defaults || {};
  }

  /**
   * Abre uma nova janela ou foca uma existente (se Singleton).
   * @template T O tipo da classe da janela.
   * @param WindowItem A Classe da janela a ser instanciada (ex: "LoginWindow").
   * @param options Opções de abertura (Parent, Modal).
   * @returns A instância da classe da janela.
   */
  public open<T extends object>(WindowItem: ClassRef<T>, options?: { parent?: WindowRef<any>, modal?: boolean }): T {
    
    const existing = this.resolveSingleton(WindowItem);
    if (existing) return existing;

    const { instance, config } = this.instantiateWindow(WindowItem);

    const nativeWin = this.createNativeWindow(config, options);
    const windowId = nativeWin.webContents.id;

    this.applyLoadStrategy(nativeWin, config);
    this.bindNativeEvents(nativeWin, config);
    
    const cleanupIpc = this.bindIpcEvents(nativeWin, windowId, config);

    this.registerLifecycle(instance, WindowItem, nativeWin, config, cleanupIpc);

    return instance;
  }

  /**
   * Registra um ouvinte de IPC Global (não escopado a uma janela específica).
   * Útil para eventos de sistema ou menu.
   */
  public globalIpc(channel: string, handler: (e: any, ...args: any[]) => void) {
    ipcMain.on(channel, handler);
  }

  /** Verifica se a classe é Singleton e já possui instância ativa. */
  private resolveSingleton<T>(WindowItem: ClassRef<T>): T | null {
    if (this.singletons.has(WindowItem)) {
      const instance = this.singletons.get(WindowItem);
      const meta = Registry.get(instance);
      
      if (meta && !meta.nativeWindow.isDestroyed()) {
        meta.nativeWindow.focus();
        return instance;
      }
      
      this.singletons.delete(WindowItem);
    }
    return null;
  }

  /** Instancia a classe do usuário e captura a configuração do Contexto. */
  private instantiateWindow<T>(WindowItem: ClassRef<T>): { instance: T, config: WindowConfig } {
    const instance = new WindowItem();

    const config = WindowContext.pop();

    if (!config) {
      throw new Error("A classe ${WindowItem.name} não utilizou 'new WindowBuilder()' no construtor.");
    }

    return { instance, config };
  }

  /** Cria a BrowserWindow nativa mesclando todas as opções. */
  private createNativeWindow(config: WindowConfig, options?: { parent?: WindowRef<any>, modal?: boolean }): BrowserWindow {
    const finalOptions: BrowserWindowConstructorOptions = {
      ...this.defaults,
      ...config.options,
      parent: this.resolveNative(options?.parent),
      modal: options?.modal
    };
    return new BrowserWindow(finalOptions);
  }

  /** Carrega o arquivo ou URL definido. */
  private applyLoadStrategy(nativeWin: BrowserWindow, config: WindowConfig) {
    if (config.loadStrategy) {
        config.loadStrategy(nativeWin);
    }
  }

  /** Vincula os eventos nativos (resize, close) definidos no WindowEvents. */
  private bindNativeEvents(nativeWin: BrowserWindow, config: WindowConfig) {
    config.nativeEvents.forEach(({ event, callback, once }) => {

      const handler = (...args: any[]) => callback(args[0], nativeWin, ...args);
      once ? nativeWin.once(event as any, handler) : nativeWin.on(event as any, handler);
    });
  }

  /** * Registra os listeners de IPC no Main Process.
   * Adiciona o filtro de segurança (Sender ID Check).
   * Retorna uma função para remover os listeners quando a janela fechar.
   */
  private bindIpcEvents(nativeWin: BrowserWindow, windowId: number, config: WindowConfig): () => void {
    const cleaners: Array<() => void> = [];

    config.ipcEvents.forEach(({ channel, callback }) => {
      const handler = async (event: Electron.IpcMainEvent, ...args: any[]) => {
        if (event.sender.id !== windowId) return;

        try {
          const payload = args.length > 0 ? args[0] : undefined;
          await callback(event, nativeWin, payload);
        } catch (error) {
          console.error("Erro no IPC '${channel}' da janela ${windowId}:", error);
        }
      };

      ipcMain.on(channel, handler);
      cleaners.push(() => ipcMain.removeListener(channel, handler));
    });

    config.ipcHandlers.forEach(({ channel, callback }) => {
      const handler = async (event: Electron.IpcMainInvokeEvent, ...args: any[]) => {
        if (event.sender.id !== windowId) return;

        try {
          const payload = args.length > 0 ? args[0] : undefined;
          return await callback(event, nativeWin, payload);
        } catch (error) {
          console.error("Erro no Handler '${channel}' da janela ${windowId}:", error);
          throw error;
        }
      };

      ipcMain.handle(channel, handler);
      cleaners.push(() => ipcMain.removeHandler(channel));
    });

    return () => cleaners.forEach(c => c());
  }

  /** Gerencia o registro no banco de dados interno e a limpeza no fechamento. */
  private registerLifecycle(
      instance: any, 
      ClassRef: any, 
      nativeWin: BrowserWindow, 
      config: WindowConfig, 
      cleanupIpc: () => void
  ) {
      const windowId = nativeWin.webContents.id;

      Registry.register(instance, { nativeWindow: nativeWin, windowId, config, instance });

      if (config.isSingleton) {
          this.singletons.set(ClassRef, instance);
      }

      nativeWin.on('closed', () => {
          cleanupIpc();
          Registry.remove(instance);
          
          if (config.isSingleton) {
              this.singletons.delete(ClassRef);
          }
      });
  }

  /** Helper para resolver referências (Classe ou Instância) para a Janela Nativa. */
  private resolveNative(target?: WindowRef<any>): BrowserWindow | undefined {
    if (!target) return undefined;
    
    if (typeof target === 'function') { 
        const inst = this.singletons.get(target);
        return inst ? Registry.get(inst)?.nativeWindow : undefined;
    } else { 
        return Registry.get(target as object)?.nativeWindow;
    }
  }
}