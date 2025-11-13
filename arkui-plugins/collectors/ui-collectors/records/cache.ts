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
import { BaseRecord } from './base';
import { AstNodePointer } from 'common/safe-types';

/**
 * Singleton LRU Cache implementation using Map's insertion order
 * for efficient least-recently-used eviction.
 */
export class RecordCache<T extends BaseRecord<arkts.AstNode, Record<string, unknown>>> {
    private static instance: RecordCache<BaseRecord<arkts.AstNode, Record<string, unknown>>>;
    private cache: Map<AstNodePointer, T>;
    private maxSize: number;

    private constructor(maxSize: number = 100) {
        if (maxSize <= 0) {
            throw new Error('Cache size must be positive');
        }
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    /**
     * Get the singleton instance of the cache
     * @param maxSize Maximum number of items to store (default: 100)
     * @returns The cache instance
     */
    public static getInstance<T extends BaseRecord<arkts.AstNode, Record<string, unknown>>>(
        maxSize: number = 100
    ): RecordCache<T> {
        if (!this.instance) {
            this.instance = new RecordCache<T>(maxSize);
        } else if (maxSize !== RecordCache.instance.maxSize) {
            this.instance.resize(maxSize);
        }
        return this.instance as RecordCache<T>;
    }

    /**
     * Get a value from the cache
     * @param key Cache key
     * @returns The cached value or undefined if not found
     */
    public get(key: AstNodePointer): T | undefined {
        const value = this.cache.get(key);
        if (value !== undefined) {
            // Refresh key by deleting and re-adding it
            this.cache.delete(key);
            this.cache.set(key, value);
        }
        return value;
    }

    /**
     * Set a value in the cache
     * @param key Cache key
     * @param value Value to cache
     */
    public set(key: AstNodePointer, value: T): void {
        if (this.cache.has(key)) {
            // Refresh key by deleting it first
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            // Evict the first item (least recently used)
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
            }
        }
        this.cache.set(key, value);
    }

    /**
     * Check if a key exists in the cache
     * @param key Cache key to check
     * @returns True if the key exists
     */
    public has(key: AstNodePointer): boolean {
        return this.cache.has(key);
    }

    /**
     * Delete a key from the cache
     * @param key Cache key to delete
     * @returns True if the key was deleted
     */
    public delete(key: AstNodePointer): boolean {
        return this.cache.delete(key);
    }

    /**
     * Clear all items from the cache
     */
    public clear(): void {
        this.cache.clear();
    }

    /**
     * Get the current number of items in the cache
     * @returns Number of cached items
     */
    public size(): number {
        return this.cache.size;
    }

    /**
     * Get all cache keys (in order of most recently used)
     * @returns Array of keys
     */
    public keys(): string[] {
        return Array.from(this.cache.keys()).reverse();
    }

    /**
     * Get all cache values (in order of most recently used)
     * @returns Array of values
     */
    public values(): T[] {
        return Array.from(this.cache.values()).reverse();
    }

    /**
     * Get all cache entries (in order of most recently used)
     * @returns Array of [key, value] pairs
     */
    public entries(): [string, T][] {
        return Array.from(this.cache.entries()).reverse();
    }

    /**
     * Resize the cache (evicts LRU items if new size is smaller)
     * @param newSize New maximum cache size
     */
    public resize(newSize: number): void {
        if (newSize <= 0) {
            throw new Error('Cache size must be positive');
        }

        this.maxSize = newSize;
        while (this.cache.size > this.maxSize) {
            const firstKey = this.cache.keys().next().value!;
            this.cache.delete(firstKey);
        }
    }

    /**
     * Execute a function for each cache entry (from most to least recently used)
     * @param callback Function to execute
     */
    public forEach(callback: (value: T, key: AstNodePointer) => void): void {
        this.entries().forEach(([key, value]) => callback(value, key));
    }
}
