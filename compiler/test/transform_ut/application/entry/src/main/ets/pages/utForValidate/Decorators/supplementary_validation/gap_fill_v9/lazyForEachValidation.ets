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

// Test Case: LazyForEach Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function lazyForEachErrorCase1() {
}

// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function lazyForEachErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function lazyForEachErrorCase3() {
}

// Correct Usage Component 1: Lazy item builder
@Builder
function buildLazyItem(index: number, loaded: boolean) {
  Row() {
    Text((index + 1).toString())
      .fontSize(14)
      .fontWeight(FontWeight.Bold)
      .fontColor('#FFFFFF')
      .width(28)
      .height(28)
      .backgroundColor(loaded ? '#FF9800' : '#E0E0E0')
      .borderRadius(14)
      .textAlign(TextAlign.Center)
      .margin({ right: 12 })
    
    Column() {
      Text(`Item ${index + 1}`)
        .fontSize(15)
        .fontColor('#333333')
      
      Text(loaded ? 'Loaded' : 'Not loaded')
        .fontSize(11)
        .fontColor(loaded ? '#4CAF50' : '#999999')
    }
    .alignItems(HorizontalAlign.Start)
    .layoutWeight(1)
  }
  .width('100%')
  .padding(10)
  .backgroundColor(loaded ? '#FFF8E1' : '#F5F5F5')
  .borderRadius(8)
  .margin({ bottom: 6 })
}

// Correct Usage Component 2: LazyForEach card styles
@Styles
function lazyForEachCardStyle() {
  .width('100%')
  .padding(18)
  .backgroundColor('#FFFFFF')
  .borderRadius(14)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.06)' })
}

// Correct Usage Component 3: LazyForEach badge extension
@Extend(Text)
function lazyForEachBadgeText() {
  .fontSize(12)
  .fontColor('#FFFFFF')
  .fontWeight(FontWeight.Medium)
  .padding({ horizontal: 8, vertical: 3 })
  .backgroundColor('#FF9800')
  .borderRadius(3)
}

@Entry
@Component
struct LazyForEachValidation {
  @State testTitle: string = 'LazyForEach Decorator Validation'
  @State errorCount: number = 3
  @State totalItems: number = 100
  @State loadedItems: number = 12

  build() {
    Column() {
      // Header
      Column() {
        Text(this.testTitle)
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1A1A1A')
        
        Text('Lazy Loading Validation')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ top: 6 })
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Lazy Loading Stats
      Row() {
        Column() {
          Text(this.totalItems.toString())
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#FF9800')
          
          Text('Total Items')
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
          Text(this.loadedItems.toString())
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#4CAF50')
          
          Text('Loaded')
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
      .backgroundColor('#FFF8E1')
      .borderRadius(12)
      .margin({ left: 20, right: 20, bottom: 16 })

      // Error Alert
      Row() {
        Text('⚠')
          .fontSize(24)
          .margin({ right: 12 })
        
        Column() {
          Text('LazyForEach Validation Errors')
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

      // Lazy Items
      Column() {
        Text('Lazy Loaded Items')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        buildLazyItem(0, true)
        buildLazyItem(1, true)
        buildLazyItem(2, true)
        buildLazyItem(3, true)
        buildLazyItem(4, false)
        buildLazyItem(5, false)
      }
      .lazyForEachCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })
      .layoutWeight(1)

      // Error Details
      Column() {
        Text('Decorator Conflicts')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 10 })
        
        List() {
          ListItem() {
            Row() {
              Text('1')
                .fontSize(12)
                .fontWeight(FontWeight.Bold)
                .fontColor('#FFFFFF')
                .width(22)
                .height(22)
                .backgroundColor('#FF6B6B')
                .borderRadius(11)
                .textAlign(TextAlign.Center)
              
              Text('@Builder + @Styles')
                .fontSize(14)
                .fontColor('#333333')
                .margin({ left: 10 })
                .layoutWeight(1)
            }
            .padding(10)
            .backgroundColor('#FFF5F5')
            .borderRadius(6)
          }
          .margin({ bottom: 8 })
          
          ListItem() {
            Row() {
              Text('2')
                .fontSize(12)
                .fontWeight(FontWeight.Bold)
                .fontColor('#FFFFFF')
                .width(22)
                .height(22)
                .backgroundColor('#FF6B6B')
                .borderRadius(11)
                .textAlign(TextAlign.Center)
              
              Text('@Extend + @Builder')
                .fontSize(14)
                .fontColor('#333333')
                .margin({ left: 10 })
                .layoutWeight(1)
            }
            .padding(10)
            .backgroundColor('#FFF5F5')
            .borderRadius(6)
          }
          .margin({ bottom: 8 })
          
          ListItem() {
            Row() {
              Text('3')
                .fontSize(12)
                .fontWeight(FontWeight.Bold)
                .fontColor('#FFFFFF')
                .width(22)
                .height(22)
                .backgroundColor('#FF6B6B')
                .borderRadius(11)
                .textAlign(TextAlign.Center)
              
              Text('@AnimatableExtend + @Builder')
                .fontSize(14)
                .fontColor('#333333')
                .margin({ left: 10 })
                .layoutWeight(1)
            }
            .padding(10)
            .backgroundColor('#FFF5F5')
            .borderRadius(6)
          }
        }
        .width('100%')
      }
      .lazyForEachCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Control Buttons
      Row() {
        Button('Load More')
          .width('48%')
          .height(46)
          .backgroundColor('#FF9800')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            this.loadedItems = Math.min(this.totalItems, this.loadedItems + 6)
          })
        
        Button('Validate')
          .width('48%')
          .height(46)
          .backgroundColor('#4CAF50')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            console.info('LazyForEach validation completed')
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