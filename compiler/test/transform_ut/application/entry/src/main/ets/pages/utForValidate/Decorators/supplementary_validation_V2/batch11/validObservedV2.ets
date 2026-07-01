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
 * Valid @ObservedV2 @Trace usage as control group.
Demonstrates correct V2 class observation patterns.
No errors should be triggered by this file.
 */

// --- Valid Patterns ---

// Valid: Basic @ObservedV2 with @Trace
@ObservedV2
class ValidModel {
  @Trace name: string = "valid";
  @Trace count: number = 42;
  @Trace active: boolean = true;
}

// Valid: Using V2 model in V2 component
@ComponentV2
struct UsesValidModel {
  @Local model: ValidModel = new ValidModel();
  build() { Column() { Text(this.model.name) } }
}

// Valid: @ObservedV2 with computed properties
@ObservedV2
class ComputedModel {
  @Trace base: number = 10;
  @Trace multiplier: number = 2;
  get product(): number { return this.base * this.multiplier; }
  get summary(): string {
    return this.base.toString() + " x " + this.multiplier.toString() +
      " = " + this.product.toString();
  }
}

// Valid: @ObservedV2 with methods and @Trace
@ObservedV2
class CounterModel {
  @Trace current: number = 0;
  @Trace max: number = 100;
  @Trace history: number[] = [];
  increment(): void {
    if (this.current < this.max) {
      this.current++;
      this.history.push(this.current);
    }
  }
  decrement(): void {
    if (this.current > 0) { this.current--; }
  }
  reset(): void { this.current = 0; this.history = []; }
}

// Valid: @ObservedV2 inheritance
@ObservedV2
class BaseEntity {
  @Trace id: number = 0;
  @Trace createdAt: string = "now";
}
@ObservedV2
class NamedEntity extends BaseEntity {
  @Trace name: string = "";
  @Trace description: string = "";
}

// Valid: Using models with @Param
@ComponentV2
struct EntityViewer {
  @Param entity: NamedEntity = new NamedEntity();
  build() {
    Column() {
      Text("ID: " + this.entity.id.toString())
      Text("Name: " + this.entity.name)
      Text("Desc: " + this.entity.description)
    }
  }
}

// Valid: Full V2 pattern with @Computed and @Monitor
@ComponentV2
struct FullV2Component {
  @Local model: CounterModel = new CounterModel();
  @Computed get displayValue(): string {
    return this.model.current.toString() + " / " + this.model.max.toString();
  }
  @Monitor("model.current")
  onCountChange() { console.log("Counter updated"); }
  build() {
    Column() {
      Text(this.displayValue)
      Button("Increment").onClick(() => this.model.increment())
      Button("Reset").onClick(() => this.model.reset())
    }
  }
}

@Entry
@Component
struct ValidObservedV2Entry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
