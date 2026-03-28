/**
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

function main() {}

function foo(): void {
  HasInstantiate.$_instantiate((() => {
    return new HasInstantiate();
  }), "foo");
}

function hasTrailing(first?: string, trailing?: (()=> void)): void {
  ({let gensym%%_884 = trailing;
  (((gensym%%_884) == (null)) ? undefined : gensym%%_884())});
}

function bar(zzz: string): void {
  hasTrailing("xxx");
  hasTrailing("xxx", (() => {
    const d = zzz;
  }));
}


class HasInstantiate {
  public static $_instantiate(factory: (()=> HasInstantiate), arg: string) {}
  
  public constructor() {}
  
}

