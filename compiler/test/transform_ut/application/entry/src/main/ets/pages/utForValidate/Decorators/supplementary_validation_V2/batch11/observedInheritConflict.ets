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

/**
 * @Observed class inheriting from @ObservedV2 class.
Tests error 10905224: @Observed cannot inherit from @ObservedV2.
V1 and V2 observation systems are incompatible in inheritance chains.
 */

// --- Error Cases ---

// Error 10905224: @Observed inheriting from @ObservedV2
@ObservedV2
class V2Base {
  @Trace val: number = 0;
}
@Observed
class V1ExtendsV2 extends V2Base {
  name: string = "test";
}

// --- Valid Patterns ---

// Valid: @ObservedV2 inheriting from @ObservedV2
@ObservedV2
class V2Parent {
  @Trace baseValue: number = 0;
}
@ObservedV2
class V2Child extends V2Parent {
  @Trace childValue: string = "child";
}

// Valid: @Observed inheriting from @Observed
@Observed
class V1Parent {
  parentProp: number = 10;
}
@Observed
class V1Child extends V1Parent {
  childProp: string = "child";
}

// Valid: Plain class inheriting from plain class
class BaseItem {
  id: number = 0;
  getId(): number { return this.id; }
}
class DerivedItem extends BaseItem {
  name: string = "derived";
  getDescription(): string { return this.name + " #" + this.id.toString(); }
}

// Valid: @ObservedV2 with @Trace inheritance
@ObservedV2
class TraceParent {
  @Trace sharedValue: number = 100;
  @Trace label: string = "parent";
}
@ObservedV2
class TraceChild extends TraceParent {
  @Trace extra: boolean = false;
}

// Valid: Using proper V2 model in component
@ComponentV2
struct UsesV2Model {
  @Local model: V2Child = new V2Child();
  build() {
    Column() {
      Text(this.model.baseValue.toString())
      Text(this.model.childValue)
    }
  }
}

@Entry
@Component
struct ObservedInheritConflictEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
