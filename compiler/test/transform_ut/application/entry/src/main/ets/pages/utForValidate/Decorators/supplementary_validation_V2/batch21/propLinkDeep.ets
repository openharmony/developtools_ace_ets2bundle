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
 * @Prop and @Link initialization validation.
 */

// --- Error Cases ---

// Error 10905203: @Link initialized directly
@Component
struct LinkDirectInit {
  @Link value: number = 42;
  build() { Column() { Text("test") } }
}

// --- Valid Patterns ---

@Component
struct PropValid {
  @Prop title: string = "Default";
  @Prop count: number = 0;
  build() { Column() { Text(this.title); Text(this.count.toString()) } }
}

@Component
struct LinkChild {
  @Link syncedValue: number;
  build() { Column() { Text("Linked: " + this.syncedValue.toString()) } }
}

@Component
struct PropParent {
  @State message: string = "Hello";
  build() { Column() { PropValid({ title: this.message }) } }
}

@Component
struct TypedProp {
  @Prop strVal: string = "text";
  @Prop numVal: number = 0;
  build() {
    Column() {
      Text("String: " + this.strVal)
      Text("Number: " + this.numVal.toString())
    }
  }
}

@Component
struct ChildCard {
  @Prop cardTitle: string;
  @Prop cardIndex: number;
  build() {
    Column() {
      Text("Card #" + this.cardIndex.toString())
      Text(this.cardTitle)
    }
  }
}

@Component
struct CardParent {
  build() {
    Column() {
      ChildCard({ cardTitle: "First", cardIndex: 1 })
      ChildCard({ cardTitle: "Second", cardIndex: 2 })
    }
  }
}

@Entry
@Component
struct PropLinkDeepEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
