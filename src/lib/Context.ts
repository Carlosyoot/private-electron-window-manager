import { WindowConfig } from "../electron";

let pending: WindowConfig | null = null;

export class WindowContext {
  // Uma PILHA (Array) em vez de uma variável única.
  // Isso resolve o problema de instâncias aninhadas ou sobrescritas.
  private static stack: WindowConfig[] = [];

  /**
   * Inicia um novo contexto e coloca no topo da pilha
   */
  public static startNew(initial?: { singleton: boolean }): void {
    const newConfig: WindowConfig = {
      options: {},
      isSingleton: initial?.singleton || false,
      loadStrategy: undefined
    };
    this.stack.push(newConfig);
  }

  /**
   * Atualiza a configuração que está no TOPO da pilha (a atual)
   */
  public static update(partial: Partial<WindowConfig>): void {
    if (this.stack.length === 0) {
      // Proteção contra uso incorreto (chamar .setup() sem new WindowBuilder())
      // Opcional: Criar um fallback ou lançar erro
      this.stack.push({ options: {}, isSingleton: false }); 
    }

    const current = this.stack[this.stack.length - 1]; // Pega o último

    if (partial.options) {
      current.options = { ...current.options, ...partial.options };
    }
    
    // Merge seguro
    Object.assign(current, { 
        ...partial, 
        options: current.options 
    });
  }

  /**
   * Retira a configuração do topo da pilha e entrega para o Controller
   */
  public static pop(): WindowConfig | null {
    if (this.stack.length === 0) return null;
    return this.stack.pop() || null;
  }
  
  // Debug (opcional)
  public static get depth() {
      return this.stack.length;
  }
}