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
 * Type assertion inside build method.
Tests error 10905204: type assertion expressions do not meet UI component syntax.
Type assertions like as are compile-time features, not runtime UI components.
 */

// --- Error Cases ---

// Error 10905204: type assertion expression does not meet UI syntax
@Component
struct BuildWithTypeAssert {
  @State data: Object = "test";
  build() {
    Column() {
      (this.data as string).length
      Text("after assertion")
    }
  }
}

// --- Valid Patterns ---

// Valid: Using typed state variables directly
@Component
struct ValidTypedState {
  @State message: string = "Hello";
  build() {
    Column() {
      Text(this.message)
      Text("Length: " + this.message.length.toString())
    }
  }
}

// Valid: Accessing properties of typed state
@Component
struct ValidPropertyAccess {
  @State count: number = 42;
  build() {
    Column() {
      Text("Count: " + this.count.toString())
      Text("Doubled: " + (this.count * 2).toString())
      Text("Is positive: " + (this.count > 0).toString())
    }
  }
}

// Valid: Build with multiple text elements
@Component
struct ValidMultiText {
  @State title: string = "Main Title";
  @State subtitle: string = "Subtitle";
  @State footer: string = "Footer";
  build() {
    Column() {
      Text(this.title).fontSize(20)
      Text(this.subtitle).fontSize(16)
      Divider()
      Text(this.footer).fontSize(12)
    }
  }
}

// Valid: Build with interactive button
@Component
struct ValidInteractive {
  @State label: string = "Initial";
  build() {
    Column() {
      Text(this.label)
      Button("Change").onClick(() => {
        this.label = "Changed at " + Date.now().toString()
      })
    }
  }
}

// Valid: Build with list items
@Component
struct ValidListItems {
  @State fruits: string[] = ["Apple", "Banana", "Cherry"];
  build() {
    Column() {
      Text("Fruit List").fontWeight(FontWeight.Bold)
      ForEach(this.fruits, (fruit: string) => {
        Text("- " + fruit)
      }, (fruit: string) => fruit)
    }
  }
}

@Entry
@Component
struct BuildWithTypeAssertionEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
