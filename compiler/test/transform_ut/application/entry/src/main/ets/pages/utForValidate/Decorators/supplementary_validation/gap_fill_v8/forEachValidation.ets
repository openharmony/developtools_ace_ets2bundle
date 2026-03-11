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

// Test Case: ForEach Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function forEachErrorCase1() {
}

// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function forEachErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function forEachErrorCase3() {
}

// Correct Usage Component 1: ForEach item builder
@Builder
function buildForEachItem(index: number, item: string, selected: boolean) {
  Row() {
    Text((index + 1).toString())
      .fontSize(14)
      .fontWeight(FontWeight.Bold)
      .fontColor('#FFFFFF')
      .width(28)
      .height(28)
      .backgroundColor(selected ? '#9C27B0' : '#E0E0E0')
      .borderRadius(14)
      .textAlign(TextAlign.Center)
      .margin({ right: 12 })
    
    Text(item)
      .fontSize(15)
      .fontWeight(selected ? FontWeight.Bold : FontWeight.Normal)
      .fontColor('#333333')
      .layoutWeight(1)
    
    if (selected) {
      Text('●')
        .fontSize(12)
        .fontColor('#9C27B0')
    }
  }
  .width('100%')
  .padding(10)
  .backgroundColor(selected ? '#F3E5F5' : '#F5F5F5')
  .borderRadius(8)
  .margin({ bottom: 6 })
}

// Correct Usage Component 2: ForEach card styles
@Styles
function forEachCardStyle() {
  .width('100%')
  .padding(18)
  .backgroundColor('#FFFFFF')
  .borderRadius(14)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.06)' })
}

// Correct Usage Component 3: ForEach counter extension
@Extend(Text)
function forEachCounterText() {
  .fontSize(28)
  .fontWeight(FontWeight.Bold)
  .fontColor('#9C27B0')
}

@Entry
@Component
struct ForEachValidation {
  @State testTitle: string = 'ForEach Decorator Validation'
  @State errorCount: number = 3
  @State itemCount: number = 8
  @State selectedIndex: number = 2
  @State items: string[] = ['Item A', 'Item B', 'Item C', 'Item D', 'Item E', 'Item F']

  build() {
    Column() {
      // Header
      Column() {
        Text(this.testTitle)
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1A1A1A')
        
        Text('ForEach Loop Validation')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ top: 6 })
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Counter
      Column() {
        Text('Total Items')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ bottom: 8 })
        
        Text(this.itemCount.toString())
          .forEachCounterText()
      }
      .width('100%')
      .padding(20)
      .backgroundColor('#F3E5F5')
      .borderRadius(12)
      .margin({ left: 20, right: 20, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Stats Grid
      Row() {
        Column() {
          Text(this.items.length.toString())
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#9C27B0')
          
          Text('Rendered')
            .fontSize(12)
            .fontColor('#666666')
        }
        .alignItems(HorizontalAlign.Center)
        .layoutWeight(1)
        
        Divider()
          .vertical(true)
          .height(50)
          .color('#E0E0E0')
        
        Column() {
          Text((this.selectedIndex + 1).toString())
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#2196F3')
          
          Text('Selected')
            .fontSize(12)
            .fontColor('#666666')
        }
        .alignItems(HorizontalAlign.Center)
        .layoutWeight(1)
        
        Divider()
          .vertical(true)
          .height(50)
          .color('#E0E0E0')
        
        Column() {
          Text(this.errorCount.toString())
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#FF6B6B')
          
          Text('Errors')
            .fontSize(12)
            .fontColor('#666666')
        }
        .alignItems(HorizontalAlign.Center)
        .layoutWeight(1)
      }
      .width('100%')
      .padding(16)
      .backgroundColor('#FAFAFA')
      .borderRadius(12)
      .margin({ left: 20, right: 20, bottom: 16 })

      // Error Alert
      Row() {
        Text('⚠')
          .fontSize(24)
          .margin({ right: 12 })
        
        Column() {
          Text('ForEach Validation Errors')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .fontColor('#FF6B6B')
          
          Text(`Error Code: 10905117`)
            .fontSize(13)
            .fontColor('#FF9800')
        }
        .alignItems(HorizontalAlign.Start)
        .layoutWeight(1)
      }
      .width('100%')
      .padding(16)
      .backgroundColor('#FFF5F5')
      .borderRadius(12)
      .margin({ left: 20, right: 20, bottom: 16 })

      // ForEach Items
      Column() {
        Text('ForEach Items')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        List() {
          ForEach(this.items, (item: string, index: number) => {
            ListItem() {
              buildForEachItem(index, item, index === this.selectedIndex)
            }
            .onClick(() => {
              this.selectedIndex = index
            })
          })
        }
        .width('100%')
        .layoutWeight(1)
      }
      .forEachCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })
      .layoutWeight(1)

      // Error Details
      Column() {
        Text('Decorator Conflicts')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 10 })
        
        Column() {
          Row() {
            Text('@Builder + @Styles')
              .fontSize(13)
              .fontColor('#333333')
              .layoutWeight(1)
            Text('❌')
              .fontSize(16)
              .fontColor('#FF6B6B')
          }
          .padding(10)
          .backgroundColor('#FFF5F5')
          .borderRadius(6)
          .margin({ bottom: 6 })
          
          Row() {
            Text('@Extend + @Builder')
              .fontSize(13)
              .fontColor('#333333')
              .layoutWeight(1)
            Text('❌')
              .fontSize(16)
              .fontColor('#FF6B6B')
          }
          .padding(10)
          .backgroundColor('#FFF5F5')
          .borderRadius(6)
          .margin({ bottom: 6 })
          
          Row() {
            Text('@AnimatableExtend + @Builder')
              .fontSize(13)
              .fontColor('#333333')
              .layoutWeight(1)
            Text('❌')
              .fontSize(16)
              .fontColor('#FF6B6B')
          }
          .padding(10)
          .backgroundColor('#FFF5F5')
          .borderRadius(6)
        }
        .width('100%')
      }
      .forEachCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Control Buttons
      Row() {
        Button('Add Item')
          .width('48%')
          .height(46)
          .backgroundColor('#9C27B0')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            this.items.push(`Item ${String.fromCharCode(65 + this.items.length)}`)
            this.itemCount++
          })
        
        Button('Validate')
          .width('48%')
          .height(46)
          .backgroundColor('#4CAF50')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            console.info('ForEach validation completed')
          })
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceBetween)
      .padding(20)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#FAFAFA')
  }
}