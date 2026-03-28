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

// Test Case: Layout Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict in layout context
@Builder
@Styles
function layoutErrorCase1() {
}

// Error Case 2: @Extend + @Builder conflict for layout
@Extend(Row)
@Builder
function layoutErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Column)
@Builder
function layoutErrorCase3() {
}

// Correct Usage Component 1: Layout builder function
@Builder
function buildLayoutContainer(direction: FlexDirection) {
  Column() {
    Text('Layout Container')
      .fontSize(18)
      .fontWeight(FontWeight.Medium)
    
    Row() {
      Text('Row Item 1')
        .fontSize(14)
        .padding(8)
      
      Divider()
        .vertical(true)
        .height(20)
        .margin({ horizontal: 8 })
      
      Text('Row Item 2')
        .fontSize(14)
        .padding(8)
    }
    .width('100%')
    .justifyContent(FlexAlign.SpaceEvenly)
  }
  .width('100%')
  .padding(16)
}

// Correct Usage Component 2: Flex layout styles
@Styles
function flexLayoutStyle() {
  .width('100%')
  .justifyContent(FlexAlign.Center)
  .alignItems(HorizontalAlign.Center)
  .padding(20)
  .backgroundColor('#E3F2FD')
}

// Correct Usage Component 3: Column extension
@Extend(Column)
function layoutColumnExtend() {
  .width('100%')
  .height('auto')
  .padding(16)
  .backgroundColor('#FFFFFF')
  .borderRadius(12)
  .shadow({ radius: 6, color: 'rgba(0,0,0,0.08)' })
}

@Entry
@Component
struct LayoutValidation {
  @State testTitle: string = 'Layout Decorator Validation'
  @State errorCount: number = 3
  @State selectedTab: number = 0
  @State layoutMode: string = 'Column'

  build() {
    Column() {
      // Header
      Column() {
        Text(this.testTitle)
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1A1A1A')
        
        Row() {
          Text('Error Code: ')
            .fontSize(14)
            .fontColor('#666666')
          Text('10905117')
            .fontSize(14)
            .fontColor('#FF6B6B')
            .fontWeight(FontWeight.Medium)
        }
        .margin({ top: 8 })
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Tab Navigation
      Row() {
        ForEach(['Overview', 'Errors', 'Examples'], (item: string, index: number) => {
          Column() {
            Text(item)
              .fontSize(16)
              .fontWeight(this.selectedTab === index ? FontWeight.Bold : FontWeight.Normal)
              .fontColor(this.selectedTab === index ? '#2196F3' : '#666666')
              .padding({ vertical: 12 })
            
            if (this.selectedTab === index) {
              Divider()
                .strokeWidth(3)
                .color('#2196F3')
                .width('50%')
            }
          }
          .layoutWeight(1)
          .onClick(() => {
            this.selectedTab = index
          })
        })
      }
      .width('100%')
      .border({ width: { bottom: 1 }, color: '#E8E8E8' })

      // Content Area
      Stack() {
        if (this.selectedTab === 0) {
          // Overview Tab
          Column() {
            Text('Layout Validation Overview')
              .fontSize(20)
              .fontWeight(FontWeight.Medium)
              .margin({ bottom: 16 })
            
            Column() {
              Text('This test validates proper usage of decorators in layout contexts. Three error cases are identified where @Builder conflicts with other decorators.')
                .fontSize(14)
                .fontColor('#333333')
                .lineHeight(22)
            }
            .padding(16)
            .backgroundColor('#F5F5F5')
            .borderRadius(8)
            .margin({ bottom: 20 })

            Row() {
              Text('Total Error Cases:')
                .fontSize(16)
                .fontColor('#666666')
              Text(this.errorCount.toString())
                .fontSize(24)
                .fontWeight(FontWeight.Bold)
                .fontColor('#FF6B6B')
                .margin({ left: 8 })
            }
            .padding(20)
            .backgroundColor('#FFF5F5')
            .borderRadius(8)
            .width('100%')
          }
          .width('100%')
          .padding(20)
        } else if (this.selectedTab === 1) {
          // Errors Tab
          Column() {
            Text('Error Case Details')
              .fontSize(20)
              .fontWeight(FontWeight.Medium)
              .margin({ bottom: 16 })
            
            List() {
              ListItem() {
                Column() {
                  Text('Error 1: @Builder + @Styles')
                    .fontSize(16)
                    .fontWeight(FontWeight.Medium)
                    .fontColor('#FF6B6B')
                  
                  Text('These decorators cannot be used together on the same function. Choose one based on your use case.')
                    .fontSize(13)
                    .fontColor('#666666')
                    .margin({ top: 4 })
                }
                .padding(16)
                .backgroundColor('#FFF5F5')
                .borderRadius(8)
                .margin({ bottom: 12 })
              }
              
              ListItem() {
                Column() {
                  Text('Error 2: @Extend + @Builder')
                    .fontSize(16)
                    .fontWeight(FontWeight.Medium)
                    .fontColor('#FF6B6B')
                  
                  Text('@Extend modifies existing components while @Builder creates new ones. They serve different purposes.')
                    .fontSize(13)
                    .fontColor('#666666')
                    .margin({ top: 4 })
                }
                .padding(16)
                .backgroundColor('#FFF5F5')
                .borderRadius(8)
                .margin({ bottom: 12 })
              }
              
              ListItem() {
                Column() {
                  Text('Error 3: @AnimatableExtend + @Builder')
                    .fontSize(16)
                    .fontWeight(FontWeight.Medium)
                    .fontColor('#FF6B6B')
                  
                  Text('Animation extensions should not be combined with builder functions.')
                    .fontSize(13)
                    .fontColor('#666666')
                    .margin({ top: 4 })
                }
                .padding(16)
                .backgroundColor('#FFF5F5')
                .borderRadius(8)
              }
            }
            .width('100%')
          }
          .width('100%')
          .padding(20)
        } else {
          // Examples Tab
          Column() {
            Text('Correct Usage Examples')
              .fontSize(20)
              .fontWeight(FontWeight.Medium)
              .margin({ bottom: 16 })
            
            // Layout mode selector
            Row() {
              Button('Column Mode')
                .fontSize(13)
                .height(36)
                .backgroundColor(this.layoutMode === 'Column' ? '#2196F3' : '#E0E0E0')
                .onClick(() => {
                  this.layoutMode = 'Column'
                })
              
              Button('Row Mode')
                .fontSize(13)
                .height(36)
                .margin({ left: 12 })
                .backgroundColor(this.layoutMode === 'Row' ? '#2196F3' : '#E0E0E0')
                .onClick(() => {
                  this.layoutMode = 'Row'
                })
            }
            .margin({ bottom: 20 })

            // Example container
            Column() {
              buildLayoutContainer(FlexDirection.Column)
            }
            .layoutColumnExtend()
            .margin({ bottom: 16 })

            Button('Test Layout Validation')
              .width('100%')
              .height(44)
              .backgroundColor('#4CAF50')
              .onClick(() => {
                console.info('Layout validation test passed')
              })
          }
          .width('100%')
          .padding(20)
          .layoutWeight(1)
        }
      }
      .width('100%')
      .layoutWeight(1)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#FAFAFA')
  }
}