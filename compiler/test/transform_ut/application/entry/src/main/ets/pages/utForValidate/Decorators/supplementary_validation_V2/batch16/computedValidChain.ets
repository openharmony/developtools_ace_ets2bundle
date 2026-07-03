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
 * Valid @Computed chain with multiple dependencies.
 */

// --- Valid Patterns ---

@ComponentV2
struct PriceCalculator {
  @Local unitPrice: number = 50;
  @Local quantity: number = 3;
  @Local taxRate: number = 0.08;
  @Local discount: number = 10;
  @Computed get subtotal(): number { return this.unitPrice * this.quantity; }
  @Computed get afterDiscount(): number { return this.subtotal - this.discount; }
  @Computed get tax(): number { return Math.floor(this.afterDiscount * this.taxRate); }
  @Computed get total(): number { return this.afterDiscount + this.tax; }
  build() {
    Column() {
      Text("Unit: " + this.unitPrice.toString())
      Text("Qty: " + this.quantity.toString())
      Text("Subtotal: " + this.subtotal.toString())
      Text("After Discount: " + this.afterDiscount.toString())
      Text("Tax: " + this.tax.toString())
      Text("Total: " + this.total.toString()).fontWeight(FontWeight.Bold)
    }
  }
}

@ComponentV2
struct StringProcessor {
  @Local input: string = "Hello World";
  @Computed get trimmed(): string { return this.input.trim(); }
  @Computed get upper(): string { return this.trimmed.toUpperCase(); }
  @Computed get wordCount(): number { return this.trimmed.split(" ").length; }
  @Computed get reversed(): string { return this.upper.split("").reverse().join(""); }
  build() {
    Column() {
      Text("Input: " + this.input)
      Text("Upper: " + this.upper)
      Text("Words: " + this.wordCount.toString())
      Text("Reversed: " + this.reversed)
    }
  }
}

@ComponentV2
struct StatusChecker {
  @Local isActive: boolean = true;
  @Local hasError: boolean = false;
  @Local retryCount: number = 0;
  @Computed get status(): string {
    if (this.hasError) return "Error";
    if (!this.isActive) return "Inactive";
    return "Active";
  }
  @Computed get canRetry(): boolean { return this.hasError && this.retryCount < 3; }
  @Computed get label(): string { return this.status + " (retries: " + this.retryCount + ")"; }
  build() {
    Column() {
      Text("Status: " + this.status)
      Text("Label: " + this.label)
      Text("Can Retry: " + this.canRetry.toString())
      Button("Toggle Active").onClick(() => { this.isActive = !this.isActive })
      Button("Simulate Error").onClick(() => { this.hasError = true })
      Button("Retry").onClick(() => { this.retryCount++ })
    }
  }
}

@Entry
@Component
struct ComputedValidChainEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
