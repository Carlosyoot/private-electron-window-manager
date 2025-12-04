import { WindowConfig } from "../declaration";

export class WindowContext {
    private static stack: WindowConfig[] = [];

    //Init a new configuration cycle
    public static startNew(initial?: { singleton: boolean}): void {
        this.stack.push({
            options: {},
            isSingleton: initial?.singleton || true,
            nativeEvents: [],
            ipcEvents: [],
            ipcHandlers: []
        });
    }

    //Method to update partial at Top of stack
    public static update(partial: Partial<WindowConfig>): void {
        if(this.stack.length === 0){
            this.startNew();
        }

        const current = this.stack[this.stack.length - 1];

        if(partial.options){
            current.options = { ...current.options, ...partial.options };
        }

        if (partial.nativeEvents) current.nativeEvents.push(...partial.nativeEvents);
        if (partial.ipcEvents) current.ipcEvents.push(...partial.ipcEvents);
        if (partial.ipcHandlers) current.ipcHandlers.push(...partial.ipcHandlers);

        if (partial.loadStrategy) current.loadStrategy = partial.loadStrategy;
    }

    public static pop(): WindowConfig | null {
        return this.stack.pop() || null;
    }

}