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
 * Test case: Preview decorator error
 * Purpose: Verify @Preview decorator usage and validation
 * Error code: 10906100
 */

// ============================================
// Test Case 1: @Preview without @Component
// Expected Error: 10906100
// ============================================

@Preview
class PreviewWithoutComponent {
  name: string = 'test'
}

// ============================================
// Test Case 2: @Preview with invalid parameters
// Expected Error: 10906100
// ============================================

@Preview({ invalid: 'value', width: 'invalid' })
@Component
struct PreviewWithInvalidParams {
  build() {
    Column() {
      Text('Invalid Preview')
    }
  }
}

// ============================================
// Test Case 3: @Preview with wrong parameter types
// Expected Error: 10906100
// ============================================

@Preview({ title: 123, width: true })
@Component
struct PreviewWrongParamTypes {
  build() {
    Column() {
      Text('Wrong Types')
    }
  }
}

// ============================================
// Test Case 4: Correct @Preview usage
// ============================================

@Preview
@Component
struct DefaultPreviewComponent {
  @State count: number = 0

  build() {
    Column() {
      Text('Default Preview')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Text('Count: ' + this.count)
        .fontSize(18)
        .margin(15)

      Button('Increment')
        .onClick(() => {
          this.count++
        })
        .width(150)
        .height(45)
        .margin(10)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F5F5')
  }
}

@Preview({ title: 'Card Component' })
@Component
struct CardPreview {
  @Prop title: string = 'Card Title'
  @Prop content: string = 'Card content description'

  build() {
    Column() {
      Text(this.title)
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(15)

      Text(this.content)
        .fontSize(14)
        .fontColor('#666666')
        .margin(10)
    }
    .width(300)
    .padding(20)
    .backgroundColor('#FFFFFF')
    .borderRadius(10)
    .shadow({ radius: 5, color: '#30000000' })
  }
}

@Preview({ title: 'Mobile View', width: 375, height: 667 })
@Component
struct MobilePreview {
  build() {
    Column() {
      Text('Mobile Preview')
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('iPhone SE Size')
          .fontSize(16)
          .margin(5)

        Text('375 x 667')
          .fontSize(14)
          .fontColor('#999999')
      }
      .padding(20)
      .backgroundColor('#E3F2FD')
      .borderRadius(8)

      Button('Action')
        .margin(20)
        .width(120)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#FAFAFA')
  }
}

@Preview({ title: 'Tablet View', width: 768, height: 1024 })
@Component
struct TabletPreview {
  build() {
    Row() {
      Column() {
        Text('Sidebar')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor(Color.White)
      }
      .width(200)
      .height('100%')
      .backgroundColor('#1890FF')
      .padding(20)

      Column() {
        Text('Main Content')
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .margin(20)

        Text('Tablet Layout (768 x 1024)')
          .fontSize(14)
          .fontColor('#666666')
      }
      .layoutWeight(1)
      .height('100%')
      .backgroundColor('#F5F5F5')
    }
    .width('100%')
    .height('100%')
  }
}

// ============================================
// Test Case 5: Multiple previews for same component
// ============================================

@Preview({ title: 'Small Phone', width: 320, height: 568 })
@Preview({ title: 'Medium Phone', width: 375, height: 812 })
@Preview({ title: 'Large Phone', width: 414, height: 896 })
@Component
struct ResponsiveComponent {
  @State items: string[] = ['Item 1', 'Item 2', 'Item 3']

  build() {
    Column() {
      Text('Responsive Design')
        .fontSize(22)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      List() {
        ForEach(this.items, (item: string, index: number) => {
          ListItem() {
            Row() {
              Text(item)
                .fontSize(16)
                .layoutWeight(1)

              Text('Details >')
                .fontSize(14)
                .fontColor('#1890FF')
            }
            .width('100%')
            .padding(15)
          }
          .backgroundColor(index % 2 === 0 ? '#FFFFFF' : '#F5F5F5')
        })
      }
      .width('90%')
      .layoutWeight(1)
      .margin(10)

      Button('Add Item')
        .onClick(() => {
          this.items.push('Item ' + (this.items.length + 1))
        })
        .width(150)
        .height(45)
        .margin(15)
    }
    .width('100%')
    .height('100%')
  }
}

// ============================================
// Entry point for testing
// ============================================

@Entry
@Component
struct TestPreviewDecorator {
  @State testTitle: string = '@Preview Decorator Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing Error Code: 10906100')
          .fontSize(18)
          .fontColor(Color.Red)
          .margin(5)

        Text('@Preview without @Component')
          .fontSize(14)
          .margin(5)

        Text('@Preview with invalid params')
          .fontSize(14)
          .margin(5)

        Text('@Preview with wrong param types')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      Column() {
        Text('@Preview Rules:')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin(5)

        Text('1. Must be used with @Component')
          .fontSize(14)
          .margin(2)

        Text('2. Can specify title, width, height')
          .fontSize(14)
          .margin(2)

        Text('3. Multiple previews allowed')
          .fontSize(14)
          .margin(2)

        Text('4. Used for IDE preview')
          .fontSize(14)
          .margin(2)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .margin(10)

      Column() {
        Text('Correct Usage:')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)

        Text('@Preview({')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('  title: "My Preview",')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('  width: 375,')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('  height: 667')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('})')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('@Component')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('struct MyComponent { ... }')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#E8F5E9')
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}
