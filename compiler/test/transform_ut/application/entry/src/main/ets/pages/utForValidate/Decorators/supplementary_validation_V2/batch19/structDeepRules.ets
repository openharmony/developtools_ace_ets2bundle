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
 * Struct decorator validation and naming rules.
 */

// --- Error Cases ---

// Error 10905230: Struct missing component decorator
struct NoDecorator {
  build() { Column() { Text("no decorator") } }
}

// --- Valid Patterns ---

// Valid: @Component struct
@Component
struct ValidComponent {
  @State count: number = 0;
  build() {
    Column() {
      Text("Count: " + this.count.toString())
      Button("Add").onClick(() => this.count++)
    }
  }
}

// Valid: @ComponentV2 struct
@ComponentV2
struct ValidV2Component {
  @Local count: number = 0;
  build() {
    Column() {
      Text("V2 Count: " + this.count.toString())
      Button("Add").onClick(() => this.count++)
    }
  }
}

// Valid: @CustomDialog struct
@CustomDialog
struct ValidDialog {
  controller: CustomDialogController;
  build() {
    Column() {
      Text("Dialog Content")
      Button("Close").onClick(() => this.controller.close())
    }
  }
}

// Valid: @Reusable struct
@Reusable
@Component
struct ValidReusable {
  build() {
    Column() { Text("Reusable Component") }
  }
}

// Valid: Struct with complex state
@Component
struct ComplexState {
  @State name: string = "Test";
  @State items: string[] = [];
  @State isActive: boolean = true;
  build() {
    Column() {
      Text("Name: " + this.name)
      Text("Items: " + this.items.length.toString())
      Text("Active: " + this.isActive.toString())
      Button("Toggle").onClick(() => { this.isActive = !this.isActive })
    }
  }
}

// Valid: Struct with methods
@Component
struct WithMethods {
  @State value: number = 0;
  private doubleIt(): number { return this.value * 2; }
  private reset(): void { this.value = 0; }
  build() {
    Column() {
      Text("Value: " + this.value.toString())
      Text("Doubled: " + this.doubleIt().toString())
      Button("Add").onClick(() => this.value++)
      Button("Reset").onClick(() => this.reset())
    }
  }
}

// Valid: Multiple structs in one file
@Component
struct FirstComponent {
  build() { Column() { Text("First") } }
}

@Component
struct SecondComponent {
  build() { Column() { Text("Second") } }
}

@Entry
@Component
struct StructDeepRulesEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
