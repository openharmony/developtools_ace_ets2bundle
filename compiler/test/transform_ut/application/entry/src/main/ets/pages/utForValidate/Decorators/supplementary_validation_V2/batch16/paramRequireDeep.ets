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
 * V2 @Param and @Require deep validation rules.
 */

// --- Error Cases ---

// Error 10905327: @Param without default value and without @Require
@ComponentV2
struct ParamNoDefault {
  @Param value: string;
  build() { Column() { Text(this.value) } }
}

// Error 10905325: @Param with union type
@ComponentV2
struct ParamUnionType {
  @Param data: string | number;
  build() { Column() { Text("union") } }
}

// Error 10905328: @Once without @Param
@ComponentV2
struct OnceNoParam {
  @Once count: number = 0;
  build() { Column() { Text(this.count.toString()) } }
}

// --- Valid Patterns ---

// Valid: @Param with default value
@ComponentV2
struct ParamWithDefault {
  @Param title: string = "Default Title";
  build() { Column() { Text(this.title) } }
}

// Valid: @Param with @Require (no default needed)
@ComponentV2
struct ParamRequired {
  @Require @Param message: string;
  build() { Column() { Text(this.message) } }
}

// Valid: @Once with @Param
@ComponentV2
struct OnceWithParam {
  @Once @Param initialValue: number = 10;
  build() { Column() { Text(this.initialValue.toString()) } }
}

// Valid: @Param with @Event for two-way binding
@ComponentV2
struct TwoWayParam {
  @Param count: number = 0;
  @Event onCountChange: (n: number) => void = (n: number) => {};
  build() {
    Column() {
      Text(this.count.toString())
      Button("Increment").onClick(() => {
        this.count++
        this.onCountChange(this.count)
      })
    }
  }
}

// Valid: Multiple @Param properties
@ComponentV2
struct MultiParam {
  @Param name: string = "Item";
  @Param price: number = 0;
  @Param quantity: number = 1;
  @Computed get total(): number { return this.price * this.quantity; }
  build() {
    Column() {
      Text(this.name)
      Text("Price: " + this.price.toString())
      Text("Qty: " + this.quantity.toString())
      Text("Total: " + this.total.toString())
    }
  }
}

// Valid: @Param with complex object
@ObservedV2
class UserConfig {
  @Trace theme: string = "light";
  @Trace fontSize: number = 14;
}

@ComponentV2
struct ConfigComponent {
  @Param config: UserConfig = new UserConfig();
  build() {
    Column() {
      Text("Theme: " + this.config.theme)
      Text("Font: " + this.config.fontSize.toString())
    }
  }
}

@Entry
@Component
struct ParamRequireDeepEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
