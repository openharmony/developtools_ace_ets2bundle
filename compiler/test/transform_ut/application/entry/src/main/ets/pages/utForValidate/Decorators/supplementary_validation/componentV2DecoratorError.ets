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
 * Test case: ComponentV2 decorator error
 * Purpose: Verify @ComponentV2 decorator usage and validation
 * Error code: 10906200
 */

// ============================================
// Test Case 1: @ComponentV2 with @State
// Expected Error: 10906200
// ============================================

@ComponentV2
struct ComponentV2WithState {
  @State count: number = 0

  build() {
    Column() {
      Text('Count: ' + this.count)
    }
  }
}

// ============================================
// Test Case 2: @ComponentV2 with @Prop
// Expected Error: 10906200
// ============================================

@ComponentV2
struct ComponentV2WithProp {
  @Prop title: string = ''

  build() {
    Column() {
      Text(this.title)
    }
  }
}

// ============================================
// Test Case 3: @ComponentV2 with @Link
// Expected Error: 10906200
// ============================================

@ComponentV2
struct ComponentV2WithLink {
  @Link value: number

  build() {
    Column() {
      Text('Value: ' + this.value)
    }
  }
}

// ============================================
// Test Case 4: Correct @ComponentV2 usage
// ============================================

@ComponentV2
struct CorrectComponentV2Usage {
  @Local count: number = 0
  @Local message: string = 'Hello V2'
  @Local isActive: boolean = true
  @Local items: string[] = []

  @Event onAction: () => void = () => {}

  build() {
    Column() {
      Text('ComponentV2 Demo')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Text(this.message)
        .fontSize(18)
        .fontColor('#1890FF')
        .margin(15)

      Text('Count: ' + this.count)
        .fontSize(16)
        .margin(10)

      Text('Status: ' + (this.isActive ? 'Active' : 'Inactive'))
        .fontSize(16)
        .margin(10)

      Text('Items: ' + this.items.length)
        .fontSize(16)
        .margin(10)

      Row() {
        Button('Increment')
          .onClick(() => {
            this.count++
          })
          .margin(5)

        Button('Toggle')
          .onClick(() => {
            this.isActive = !this.isActive
          })
          .margin(5)

        Button('Add Item')
          .onClick(() => {
            this.items.push('Item ' + (this.items.length + 1))
          })
          .margin(5)
      }
      .margin(15)

      Button('Trigger Event')
        .onClick(() => {
          this.onAction()
        })
        .margin(10)
    }
    .width('100%')
    .height('100%')
    .padding(20)
  }
}

// ============================================
// Test Case 5: @ComponentV2 with @Param
// ============================================

@ComponentV2
struct ComponentV2WithParam {
  @Param title: string = 'Default Title'
  @Param description: string = ''
  @Param showIcon: boolean = true
  @Param priority: number = 1

  @Event onClick: () => void = () => {}

  build() {
    Column() {
      Row() {
        if (this.showIcon) {
          Text('📋')
            .fontSize(24)
            .margin(10)
        }

        Column() {
          Text(this.title)
            .fontSize(18)
            .fontWeight(FontWeight.Bold)

          if (this.description !== '') {
            Text(this.description)
              .fontSize(14)
              .fontColor('#666666')
              .margin({ top: 4 })
          }
        }
        .alignItems(HorizontalAlign.Start)
        .layoutWeight(1)

        Text('P' + this.priority)
          .fontSize(12)
          .fontColor(this.priority > 3 ? Color.Red : Color.Green)
          .padding(5)
          .backgroundColor(this.priority > 3 ? '#FFEBEE' : '#E8F5E9')
          .borderRadius(4)
      }
      .width('100%')
      .padding(15)
      .backgroundColor('#FFFFFF')
      .borderRadius(8)
      .shadow({ radius: 3, color: '#20000000' })
      .onClick(() => {
        this.onClick()
      })
    }
    .width('90%')
    .margin(10)
  }
}

// ============================================
// Test Case 6: @ComponentV2 parent-child
// ============================================

@ComponentV2
struct ParentComponentV2 {
  @Local parentCount: number = 0
  @Local parentMessage: string = 'From Parent'

  build() {
    Column() {
      Text('Parent Component V2')
        .fontSize(22)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Text('Count: ' + this.parentCount)
        .fontSize(16)
        .margin(10)

      Button('Update Parent')
        .onClick(() => {
          this.parentCount++
        })
        .margin(10)

      ChildComponentV2({
        receivedMessage: this.parentMessage,
        receivedCount: this.parentCount
      })
    }
    .width('100%')
    .height('100%')
    .padding(20)
  }
}

@ComponentV2
struct ChildComponentV2 {
  @Param receivedMessage: string = ''
  @Param receivedCount: number = 0

  @Event notifyParent: (data: string) => void = () => {}

  build() {
    Column() {
      Text('Child Component V2')
        .fontSize(18)
        .fontWeight(FontWeight.Medium)
        .margin(15)

      Column() {
        Text('Received: ' + this.receivedMessage)
          .fontSize(14)
          .margin(5)

        Text('Count: ' + this.receivedCount)
          .fontSize(14)
          .margin(5)
      }
      .padding(15)
      .backgroundColor('#F5F5F5')
      .borderRadius(8)
      .margin(10)

      Button('Notify Parent')
        .onClick(() => {
          this.notifyParent('Hello from child!')
        })
        .margin(10)
    }
    .width('90%')
    .padding(10)
    .backgroundColor('#FFFFFF')
    .borderRadius(10)
  }
}

// ============================================
// Entry point for testing
// ============================================

@Entry
@Component
struct TestComponentV2Decorator {
  @State testTitle: string = '@ComponentV2 Decorator Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing Error Code: 10906200')
          .fontSize(18)
          .fontColor(Color.Red)
          .margin(5)

        Text('@ComponentV2 with @State')
          .fontSize(14)
          .margin(5)

        Text('@ComponentV2 with @Prop')
          .fontSize(14)
          .margin(5)

        Text('@ComponentV2 with @Link')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      Column() {
        Text('@ComponentV2 Rules:')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin(5)

        Text('1. Cannot use V1 decorators')
          .fontSize(14)
          .margin(2)

        Text('2. Use @Local instead of @State')
          .fontSize(14)
          .margin(2)

        Text('3. Use @Param instead of @Prop')
          .fontSize(14)
          .margin(2)

        Text('4. Use @Event for callbacks')
          .fontSize(14)
          .margin(2)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .margin(10)

      Column() {
        Text('V2 Decorators:')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)

        Text('@Local - component state')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('@Param - parent input')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('@Event - child output')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('@Computed - derived values')
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
