import { BrowserWindowConstructorOptions } from "electron";
import { WindowContext } from "../core/WindowContext";

/**
 * **[TOOLKIT]** Construtor Visual da Janela.
 * * Responsável por definir a aparência ("BrowserWindowOptions") e o conteúdo 
 * (Arquivo/URL) da janela.
 *  @description
 * Ao instanciar esta classe, um novo ciclo de configuração é iniciado no "WindowContext".
 * Todos os métodos retornam "this" para permitir uma interface fluente (encadeamento).
 * @example
 * new WindowBuilder({ singleton: true })
 * .setup({ width: 800, height: 600, frame: false })
 * .file('index.html');
 */
export class WindowBuilder {

    /**
     * Inicia a construção de uma nova janela.
     * * @param options Configurações iniciais de comportamento.
     * @param options.singleton Se "true", o Controller impedirá a criação de múltiplas instâncias
     * desta classe, apenas focando a janela existente se ela já estiver aberta.
     */
    constructor(options?: { singleton: boolean}){
        WindowContext.startNew(options);
    }

    /**
     * Define opções nativas do Electron para a "BrowserWindow".
     * * @param options Objeto de configuração padrão do Electron (width, height, webPreferences, etc).
     * As opções são mescladas com os padrões globais definidos no "WindowController".
     * @returns A própria instância ("this").
     */
    public setup(options: BrowserWindowConstructorOptions): this {
        WindowContext.update({ options });
        return this;
    }

    /**
     * Define que a janela deve carregar um arquivo local (HTML).
     * Ideal para produção ou builds estáticos.
     * * @param path Caminho relativo ou absoluto para o arquivo HTML.
     * @returns A própria instância ("this").
     */
    public file(path: string): this {
        WindowContext.update({
            loadStrategy: (win) => win.loadFile(path)
        });

        return this;
    }

    /**
     * Define que a janela deve carregar uma URL externa ou servidor local.
     * Ideal para desenvolvimento (ex: "http://localhost:3000") ou carregamento de sites remotos.
     * * @param url A URL completa a ser carregada.
     * @returns A própria instância ("this").
     */
    public url(url: string): this {
        WindowContext.update({
            loadStrategy: (win) => win.loadURL(url)
        });

        return this;
    }

    /**
     * **[ATALHO]** Injeta automaticamente o script de Preload padrão da biblioteca.
     * * Este script expõe a API segura necessária para usar IPCs e Eventos no Frontend 
     * sem configuração manual.
     *  @returns A própria instância ("this").
     */
    public defaultPreload(): this {
        // TODO: Implementar a lógica de apontar para o arquivo preload interno da lib
        return this;
    }
}