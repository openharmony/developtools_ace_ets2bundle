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

import { Memo} from "arkui.incremental.annotation";

class Person {
    constructor() {}
}

@Memo
function fullName(this: Person, @Memo arg?: () => void): void {
  return;
}

class A {}

@Memo
type F1 = (this: A, @Memo arg?: () => void) => void;

@Memo
type F2 = (a: A, @Memo arg?: () => void) => void;

@Memo
function foo(this: A, @Memo arg?: () => void): void {}

@Memo
function goo(a: A, @Memo arg?: () => void): void {}

@Memo
() => {
    let x = new Person();
    x.fullName(() => {});

    let f1: F1 = foo;
    let f2: F2 = goo;

    let a = new A();
    a.f1(() => {});
    f1(a, () => {});

    f2(a, () => {});
}