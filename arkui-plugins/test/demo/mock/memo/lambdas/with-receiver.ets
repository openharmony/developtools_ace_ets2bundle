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

class Person {
    constructor() {}
}

@memo
function fullName(this: Person, @memo arg?: () => void): void {
  return;
}

class A {}

@memo
type F1 = (this: A, @memo arg?: () => void) => void;

@memo
type F2 = (a: A, @memo arg?: () => void) => void;

@memo
function foo(this: A, @memo arg?: () => void): void {}

@memo
function goo(a: A, @memo arg?: () => void): void {}

@memo
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