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

import * as arkts from '@koalaui/libarkts';

export interface AstNodeCacheValue {
    peer: arkts.KNativePointer;
    type: arkts.Es2pandaAstNodeType;
    metadata?: AstNodeCacheValueMetadata;
}

export type AstNodeCacheValueMetadata = {
    [key in string]?: any;
}

function traverseASTSync(
    left: arkts.AstNode,
    right: arkts.AstNode,
    callbackFn: (left: arkts.AstNode, right: arkts.AstNode) => boolean
): void {
    const shouldStop = callbackFn(left, right);
    if (shouldStop) {
        return;
    }
    const leftChildren = left.getChildren();
    const rightChildren = right.getChildren();
    for (let i = 0; i < leftChildren.length; i++) {
        traverseASTSync(leftChildren[i], rightChildren[i], callbackFn);
    }
}

export function copyCacheToClonedNode(original: arkts.AstNode, cloned: arkts.AstNode, shouldRefresh?: boolean): void {
    const traverseCallbackFn = (_original: arkts.AstNode, _cloned: arkts.AstNode): boolean => {
        if (!NodeCacheFactory.currentCacheKey) {
            return true;
        }
        const key: string = NodeCacheFactory.currentCacheKey;
        const cache: NodeCache = NodeCacheFactory.getInstance().getCache(key);
        if (!cache.has(_original)) {
            return false;
        }
        if (shouldRefresh) {
            cache.refresh(_original, _cloned);
        } else {
            const value = cache.get(_original)!;
            cache.collect(_cloned, value.metadata);

        }
        return cache.shouldUpdateByPeer(_cloned.peer);
    };
    traverseASTSync(original, cloned, traverseCallbackFn);
}

// Add hook to update cache on clone calls. Please refactor
((orig, origOnUpdate) => {
    arkts.AstNode.prototype.clone = function () {
        const cloned = orig.call(this);
        copyCacheToClonedNode(this, cloned);
        return cloned;
    };

    arkts.AstNode.prototype.onUpdate = function (original: arkts.AstNode) {
        origOnUpdate.call(this, original);
        NodeCacheFactory.getInstance().refresh(original, this);
        NodeCacheFactory.getInstance().refreshUpdate(original, this);
    };
})(arkts.AstNode.prototype.clone, arkts.AstNode.prototype.onUpdate);


export class NodeCache {
    private _shouldPerfLog: boolean = false;
    private _isCollected: boolean = false;
    private _shouldCollectUpdate: boolean = false;
    private _shouldCollect: boolean = true;
    private cacheMap: Map<arkts.KNativePointer, AstNodeCacheValue>;
    private nodesToUpdate: Set<arkts.KNativePointer>;

    constructor(private id: string) {
        this.cacheMap = new Map();
        this.nodesToUpdate = new Set();
    }

    shouldPerfLog(shouldLog: boolean): this {
        this._shouldPerfLog = shouldLog;
        return this;
    }

    shouldCollect(shouldCollect: boolean): this {
        this._shouldCollect = shouldCollect;
        return this;
    }

    shouldCollectUpdate(shouldCollectUpdate: boolean): this {
        this._shouldCollectUpdate = shouldCollectUpdate;
        return this;
    }

    collect(node: arkts.AstNode, metadata?: AstNodeCacheValueMetadata): void {
        if (!this._shouldCollect) {
            return;
        }
        if (this._shouldCollectUpdate) {
            this._collectNodesToUpdate(node, node.parent);
        }
        this._collect(node, metadata);
    }

    shouldUpdate(node: arkts.AstNode): boolean {
        if (!this._shouldCollectUpdate) {
            return true;
        }
        return this.nodesToUpdate.has(node.peer);
    }

    shouldUpdateByPeer(peer: arkts.KNativePointer): boolean {
        if (!this._shouldCollectUpdate) {
            return true;
        }
        return this.nodesToUpdate.has(peer);
    }

    addNodeToUpdate(node: arkts.AstNode): void {
        if (!this._isCollected && !this._shouldCollectUpdate) {
            return;
        }
        this.nodesToUpdate.add(node.peer);
    }

    addNodeToUpdateByPeer(peer: arkts.KNativePointer): void {
        if (!this._isCollected && !this._shouldCollectUpdate) {
            return;
        }
        this.nodesToUpdate.add(peer);
    }

    private _collect(node: arkts.AstNode, metadata?: AstNodeCacheValueMetadata): void {
        const peer = node.peer;
        const type = node.astNodeType;
        let currMetadata: AstNodeCacheValueMetadata | undefined = metadata ?? {};
        if (this.cacheMap.has(peer)) {
            const oldMetadata = this.cacheMap.get(peer)!.metadata ?? {};
            currMetadata = { ...oldMetadata, ...currMetadata };
        }
        currMetadata = Object.keys(currMetadata).length === 0 ? undefined : currMetadata;
        this.cacheMap.set(peer, { peer, type, metadata: currMetadata });        
        this._isCollected = true;
    }

