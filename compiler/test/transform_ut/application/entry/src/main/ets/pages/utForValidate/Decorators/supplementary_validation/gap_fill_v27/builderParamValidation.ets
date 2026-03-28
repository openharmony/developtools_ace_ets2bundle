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
 * Test case: Builderparamvalidation 27 5
 * Purpose: Supplementary validation test
 * Generated: Auto-generated test file
 */


// ============================================
// Test Case 1: @Watch decorator usage
// ============================================

@Component
struct WatchTest27_5 {
  @State @Watch('onCountChanged') count: number = 0
  @State @Watch('onMessageChanged') message: string = 'Hello'
  @State @Watch('onItemsChanged') items: string[] = []
  @State @Watch('onUserChanged') user: { name: string, age: number } = { name: 'Test', age: 0 }

  @State changeLog: string[] = []

  onCountChanged(propName: string) {
    this.changeLog.push(`Count changed to: ${this.count}`)
    console.log('Watch: ' + propName + ' = ' + this.count)
  }

  onMessageChanged(propName: string) {
    this.changeLog.push(`Message changed to: ${this.message}`)
    console.log('Watch: ' + propName + ' = ' + this.message)
  }

  onItemsChanged(propName: string) {
    this.changeLog.push(`Items changed, count: ${this.items.length}`)
    console.log('Watch: ' + propName + ' length = ' + this.items.length)
  }

  onUserChanged(propName: string) {
    this.changeLog.push(`User changed: ${this.user.name}, ${this.user.age}`)
    console.log('Watch: ' + propName + ' = ' + JSON.stringify(this.user))
  }

  build() {
    Column() {
      Text('@Watch Test 27-5')
        .fontSize(22)
        .fontWeight(FontWeight.Bold)
        .margin(15)

      Column() {
        Text('Count: ' + this.count)
          .fontSize(18)
          .margin(5)

        Text('Message: ' + this.message)
          .fontSize(16)
          .margin(5)

        Text('Items: ' + this.items.length)
          .fontSize(16)
          .margin(5)

        Text('User: ' + this.user.name + ', ' + this.user.age)
          .fontSize(14)
          .margin(5)
      }
      .padding(10)
      .backgroundColor('#E8F5E9')
      .margin(10)

      Row() {
        Button('Increment')
          .onClick(() => {
            this.count++
          })
          .margin(5)

        Button('Change Message')
          .onClick(() => {
            this.message = 'Updated ' + new Date().toLocaleTimeString()
          })
          .margin(5)

        Button('Add Item')
          .onClick(() => {
            this.items.push('Item ' + (this.items.length + 1))
          })
          .margin(5)

        Button('Update User')
          .onClick(() => {
            this.user = { name: 'User ' + Math.floor(Math.random() * 100), age: Math.floor(Math.random() * 50) + 20 }
          })
          .margin(5)
      }
      .margin(10)

      Text('Change Log:')
        .fontSize(16)
        .fontWeight(FontWeight.Bold)
        .margin(10)

      List() {
        ForEach(this.changeLog.slice(-10), (log: string, index: number) => {
          ListItem() {
            Text(log)
              .fontSize(12)
              .margin(2)
          }
        }, (log: string, index: number) => index.toString())
      }
      .height(150)
      .backgroundColor('#F5F5F5')
      .padding(10)
    }
    .width('100%')
    .padding(20)
  }
}

// ============================================
// Test Case 2: @Builder usage
// ============================================

@Builder
function CustomButton27_5(text: string, onClick: () => void) {
  Button(text)
    .onClick(onClick)
    .width(120)
    .height(40)
    .backgroundColor('#1890FF')
    .fontColor('#FFFFFF')
    .borderRadius(8)
    .margin(5)
}

