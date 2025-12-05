import { WindowConfig } from "../types/lib";

/**
 * **[INTERNO]** Gerenciador de Contexto (Pilha de Configuração).
 * * Esta classe atua como um buffer temporário ("Hot Potato") que armazena as configurações
 * definidas pelos Builders ("WindowBuilder", "IpcChannel", "WindowEvents") dentro do construtor
 * de uma classe de Janela.
 * @description
 * Funciona como uma **Pilha (Stack)** para suportar instâncias aninhadas ou criações múltiplas,
 * embora o caso de uso comum seja uma configuração por vez.
 * * O ciclo de vida é:
 * 1. "startNew()": Chamado ao instanciar "new WindowBuilder()".
 * 2. "update()": Chamado pelos métodos fluentes (".setup()", ".on()", etc).
 * 3. "pop()": Chamado pelo "WindowController" para recuperar a config finalizada.
 */
export class WindowContext {
    /**
     * Pilha de configurações em construção.
     * O último elemento é sempre a janela que está sendo configurada no momento.
     */
    private static stack: WindowConfig[] = [];

    /**
     * Inicia um novo ciclo de configuração.
     * Deve ser chamado no início do construtor do "WindowBuilder".
     * * @param initial Configurações iniciais opcionais (ex: definir se é Singleton logo no início).
     */
    public static startNew(initial?: { singleton: boolean}): void {
        this.stack.push({
            options: {},
            // Nota: Se 'singleton' não for passado, aqui está definindo como true por padrão.
            // Se a intenção for 'false' por padrão, altere para: initial?.singleton || false
            isSingleton: initial?.singleton || true, 
            nativeEvents: [],
            ipcEvents: [],
            ipcHandlers: []
        });
    }

    /**
     * Atualiza a configuração que está atualmente no topo da pilha.
     * Realiza o merge inteligente de opções e adiciona eventos aos arrays.
     * * @param partial Um objeto parcial contendo apenas os campos que devem ser atualizados.
     */
    public static update(partial: Partial<WindowConfig>): void {
        // Fallback de segurança: Se o usuário chamar um método de builder
        // sem ter instanciado o WindowBuilder (stack vazia), criamos um novo contexto.
        if(this.stack.length === 0){
            this.startNew();
        }

        // Pega a configuração atual (Topo da pilha)
        const current = this.stack[this.stack.length - 1];

        // Merge de Opções do Electron (ex: width, height)
        if(partial.options){
            current.options = { ...current.options, ...partial.options };
        }

        // Adição de Eventos às listas existentes
        if (partial.nativeEvents) current.nativeEvents.push(...partial.nativeEvents);
        if (partial.ipcEvents) current.ipcEvents.push(...partial.ipcEvents);
        if (partial.ipcHandlers) current.ipcHandlers.push(...partial.ipcHandlers);

        // Define a estratégia de carregamento (URL ou Arquivo)
        if (partial.loadStrategy) current.loadStrategy = partial.loadStrategy;
    }

    /**
     * Finaliza o ciclo de configuração e retorna o objeto completo.
     * Remove a configuração da pilha.
     * * @returns A configuração completa da janela ("WindowConfig") ou "null" se a pilha estiver vazia.
     */
    public static pop(): WindowConfig | null {
        return this.stack.pop() || null;
    }
}