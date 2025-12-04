import { WindowContext } from "../core/WindowContext";
import { NativeEventHandler } from "../declaration";

export class WindowEvents {

    public on(event: string, callback: NativeEventHandler): this {

        WindowContext.update({
            nativeEvents: [{ event, callback, once: false}]
        });

        return this;
    }

    public once(event: string, callback: NativeEventHandler): this {

        WindowContext.update({
            nativeEvents: [{event, callback, once: true}]
        });

        return this;
    }
}