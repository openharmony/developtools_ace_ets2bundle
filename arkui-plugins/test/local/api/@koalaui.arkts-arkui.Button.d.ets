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

export declare class Button {
    // TODO: the second argument will be gone after hte plugin is improved
    @BuilderLambda("instantiateImpl")
    static $_instantiate(
        factory: () => Button,
        options?: string,
        content?: () => void
    ): Button;

    @memo
    static instantiateImpl(
        @memo
        style: (instance: Button) => Button | undefined,
        factory: () => Button,
        options?: string,
        @memo
        content?: () => void
    ): void;

    static instantiateImpl(
        __memo_context: __memo_context_type, 
        __memo_id: __memo_id_type, 
        style: ((__memo_context: __memo_context_type, __memo_id: __memo_id_type, instance: Button) => Button) | undefined, 
        factory: () => Button, 
        options?: string, 
        content?: (__memo_context: __memo_context_type, __memo_id: __memo_id_type) => void
    ): void;
}

export interface ButtonOptions {}