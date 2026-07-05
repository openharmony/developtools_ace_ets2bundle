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
 * Valid @ObservedV2 deep patterns.
 */

// --- Valid Patterns ---
// Valid: Component 1
@ObservedV2
class Model1 {
  @Trace value: number = 0;
  @Trace label: string = "Item";
}

// Valid: Component 2
@ComponentV2
struct Display1 {
  @Local model: Model1 = new Model1();
  build() {
    Column() {
      Text(this.model.label)
      Text(this.model.value.toString())
      Button("Add").onClick(() => { this.model.value++ })
    }
  }
}

// Valid: Counter model
@ObservedV2
class CounterModel {
  @Trace count: number = 0;
  increment(): void { this.count++; }
  reset(): void { this.count = 0; }
}

// Valid: Counter display
@ComponentV2
struct CounterView {
  @Local counter: CounterModel = new CounterModel();
  build() {
    Column() {
      Text("Count: " + this.counter.count.toString())
      Button("+").onClick(() => this.counter.increment())
      Button("Reset").onClick(() => this.counter.reset())
    }
  }
}

// Valid: Profile model
@ObservedV2
class Profile {
  @Trace name: string = "User";
  @Trace age: number = 25;
  @Trace active: boolean = true;
}

// Valid: Profile display
@ComponentV2
struct ProfileView {
  @Local profile: Profile = new Profile();
  build() {
    Column() {
      Text("Name: " + this.profile.name)
      Text("Age: " + this.profile.age.toString())
      Text("Active: " + this.profile.active.toString())
      Button("Toggle").onClick(() => { this.profile.active = !this.profile.active })
    }
  }
}

// Valid: Cart model
@ObservedV2
class CartItem {
  @Trace name: string = "Item";
  @Trace price: number = 10;
  @Trace qty: number = 1;
}

// Valid: Cart display
@ComponentV2
struct CartView {
  @Local item: CartItem = new CartItem();
  build() {
    Column() {
      Text(this.item.name)
      Text("Price: $" + this.item.price.toString())
      Text("Qty: " + this.item.qty.toString())
      Text("Total: $" + (this.item.price * this.item.qty).toString())
      Button("Add Qty").onClick(() => { this.item.qty++ })
    }
  }
}

@Entry
@Component
struct ObservedV2ValidDeepEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
