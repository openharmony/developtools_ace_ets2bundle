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
 * Valid @Extend for Text component with multiple style attributes.
Tests correct @Extend usage with Text component including chained styles.
@Extend allows extending component-specific styling.
 */

// --- Valid Patterns ---

// Valid: @Extend for Text with multiple parameters
@Extend(Text)
function extendTextTitle(color: ResourceColor, size: number) {
  .fontColor(color)
  .fontSize(size)
  .fontWeight(FontWeight.Bold)
}

// Valid: @Extend for Text with single parameter
@Extend(Text)
function extendTextColor(color: ResourceColor) {
  .fontColor(color)
}

// Valid: @Extend for Text without parameters
@Extend(Text)
function extendTextNoParams() {
  .fontSize(16)
  .fontWeight(FontWeight.Normal)
}

// Valid: Using @Extend in component
@Component
struct UsesExtend {
  @State titleColor: ResourceColor = Color.Black;
  build() {
    Column() {
      Text("Title")
        .extendTextTitle(this.titleColor, 24)
      Text("Subtitle")
        .extendTextColor(Color.Gray)
      Text("Body")
        .extendTextNoParams()
    }
  }
}

// Valid: @Extend with interactive color
@Extend(Text)
function extendTextStatus(isActive: boolean) {
  .fontColor(isActive ? Color.Green : Color.Red)
  .fontWeight(isActive ? FontWeight.Bold : FontWeight.Normal)
}

@Component
struct StatusText {
  @State active: boolean = true;
  build() {
    Column() {
      Text("System Status")
        .extendTextStatus(this.active)
      Button("Toggle").onClick(() => {
        this.active = !this.active
      })
    }
  }
}

// Valid: Multiple @Extend functions
@Extend(Text)
function headingStyle() {
  .fontSize(28)
  .fontWeight(FontWeight.Bold)
  .fontColor(Color.Dark)
}

@Extend(Text)
function captionStyle() {
  .fontSize(12)
  .fontColor(Color.Gray)
}

@Component
struct ArticleLayout {
  build() {
    Column() {
      Text("Article Heading").headingStyle()
      Divider().margin(10)
      Text("Body text of the article goes here.").extendTextNoParams()
      Text("Photo caption").captionStyle()
    }
  }
}

// Valid: Component with styled button
@Component
struct StyledButtonPage {
  build() {
    Column() {
      Text("Settings").extendTextTitle(Color.Blue, 22)
      Text("Configure your preferences").extendTextColor(Color.Gray)
      Button("Save").backgroundColor(Color.Green)
      Button("Reset").backgroundColor(Color.Gray)
    }
  }
}

// Valid: List with styled text items
@Component
struct StyledTextList {
  @State items: string[] = ["First Item", "Second Item", "Third Item"];
  build() {
    Column() {
      ForEach(this.items, (item: string) => {
        Text(item).extendTextNoParams()
      }, (item: string) => item)
    }
  }
}

@Entry
@Component
struct ExtendTextValidEntry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
