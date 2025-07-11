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

@memo type ItemBuilder<T> = (item: Item<T>) => void;

interface Item<T> {
  item: T;
}

interface Attribute<T> {
  @memo each<T>(@memo itemGenerator: ItemBuilder<T>): Attribute<T>;
}

@memo
export declare function A<T>(): Attribute<T>

@memo
function func<T>(): ItemBuilder<T> {
  return (item: Item<T>): void => {};
}

class B {
  @memo build() {
    A<string>().each((ri: Item<string>) => {})
  }
}
