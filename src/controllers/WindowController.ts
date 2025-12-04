import { BrowserWindow, BrowserWindowConstructorOptions, ipcMain } from 'electron';
import { WindowContext } from '../core/WindowContext';
import { ClassRef, WindowRef } from '../declaration'; // Verifique o caminho
import { Registry } from '../core/WindowRegistry'; // Verifique o caminho

export class WindowController {
  // Ajuste aqui também para garantir consistência
  private singletons = new Map<ClassRef<any>, any>();
  private defaults: BrowserWindowConstructorOptions;

  constructor(config?: { defaults?: BrowserWindowConstructorOptions }) {
    this.defaults = config?.defaults || {};
  }

  // --- CORREÇÃO AQUI ---
  // Adicionamos "extends object" para garantir que T não é um primitivo (number/string)
  public open<T extends object>(WindowItem: ClassRef<T>, options?: { parent?: WindowRef<any>, modal?: boolean }): T {
    
    // 1. Singleton Check
    if (this.singletons.has(WindowItem)) {
      const instance = this.singletons.get(WindowItem);
      const meta = Registry.get(instance);
      if (meta && !meta.nativeWindow.isDestroyed()) {
        meta.nativeWindow.focus();
        return instance;
      }
      this.singletons.delete(WindowItem);
    }

    // 2. Criação
    const instance = new WindowItem();
    const config = WindowContext.pop();

    if (!config) throw new Error(`Classe ${WindowItem.name} não usou WindowBuilder.`);

    // 3. Merge de Opções
    const finalOptions: BrowserWindowConstructorOptions = {
        ...this.defaults,
        ...config.options,
        parent: this.resolveNative(options?.parent),
        modal: options?.modal
    };

    const nativeWin = new BrowserWindow(finalOptions);

    // 4. Load Strategy
    if (config.loadStrategy) config.loadStrategy(nativeWin);

    // 5. Aplica Eventos Nativos
    config.nativeEvents.forEach(({ event, callback, once }) => {
        const handler = (...args: any[]) => callback(args[0], nativeWin, ...args);
        once ? nativeWin.once(event as any, handler) : nativeWin.on(event as any, handler);
    });

    // 6. Aplica IPCs
    const cleanupIPCs: Array<() => void> = [];

    config.ipcEvents.forEach(({ channel, callback }) => {
        const handler = (event: Electron.IpcMainEvent, ...args: any[]) => {
            if (event.sender.id === nativeWin.webContents.id) {
                callback(event, nativeWin, args[0]);
            }
        };
        ipcMain.on(channel, handler);
        cleanupIPCs.push(() => ipcMain.removeListener(channel, handler));
    });

    config.ipcHandlers.forEach(({ channel, callback }) => {
        const handler = (event: Electron.IpcMainInvokeEvent, ...args: any[]) => {
             if (event.sender.id === nativeWin.webContents.id) {
                return callback(event, nativeWin, args[0]);
            }
        };
        ipcMain.handle(channel, handler);
        cleanupIPCs.push(() => ipcMain.removeHandler(channel));
    });

    // 7. Registro
    // AGORA FUNCIONA: O TS sabe que 'instance' é um objeto válido para WeakMap
    Registry.register(instance, { nativeWindow: nativeWin, config, instance });

    if (config.isSingleton) this.singletons.set(WindowItem, instance);

    nativeWin.on('closed', () => {
        cleanupIPCs.forEach(clean => clean());
        Registry.remove(instance);
        if (config.isSingleton) this.singletons.delete(WindowItem);
    });

    return instance;
  }
  
  public globalIpc(channel: string, handler: (e: any, ...args: any[]) => void) {
      ipcMain.on(channel, handler);
  }

  private resolveNative(target?: WindowRef<any>): BrowserWindow | undefined {
      if (!target) return undefined;
      
      if (typeof target === 'function') { // Classe
          const inst = this.singletons.get(target);
          return inst ? Registry.get(inst)?.nativeWindow : undefined;
      } else { // Instância
          // 'target' aqui pode precisar de cast se WindowRef não for estrito, 
          // mas geralmente funciona se for 'object'
          return Registry.get(target)?.nativeWindow;
      }
  }
}