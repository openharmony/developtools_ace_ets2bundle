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

import { memo, __memo_context_type, __memo_id_type } from "@ohos.arkui.stateManagement"

class A {
    @memo foo(p?: ()=>void): void {}

    goo(@memo p?: ()=>void): void {}

    @memo koo(@memo p?: ()=>void): void {}
}

@memo
function bar(f?: ()=>void): void {}

function par(f?: @memo ()=>void): void {}

@memo
function kar(@memo f?: ()=>void): void {}

@memo
() => {
    let a = new A();
    a.foo() { console.log(); }
    a.goo() { console.log(); }
    a.koo() { console.log(); }

    bar() { console.log(); }
    par() { console.log(); }
    kar() { console.log(); }
}
