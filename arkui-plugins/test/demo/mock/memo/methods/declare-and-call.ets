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

declare abstract class A {
    @memo 
    x(): void;

    test_signature(
		@memo arg1: () => void,
		@memo arg2: (() => void) | undefined,
		@memo arg3: ((() => void) | undefined) | ((() => int) | undefined),
		@memo x: (y: (z: @memo () => void) => void) => void,
	): @memo () => void;
}

class AA extends A {
    @memo x(): void {}
}

@memo
() => {
    new AA().x();

    const a: A = new AA();
    a.x();
}

