/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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

import { ComponentV2, Column } from "@ohos.arkui.component"
import { Monitor, Local, IMonitor, ObservedV2, Trace, ObservedArray } from "@ohos.arkui.stateManagement"

@ObservedV2
class Person {
  @Trace name: string = "Tom";
  @Trace age: number = 24;
}

@ObservedV2
class Animal {
  @Trace species: string = "Cat";
  @Trace weight: number = 5;
}

@ComponentV2
struct Index {
  @Local message: string = "Hello World";
  @Local entity: Person | Animal = new Person();
  @Local items: (Person | Animal)[] = [new Person(), new Animal()];
  @Local items2: ObservedArray<(Person | Animal)> = new ObservedArray<(Person | Animal)>();
  @Local items3: Map<string, (Person | Animal)> | string | number = new Map<string, (Person | Animal)>();
  @Local items4: Set<(Person | Animal)> | string | number = new Set<(Person | Animal)>();

  @Monitor(["entity.name", "items.0.species", "items.length", "items2.0.species", "items2.length", "items3.size", "items4.size"])
  onEntityChange(monitor: IMonitor) {
    monitor.dirty.forEach((path: string) => {
      console.info(`${path} changed`);
    });
  }

  build() {
    Column() {
    }
  }
}
