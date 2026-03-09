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

import { KNativePointer } from '@koalaui/interop';
import { Es2pandaAstNodeType } from '../../Es2pandaEnums';
import { AstNode, UnsupportedNode } from '../peers/AstNode';
import { global } from '../static/global';
import { getOrPut, nodeByType } from '../class-by-peer';
import { traverseASTSync } from './private';

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
    hasBuilder?: boolean;
}

export function copyCacheToClonedNode(original: AstNode, cloned: AstNode, shouldRefresh?: boolean): void {
    const traverseCallbackFn = (_original: AstNode, _cloned: AstNode): boolean => {
        if (!NodeCache.getInstance().has(_original)) {
            return false;
        }
        if (shouldRefresh) {
            NodeCache.getInstance().refresh(_original, _cloned);
        } else {
            const value = NodeCache.getInstance().get(_original)!;
            NodeCache.getInstance().collect(_cloned, value.metadata);
        }
        return false;
    };
    traverseASTSync(original, cloned, traverseCallbackFn);
}

export class NodeCache {
    private _isCollected: boolean = false;
    private cacheMap: Map<KNativePointer, AstNodeCacheValue>;
    private static instance: NodeCache;

    private constructor() {
        this.cacheMap = new Map();
    }

    static getInstance(): NodeCache {
        if (!this.instance) {
            this.instance = new NodeCache();
        }
        return this.instance;
    }

    collect(node: AstNode, metadata?: AstNodeCacheValueMetadata): void {
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
            const node = nodeByType.get(type) ?? UnsupportedNode;
            const newNode = getOrPut(peer, (peer) => new node(peer)) as AstNode;
            console.log(
                `[NODE CACHE] ptr ${peer}, type: ${type}, metadata: ${JSON.stringify(metadata)}, node: `,
                newNode.dumpSrc()
            );
        });
    }
}
