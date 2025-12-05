import { WindowContext } from "../core/WindowContext";
import { NativeEventHandler } from "../types/lib";

/**
 * **[TOOLKIT]** Gerenciador de Eventos Nativos.
 * * Responsável por registrar ouvintes para eventos do ciclo de vida da "BrowserWindow" 
 * (ex: 'resize', 'close', 'blur', 'ready-to-show').
 * @description
 * Diferente do "IpcChannel", estes eventos não vêm do Frontend. Eles vêm do próprio 
 * sistema operacional ou do processo Main do Electron.
 * * O callback registrado receberá a instância da janela como segundo argumento, 
 * permitindo manipulação direta (ex: "win.hide()", "win.setProgressBar()").
 * @example
 * new WindowEvents()
 * .on('close', (event, win) => {
 * event.preventDefault(); // Impede o fechamento
 * win.hide(); // Esconde a janela
 * })
 */
export class WindowEvents {

    /**
     * Registra um ouvinte persistente para um evento nativo.
     * O callback será executado toda vez que o evento ocorrer.
     * * @param event O nome do evento nativo do Electron (ex: 'resize', 'focus').
     * @param callback Função a ser executada. Recebe "(event, win, ...args)".
     * @returns A própria instância ("this") para permitir encadeamento.
     */
    public on(event: string, callback: NativeEventHandler): this {

        WindowContext.update({
            nativeEvents: [{ event, callback, once: false}]
        });

        return this;
    }

    /**
     * Registra um ouvinte de execução única.
     * O callback será executado apenas na primeira vez que o evento ocorrer e depois removido.
     * Útil para eventos de inicialização como 'ready-to-show'.
     * * @param event O nome do evento nativo.
     * @param callback Função a ser executada. Recebe "(event, win, ...args)".
     * @returns A própria instância ("this") para permitir encadeamento.
     */
    public once(event: string, callback: NativeEventHandler): this {

        WindowContext.update({
            nativeEvents: [{event, callback, once: true}]
        });

        return this;
    }
}