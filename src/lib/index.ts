/**
 * **Electron Window Manager Lib**
 * * Uma biblioteca opinativa para gerenciamento de janelas, eventos e IPCs no Electron.
 * * @module ElectronWindowManager
 * @author Seu Nome/Empresa
 * @version 1.0.0
 * * @example
 * // Uso Básico
 * import { WindowController, WindowBuilder } from 'minha-lib';
 * * const controller = new WindowController();
 * controller.open(MyWindow);
 */

export { WindowBuilder } from './toolkit/WindowBuilder';
export { WindowEvents } from './toolkit/WindowEvents';
export { IpcChannel } from './toolkit/IpcChannel';

export { WindowController } from './controllers/WindowController';

export { RouterEvents as WindowRouter } from './utils/RouterEvents'; 

export type { 
    IpcMsgHandler, 
    IpcInvokeHandler, 
    NativeEventHandler, 
    WindowRef,
    ClassRef
} from './declaration';