import { WindowContext } from "../core/WindowContext";
import { IpcMsgHandler, IpcInvokeHandler } from "../types/lib";

/**
 * **[TOOLKIT]** Canal de Comunicação IPC (Inter-Process Communication).
 * * Permite definir ouvintes de mensagens (".on") e manipuladores de invocação (".handle")
 * de forma **escopada**.
 * @description
 * Diferente do "ipcMain" nativo do Electron (que ouve globalmente), os eventos definidos aqui
 * são **automaticamente filtrados** pelo "WindowController". O callback só será executado se, 
 * e somente se, a mensagem vier da janela que instanciou este canal.
 * @template T (Opcional) Tipo genérico para tipar o payload esperado nos callbacks.
 * Útil para garantir intellisense no objeto "dados".
 * @example
 * // Definindo que esperamos um objeto com 'id' e 'nome'
 * new IpcChannel<{ id: number, nome: string }>()
 * .on('salvar', (evt, win, dados) => {
 * console.log(dados.nome); // Autocomplete
 * });
 */
export class IpcChannel<T = any> {

    /**
     * Registra um ouvinte para mensagens assíncronas (unidirecionais).
     * Equivalente ao "ipcMain.on", mas seguro e restrito a esta janela.
     * * @param channel O nome do canal (string) que o Frontend deve chamar.
     * @param callback A função a ser executada. Recebe "(event, window, payload)".
     * @returns A própria instância ("this") para permitir encadeamento.
     */
    public on(channel: string, callback: IpcMsgHandler): this {
        
        WindowContext.update({
            ipcEvents: [{channel, callback}]
        });

        return this;
    }

    /**
     * Registra um manipulador para invocações bidirecionais (Request/Response).
     * Equivalente ao "ipcMain.handle". O Frontend aguarda a Promise retornar.
     * * @param channel O nome do canal (string) que o Frontend deve invocar.
     * @param callback A função a ser executada. Deve retornar um valor ou uma Promise.
     * @returns A própria instância ("this") para permitir encadeamento.
     */
    public handle(channel: string, callback: IpcInvokeHandler): this {
        
        WindowContext.update({
            ipcHandlers: [{channel, callback}]
        });

        return this;
    }
}