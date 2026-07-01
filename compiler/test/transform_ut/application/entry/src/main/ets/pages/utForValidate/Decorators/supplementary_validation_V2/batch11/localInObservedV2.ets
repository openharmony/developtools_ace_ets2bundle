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
 * @Local decorator inside @ObservedV2 class.
Tests error 10905337: @Local can only be used with struct.
@Local is a component decorator, not a class decorator.
 */

// --- Error Cases ---

// Error 10905337: @Local in @ObservedV2 class
@ObservedV2
class ObservedV2Local {
  @Local count: number = 0;
}

// --- Valid Patterns ---

// Valid: @Local in @ComponentV2 struct
@ComponentV2
struct ValidLocalStruct {
  @Local count: number = 0;
  @Local message: string = "hello";
  build() { Column() { Text(this.message) } }
}

// Valid: @ObservedV2 class without @Local
@ObservedV2
class CleanObservedV2 {
  @Trace value: number = 0;
  @Trace name: string = "clean";
  increment(): void { this.value++; }
}

// Valid: Using @ObservedV2 with @Local in struct
@ComponentV2
struct ModelWithLocal {
  @Local model: CleanObservedV2 = new CleanObservedV2();
  @Local displayText: string = "initial";
  build() {
    Column() {
      Text(this.model.name)
      Text("Value: " + this.model.value.toString())
      Text(this.displayText)
    }
  }
}

// Valid: Multiple @Local variables in struct
@ComponentV2
struct MultiLocalStruct {
  @Local counter: number = 0;
  @Local isActive: boolean = true;
  @Local currentTab: string = "home";
  @Local items: string[] = ["a", "b", "c"];
  build() {
    Column() {
      Text("Tab: " + this.currentTab)
      Text("Counter: " + this.counter.toString())
      if (this.isActive) {
        Text("Active")
      }
    }
  }
}

// Valid: @Local with @Monitor
@ComponentV2
struct LocalWithMonitor {
  @Local value: number = 10;
  @Monitor("value")
  onValueChange() { console.log("value changed to " + this.value.toString()); }
  build() {
    Column() {
      Text(this.value.toString())
      Button("Change").onClick(() => this.value = Math.random() * 100)
    }
  }
}

// Valid: @Local with @Computed
@ComponentV2
struct LocalWithComputed {
  @Local base: number = 5;
  @Computed get doubled(): number { return this.base * 2; }
  @Computed get squared(): number { return this.base * this.base; }
  build() {
    Column() {
      Text("Base: " + this.base.toString())
      Text("Doubled: " + this.doubled.toString())
      Text("Squared: " + this.squared.toString())
    }
  }
}

@Entry
@Component
struct LocalInObservedV2Entry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
