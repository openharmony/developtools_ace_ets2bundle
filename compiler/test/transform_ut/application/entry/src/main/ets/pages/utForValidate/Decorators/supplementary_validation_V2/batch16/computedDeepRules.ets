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
 * V2 @Computed decorator deep validation rules.
 */

// --- Error Cases ---

// Error 10905116: @Computed on non-getter
@ComponentV2
struct ComputedOnMethod {
  @Computed
  getValue(): number { return 42; }
  build() { Column() { Text("computed") } }
}

// --- Valid Patterns ---

// Valid: @Computed on getter
@ComponentV2
struct ComputedValid {
  @Local a: number = 10;
  @Local b: number = 20;
  @Computed get sum(): number { return this.a + this.b; }
  build() {
    Column() {
      Text("A: " + this.a.toString())
      Text("B: " + this.b.toString())
      Text("Sum: " + this.sum.toString())
    }
  }
}

// Valid: @Computed with conditional logic
@ComponentV2
struct ComputedConditional {
  @Local score: number = 75;
  @Computed get grade(): string {
    if (this.score >= 90) return "A";
    if (this.score >= 80) return "B";
    if (this.score >= 70) return "C";
    return "F";
  }
  build() {
    Column() {
      Text("Score: " + this.score.toString())
      Text("Grade: " + this.grade)
      Button("Add 10").onClick(() => this.score += 10)
    }
  }
}

// Valid: @Computed chain
@ComponentV2
struct ComputedChain {
  @Local basePrice: number = 100;
  @Local discount: number = 20;
  @Local taxRate: number = 0.1;
  @Computed get discountedPrice(): number { return this.basePrice - this.discount; }
  @Computed get taxAmount(): number { return Math.floor(this.discountedPrice * this.taxRate); }
  @Computed get finalPrice(): number { return this.discountedPrice + this.taxAmount; }
  build() {
    Column() {
      Text("Base: " + this.basePrice.toString())
      Text("Discounted: " + this.discountedPrice.toString())
      Text("Tax: " + this.taxAmount.toString())
      Text("Final: " + this.finalPrice.toString())
    }
  }
}

// Valid: @Computed with string manipulation
@ComponentV2
struct ComputedString {
  @Local firstName: string = "John";
  @Local lastName: string = "Doe";
  @Computed get fullName(): string { return this.firstName + " " + this.lastName; }
  @Computed get initials(): string { return this.firstName[0] + this.lastName[0]; }
  build() {
    Column() {
      Text("Full: " + this.fullName)
      Text("Initials: " + this.initials)
    }
  }
}

// Valid: @Computed depending on @Param
@ComponentV2
struct ComputedFromParam {
  @Param items: number = 5;
  @Param pricePerItem: number = 10;
  @Computed get total(): number { return this.items * this.pricePerItem; }
  build() {
    Column() {
      Text("Items: " + this.items.toString())
      Text("Total: " + this.total.toString())
    }
  }
}

@Entry
@Component
struct ComputedDeepRulesEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
