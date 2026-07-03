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
 * @Builder function return statement restriction.
 */

// --- Error Cases ---

// Error 10905201: @Builder with return statement
@Builder
function builderWithReturn() {
  if (true) {
    return;
  }
  Text("content")
}

// --- Valid Patterns ---

// Valid: @Builder without return
@Builder
function simpleBuilder() {
  Text("Simple Content")
}

// Valid: @Builder with parameters
@Builder
function paramBuilder(label: string, value: number) {
  Column() {
    Text(label).fontSize(16)
    Text(value.toString()).fontSize(14)
  }
}

// Valid: @Builder with conditional (no return)
@Builder
function conditionalBuilder(isActive: boolean) {
  if (isActive) {
    Text("Active State").fontColor(Color.Green)
  } else {
    Text("Inactive State").fontColor(Color.Gray)
  }
}

// Valid: @Builder used in component
@Component
struct UsesBuilder {
  @State count: number = 0;
  build() {
    Column() {
      simpleBuilder()
      paramBuilder("Count", this.count)
      conditionalBuilder(this.count > 0)
      Button("Increment").onClick(() => this.count++)
    }
  }
}

// Valid: @Builder for list items
@Builder
function listItemBuilder(name: string, index: number) {
  Row() {
    Text(name).layoutWeight(1)
    Text("#" + index.toString())
  }
}

@Component
struct ListExample {
  build() {
    Column() {
      listItemBuilder("Alpha", 1)
      listItemBuilder("Beta", 2)
      listItemBuilder("Gamma", 3)
    }
  }
}

// Valid: @Builder for card layout
@Builder
function cardBuilder(title: string) {
  Column() {
    Text(title).fontSize(18).fontWeight(FontWeight.Bold)
    Divider()
    Text("Card body content goes here")
  }
  .padding(16)
}

@Component
struct CardList {
  build() {
    Column() {
      cardBuilder("Card 1")
      cardBuilder("Card 2")
      cardBuilder("Card 3")
    }
  }
}

@Entry
@Component
struct BuilderReturnErrorEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
