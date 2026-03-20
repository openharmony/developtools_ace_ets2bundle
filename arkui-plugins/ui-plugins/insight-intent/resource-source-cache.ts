/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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

/**
 * 资源源代码缓存
 * 用于在 $r() 转换为 _r() 时保存原始表达式
 * 以便后续在 InsightIntent 处理时能获取原始形式
 */
export class ResourceSourceCache {
    private static instance: ResourceSourceCache;
    
    // 使用节点的 peer（底层指针）作为 key，因为 AST 节点对象可能被重建
    // key: peer (number), value: 原始源代码字符串
    private cache: Map<number, string> = new Map();
    
    private constructor() {}
    
    static getInstance(): ResourceSourceCache {
        if (!ResourceSourceCache.instance) {
            ResourceSourceCache.instance = new ResourceSourceCache();
        }
        return ResourceSourceCache.instance;
    }
    
    /**
     * 缓存原始资源表达式
     * @param newNode 转换后的节点
     * @param originalSource 原始源代码（如 "$r('app.media.app_icon')"）
     */
    set(newNode: arkts.CallExpression, originalSource: string): void {
        const peer = (newNode as any).peer;
        if (peer !== undefined && peer !== null) {
            this.cache.set(peer, originalSource);
        }
    }
    
    /**
     * 获取原始资源表达式
     * @param node 当前节点（可能是转换后的 _r() 调用）
     * @returns 原始源代码，如果没有找到返回 undefined
     */
    get(node: arkts.CallExpression): string | undefined {
        const peer = (node as any).peer;
        if (peer !== undefined && peer !== null) {
            return this.cache.get(peer);
        }
        return undefined;
    }
    
    /**
     * 检查是否有缓存
     */
    has(node: arkts.CallExpression): boolean {
        const peer = (node as any).peer;
        if (peer !== undefined && peer !== null) {
            return this.cache.has(peer);
        }
        return false;
    }
    
    /**
     * 清空缓存（通常在处理新文件时调用）
     */
    clear(): void {
        this.cache.clear();
    }
    
    /**
     * 获取缓存大小
     */
    get size(): number {
        return this.cache.size;
    }
}
