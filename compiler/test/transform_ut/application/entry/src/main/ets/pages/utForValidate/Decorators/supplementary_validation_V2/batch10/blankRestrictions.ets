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
 * Blank component nesting restrictions.
Tests valid Blank usage. Blank should only be used inside container components
that support it like Column and Row.
 */

// --- Valid Patterns ---

// Valid: Blank inside Column with weight
@Component
struct BlankInColumn {
  build() {
    Column() {
      Text("Top")
      Blank()
      Text("Bottom")
    }
  }
}

// Valid: Blank inside Row
@Component
struct BlankInRow {
  build() {
    Column() {
      Row() {
        Text("Left")
        Blank()
        Text("Right")
      }
    }
  }
}

// Valid: Multiple Blanks in Column
@Component
struct MultiBlankColumn {
  build() {
    Column() {
      Text("Header")
      Blank()
      Text("Middle")
      Blank()
      Text("Footer")
    }
  }
}

// Valid: Blank with styled text
@Component
struct BlankWithStyle {
  build() {
    Column() {
      Text("Title").fontSize(20).fontWeight(FontWeight.Bold)
      Blank()
      Text("Content goes here").fontSize(14)
    }
  }
}

// Valid: Blank in nested layout
@Component
struct BlankNested {
  build() {
    Column() {
      Row() {
        Text("Row Item 1")
        Blank()
        Text("Row Item 2")
      }
      Blank()
      Text("Below the row")
    }
  }
}

// Valid: Blank with button interaction
@Component
struct BlankWithButton {
  @State showExtra: boolean = false;
  build() {
    Column() {
      Text("Main Content")
      Blank()
      if (this.showExtra) {
        Text("Extra Content")
      }
      Button("Toggle").onClick(() => {
        this.showExtra = !this.showExtra
      })
    }
  }
}

@Entry
@Component
struct BlankRestrictionsEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
