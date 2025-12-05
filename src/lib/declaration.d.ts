import { BrowserWindow, BrowserWindowConstructorOptions, IpcMainEvent, IpcMainInvokeEvent } from "electron";

/**
 * Representa o construtor de uma Classe.
 * Usado pelo Controller para instanciar janelas dinamicamente.
 * * @template T O tipo da classe.
 */
export type ClassRef<T> = new(...args: any[]) => T;

/**
 * Uma referência flexível a uma janela.
 * Pode ser a **Definição da Classe** (usada para Singletons ou criação) 
 * ou a **Instância** específica (usada para manipular janelas abertas).
 */
export type WindowRef<T> = ClassRef<T> | T;

/**
 * Assinatura do callback para eventos nativos da janela (ex: 'resize', 'close').
 * * @param event O evento nativo do Electron.
 * @param win A instância da "BrowserWindow" que disparou o evento.
 * @param args Argumentos adicionais fornecidos pelo Electron.
 */
export type NativeEventHandler = (event: any, win: BrowserWindow, ...args: any[]) => void;

/**
 * Assinatura do callback para mensagens IPC unidirecionais ("ipcRenderer.send").
 * * @param event O evento IPC nativo.
 * @param win A instância da "BrowserWindow" que enviou a mensagem (identificada automaticamente pela lib).
 * @param payload Os dados enviados pelo Frontend (o primeiro argumento).
 */
export type IpcMsgHandler = (event: IpcMainEvent, win: BrowserWindow, payload: any) => void;

/**
 * Assinatura do callback para invocações IPC bidirecionais ("ipcRenderer.invoke").
 * Deve retornar um valor ou uma Promise que será enviada de volta ao Frontend.
 * * @param event O evento IPC nativo.
 * @param win A instância da "BrowserWindow" que invocou.
 * @param payload Os dados enviados pelo Frontend.
 */
export type IpcInvokeHandler = (event: IpcMainInvokeEvent, win: BrowserWindow, payload: any) => Promise<any> | any;

/**
 * Função responsável por carregar o conteúdo na janela (URL ou Arquivo).
 */
export type LoadStrategy = (win: BrowserWindow) => void;

/**
 * **[INTERNO]** Configuração acumulada pelos Builders ("WindowBuilder", "IpcChannel", "WindowEvents").
 * * Este objeto armazena todas as definições feitas no construtor da classe da janela
 * antes da janela nativa ser efetivamente criada.
 */
export interface WindowConfig {
    /** Opções visuais passadas para o construtor do "BrowserWindow" (width, height, frame, etc). */
    options: BrowserWindowConstructorOptions;
    
    /** Estratégia de carregamento definida (ex: .file() ou .url()). */
    loadStrategy?: LoadStrategy;
    
    /** Define se a janela deve ter apenas uma instância ativa. */
    isSingleton: boolean;

    /** Lista de eventos nativos a serem registrados na criação. */
    nativeEvents: Array<{ event: string, callback: NativeEventHandler, once: boolean}>;
    
    /** Lista de canais IPC (on) a serem registrados. */
    ipcEvents: Array<{ channel: string, callback: IpcMsgHandler}>;
    
    /** Lista de handlers IPC (handle/invoke) a serem registrados. */
    ipcHandlers: Array<{ channel: string, callback: IpcInvokeHandler}>;
}

/**
 * **[INTERNO]** Metadados armazenados no "Registry".
 * * Vincula a instância da classe do usuário à janela nativa do Electron e suas configurações.
 */
export interface WindowMetadata {
    /** A janela real do Electron. */
    nativeWindow: BrowserWindow;
    
    /** O ID numérico da janela (webContents.id), usado para roteamento seguro mesmo após fechamento. */
    windowId: number;
    
    /** A configuração original usada para criar esta janela. */
    config: WindowConfig;
    
    /** A instância da classe definida pelo usuário (ex: "new MyWindow()"). */
    instance: any;
}