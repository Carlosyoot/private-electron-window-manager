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

    public defaultPreload(): this {

        return this;
    }
}