/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
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

// Test Case: Style Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function styleErrorCase1() {
}

// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function styleErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function styleErrorCase3() {
}

// Correct Usage Component 1: Style builder function
@Builder
function buildStylePreview(styleName: string, color: string) {
  Column() {
    Text(styleName)
      .fontSize(16)
      .fontWeight(FontWeight.Medium)
      .fontColor('#333333')
    
    Row() {
      Text('Aa')
        .fontSize(24)
        .fontColor(color)
    }
    .width(60)
    .height(60)
    .backgroundColor(color + '20')
    .borderRadius(8)
    .justifyContent(FlexAlign.Center)
    .margin({ top: 8 })
  }
  .padding(16)
  .backgroundColor('#FFFFFF')
  .borderRadius(12)
  .shadow({ radius: 4, color: 'rgba(0,0,0,0.08)' })
}

// Correct Usage Component 2: Standalone @Styles
@Styles
function stylePrimaryCard() {
  .width('100%')
  .padding(20)
  .backgroundColor('#FFFFFF')
  .borderRadius(16)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.06)' })
}

// Correct Usage Component 3: @Extend for Text
@Extend(Text)
function styleHeading() {
  .fontSize(22)
  .fontWeight(FontWeight.Bold)
  .fontColor('#1A1A1A')
  .margin({ bottom: 8 })
}

@Entry
@Component
struct StyleValidation {
  @State testTitle: string = 'Style Decorator Validation'
  @State errorCount: number = 3
  @State selectedStyle: number = 0
  @State previewText: string = 'Style Preview'

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
      .padding({ top: 24, bottom: 20 })
      .alignItems(HorizontalAlign.Center)

      // Style Preview Section
      Column() {
        Text('Style Preview')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 16 })
        
        // Style selector tabs
        Row() {
          ForEach(['Primary', 'Secondary', 'Accent'], (style: string, index: number) => {
            Column() {
              Text(style)
                .fontSize(14)
                .fontWeight(this.selectedStyle === index ? FontWeight.Bold : FontWeight.Normal)
                .fontColor(this.selectedStyle === index ? '#FFFFFF' : '#666666')
                .padding({ horizontal: 20, vertical: 10 })
                .backgroundColor(this.selectedStyle === index ? '#2196F3' : '#F5F5F5')
                .borderRadius(20)
            }
            .margin({ right: index < 2 ? 8 : 0 })
            .onClick(() => {
              this.selectedStyle = index
            })
          })
        }
        .margin({ bottom: 20 })

        // Preview card
        Column() {
          Text(this.previewText)
            .styleHeading()
          
          Text('This is a preview of the selected style configuration.')
            .fontSize(14)
            .fontColor('#666666')
            .lineHeight(20)
            .margin({ bottom: 16 })
          
          Divider()
            .strokeWidth(1)
            .color('#E0E0E0')
            .margin({ bottom: 16 })
          
          Row() {
            Text('Sample Element')
              .fontSize(16)
              .fontColor(this.selectedStyle === 0 ? '#2196F3' : (this.selectedStyle === 1 ? '#757575' : '#FF9800'))
              .layoutWeight(1)
            
            Circle({ width: 12, height: 12 })
              .fill(this.selectedStyle === 0 ? '#2196F3' : (this.selectedStyle === 1 ? '#757575' : '#FF9800'))
          }
          .width('100%')
        }
        .padding(20)
        .backgroundColor('#FAFAFA')
        .borderRadius(12)
        .width('100%')
      }
      .stylePrimaryCard()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Error Panel
      Column() {
        Text('⚠️ Validation Errors')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .fontColor('#FF6B6B')
          .margin({ bottom: 12 })
        
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
            }
            .padding(10)
          }
          
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
            }
            .padding(10)
          }
          
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
            }
            .padding(10)
          }
        }
        .width('100%')
        .backgroundColor('#FFF5F5')
        .borderRadius(8)
        .padding(8)
      }
      .stylePrimaryCard()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Style Grid
      Column() {
        Text('Available Styles')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        Row() {
          buildStylePreview('Primary', '#2196F3')
            .layoutWeight(1)
            .margin({ right: 8 })
          
          buildStylePreview('Secondary', '#757575')
            .layoutWeight(1)
        }
        .width('100%')
        .margin({ bottom: 8 })

        Row() {
          buildStylePreview('Success', '#4CAF50')
            .layoutWeight(1)
            .margin({ right: 8 })
          
          buildStylePreview('Warning', '#FF9800')
            .layoutWeight(1)
        }
        .width('100%')
      }
      .stylePrimaryCard()
      .margin({ left: 20, right: 20 })
      .layoutWeight(1)

      // Footer Actions
      Row() {
        Button('Apply Style')
          .width('100%')
          .height(48)
          .backgroundColor('#2196F3')
          .fontColor('#FFFFFF')
          .fontSize(16)
          .borderRadius(8)
          .onClick(() => {
            console.info('Style applied successfully')
          })
      }
      .width('100%')
      .padding(20)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F7FA')
  }
}