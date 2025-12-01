import { WindowBuilder } from "../lib/WindowBuilder";

// windows/ConfigWindow.ts (SINGLETON)
export class ConfigWindow {
  constructor() {
    // Singleton definido aqui!
    const win = new WindowBuilder({ singleton: true }); 
    win.setup({ title: "Configurações", width: 400 });
    win.file('config.html');
  }
}

// windows/ChatWindow.ts (MULTI-INSTÂNCIA)
export class ChatWindow {
  constructor() {
    // Sem singleton!
    const win = new WindowBuilder(); 
    win.setup({ width: 600, height: 800 });
    win.file('chat.html');
  }
}

// windows/ViewerWindow.ts (FILHA/MODAL)
export class ViewerWindow {
  constructor() {
    const win = new WindowBuilder();
    win.file('image-viewer.html');
  }
}