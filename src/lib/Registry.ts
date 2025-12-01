import { WindowMetadata } from "../electron";

class WindowRegistryService {
  // O WeakMap é privado. Ninguém fora dessa classe toca nele.
  private storage = new WeakMap<Object, WindowMetadata>();

  // Singleton Instance (Padrão Lazy)
  private static instance: WindowRegistryService;

  private constructor() {} // Construtor privado impede "new WindowRegistryService()" fora daqui

  public static getInstance(): WindowRegistryService {
    if (!WindowRegistryService.instance) {
      WindowRegistryService.instance = new WindowRegistryService();
    }
    return WindowRegistryService.instance;
  }

  public register(target: Object, metadata: WindowMetadata): void {
    if (this.storage.has(target)) {
      console.warn(`[Registry] A instância ${target.constructor.name} já foi registrada. Sobrescrevendo.`);
    }
    this.storage.set(target, metadata);
  }

  public get(target: Object): WindowMetadata | undefined {
    return this.storage.get(target);
  }

  public has(target: Object): boolean {
    return this.storage.has(target);
  }
  
  public remove(target: Object): void {
      this.storage.delete(target);
  }
}

// Exportamos a instância única, mas agora ela vem de uma classe estruturada
export const Registry = WindowRegistryService.getInstance();