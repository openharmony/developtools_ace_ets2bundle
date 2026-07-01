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
 * @Entry decorator with configuration parameter.
Tests error 10905231 + 10905402: Multiple @Entry decorators.
@Entry should appear exactly once per page.
 */

// --- Error Cases ---

// Error 10905231 + 10905402: Additional @Entry beyond the generated one
@Entry({ route: "main" })
@Component
struct EntryWithConfig {
  build() { Column() { Text("configured entry") } }
}

// --- Valid Patterns ---

// Valid: Simple @Entry @Component
@Component
struct SimpleComponent {
  build() { Column() { Text("simple") } }
}

// Valid: Component with state
@Component
struct StatefulComponent {
  @State count: number = 0;
  build() {
    Column() {
      Text(this.count.toString())
      Button("Add").onClick(() => this.count++)
    }
  }
}

// Valid: Component with props
@Component
struct PropsComponent {
  @Prop title: string = "default";
  @Prop visible: boolean = true;
  build() {
    Column() {
      if (this.visible) {
        Text(this.title)
      }
    }
  }
}

// Valid: Component with builder
@Builder
function headerBuilder() { Text("Header") }

@Component
struct ComponentWithBuilder {
  build() {
    Column() {
      headerBuilder()
      Text("Body content")
    }
  }
}

// Valid: Component with ForEach
@Component
struct ComponentWithList {
  @State items: string[] = ["A", "B", "C"];
  build() {
    Column() {
      ForEach(this.items, (item: string) => {
        Text(item)
      }, (item: string) => item)
    }
  }
}

// Valid: Component with conditional rendering
@Component
struct ComponentConditional {
  @State mode: number = 1;
  build() {
    Column() {
      if (this.mode === 1) {
        Text("Mode 1")
      } else {
        Text("Other mode")
      }
    }
  }
}

@Entry
@Component
struct EntryWithParamEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
