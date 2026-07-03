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
 * Grid child component rules.
Tests error 10905219: Grid can only contain GridItem children.
Direct Text or other components inside Grid are not allowed.
 */

// --- Error Cases ---

// Error 10905219: Grid with direct Text child (not wrapped in GridItem)
@Component
struct GridWithText {
  build() {
    Grid() {
      Text("invalid direct child")
    }
  }
}

// --- Valid Patterns ---

// Valid: Grid with GridItem children
@Component
struct GridValidChildren {
  build() {
    Grid() {
      GridItem() { Text("valid 1") }
      GridItem() { Text("valid 2") }
      GridItem() { Text("valid 3") }
      GridItem() { Text("valid 4") }
    }
  }
}

// Valid: Grid with ForEach inside GridItem
@Component
struct GridWithForEach {
  @State numbers: number[] = [1, 2, 3, 4, 5, 6];
  build() {
    Grid() {
      ForEach(this.numbers, (num: number) => {
        GridItem() {
          Text(num.toString())
        }
      }, (num: number) => num.toString())
    }
  }
}

// Valid: Grid with styled GridItems
@Component
struct GridStyled {
  build() {
    Grid() {
      GridItem() {
        Column() {
          Text("Card 1").fontSize(16)
          Text("Description")
        }
      }
      GridItem() {
        Column() {
          Text("Card 2").fontSize(16)
          Text("Another description")
        }
      }
    }
  }
}

// Valid: Grid with conditional rendering in GridItem
@Component
struct GridConditional {
  @State showAll: boolean = true;
  build() {
    Grid() {
      GridItem() { Text("Always visible") }
      if (this.showAll) {
        GridItem() { Text("Conditional item") }
      }
      GridItem() { Text("Last item") }
    }
  }
}

// Valid: Simple grid layout
@Component
struct GridSimpleLayout {
  build() {
    Grid() {
      GridItem() { Text("A") }
      GridItem() { Text("B") }
      GridItem() { Text("C") }
      GridItem() { Text("D") }
      GridItem() { Text("E") }
      GridItem() { Text("F") }
    }
    .columnsTemplate("1fr 1fr 1fr")
  }
}

@Entry
@Component
struct GridChildRulesEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
