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
 * Complete V2 component example combining all V2 features.
Tests @ObservedV2, @Trace, @Param, @Local, @Computed, @Monitor together.
Demonstrates a full V2 state management pattern.
 */

// --- Valid Patterns ---

// Valid: V2 observed model with @Trace
@ObservedV2
class CounterModel {
  @Trace count: number = 0;
  increment() { this.count++; }
  decrement() { this.count--; }
  reset() { this.count = 0; }
}

// Valid: V2 component using the model
@ComponentV2
struct CounterComponent {
  @Param initialCount: number = 0;
  @Local model: CounterModel = new CounterModel();
  @Computed get displayValue(): string {
    return "Count: " + (this.model.count + this.initialCount).toString();
  }
  @Monitor("model")
  onCountChange() { console.log("count changed"); }
  build() {
    Column() {
      Text(this.displayValue)
      Button("Increment").onClick(() => this.model.increment())
      Button("Decrement").onClick(() => this.model.decrement())
      Button("Reset").onClick(() => this.model.reset())
    }
  }
}

// Valid: V2 model with computed properties
@ObservedV2
class CartModel {
  @Trace items: string[] = [];
  @Trace discount: number = 0;
  get total(): number { return this.items.length * 10 - this.discount; }
  get summary(): string {
    return this.items.length.toString() + " items, total: " + this.total.toString();
  }
  addItem(item: string): void { this.items.push(item); }
  applyDiscount(d: number): void { this.discount = d; }
}

@ComponentV2
struct ShoppingCartV2 {
  @Local cart: CartModel = new CartModel();
  @Computed get displaySummary(): string { return this.cart.summary; }
  build() {
    Column() {
      Text(this.displaySummary)
      Button("Add Item").onClick(() => this.cart.addItem("new item"))
      Button("Apply Discount").onClick(() => this.cart.applyDiscount(5))
    }
  }
}

// Valid: V2 component with @Event
@ComponentV2
struct EventfulCounter {
  @Param startValue: number = 0;
  @Local current: number = 0;
  @Event onMaximum: () => void = () => {};
  @Computed get isAtMax(): boolean { return this.current >= 10; }
  build() {
    Column() {
      Text("Current: " + (this.current + this.startValue).toString())
      Button("Increment").onClick(() => {
        this.current++
        if (this.isAtMax) { this.onMaximum() }
      })
    }
  }
}

// Valid: V2 component with @Provider
@ComponentV2
struct ConfigProvider {
  @Local theme: string = "dark";
  @Provider("appTheme") themeValue: string = "dark";
  @Computed get themeLabel(): string { return "Theme: " + this.theme; }
  build() {
    Column() {
      Text(this.themeLabel)
      Button("Toggle Theme").onClick(() => {
        this.theme = this.theme === "dark" ? "light" : "dark"
        this.themeValue = this.theme
      })
      ConfigConsumer()
    }
  }
}

@ComponentV2
struct ConfigConsumer {
  @Consumer("appTheme") currentTheme: string = "dark";
  build() {
    Text("Consumer sees: " + this.currentTheme)
  }
}

// Valid: Full page using V2 components
@ComponentV2
struct V2FullPage {
  build() {
    Column() {
      CounterComponent({ initialCount: 100 })
      ShoppingCartV2()
      ConfigProvider()
    }
  }
}

@Entry
@Component
struct V2CompleteExampleEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
