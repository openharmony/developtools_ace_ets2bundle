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
 * @Trace decorator applied to a method instead of a variable.
Tests error 10905343: @Trace can only decorate member variables,
not methods. @Trace is for property-level change tracking.
 */

// --- Error Cases ---

// Error 10905343: @Trace on a method
@ObservedV2
class TraceMethod {
  count: number = 0;
  @Trace
  getCount(): number { return this.count; }
}

// --- Valid Patterns ---

// Valid: @Trace on variable, method without decorator
@ObservedV2
class ValidTraceVar {
  @Trace count: number = 0;
  @Trace label: string = "counter";
  getCount(): number { return this.count; }
  setCount(value: number): void { this.count = value; }
}

// Valid: @Trace with different types
@ObservedV2
class TypedTraceModel {
  @Trace intValue: number = 42;
  @Trace stringValue: string = "hello";
  @Trace boolValue: boolean = true;
  @Trace arrayValue: number[] = [1, 2, 3];
}

// Valid: @ObservedV2 with computed-like patterns
@ObservedV2
class ComputedLikeModel {
  @Trace base: number = 10;
  @Trace multiplier: number = 2;
  get product(): number { return this.base * this.multiplier; }
  get summary(): string {
    return "Base=" + this.base.toString() + " x" + this.multiplier.toString();
  }
}

// Valid: @Trace with update logic
@ObservedV2
class CounterModel {
  @Trace current: number = 0;
  @Trace max: number = 100;
  @Trace history: number[] = [];
  increment(): void {
    if (this.current < this.max) {
      this.current++;
    }
  }
  canIncrement(): boolean { return this.current < this.max; }
}

// Valid: Using traced model with V2 component
@ComponentV2
struct CounterDisplay {
  @Local counter: CounterModel = new CounterModel();
  build() {
    Column() {
      Text("Counter: " + this.counter.current.toString())
      Text("Max: " + this.counter.max.toString())
      Button("Add").onClick(() => this.counter.increment())
    }
  }
}

@Entry
@Component
struct TraceOnMethodEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
