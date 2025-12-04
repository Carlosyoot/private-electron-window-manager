import { WindowContext } from "../core/WindowContext";
import { IpcMsgHandler, IpcInvokeHandler } from "../declaration";

export class IpcChannel<T = any> {

    public on(channel: string, callback: IpcMsgHandler): this {
        
        WindowContext.update({
            ipcEvents: [{channel, callback}]
        });

        return this;
    }

    public handle(channel: string, callback: IpcInvokeHandler): this {
        
        WindowContext.update({
            ipcHandlers: [{channel,callback}]
        });

        return this;
    }
}