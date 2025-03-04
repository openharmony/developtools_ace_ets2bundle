import { int32 } from "@koalaui/compat";
export type KoalaCallsiteKey = int32;
export declare class KoalaCallsiteKeys {
    static readonly empty: KoalaCallsiteKey;
    static combine(key1: KoalaCallsiteKey, key2: KoalaCallsiteKey): KoalaCallsiteKey;
    static asString(key: KoalaCallsiteKey): string;
}
//# sourceMappingURL=koalaKey.d.ts.map