    private _collectNodesToUpdate(node: arkts.AstNode, parent?: arkts.AstNode): void {
        this.nodesToUpdate.add(node.peer);
        let currParent: arkts.AstNode | undefined = parent;
        while (!!currParent && !this.nodesToUpdate.has(currParent.peer)) {
            this.nodesToUpdate.add(currParent.peer);
            currParent = currParent.parent;
        }
        this._isCollected = true;
    }

    refresh(original: arkts.AstNode, node: arkts.AstNode): void {
        let metadata: AstNodeCacheValueMetadata | undefined;
        if (this.has(original)) {
            metadata = this.get(original)?.metadata;
            this.cacheMap.delete(original.peer);
        }
        this._collectNodesToUpdate(node);
        this._collect(node, metadata);
    }

    refreshUpdate(original: arkts.AstNode, node: arkts.AstNode): void {
        if (this.shouldUpdate(original)) {
            this.nodesToUpdate.delete(original.peer);
        }
        this._collectNodesToUpdate(node, original.parent);
    }

    isCollected(): boolean {
        return this._isCollected;
    }

    isCollectEnabled(): boolean {
        return this._shouldCollect;
    }

    isCollectUpdateEnabled(): boolean {
        return this._shouldCollectUpdate;
    }

    has(node: arkts.AstNode): boolean {
        return this.cacheMap.has(node.peer);
    }

    get(node: arkts.AstNode): AstNodeCacheValue | undefined {
        return this.cacheMap.get(node.peer);
    }

    clear(): void {
        this.cacheMap.clear();
        this.nodesToUpdate.clear();
        this._isCollected = false;
    }

    visualize(): void {
        Array.from(this.cacheMap.values()).forEach(({ peer, type, metadata }) => {
            const src = arkts.arktsGlobal.generatedEs2panda._AstNodeDumpEtsSrcConst(arkts.arktsGlobal.context, peer);
            const shouldUpdate = this.nodesToUpdate.has(peer);
            console.log(
                `[NODE CACHE] ptr ${peer}, type: ${type}, shouldUpdate: ${shouldUpdate}, metadata: ${JSON.stringify(metadata)}, node: `,
                src
            );
        });
    }

    perfLog(key?: string): void {
        if (!this._shouldPerfLog) {
            return;
        }
        if (!!key) {
            console.log("[PERFORMANCE] [NODE CACHE] cache key: ", key);
        }
        console.log(`[PERFORMANCE] [NODE CACHE] cached-node count: `, Object.keys(this.cacheMap).length);
        console.log(`[PERFORMANCE] [NODE CACHE] should-update-node count: `, this.nodesToUpdate.size);
    }
}

export class NodeCacheFactory {
    private _shouldPerfLog: boolean = false;
    private cacheMap: Map<string, NodeCache>;
    private static instance: NodeCacheFactory;

    static currentCacheKey: string | undefined;

    private constructor() {
        this.cacheMap = new Map();
    }

    static getInstance(): NodeCacheFactory {
        if (!this.instance) {
            this.instance = new NodeCacheFactory();
        }
        return this.instance;
    }

    shouldPerfLog(shouldLog: boolean): this {
        this._shouldPerfLog = shouldLog;
        return this;
    }

    getCacheMap(): Map<string, NodeCache> {
        return this.cacheMap;
    }

    getCache(key: string): NodeCache {
        if (!this.cacheMap.has(key)) {
            this.cacheMap.set(key, new NodeCache(key));
        }
        return this.cacheMap.get(key)!;
    }

    clear(): void {
        this.cacheMap.forEach((cache) => {
            cache.clear();
        });
        this.cacheMap = new Map();
    }

    has(node: arkts.AstNode, key?: string): boolean {
        if (!!key) {
            return !!this.cacheMap.get(key)?.has(node);
        }
        return Array.from(this.cacheMap.values()).some((cache) => cache.has(node));
    }

    shouldUpdate(node: arkts.AstNode, key?: string): boolean {
        if (!!key) {
            return !!this.cacheMap.get(key)?.shouldUpdate(node);
        }
        return Array.from(this.cacheMap.values()).some((cache) => cache.shouldUpdate(node));
    }

    refresh(original: arkts.AstNode, node: arkts.AstNode, key?: string): void {
        if (!!key) {
            const cache: NodeCache | undefined = this.cacheMap.get(key);
            if (!!cache && cache.has(original)) {
                cache.refresh(original, node);
            }
            return;
        }
        this.cacheMap.forEach((cache) => {
            if (cache.has(original)) {
                cache.refresh(original, node);
            }
        });
    }

    refreshUpdate(original: arkts.AstNode, node: arkts.AstNode, key?: string): void {
        if (!!key) {
            const cache: NodeCache | undefined = this.cacheMap.get(key);
            if (!!cache && cache.shouldUpdate(original)) {
                cache.refreshUpdate(original, node);
            }
            return;
        }
        this.cacheMap.forEach((cache) => {
            if (cache.shouldUpdate(original)) {
                cache.refreshUpdate(original, node);
            }
        });
    }

    perfLog(key: string, shouldLog: boolean = false): void {
        if (!shouldLog) {
            return;
        }
        if (!this.cacheMap.has(key)) {
            return;
        }
        this.cacheMap.get(key)!.shouldPerfLog(this._shouldPerfLog).perfLog(key);
    }
}
