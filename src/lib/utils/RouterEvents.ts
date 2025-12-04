import { Registry } from "../core/WindowRegistry";
import { WindowRef } from "../declaration";

export class RouterEvents {

    static sendTo(target: WindowRef<any>, channel: string, data: any){

        let nativeWin;

        if(typeof target === "function"){

            const all = Registry.getAll();
            const found = all.find(meta => meta.instance instanceof target);
            
            nativeWin = found?.nativeWindow;
        }

        else {
            nativeWin = Registry.get(target)?.nativeWindow;
        }

        if(nativeWin && !nativeWin.isDestroyed()) {
            nativeWin.webContents.send(channel,data);
        }
    }

    static broadcast(channel: string, data: any){

        Registry.getAll().forEach( meta => {
            if(!meta.nativeWindow.isDestroyed()) {
                meta.nativeWindow.webContents.send(channel,data);
            }
        });
    }
}