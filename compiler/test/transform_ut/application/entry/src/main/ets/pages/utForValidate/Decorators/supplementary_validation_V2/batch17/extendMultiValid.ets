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
 * Valid @Extend decorator multi-component patterns.
 */

// --- Valid Patterns ---

@Extend(Text)
function primaryText(size: number) {
  .fontSize(size)
  .fontColor(Color.Blue)
  .fontWeight(FontWeight.Medium)
}

@Extend(Text)
function secondaryText(size: number) {
  .fontSize(size)
  .fontColor(Color.Gray)
}

@Extend(Button)
function primaryButton(bg: ResourceColor) {
  .backgroundColor(bg)
  .borderRadius(8)
  .padding(12)
}

@Extend(Column)
function cardColumn() {
  .padding(16)
  .borderRadius(12)
}

@Component
struct TextShowcase {
  build() {
    Column() {
      Text("Primary Title").primaryText(24)
      Text("Primary Subtitle").primaryText(18)
      Text("Secondary Text").secondaryText(14)
      Text("Footnote").secondaryText(12)
    }
    .cardColumn()
  }
}

@Component
struct ButtonShowcase {
  build() {
    Column() {
      Button("Save").primaryButton(Color.Blue)
      Button("Delete").primaryButton(Color.Red)
      Button("Cancel").primaryButton(Color.Gray)
    }
  }
}

@Component
struct MixedShowcase {
  @State clickCount: number = 0;
  build() {
    Column() {
      Text("Interactive Demo").primaryText(20)
      Text("Clicked: " + this.clickCount.toString()).secondaryText(14)
      Button("Click Me").primaryButton(Color.Green)
      Button("Reset").primaryButton(Color.Gray)
    }
    .cardColumn()
  }
}

@Component
struct ArticleDisplay {
  build() {
    Column() {
      Text("Article Title").primaryText(22)
      Divider().margin(8)
      Text("Introduction paragraph with details.").secondaryText(14)
      Text("Body content continues here.").secondaryText(14)
      Divider().margin(8)
      Text("Conclusion").primaryText(16)
    }
    .cardColumn()
  }
}

@Entry
@Component
struct ExtendMultiValidEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
