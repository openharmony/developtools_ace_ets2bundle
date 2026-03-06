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
 * Test case: BuilderParam decorator error
 * Purpose: Verify @BuilderParam decorator usage and validation
 * Error code: 10905300
 */

// ============================================
// Test Case 1: @BuilderParam with default value
// Expected Error: 10905300
// ============================================

@Component
struct BuilderParamWithDefault {
  @BuilderParam customBuilder: () => void = this.defaultBuilder

  @Builder
  defaultBuilder() {
    Column() {
      Text('Default')
    }
  }

  build() {
    Column() {
      this.customBuilder()
    }
  }
}

// ============================================
// Test Case 2: @BuilderParam with wrong type
// Expected Error: 10905300
// ============================================

@Component
struct BuilderParamWrongType {
  @BuilderParam content: string = ''

  build() {
    Column() {
      Text('Content: ' + this.content)
    }
  }
}

// ============================================
// Test Case 3: @BuilderParam used outside @Component
// Expected Error: 10905300
// ============================================

class BuilderParamOutside {
  @BuilderParam builder: () => void = () => {}
}

// ============================================
// Test Case 4: Correct @BuilderParam usage
// ============================================

@Component
struct CorrectBuilderParamUsage {
  @BuilderParam headerBuilder: () => void
  @BuilderParam footerBuilder: () => void
  @BuilderParam contentBuilder: () => void

  build() {
    Column() {
      if (this.headerBuilder) {
        this.headerBuilder()
      }

      Column() {
        if (this.contentBuilder) {
          this.contentBuilder()
        }
      }
      .layoutWeight(1)
      .width('100%')

      if (this.footerBuilder) {
        this.footerBuilder()
      }
    }
    .width('100%')
    .height('100%')
  }
}

// ============================================
// Test Case 5: @BuilderParam with parameters
// ============================================

@Component
struct BuilderParamWithParams {
  @BuilderParam itemBuilder: (item: string, index: number) => void
  @BuilderParam emptyBuilder: () => void

  @State items: string[] = ['Item 1', 'Item 2', 'Item 3', 'Item 4']

  build() {
    Column() {
      Text('Dynamic List Builder')
        .fontSize(22)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      if (this.items.length === 0 && this.emptyBuilder) {
        this.emptyBuilder()
      } else {
        List() {
          ForEach(this.items, (item: string, index: number) => {
            ListItem() {
              if (this.itemBuilder) {
                this.itemBuilder(item, index)
              }
            }
            .margin(5)
          })
        }
        .width('90%')
        .layoutWeight(1)
      }

      Row() {
        Button('Add Item')
          .onClick(() => {
            this.items.push('Item ' + (this.items.length + 1))
          })
          .margin(5)

        Button('Clear All')
          .onClick(() => {
            this.items = []
          })
          .margin(5)
      }
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .padding(10)
  }
}

// ============================================
// Test Case 6: Complex @BuilderParam demo
// ============================================

@Builder
function MyHeaderBuilder() {
  Column() {
    Text('Custom Header')
      .fontSize(24)
      .fontWeight(FontWeight.Bold)
      .fontColor(Color.White)
  }
  .width('100%')
  .height(60)
  .backgroundColor('#1890FF')
  .justifyContent(FlexAlign.Center)
}

@Builder
function MyFooterBuilder() {
  Column() {
    Text('Custom Footer')
      .fontSize(14)
      .fontColor(Color.Gray)
  }
  .width('100%')
  .height(40)
  .backgroundColor('#F5F5F5')
  .justifyContent(FlexAlign.Center)
}

@Builder
function MyContentBuilder() {
  Column() {
    Text('Main Content Area')
      .fontSize(18)
      .margin(20)

    Text('This content is built using @BuilderParam')
      .fontSize(14)
      .fontColor(Color.Gray)
  }
  .width('100%')
  .layoutWeight(1)
  .justifyContent(FlexAlign.Center)
}

@Component
struct LayoutWithBuilderParams {
  @BuilderParam header: () => void = MyHeaderBuilder
  @BuilderParam footer: () => void = MyFooterBuilder
  @BuilderParam content: () => void = MyContentBuilder

  build() {
    Column() {
      this.header()
      this.content()
      this.footer()
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
struct TestBuilderParamDecorator {
  @State testTitle: string = '@BuilderParam Decorator Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing Error Code: 10905300')
          .fontSize(18)
          .fontColor(Color.Red)
          .margin(5)

        Text('@BuilderParam with default value')
          .fontSize(14)
          .margin(5)

        Text('@BuilderParam with wrong type')
          .fontSize(14)
          .margin(5)

        Text('@BuilderParam outside @Component')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      Column() {
        Text('@BuilderParam Rules:')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin(5)

        Text('1. Must be used inside @Component')
          .fontSize(14)
          .margin(2)

        Text('2. Type must be function/builder')
          .fontSize(14)
          .margin(2)

        Text('3. Cannot have default value in declaration')
          .fontSize(14)
          .margin(2)

        Text('4. Enables flexible UI composition')
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

        Text('@Component')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('struct MyComponent {')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('  @BuilderParam header: () => void')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('}')
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
