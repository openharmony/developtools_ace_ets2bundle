/*
 * Copyright (c) 2022-2025 Huawei Device Co., Ltd.
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


import { BuilderLambda } from "@koalaui.arkts-arkui.Common"
import { __memo_context_type, __memo_id_type, memo } from "@koalaui/runtime";

export declare class Column {
    @BuilderLambda("instantiateImpl")
    static $_instantiate(
        factory: () => Column,
        content?: () => void,
        options?: ColumnOptions | undefined
    ): Column

    @memo
    static instantiateImpl(
        @memo
        style: (instance: Column) => Column | undefined,
        factory: () => Column,
        @memo
        content?: () => void,
        options?: ColumnOptions | undefined

    ): void

    static instantiateImpl(
        __memo_context: __memo_context_type,
        __memo_id: __memo_id_type,
        style: (__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: Column) => Column|undefined,
        factory: () => Column,
        content?: (__memo_context: __memo_context_type, __memo_id: __memo_id_type) => void,
        options?: ColumnOptions | undefined,
    ): void
}

export interface ColumnOptions {
    space?: number
}