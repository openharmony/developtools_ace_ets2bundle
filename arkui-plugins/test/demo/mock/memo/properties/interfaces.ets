/*
 * Copyright (C) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { memo } from "arkui.stateManagement.runtime";

interface A {
    arg: () => void
    @memo memo_arg: () => void
    @memo memo_optional_arg?: () => void
    @memo memo_union_arg: (() => void) | undefined

    arg_memo_type: @memo () => void
}

@memo() (() => {
    let a: A = {
        arg: (() => {}),
        memo_arg: (() => {}),
        memo_union_arg: (() => {}),
        arg_memo_type: (() => {}),
    };
});