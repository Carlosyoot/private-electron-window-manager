import { WindowMetadata } from "../declaration";

/**
 * **[INTERNO]** Serviço de Registro (Banco de Dados em Memória).
 * * Este Singleton gerencia o ciclo de vida e as referências cruzadas entre as 
 * classes do usuário e as janelas nativas do Electron.
 * @description
 * Utiliza estratégias de armazenamento híbridas para garantir:
 * 1. **Segurança de Memória**: `WeakMap` permite que o Garbage Collector limpe instâncias não usadas.
 * 2. **Roteamento de IPC**: `idMap` permite descobrir quem enviou uma mensagem baseada no ID nativo.
 * 3. **Broadcast**: `activeInstances` permite iterar sobre janelas abertas (já que WeakMaps não são iteráveis).
 */
class RegistryService {

    /**
     * Mapeamento principal: Instância do Usuário -> Metadados (Native Window + Config).
     * Usa `WeakMap` para evitar memory leaks se o usuário perder a referência da classe.
     */
    private instanceMap = new WeakMap<object, WindowMetadata>();

    /**
     * Mapeamento reverso: WebContents ID (number) -> Instância do Usuário.
     * Essencial para o `WindowController` identificar a origem de eventos IPC.
     */
    private idMap = new Map<number, object>();

    /**
     * Lista de instâncias ativas.
     * Necessário apenas porque `WeakMap` não é iterável, e precisamos disso para o `Router.broadcast`.
     */
    private activeInstances = new Set<object>();

    /**
     * Registra uma nova janela aberta no sistema.
     * Chamado automaticamente pelo `WindowController` após a criação da janela nativa.
     * * @param target A instância da classe do usuário (ex: `new MyWindow()`).
     * @param metadata Os dados vinculados a essa instância (Janela nativa, ID, Config).
     */
    public register(target: object, metadata: WindowMetadata): void {
        this.instanceMap.set(target, metadata);
        // Mapeia o ID numérico para a instância para permitir lookup reverso
        this.idMap.set(metadata.windowId, target);
        this.activeInstances.add(target);
    }

    /**
     * Remove uma janela do registro.
     * Deve ser chamado quando a janela nativa é fechada (`closed`) para limpar referências.
     * * @param target A instância da classe do usuário a ser removida.
     */
    public remove(target: object): void {
        const meta = this.instanceMap.get(target);

        if(meta){
            // Remove o ID do mapa reverso para evitar roteamento para janelas mortas
            this.idMap.delete(meta.windowId);
        }

        this.activeInstances.delete(target);
        // Nota: não precisamos deletar do instanceMap, o WeakMap cuida disso.
    }

    /**
     * Recupera os metadados (Janela Nativa, Config) de uma instância de classe.
     * * @param target A instância da classe do usuário.
     * @returns Os metadados ou `undefined` se não estiver registrada/aberta.
     */
    public get(target: object): WindowMetadata | undefined {
        return this.instanceMap.get(target);
    }

    /**
     * Busca a instância da classe do usuário baseada no ID nativo do Electron (`webContents.id`).
     * Usado internamente pelo Controller para saber quem enviou um IPC.
     * * @param id O ID numérico do WebContents.
     * @returns A instância da classe correspondente ou `undefined`.
     */
    public findByWebContentsId(id: number): object | undefined {
        return this.idMap.get(id);
    }

    /**
     * Retorna metadados de TODAS as janelas ativas registradas.
     * Usado principalmente pelo `Router` para realizar Broadcasts.
     */
    public getAll(): WindowMetadata[] {
        const results: WindowMetadata[] = [];

        this.activeInstances.forEach(inst => {
            const meta = this.get(inst);
            
            if(meta) results.push(meta);
        });

        return results;
    }
}

/**
 * Instância Singleton do Serviço de Registro.
 */
export const Registry = new RegistryService();