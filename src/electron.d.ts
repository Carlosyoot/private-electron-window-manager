import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';

// Tipos utilitários
export type ClassRef<T> = new (...args: any[]) => T;
export type WindowRef<T> = ClassRef<T> | T; // Pode ser a Classe ou a Instância
export type LoadStrategy = (window: BrowserWindow) => void;

// O estado que o Builder gera
export interface WindowConfig {
  options: BrowserWindowConstructorOptions;
  loadStrategy?: LoadStrategy;
  isSingleton: boolean; // O flag crucial
}

// O que guardamos no "Cofre" sobre cada janela aberta
export interface WindowMetadata {
  nativeWindow: BrowserWindow;
  config: WindowConfig;
}