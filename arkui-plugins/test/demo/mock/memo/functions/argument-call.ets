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

import { Memo } from 'arkui.incremental.annotation';

@Memo function memo_arg_call(
    arg1: number,
    arg2: (x: number) => number,
    @Memo arg3: (x: number) => number,
    arg4?: (x: number) => number,
    @Memo arg5?: (x: number) => number,
) {
    arg2(arg1)
    arg3(arg1)
    arg4?.(arg1)
    arg5?.(arg1)
}

@Memo
function memo_arg_call_with_lowering(
    arg1: number,
    arg4?: (x: number) => number,
    @Memo arg5?: (x: number) => number,
) {
    {let gensym___1 = arg4;
      ((gensym___1 == null) ? undefined : gensym___1(arg1))};
    {let gensym___2 = arg5;
      ((gensym___2 == null) ? undefined : gensym___2(arg1))};
}

@Memo
function args_with_default_values(
    arg1: int = 10,
    @Memo arg2: () => int = () => { return 20 },
    arg3: int = arg1,
    arg4?: int
): void { 
    console.log(arg1, arg2, arg3, arg4)
    console.log(arg2())
}
