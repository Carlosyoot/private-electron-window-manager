import { app } from "electron";
import { WindowController } from "../lib/lib";
import { MyWindow } from "./MyWindow";

const controller = new WindowController();

app.whenReady().then(() => {
    controller.open(MyWindow)
});