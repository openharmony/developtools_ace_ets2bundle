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
 * @Observed class used in V2 component.
Tests valid V1 observed class usage in V2 context.
@Observed classes can be stored in V2 @Local without issues.
 */

// --- Valid Patterns ---

// Valid: @Observed class definition
@Observed
class V1Model {
  count: number = 0;
  name: string = "model";
}

// Valid: V2 component using V1 observed class as @Local
@ComponentV2
struct V2UsingV1Model {
  @Local model: V1Model = new V1Model();
  build() { Column() { Text(this.model.count.toString()) } }
}

// Valid: V1 observed class with methods
@Observed
class Counter {
  value: number = 0;
  max: number = 100;
  increment(): void { if (this.value < this.max) this.value++; }
  reset(): void { this.value = 0; }
  get canIncrement(): boolean { return this.value < this.max; }
}

@ComponentV2
struct V2CounterDisplay {
  @Local counter: Counter = new Counter();
  build() {
    Column() {
      Text("Count: " + this.counter.value.toString())
      Text("Can increment: " + this.counter.canIncrement.toString())
      Button("Add").onClick(() => this.counter.increment())
    }
  }
}

// Valid: V2 component with V1 model and V2 features
@Observed
class UserInfo {
  name: string = "User";
  email: string = "user@example.com";
  verified: boolean = false;
}

@ComponentV2
struct UserInfoCard {
  @Local user: UserInfo = new UserInfo();
  @Computed get statusText(): string {
    return this.user.verified ? "Verified" : "Unverified";
  }
  build() {
    Column() {
      Text(this.user.name).fontSize(18)
      Text(this.user.email).fontSize(14)
      Text(this.statusText).fontColor(this.user.verified ? Color.Green : Color.Red)
    }
  }
}

// Valid: Multiple V1 models in V2 component
@Observed
class Product {
  name: string = "Product";
  price: number = 0;
}

@Observed
class Cart {
  items: number = 0;
  total: number = 0;
}

@ComponentV2
struct ShoppingCart {
  @Local product: Product = new Product();
  @Local cart: Cart = new Cart();
  build() {
    Column() {
      Text(this.product.name + " - $" + this.product.price.toString())
      Text("Cart: " + this.cart.items.toString() + " items")
      Text("Total: $" + this.cart.total.toString())
    }
  }
}

// Valid: V2 component with V1 observed class array
@ComponentV2
struct ProductList {
  @Local products: Product[] = [new Product(), new Product()];
  build() {
    Column() {
      Text("Product Count: " + this.products.length.toString())
      ForEach(this.products, (p: Product) => {
        Text(p.name)
      }, (p: Product, i: number) => i.toString())
    }
  }
}

// Valid: Simple V2 component
@ComponentV2
struct SimpleV2 {
  @Local message: string = "Hello V2";
  build() { Column() { Text(this.message) } }
}

@Entry
@Component
struct ObservedInV2Entry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
