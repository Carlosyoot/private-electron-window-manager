import { WindowBuilder, IpcChannel } from "../lib/lib"
import path from "path"


export class MyWindow {
    constructor(){

        new WindowBuilder()
        .setup({ width: 400, height:600})
        .file(path.join(__dirname, 'index.html'))
        .setup({ webPreferences: { preload: path.join(__dirname, "preload.js")}})

        const ipc = new IpcChannel();

        ipc.on("ping", (evt,win, dados) => {

            console.log(dados);

            evt.reply("pong", { msg: "pong"});

        });
    }
}