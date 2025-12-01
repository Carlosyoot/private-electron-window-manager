import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
// Importamos a CLASSE WindowContext, não mais o objeto Context
import { WindowContext } from './Context'; 

export class WindowBuilder {
  
  constructor(options?: { singleton: boolean }) {
    // Inicia um novo item na Pilha (Stack)
    WindowContext.startNew({ singleton: options?.singleton || false });
  }

  public setup(opts: BrowserWindowConstructorOptions): this {
    // Atualiza o item que está no TOPO da pilha
    WindowContext.update({ options: opts });
    return this;
  }

  // --- Estratégias de Carregamento ---

  public file(path: string): void {
    WindowContext.update({
      loadStrategy: (win) => win.loadFile(path)
    });
  }

  public url(url: string): void {
    WindowContext.update({
      loadStrategy: (win) => win.loadURL(url)
    });
  }

  public handle(callback: (win: BrowserWindow) => void): void {
    WindowContext.update({ loadStrategy: callback });
  }
}