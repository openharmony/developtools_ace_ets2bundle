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
    @memo
    static $_invoke(): void {}
}

class B {
    static $_invoke(@memo p?: () => void): void {}
}

class C {
    @memo
    static $_instantiate(factory: () => C): C {
        return factory();
    }
}

class D {
    static $_instantiate(factory: () => D, @memo content?: () => void): D {
        return factory();
    }
}

@memo
() => {
    A();
    B(() => {});

    let x: C | D = C();
    x = D();
}
