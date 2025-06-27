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

@Memo
function funcNum(): number {
  return 1;
}

@Memo
function funcStr(): string {
  return "1";
}

@Memo
function funcBool(): boolean {
  return false;
}

interface A {
    str: string;
}

@Memo
function funcA(): A {
    return { str: "1" };
}

type B = (str: string) => void;

@Memo
function funcB(): B {
    return (str: string) => {};
}

class C {
    str: string;
    constructor(str: string) {
        this.str = str;
    }
}

@Memo
function funcC(): C {
    return new C("1");
}

@Memo
function funcD(): () => void {
  return () => {};
}