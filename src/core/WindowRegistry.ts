import { WindowMetadata } from "../declaration";

class RegistryService{

    // Map for windowObjects // security with memoryLeak
    private instanceMap = new WeakMap<object, WindowMetadata>();

    //private Ids for active Objects
    private idMap = new Map<number,object>();

    private activeInstances = new Set<object>();

    public register(target: object, metadata: WindowMetadata): void {
        this.instanceMap.set(target, metadata);
        this.idMap.set(metadata.nativeWindow.webContents.id, target);
        this.activeInstances.add(target);
    }

    public remove(target: object): void {
        const meta = this.instanceMap.get(target);

        if(meta){
            this.idMap.delete(meta.nativeWindow.webContents.id);
        }

        this.activeInstances.delete(target);
    }

    public get(target: object): WindowMetadata | undefined {
        return this.instanceMap.get(target);
    }

    public findByWebContentsId(id: number): object | undefined {
        return this.idMap.get(id);
    }

    public getAll(): WindowMetadata[] {

        const results: WindowMetadata[] = [];

        this.activeInstances.forEach(inst => {
            const meta = this.get(inst);
            
            if(meta) results.push(meta);
        });

        return results;
    }
}

export const Registry = new RegistryService();