import { WindowBuilder, IpcChannel, WindowEvents } from "../lib"
import path from "path"


export class MyWindow {
    constructor(){

        new WindowBuilder()
        .setup({ width: 400, height:600})
        .file(path.join(__dirname, '../../src/app/index.html'))
        .setup({ webPreferences: { preload: path.join(__dirname, "preload.js")}})

        new IpcChannel()
        .on("ping", (evt, win, dados) => {
            console.log(dados);
            evt.reply("pong", { msg: "pong"});
        })

        new WindowEvents()

    }
}