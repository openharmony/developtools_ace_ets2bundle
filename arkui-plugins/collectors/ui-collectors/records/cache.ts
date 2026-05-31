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
import { AstNodePointer } from '../../../common/safe-types';
import { LRUCache } from '../../../common/lru-cache';

type BaseRecordTemplate = BaseRecord<arkts.AstNode, Record<string, unknown>>;

export class RecordCache<T extends BaseRecordTemplate> extends LRUCache<AstNodePointer, T> {
    protected static instance: LRUCache<AstNodePointer, BaseRecordTemplate>;

    /**
     * Get the singleton instance of the cache
     * @param maxSize Maximum number of items to store (default: 100)
     * @returns The cache instance
     */
    public static getInstance<T extends BaseRecordTemplate>(maxSize: number = 100): RecordCache<T> {
        if (!this.instance) {
            this.instance = new RecordCache<T>(maxSize);
        } else if (maxSize !== RecordCache.instance.maxSize) {
            this.instance.resize(maxSize);
        }
        return this.instance as RecordCache<T>;
    }
}
