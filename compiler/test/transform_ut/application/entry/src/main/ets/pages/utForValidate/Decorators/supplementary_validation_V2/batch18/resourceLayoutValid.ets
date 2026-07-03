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
 * Valid layout components without resource dependencies.
 */

// --- Valid Patterns ---

@Component
struct GridLayout {
  build() {
    Column() {
      Text("Grid Layout").fontSize(18).fontWeight(FontWeight.Bold)
      Row() {
        Column() { Text("Cell 1") }.width("50%")
        Column() { Text("Cell 2") }.width("50%")
      }
      Row() {
        Column() { Text("Cell 3") }.width("50%")
        Column() { Text("Cell 4") }.width("50%")
      }
    }
  }
}

@Component
struct StackLayout {
  build() {
    Column() {
      Text("Stack Layout Demo").fontSize(16)
      Stack() {
        Text("Background Layer").fontColor(Color.Gray)
        Text("Foreground Layer")
      }
    }
  }
}

@Component
struct FlexLayout {
  build() {
    Column() {
      Text("Flex Layout").fontSize(16)
      Row() {
        Text("A").padding(8)
        Text("B").padding(8)
        Text("C").padding(8)
      }
      .justifyContent(FlexAlign.SpaceAround)
    }
  }
}

@Component
struct ListLayout {
  @State sections: string[] = ["Section A", "Section B", "Section C"];
  build() {
    Column() {
      Text("List Layout").fontSize(16)
      ForEach(this.sections, (section: string, i: number) => {
        Column() {
          Text(section).fontWeight(FontWeight.Bold)
          Text("Content for " + section).fontSize(12)
        }
        .padding(8)
      }, (section: string) => section)
    }
  }
}

@Component
struct PanelLayout {
  build() {
    Column() {
      Text("Panel Layout").fontSize(16)
      Row() {
        Column() {
          Text("Left Panel").fontSize(12)
          Text("Navigation items here")
        }
        .width("30%")

        Column() {
          Text("Main Panel").fontSize(12)
          Text("Main content here")
        }
        .width("70%")
      }
    }
  }
}

@Component
struct ResponsiveLayout {
  @State isCompact: boolean = false;
  build() {
    Column() {
      Text("Responsive Layout").fontSize(16)
      Button("Toggle Layout").onClick(() => { this.isCompact = !this.isCompact })
      if (this.isCompact) {
        Column() {
          Text("Compact Mode")
          Text("Single column layout")
        }
      } else {
        Row() {
          Column() { Text("Wide Left") }
          Column() { Text("Wide Right") }
        }
      }
    }
  }
}

@Component
struct CardGridLayout {
  build() {
    Column() {
      Text("Card Grid").fontSize(16)
      ForEach([1, 2, 3], (n: number) => {
        Row() {
          Text("Card " + n.toString() + "A")
          Text("Card " + n.toString() + "B")
        }
        .padding(4)
      }, (n: number) => n.toString())
    }
  }
}

@Entry
@Component
struct ResourceLayoutValidEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
