import { app } from "electron";
import { WindowController } from "../lib"; 
import { MyWindow } from "./MyWindow";
import { ModalWindow } from "./ModalWindow";

const controller = new WindowController();

app.whenReady().then(() => {
    const mainWindowInstance = controller.open(MyWindow);

    controller.globalIpc('request-modal', () => {
        
        controller.open(ModalWindow, { 
            parent: mainWindowInstance, 
            modal: true 
        });

    });
});