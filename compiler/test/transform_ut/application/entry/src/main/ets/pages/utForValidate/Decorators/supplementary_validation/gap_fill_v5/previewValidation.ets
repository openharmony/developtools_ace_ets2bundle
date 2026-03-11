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

// Test Case: Preview Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function previewErrorCase1() {
}
// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function previewErrorCase2() {
}
// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function previewErrorCase3() {
}
// Correct Usage Component 1: Preview item builder
@Builder
function buildPreviewItem(name: string, dimensions: string, status: string) {
  Row() {
    Column() {
      Row() {
        Text(name)
          .fontSize(15)
          .fontWeight(FontWeight.Medium)
          .fontColor('#333333')
        
        if (status === 'active') {
          Text('●')
            .fontSize(10)
            .fontColor('#4CAF50')
            .margin({ left: 6 })
        }
      }
      .margin({ bottom: 4 })
      
      Text(dimensions)
        .fontSize(12)
        .fontColor('#999999')
    }
    .alignItems(HorizontalAlign.Start)
    .layoutWeight(1)
    
    Text('👁')
      .fontSize(20)
  }
  .width('100%')
  .padding(12)
  .backgroundColor('#F3E5F5')
  .borderRadius(8)
  .margin({ bottom: 8 })
}
// Correct Usage Component 2: Preview card styles
@Styles
function previewCardStyle() {
  .width('100%')
  .padding(18)
  .backgroundColor('#FFFFFF')
  .borderRadius(14)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.06)' })
}
// Correct Usage Component 3: Preview status extension
@Extend(Text)
function previewStatusText() {
  .fontSize(14)
  .fontColor('#FFFFFF')
  .padding({ horizontal: 10, vertical: 4 })
  .borderRadius(4)
}
@Entry
@Component
struct PreviewValidation {
  @State testTitle: string = 'Preview Decorator Validation'
  @State errorCount: number = 3
  @State previewCount: number = 6
  @State activePreviews: number = 4
  @State previewMode: boolean = true

  build() {
    Column() {
      // Header
      Column() {
        Text(this.testTitle)
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1A1A1A')
        
        Text('Component Preview Validation')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ top: 6 })
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Preview Toggle
      Row() {
        Text('Preview Mode')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .fontColor('#333333')
          .layoutWeight(1)
        
        Toggle({ type: ToggleType.Switch, isOn: this.previewMode })
          .selectedColor('#9C27B0')
          .onChange((isOn: boolean) => {
            this.previewMode = isOn
          })
      }
      .width('100%')
      .padding(16)
      .backgroundColor(this.previewMode ? '#F3E5F5' : '#F5F5F5')
      .borderRadius(12)
      .margin({ left: 20, right: 20, bottom: 16 })

      // Stats Grid
      Row() {
        Column() {
          Text(this.previewCount.toString())
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#9C27B0')
          
          Text('Total Previews')
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
          Text(this.activePreviews.toString())
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#4CAF50')
          
          Text('Active')
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
        Column() {
          Text('Validation Errors Detected')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .fontColor('#FF6B6B')
          
          Text('Error Code: 10905117')
            .fontSize(13)
            .fontColor('#FF9800')
        }
        .alignItems(HorizontalAlign.Start)
        .layoutWeight(1)
        
        Text(this.errorCount.toString())
          .fontSize(32)
          .fontWeight(FontWeight.Bold)
          .fontColor('#FF6B6B')
      }
      .width('100%')
      .padding(16)
      .backgroundColor('#FFF5F5')
      .borderRadius(12)
      .margin({ left: 20, right: 20, bottom: 16 })

      // Preview List
      Column() {
        Text('Active Previews')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        buildPreviewItem('ButtonPreview', '120x48 px', 'active')
        buildPreviewItem('CardPreview', '320x200 px', 'active')
        buildPreviewItem('InputPreview', '280x56 px', 'active')
        buildPreviewItem('ModalPreview', '400x300 px', 'inactive')
      }
      .previewCardStyle()
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
              
              Text('Invalid')
                .previewStatusText()
                .backgroundColor('#FF6B6B')
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
              
              Text('Invalid')
                .previewStatusText()
                .backgroundColor('#FF6B6B')
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
              
              Text('Invalid')
                .previewStatusText()
                .backgroundColor('#FF6B6B')
            }
            .padding(10)
            .backgroundColor('#FFF5F5')
            .borderRadius(6)
          }
        }
        .width('100%')
      }
      .previewCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Action Buttons
      Row() {
        Button('Refresh Previews')
          .width('48%')
          .height(46)
          .backgroundColor('#9C27B0')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            this.activePreviews = Math.floor(Math.random() * 6)
          })
        
        Button('Validate All')
          .width('48%')
          .height(46)
          .backgroundColor('#2196F3')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            console.info('Preview validation completed')
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