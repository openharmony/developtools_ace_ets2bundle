import { int32 } from "@koalaui/common";
export type ResourceId = int32;
export declare class ResourceHolder {
    private static nextResourceId;
    private resources;
    private static _instance;
    static instance(): ResourceHolder;
    hold(resourceId: ResourceId): void;
    release(resourceId: ResourceId): void;
    registerAndHold(resource: object): ResourceId;
    get(resourceId: ResourceId): object;
    has(resourceId: ResourceId): boolean;
}
//# sourceMappingURL=ResourceManager.d.ts.map