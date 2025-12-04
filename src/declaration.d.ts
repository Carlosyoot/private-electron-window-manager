import { BrowserWindow, BrowserWindowConstructorOptions, IpcMainEvent, IpcMainInvokeEvent } from "electron";


export type ClassRef<T> = new(...args: any[]) => T;
export type WindowRef<T> = ClassRef<T> | T;
export type NativeEventHandler = (event: any, win: BrowserWindow, ...args: any[]) => void;
export type IpcMsgHandler = (event: IpcMainEvent, win: BrowserWindow, payload: any) => void;
export type IpcInvokeHandler = (event: IpcMainInvokeEvent, win: BrowserWindow, payload: any) => Promise<any> | any;
export type LoadStrategy = (win: BrowserWindow) => void;


export interface WindowConfig {
    options: BrowserWindowConstructorOptions;
    loadStrategy?: LoadStrategy;
    isSingleton: boolean;

    nativeEvents: Array<{ event: string, callback: NativeEventHandler, once: boolean}>;
    ipcEvents: Array<{ channel: string, callback: IpcMsgHandler}>;
    ipcHandlers: Array<{ channel: string, callback: IpcInvokeHandler}>;
}

export interface WindowMetadata {
    nativeWindow: BrowserWindow;
    config: WindowConfig;
    instance: any;
}
