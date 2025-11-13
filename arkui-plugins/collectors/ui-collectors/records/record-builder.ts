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
import { BaseRecord, RecordOptions } from './base';
import { RecordCache } from './cache';
import { AstNodePointer } from 'common/safe-types';

function getOrPut<
    T extends BaseRecord<arkts.AstNode, Record<string, unknown>>,
    U extends RecordOptions = RecordOptions
>(key: AstNodePointer, options: U, create: (options: U) => T): T {
    if (RecordCache.getInstance<T>().has(key)) {
        return RecordCache.getInstance<T>().get(key)!;
    }
    const newRecord = create(options);
    RecordCache.getInstance<T>().set(key, newRecord);
    return newRecord;
}

export class RecordBuilder {
    static build<U extends arkts.AstNode, V extends BaseRecord<U, Record<string, unknown>>, T extends RecordOptions = RecordOptions>(
        Record: { new (options: T): V },
        node: U,
        options: T
    ): V {
        return getOrPut<V, T>(node.peer, options, (options: T) => new Record(options));
    }

    static reset(): void {
        RecordCache.getInstance().clear();
    }
}
