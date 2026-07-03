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
 * @Observed and @ObservedV2 conflict validation.
 */

// --- Error Cases ---

// Error 10905226: Both @Observed and @ObservedV2
@Observed
@ObservedV2
class DualObserved { count: number = 0; }

// --- Valid Patterns ---

@ObservedV2
class ValidV2Model {
  @Trace id: number = 0;
  @Trace name: string = "Model";
  @Trace active: boolean = true;
}

@ComponentV2
struct V2ModelDisplay {
  @Local model: ValidV2Model = new ValidV2Model();
  build() {
    Column() {
      Text("ID: " + this.model.id.toString())
      Text("Name: " + this.model.name)
      Text("Active: " + this.model.active.toString())
      Button("Toggle Active").onClick(() => { this.model.active = !this.model.active })
    }
  }
}

@ObservedV2
class CounterModel {
  @Trace count: number = 0;
  increment(): void { this.count++; }
  reset(): void { this.count = 0; }
}

@ComponentV2
struct CounterDisplay {
  @Local counter: CounterModel = new CounterModel();
  build() {
    Column() {
      Text("Count: " + this.counter.count.toString())
      Button("+").onClick(() => this.counter.increment())
      Button("Reset").onClick(() => this.counter.reset())
    }
  }
}

@ObservedV2
class ProductModel {
  @Trace name: string = "Product";
  @Trace price: number = 0;
  @Trace inStock: boolean = true;
}

@ComponentV2
struct ProductDisplay {
  @Local product: ProductModel = new ProductModel();
  build() {
    Column() {
      Text(this.product.name).fontSize(18)
      Text("Price: $" + this.product.price.toString())
      Text("Stock: " + (this.product.inStock ? "Yes" : "No"))
      Button("Update Price").onClick(() => { this.product.price += 10 })
    }
  }
}

@Entry
@Component
struct ObservedConflictDeepEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
