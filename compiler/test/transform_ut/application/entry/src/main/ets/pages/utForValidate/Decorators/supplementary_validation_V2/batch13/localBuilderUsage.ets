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
 * @LocalBuilder method usage in V2 struct. Tests valid @LocalBuilder patterns.
 */

// --- Valid Patterns ---

// Valid: @LocalBuilder method in @ComponentV2
@ComponentV2
struct WithLocalBuilder {
  @LocalBuilder
  buildContent() { Text("content") }
  build() { Column() { this.buildContent() } }
}

// Valid: @LocalBuilder with conditional rendering
@ComponentV2
struct ConditionalLocalBuilder {
  @Local isLoading: boolean = false;
  @LocalBuilder
  stateContent() {
    if (this.isLoading) {
      Text("Loading...")
    } else {
      Text("Content loaded!")
    }
  }
  build() { Column() { this.stateContent() } }
}

// Valid: Multiple @LocalBuilder methods
@ComponentV2
struct MultiLocalBuilder {
  @Local title: string = "Dashboard";
  @Local count: number = 0;
  @LocalBuilder
  headerContent() {
    Text(this.title).fontSize(20).fontWeight(FontWeight.Bold)
  }
  @LocalBuilder
  counterContent() {
    Text("Count: " + this.count.toString())
    Button("Add").onClick(() => this.count++)
  }
  build() {
    Column() {
      this.headerContent()
      this.counterContent()
    }
  }
}

// Valid: @LocalBuilder with @Param
@ComponentV2
struct ParamLocalBuilder {
  @Param label: string = "default";
  @LocalBuilder
  labeledContent() {
    Text(this.label).fontSize(16)
  }
  build() { Column() { this.labeledContent() } }
}

// Valid: @LocalBuilder with @Computed
@ComponentV2
struct ComputedLocalBuilder {
  @Local base: number = 5;
  @Local multiplier: number = 3;
  @Computed get product(): number { return this.base * this.multiplier; }
  @LocalBuilder
  productDisplay() {
    Column() {
      Text("Base: " + this.base.toString())
      Text("Multiplier: " + this.multiplier.toString())
      Text("Product: " + this.product.toString()).fontWeight(FontWeight.Bold)
    }
  }
  build() { Column() { this.productDisplay() } }
}

// Valid: @LocalBuilder with ForEach
@ComponentV2
struct ListLocalBuilder {
  @Local items: string[] = ["Alpha", "Beta", "Gamma"];
  @LocalBuilder
  itemList() {
    ForEach(this.items, (item: string) => {
      Text(item).padding(5)
    }, (item: string) => item)
  }
  build() { Column() { this.itemList() } }
}

@Entry
@Component
struct LocalBuilderUsageEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
