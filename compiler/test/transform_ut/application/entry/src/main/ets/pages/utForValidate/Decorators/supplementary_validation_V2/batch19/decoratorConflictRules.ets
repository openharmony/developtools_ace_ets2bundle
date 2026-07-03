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
 * Decorator conflict and duplicate validation.
 */

// --- Error Cases ---

// Error 10905119: Duplicate @Builder decorator
@Component
struct DuplicateBuilder {
  @Builder
  @Builder
  content() { Text("duplicate") }
  build() { Column() { Text("test") } }
}

// --- Valid Patterns ---

// Valid: Single decorator per member
@Component
struct SingleDecorator {
  @State count: number = 0;
  @State name: string = "Test";
  build() {
    Column() {
      Text(this.name)
      Text(this.count.toString())
    }
  }
}

// Valid: Different decorators on different members
@Component
struct DifferentDecorators {
  @State value: number = 0;
  @Prop label: string;
  @Link synced: number;
  build() {
    Column() {
      Text(this.label)
      Text(this.value.toString())
      Text(this.synced.toString())
    }
  }
}

// Valid: V2 decorators
@ComponentV2
struct V2Decorators {
  @Local count: number = 0;
  @Param name: string = "default";
  @Computed get doubled(): number { return this.count * 2; }
  build() {
    Column() {
      Text(this.name)
      Text(this.count.toString())
      Text(this.doubled.toString())
    }
  }
}

// Valid: @Provide/@Consume pair
@Component
struct ProviderComponent {
  @Provide("theme") theme: string = "dark";
  build() {
    Column() {
      Text("Theme: " + this.theme)
      ConsumerComponent()
    }
  }
}

@Component
struct ConsumerComponent {
  @Consume("theme") currentTheme: string;
  build() {
    Column() { Text("Consumer: " + this.currentTheme) }
  }
}

// Valid: @Watch on state variable
@Component
struct ValidWatch {
  @State count: number = 0;
  @Watch("onCountChange")
  trackedCount: number = 0;
  onCountChange(): void { this.count = this.trackedCount * 2; }
  build() {
    Column() {
      Text("Tracked: " + this.trackedCount.toString())
      Text("Count: " + this.count.toString())
      Button("Add").onClick(() => this.trackedCount++)
    }
  }
}

// Valid: @ObjectLink with @Observed
@Observed
class DataModel {
  data: number = 0;
}

@Component
struct ObjectLinkComp {
  @ObjectLink model: DataModel;
  build() { Column() { Text(this.model.data.toString()) } }
}

@Entry
@Component
struct DecoratorConflictRulesEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
