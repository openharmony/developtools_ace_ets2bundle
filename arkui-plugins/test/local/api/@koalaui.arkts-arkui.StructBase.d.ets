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

export declare class StructBase<T, OptionsT> {
    @BuilderLambda("instantiateImpl")
    static $_instantiate<S extends StructBase<S, OptionsS>, OptionsS> (
        factory: () => S,
        options?: OptionsS,
        content?: () => void
    ): S

    @memo
    static instantiateImpl<S extends StructBase<S, OptionsS>, OptionsS>(
        @memo
        builder: ((instance: S)=>S)|undefined,
        factory: () => S,
        options?: OptionsS,
        @memo
        content?: () => void
    ): void

    static instantiateImpl<S extends StructBase<S, OptionsS>, OptionsS>(
        __memo_context: __memo_context_type, 
        __memo_id: __memo_id_type, 
        builder: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: S) => S) | undefined, 
        factory: () => S, 
        options?: OptionsS, 
        content?: (__memo_context: __memo_context_type, __memo_id: __memo_id_type) => void
    ): void;

    build(): void

    @memo protected _build(@memo style: ((instance: T)=>T)|undefined, @memo content: (() => void)|undefined, options: OptionsT|undefined): void

    protected _build(
        __memo_context: __memo_context_type, 
        __memo_id: __memo_id_type, 
        style: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: T) => T) | undefined, 
        content: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type) => void) | undefined, 
        options: OptionsT | undefined
    ): void;
}