import { BrowserWindow } from 'electron';
import { WindowContext } from './Context'; // Classe Estática
import { Registry } from './Registry';     // Instância do Serviço
import { ClassRef, WindowRef } from '../electron'; // Ajuste seus imports de tipos aqui

export class WindowController {
  
  private singletons = new Map<ClassRef<any>, any>();

  // --- MÉTODOS PÚBLICOS ---

  public open<T>(WindowItem: ClassRef<T>, options?: { parent?: WindowRef<any>, modal?: boolean }): T {
    
    // 1. Check de Singleton
    if (this.singletons.has(WindowItem)) {
      const instance = this.singletons.get(WindowItem);
      // Registry agora é um serviço, usamos .get()
      const meta = Registry.get(instance); 
      
      if (meta && !meta.nativeWindow.isDestroyed()) {
        meta.nativeWindow.focus();
        return instance;
      }
      this.singletons.delete(WindowItem);
    }

    // 2. Instanciação e Captura (Stack Logic)
    // Ao dar 'new', o Builder empilha a config no WindowContext
    const instance = new WindowItem();
    
    // Recuperamos a config do topo da pilha e removemos ela de lá
    const config = WindowContext.pop();

    if (!config) {
      throw new Error(`A classe ${WindowItem.name} não instanciou um 'new WindowBuilder()'`);
    }

    // 3. Resolução do Pai
    let parentNative: BrowserWindow | undefined;
    if (options?.parent) {
      parentNative = this.resolveNativeWindow(options.parent);
      if (!parentNative) {
        console.warn("Janela pai não encontrada ou fechada.");
      }
    }

    // 4. Criação Nativa
    const nativeWin = new BrowserWindow({
      ...config.options,
      parent: parentNative,
      modal: options?.modal
    });

    // 5. Executa Estratégia de Load
    if (config.loadStrategy) {
      config.loadStrategy(nativeWin);
    }

    // 6. Registros
    // Usamos o método .register() definido na sua nova classe de serviço
    Registry.register(instance, { nativeWindow: nativeWin, config });

    if (config.isSingleton) {
      this.singletons.set(WindowItem, instance);
    }

    // Limpeza
    nativeWin.on('closed', () => {
      if (config.isSingleton) {
        this.singletons.delete(WindowItem);
      }
      // Opcional: Se quiser limpar explicitamente do Registry Service
      // Registry.remove(instance); 
      // Mas como é WeakMap, o GC cuida disso se a instância morrer.
    });

    return instance;
  }

  public send(target: WindowRef<any>, channel: string, ...args: any[]) {
    const native = this.resolveNativeWindow(target);
    if (native && !native.isDestroyed()) {
      native.webContents.send(channel, ...args);
    } else {
      console.warn("Tentou enviar IPC para uma janela inexistente.");
    }
  }

  public close(target: WindowRef<any>) {
    const native = this.resolveNativeWindow(target);
    native?.close();
  }

  // --- RESOLVEDOR DE AMBIGUIDADE ---
  
  private resolveNativeWindow(ref: WindowRef<any>): BrowserWindow | null {
    // Caso 1: Instância
    if (typeof ref === 'object') {
      const meta = Registry.get(ref);
      return meta ? meta.nativeWindow : null;
    }

    // Caso 2: Classe (Singleton)
    if (typeof ref === 'function') {
      if (this.singletons.has(ref)) {
        const instance = this.singletons.get(ref);
        const meta = Registry.get(instance);
        return meta ? meta.nativeWindow : null;
      }
      
      throw new Error(
        `Ambiguidade ou Erro: A classe ${ref.name} não é um Singleton ativo.`
      );
    }

    return null;
  }
}