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
import { Es2pandaAstNodeType } from '../Es2pandaEnums';
import type { AstNode } from './peers/AstNode';

export const nodeByType = new Map<Es2pandaAstNodeType, { new (peer: KNativePointer): AstNode }>([]);

const MAX_SIZE = 2 ** 24;
const cache = new Map<KNativePointer, AstNode>();
export function clearNodeCache(): void {
    cache.clear();
}

export function getOrPut(peer: KNativePointer, create: (peer: KNativePointer) => AstNode): AstNode {
    if (cache.has(peer)) {
        return cache.get(peer)!;
    }

    const newNode = create(peer);
    if (cache.size < MAX_SIZE) {
        cache.set(peer, newNode);
    }
    return newNode;
}