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
import { Monitor, Local, IMonitor, ObservedV2, Trace } from "@ohos.arkui.stateManagement"

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

@ObservedV2
class BoxA {
  @Trace inner: Person = new Person();
}

@ObservedV2
class BoxB {
  @Trace inner: Animal = new Animal();
}

@ComponentV2
struct Index {
  @Local entity: Person | Animal = new Person();
  @Local container: BoxA | BoxB = new BoxA();

  @Monitor(["entity.*", "entity.name", "container.inner.*"])
  onEntityChange(monitor: IMonitor) {
    monitor.dirty.forEach((path: string) => {
      console.info(`${path} changed`);
    });
  }

  build() {
    Column() {}
  }
}
