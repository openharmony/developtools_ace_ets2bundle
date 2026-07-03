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
 * @Computed property chain with multiple levels of dependency.
Tests valid @Computed where one computed property depends on another.
Includes multi-level computed chains and mixed dependencies.
 */

// --- Valid Patterns ---

// Valid: Computed chain (product depends on base, formatted depends on product)
@ComponentV2
struct ComputedChain {
  @Local base: number = 10;
  @Local multiplier: number = 2;
  @Computed get product(): number { return this.base * this.multiplier; }
  @Computed get formatted(): string { return "Result: " + this.product; }
  build() { Column() { Text(this.formatted) } }
}

// Valid: Three-level computed chain
@ComponentV2
struct ThreeLevelChain {
  @Local base: number = 5;
  @Computed get doubled(): number { return this.base * 2; }
  @Computed get squared(): number { return this.doubled * this.doubled; }
  @Computed get label(): string { return "Value: " + this.squared.toString(); }
  build() { Column() { Text(this.label) } }
}

// Valid: Computed with multiple independent dependencies
@ComponentV2
struct MultiDepsComputed {
  @Local width: number = 100;
  @Local height: number = 200;
  @Local depth: number = 50;
  @Computed get area(): number { return this.width * this.height; }
  @Computed get volume(): number { return this.area * this.depth; }
  @Computed get summary(): string {
    return "W:" + this.width.toString() + " H:" + this.height.toString() +
      " D:" + this.depth.toString() + " V:" + this.volume.toString();
  }
  build() { Column() { Text(this.summary) } }
}

// Valid: Computed with boolean logic
@ComponentV2
struct BooleanComputed {
  @Local count: number = 5;
  @Local max: number = 10;
  @Computed get isFull(): boolean { return this.count >= this.max; }
  @Computed get statusText(): string { return this.isFull ? "Full" : "Available"; }
  @Computed get remaining(): number { return this.max - this.count; }
  build() {
    Column() {
      Text(this.statusText)
      Text("Remaining: " + this.remaining.toString())
    }
  }
}

// Valid: Computed with string manipulation
@ComponentV2
struct StringComputed {
  @Local firstName: string = "John";
  @Local lastName: string = "Doe";
  @Computed get fullName(): string { return this.firstName + " " + this.lastName; }
  @Computed get initials(): string {
    return this.firstName.charAt(0) + this.lastName.charAt(0);
  }
  @Computed get displayName(): string { return this.initials + " - " + this.fullName; }
  build() {
    Column() {
      Text(this.displayName)
    }
  }
}

// Valid: Computed with @Monitor
@ComponentV2
struct ComputedWithMonitor {
  @Local base: number = 10;
  @Computed get doubled(): number { return this.base * 2; }
  @Monitor("base")
  onBaseChange() { console.log("Base changed, doubled now: " + this.doubled); }
  build() {
    Column() {
      Text("Base: " + this.base.toString())
      Text("Doubled: " + this.doubled.toString())
      Button("Change").onClick(() => this.base = Math.floor(Math.random() * 100))
    }
  }
}

@Entry
@Component
struct DeepComputedChainEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