@Builder
function CardView27_5(title: string, content: string) {
  Column() {
    Text(title)
      .fontSize(18)
      .fontWeight(FontWeight.Bold)
      .margin(10)

    Text(content)
      .fontSize(14)
      .margin(5)
  }
  .width('90%')
  .padding(15)
  .backgroundColor('#FFFFFF')
  .borderRadius(10)
  .shadow({ radius: 5, color: '#20000000' })
  .margin(10)
}

@Builder
function ListItemView27_5(item: { id: number, name: string, value: number }) {
  Row() {
    Text(item.id.toString())
      .fontSize(14)
      .width(40)
      .fontColor('#999999')

    Text(item.name)
      .fontSize(16)
      .layoutWeight(1)

    Text(item.value.toString())
      .fontSize(14)
      .fontColor('#1890FF')
      .width(60)
  }
  .width('100%')
  .padding(12)
  .backgroundColor('#FAFAFA')
  .borderRadius(6)
  .margin({ top: 4, bottom: 4 })
}

@Component
struct BuilderTest27_5 {
  @State items: { id: number, name: string, value: number }[] = [
    { id: 1, name: 'Item A', value: 100 },
    { id: 2, name: 'Item B', value: 200 },
    { id: 3, name: 'Item C', value: 300 }
  ]
  @State clickCount: number = 0

  build() {
    Column() {
      Text('@Builder Test 27-5')
        .fontSize(22)
        .fontWeight(FontWeight.Bold)
        .margin(15)

      CardView27_5('Welcome', 'This is a builder function example with custom styling and shadow effects.')

      Text('Click Count: ' + this.clickCount)
        .fontSize(16)
        .margin(10)

      Row() {
        CustomButton27_5('Increment', () => {
          this.clickCount++
        })

        CustomButton27_5('Reset', () => {
          this.clickCount = 0
        })

        CustomButton27_5('Add Item', () => {
          const newId = this.items.length + 1
          this.items.push({
            id: newId,
            name: 'Item ' + String.fromCharCode(65 + newId - 1),
            value: newId * 100
          })
        })
      }
      .margin(10)

      Text('Items:')
        .fontSize(16)
        .fontWeight(FontWeight.Bold)
        .margin(10)

      Column() {
        ForEach(this.items, (item: { id: number, name: string, value: number }) => {
          ListItemView27_5(item)
        }, (item: { id: number, name: string, value: number }) => item.id.toString())
      }
      .width('100%')
      .padding(10)
    }
    .width('100%')
    .padding(20)
    .backgroundColor('#F0F2F5')
  }
}

// ============================================
// Test Case 3: @Watch errors
// ============================================

@Component
struct WatchErrorTest27_5 {
  // Error: @Watch with non-existent callback
  @State @Watch('nonExistentCallback') value: number = 0

  // Error: @Watch with invalid callback signature
  @State @Watch(123) anotherValue: string = ''

  build() {
    Column() {
      Text('Watch Error Test')
    }
  }
}

// ============================================
// Test Case 4: @Builder errors
// ============================================

@Component
struct BuilderErrorTest27_5 {
  // Error: @Builder inside struct
  @Builder
  invalidBuilder() {
    Text('This should not work')
  }

  build() {
    Column() {
      Text('Builder Error Test')
    }
  }
}

// ============================================
// Entry Point
// ============================================

@Entry
@Component
struct WatchBuilderEntry27_5 {
  @State testTitle: string = '@Watch & @Builder Test 27-5'
  @State currentTab: number = 0

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Row() {
        Button('@Watch')
          .backgroundColor(this.currentTab === 0 ? '#1890FF' : '#CCCCCC')
          .onClick(() => this.currentTab = 0)
          .margin(5)

        Button('@Builder')
          .backgroundColor(this.currentTab === 1 ? '#1890FF' : '#CCCCCC')
          .onClick(() => this.currentTab = 1)
          .margin(5)
      }
      .margin(10)

      if (this.currentTab === 0) {
        WatchTest27_5()
      } else {
        BuilderTest27_5()
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#FAFAFA')
  }
}
