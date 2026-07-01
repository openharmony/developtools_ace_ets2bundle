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
 * Class decorated with both @Observed and @ObservedV2 simultaneously.
Tests error 10905226. A class cannot use both observation systems.
Includes valid @Observed and @ObservedV2 examples for comparison.
 */

// --- Error Cases ---

// Error 10905226: Cannot use both @Observed and @ObservedV2
@Observed
@ObservedV2
class DualDecorated {
  value: number = 0;
}

// --- Valid Patterns ---

// Valid: Class with only @Observed
@Observed
class ValidObserved {
  count: number = 0;
  name: string = "observed";
}

// Valid: Class with only @ObservedV2
@ObservedV2
class ValidObservedV2 {
  @Trace count: number = 0;
  @Trace name: string = "observedV2";
}

// Valid: @Observed class with methods
@Observed
class ObservedWithMethods {
  value: number = 10;
  getValue(): number { return this.value; }
  setValue(v: number): void { this.value = v; }
}

// Valid: @ObservedV2 with multiple @Trace members
@ObservedV2
class MultiTraceModel {
  @Trace name: string = "model";
  @Trace count: number = 42;
  @Trace active: boolean = true;
  @Trace items: string[] = [];
  updateName(n: string): void { this.name = n; }
}

// Valid: Plain class without decorators
class PlainDataModel {
  id: number = 0;
  title: string = "";
  description: string = "";
  constructor(id: number, title: string) {
    this.id = id;
    this.title = title;
  }
}

// Valid: Using @Observed class in @Component
@Component
struct UsesObservedModel {
  @State model: ValidObserved = new ValidObserved();
  build() {
    Column() {
      Text(this.model.name)
      Text(this.model.count.toString())
    }
  }
}

@Entry
@Component
struct ObservedDualDecorEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
