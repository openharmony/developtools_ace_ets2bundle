/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { KNativePointer } from "@koalaui/interop";
import { AstNode, Es2pandaAstNodeType, factory, unpackString } from "./arkts-api";
import { global } from "./arkts-api/static/global";

// Improve: this should actually belong to plugin contexts, not to libarkts

export interface AstNodeCacheValue {
    peer: KNativePointer;
    type: Es2pandaAstNodeType;
    metadata?: AstNodeCacheValueMetadata;
}

export interface AstNodeCacheValueMetadata {
    callName?: string;
    hasReceiver?: boolean;
    isSetter?: boolean;
    isGetter?: boolean;
    forbidTypeRewrite?: boolean;
    isWithinTypeParams?: boolean;
    hasMemoSkip?: boolean;
    hasMemoIntrinsic?: boolean;
    hasMemoEntry?: boolean;
}

export class MemoNodeCache {
    private _isCollected: boolean = false;
    private cacheMap: Map<KNativePointer, AstNodeCacheValue>;
    private static instance: MemoNodeCache;
    static disableMemoNodeCache = false;

    private constructor() {
        this.cacheMap = new Map();
    }

    static getInstance(): MemoNodeCache {
        if (!this.instance) {
            this.instance = new MemoNodeCache();
        }
        if (this.disableMemoNodeCache) {
            return this.instance
        }

        // Please provide the another way to force cache update on when node updates
        wrapFuncWithNodeCache(this.instance, "updateArrowFunctionExpression")
        wrapFuncWithNodeCache(this.instance, "updateBreakStatement")
        wrapFuncWithNodeCache(this.instance, "updateCallExpression")
        wrapFuncWithNodeCache(this.instance, "updateClassProperty")
        wrapFuncWithNodeCache(this.instance, "updateETSFunctionType")
        wrapFuncWithNodeCache(this.instance, "updateETSParameterExpression")
        wrapFuncWithNodeCache(this.instance, "updateETSUnionType")
        wrapFuncWithNodeCache(this.instance, "updateIdentifier")
        wrapFuncWithNodeCache(this.instance, "updateMethodDefinition")
        wrapFuncWithNodeCache(this.instance, "updateProperty")
        wrapFuncWithNodeCache(this.instance, "updateReturnStatement")
        wrapFuncWithNodeCache(this.instance, "updateScriptFunction")
        wrapFuncWithNodeCache(this.instance, "updateTSTypeAliasDeclaration")
        wrapFuncWithNodeCache(this.instance, "updateVariableDeclarator")

        return this.instance;
    }

    collect(node: AstNode, metadata?: AstNodeCacheValueMetadata): void {
        if (MemoNodeCache.disableMemoNodeCache) {
            return
        }
        const peer = node.peer;
        const type = global.generatedEs2panda._AstNodeTypeConst(global.context, node.peer);
        let currMetadata: AstNodeCacheValueMetadata | undefined = metadata ?? {};
        if (this.cacheMap.has(peer)) {
            const oldMetadata = this.cacheMap.get(peer)!.metadata ?? {};
            currMetadata = { ...oldMetadata, ...currMetadata };
        }
        currMetadata = Object.keys(currMetadata).length === 0 ? undefined : currMetadata;
        this.cacheMap.set(peer, { peer, type, metadata: currMetadata });
        this._isCollected = true;
    }

    refresh(original: AstNode, node: AstNode): void {
        let metadata: AstNodeCacheValueMetadata | undefined;
        if (this.has(original)) {
            metadata = this.get(original)?.metadata;
            this.cacheMap.delete(original.peer);
        }
        this.collect(node, metadata);
    }

    isCollected(): boolean {
        return this._isCollected;
    }

    has(node: AstNode): boolean {
        return this.cacheMap.has(node.peer);
    }

    get(node: AstNode): AstNodeCacheValue | undefined {
        return this.cacheMap.get(node.peer);
    }

    clear(): void {
        this.cacheMap.clear();
        this._isCollected = false;
    }

    visualize(): void {
        Array.from(this.cacheMap.values()).forEach(({ peer, type, metadata }) => {
            const src = global.generatedEs2panda._AstNodeDumpEtsSrcConst(global.context, peer)
            console.log(
                `[NODE CACHE] ptr ${peer}, type: ${type}, metadata: ${JSON.stringify(metadata)}, node: `,
                unpackString(src)
            );
        });
    }
}

function wrapFuncWithNodeCache(cache: MemoNodeCache, funcName: keyof typeof factory) {
    if ((funcName+"__orig") in factory) return;

    let orig = factory[funcName] as any;
    let wrapped = function (this: any, original: AstNode, ...args: any[]) {
        let newNode = orig.call(this, original, ...args);
        if (cache.has(original)) {
            cache.refresh(original, newNode);
        }
        return newNode
    };
    (factory as any)[funcName] = wrapped as any;
    (factory as any)[funcName+"__orig"] = orig as any;
}
