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
 * Struct build method validation rules.
 */

// --- Error Cases ---

// Error 10905106: Struct without build method
@Component
struct NoBuildMethod {
  @State value: number = 0;
}

// Error 10905103: Multiple build methods
@Component
struct DuplicateBuild {
  build() { Column() { Text("first") } }
  build() { Column() { Text("second") } }
}

// --- Valid Patterns ---

// Valid: Single build method
@Component
struct SingleBuild {
  @State message: string = "Hello";
  build() {
    Column() { Text(this.message) }
  }
}

// Valid: Build with complex content
@Component
struct ComplexBuild {
  @State count: number = 0;
  @State label: string = "Counter";
  build() {
    Column() {
      Text(this.label).fontSize(18).fontWeight(FontWeight.Bold)
      Text(this.count.toString()).fontSize(36)
      Row() {
        Button("-").onClick(() => this.count--)
        Button("Reset").onClick(() => { this.count = 0 })
        Button("+").onClick(() => this.count++)
      }
    }
  }
}

// Valid: Build with conditional rendering
@Component
struct ConditionalBuild {
  @State isLoading: boolean = false;
  @State hasData: boolean = true;
  build() {
    Column() {
      if (this.isLoading) {
        Text("Loading...")
      } else {
        if (this.hasData) {
          Text("Data available")
        } else {
          Text("No data")
        }
      }
      Button("Toggle Loading").onClick(() => { this.isLoading = !this.isLoading })
      Button("Toggle Data").onClick(() => { this.hasData = !this.hasData })
    }
  }
}

// Valid: Build with ForEach
@Component
struct ForEachBuild {
  @State items: string[] = ["A", "B", "C", "D"];
  build() {
    Column() {
      Text("Items (" + this.items.length.toString() + ")")
      ForEach(this.items, (item: string, index: number) => {
        Text((index + 1).toString() + ". " + item)
      }, (item: string) => item)
      Button("Add").onClick(() => { this.items.push("New") })
    }
  }
}

// Valid: Build with nested components
@Component
struct ChildComp {
  @Prop label: string;
  build() { Text(this.label) }
}

@Component
struct ParentWithNested {
  build() {
    Column() {
      ChildComp({ label: "First" })
      ChildComp({ label: "Second" })
      ChildComp({ label: "Third" })
    }
  }
}

// Valid: Build with method calls in expressions
@Component
struct MethodInBuild {
  @State base: number = 10;
  private format(n: number): string { return "Value: " + n.toString(); }
  build() {
    Column() {
      Text(this.format(this.base))
      Text(this.format(this.base * 2))
      Text(this.format(this.base * 3))
      Button("Add 10").onClick(() => { this.base += 10 })
    }
  }
}

@Entry
@Component
struct StructBuildRulesEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
