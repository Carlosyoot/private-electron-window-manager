import { WindowBuilder } from "../lib";
import path from "path";

export class ModalWindow {
    constructor() {
        new WindowBuilder()
            .setup({ 
                width: 300, 
                height: 200, 
                title: "Eu sou o Modal",
                minimizable: false,
                maximizable: false
            })
            .file(path.join(__dirname, '../../src/app/index.html'))
            .setup({ webPreferences: { preload: path.join(__dirname, "preload.js") } });
    }
}