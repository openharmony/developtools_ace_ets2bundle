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
 * Build method content restriction validation.
 */

// --- Error Cases ---

// Error 10905209: Non-UI statement in build
@Component
struct BuildWithStatement {
  build() {
    let temp: number = 42;
    Column() { Text(temp.toString()) }
  }
}

// --- Valid Patterns ---

@Component
struct CleanBuild {
  @State count: number = 0;
  build() {
    Column() {
      Text("Count: " + this.count.toString())
      Button("Add").onClick(() => this.count++)
    }
  }
}

@Component
struct ConditionalBuild {
  @State show: boolean = false;
  build() {
    Column() {
      if (this.show) { Text("Visible") } else { Text("Hidden") }
      Button("Toggle").onClick(() => { this.show = !this.show })
    }
  }
}

@Component
struct ForEachBuild {
  @State items: string[] = ["A", "B", "C"];
  build() {
    Column() {
      ForEach(this.items, (item: string) => { Text(item) }, (item: string) => item)
    }
  }
}

@Component
struct NestedBuild {
  build() {
    Column() {
      Row() {
        Text("Left").layoutWeight(1)
        Text("Right")
      }
      Divider()
      Column() { Text("Content") }
    }
  }
}

@Entry
@Component
struct BuildContentRulesEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
