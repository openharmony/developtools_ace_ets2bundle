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
 * Valid @Once and @Require combination patterns.
 */

// --- Valid Patterns ---

@ComponentV2
struct OnceRequireValid {
  @Once @Param config: string = "default";
  build() { Column() { Text(this.config) } }
}

@ComponentV2
struct RequireWithParam {
  @Require @Param userId: string;
  @Local profile: string = "";
  build() {
    Column() {
      Text("User: " + this.userId)
      Text("Profile: " + this.profile)
      Button("Load").onClick(() => { this.profile = "Loaded data" })
    }
  }
}

@ComponentV2
struct OnceWithEvent {
  @Once @Param initialCount: number = 0;
  @Local current: number = 0;
  build() {
    Column() {
      Text("Initial: " + this.initialCount.toString())
      Text("Current: " + this.current.toString())
      Button("Sync").onClick(() => { this.current = this.initialCount })
      Button("Add").onClick(() => { this.current++ })
    }
  }
}

@ComponentV2
struct RequireBuilderParam {
  @Require @BuilderParam header: () => void;
  build() {
    Column() {
      this.header()
      Text("Body content")
    }
  }
}

@Builder
function defaultHeader() { Text("Default Header") }

@ComponentV2
struct UsesRequiredBuilder {
  build() {
    Column() {
      RequireBuilderParam({ header: defaultHeader })
    }
  }
}

@ComponentV2
struct ConfigurableList {
  @Require @Param title: string;
  @Once @Param maxItems: number = 10;
  @Local items: string[] = [];
  build() {
    Column() {
      Text(this.title).fontWeight(FontWeight.Bold)
      Text("Max: " + this.maxItems.toString())
      Text("Items: " + this.items.length.toString())
      Button("Add").onClick(() => {
        if (this.items.length < this.maxItems) {
          this.items.push("Item " + this.items.length)
        }
      })
    }
  }
}

@Entry
@Component
struct OnceRequireValidEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
