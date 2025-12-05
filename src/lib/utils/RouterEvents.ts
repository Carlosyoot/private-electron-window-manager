import { Registry } from "../core/WindowRegistry"; // Ajuste o caminho se necessário
import { WindowRef } from "../types/lib"; // Ajuste o caminho se necessário

/**
 * **[UTILS]** Roteador de Eventos (O "Carteiro").
 * * Responsável por enviar mensagens IPC do Processo Principal (Backend) para as Janelas (Frontend).
 * @description
 * Diferente do `event.reply` (que apenas responde a quem chamou), esta classe permite
 * iniciar a comunicação proativamente ("Push Notifications").
 * Utiliza o `Registry` para encontrar a janela certa sem que você precise gerenciar IDs manualmente.
 */
export class RouterEvents {

    /**
     * Envia uma mensagem para uma janela específica.
     * * @param target O alvo da mensagem.
     * - Se for uma **Classe** (ex: `LoginWindow`), busca a primeira instância dessa classe (útil para Singletons).
     * - Se for uma **Instância** (ex: `const chat1`), envia diretamente para ela.
     * @param channel O nome do canal que o Frontend deve estar ouvindo (via preload).
     * @param data O payload de dados a ser enviado.
     */
    static sendTo(target: WindowRef<any>, channel: string, data: any) {

        let nativeWin;

        if(typeof target === "function"){
            const all = Registry.getAll();
            const found = all.find(meta => meta.instance instanceof target);
            
            nativeWin = found?.nativeWindow;
        }
        else {
            nativeWin = Registry.get(target)?.nativeWindow;
        }

        if(nativeWin && !nativeWin.isDestroyed()) {
            nativeWin.webContents.send(channel, data);
        }
    }

    /**
     * Envia uma mensagem para **TODAS** as janelas ativas da aplicação.
     * * Útil para atualizações globais, como troca de tema, logout de sessão, avisos de sistema, etc.
     *  @param channel O nome do canal.
     * @param data O payload de dados.
     */
    static broadcast(channel: string, data: any){

        Registry.getAll().forEach( meta => {
            if(!meta.nativeWindow.isDestroyed()) {
                meta.nativeWindow.webContents.send(channel, data);
            }
        });
    }
}