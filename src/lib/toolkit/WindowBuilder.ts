import { BrowserWindowConstructorOptions } from "electron";
import { WindowContext } from "../core/WindowContext";

export class WindowBuilder{

    constructor(options?: { singleton: boolean}){
        WindowContext.startNew(options);
    }

    public setup(options: BrowserWindowConstructorOptions): this {
        WindowContext.update({ options });
        return this;
    }

    public file(path: string): this {
        WindowContext.update({
            loadStrategy: (win) => win.loadFile(path)
        });

        return this;
    }

    public url(url: string): this {
        WindowContext.update({
            loadStrategy: (win) => win.loadURL(url)
        });

        return this;
    }

    public defaultPreload(): this {

        return this;
    }
}