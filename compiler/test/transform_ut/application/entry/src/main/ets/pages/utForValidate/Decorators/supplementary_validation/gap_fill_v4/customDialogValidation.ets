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

// Test Case: CustomDialog Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function customDialogErrorCase1() {
}

// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function customDialogErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function customDialogErrorCase3() {
}

// Correct Usage Component 1: Dialog content builder
@Builder
function buildDialogContent(title: string, message: string, type: string) {
  Column() {
    Row() {
      Text(type === 'error' ? '✕' : type === 'success' ? '✓' : 'ℹ')
        .fontSize(28)
        .fontColor(type === 'error' ? '#FF6B6B' : type === 'success' ? '#4CAF50' : '#2196F3')
    }
    .width(56)
    .height(56)
    .backgroundColor(type === 'error' ? '#FFF5F5' : type === 'success' ? '#E8F5E9' : '#E3F2FD')
    .borderRadius(28)
    .justifyContent(FlexAlign.Center)
    .margin({ bottom: 12 })
    
    Text(title)
      .fontSize(18)
      .fontWeight(FontWeight.Bold)
      .fontColor('#333333')
      .margin({ bottom: 8 })
    
    Text(message)
      .fontSize(14)
      .fontColor('#666666')
      .textAlign(TextAlign.Center)
      .maxLines(3)
  }
  .width('100%')
  .padding(20)
  .alignItems(HorizontalAlign.Center)
}

// Correct Usage Component 2: Dialog card styles
@Styles
function customDialogCardStyle() {
  .width('100%')
  .padding(18)
  .backgroundColor('#FFFFFF')
  .borderRadius(14)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.06)' })
}

// Correct Usage Component 3: Dialog button extension
@Extend(Button)
function customDialogButton() {
  .height(44)
  .fontSize(15)
  .borderRadius(8)
}

@Entry
@Component
struct CustomDialogValidation {
  @State testTitle: string = 'CustomDialog Decorator Validation'
  @State errorCount: number = 3
  @State showErrorDialog: boolean = false
  @State showSuccessDialog: boolean = false

  build() {
    Column() {
      // Header
      Column() {
        Text(this.testTitle)
          .fontSize(26)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1A1A1A')
        
        Text('Dialog Validation Test')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ top: 6 })
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Validation Status Card
      Column() {
        Row() {
          Column() {
            Text('Dialog Tests')
              .fontSize(14)
              .fontColor('#666666')
            
            Text('2')
              .fontSize(28)
              .fontWeight(FontWeight.Bold)
              .fontColor('#2196F3')
          }
          .alignItems(HorizontalAlign.Center)
          .layoutWeight(1)
          
          Divider()
            .vertical(true)
            .height(50)
            .color('#E0E0E0')
          
          Column() {
            Text('Errors')
              .fontSize(14)
              .fontColor('#666666')
            
            Text(this.errorCount.toString())
              .fontSize(28)
              .fontWeight(FontWeight.Bold)
              .fontColor('#FF6B6B')
          }
          .alignItems(HorizontalAlign.Center)
          .layoutWeight(1)
          
          Divider()
            .vertical(true)
            .height(50)
            .color('#E0E0E0')
          
          Column() {
            Text('Error Code')
              .fontSize(12)
              .fontColor('#666666')
            
            Text('10905117')
              .fontSize(14)
              .fontWeight(FontWeight.Medium)
              .fontColor('#FF9800')
          }
          .alignItems(HorizontalAlign.Center)
          .layoutWeight(1)
        }
        .width('100%')
        .padding(16)
        .backgroundColor('#FAFAFA')
        .borderRadius(8)
      }
      .customDialogCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Dialog Preview Section
      Column() {
        Text('Dialog Previews')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 16 })
        
        // Error Dialog Preview
        Column() {
          buildDialogContent(
            'Validation Error',
            '3 decorator conflicts detected in your code.',
            'error'
          )
          
          Button('Dismiss')
            .customDialogButton()
            .width('100%')
            .backgroundColor('#FF6B6B')
            .margin({ top: 12 })
        }
        .width('100%')
        .backgroundColor('#FFFFFF')
        .borderRadius(12)
        .shadow({ radius: 8, color: 'rgba(0,0,0,0.1)' })
        .margin({ bottom: 16 })

        // Success Dialog Preview
        Column() {
          buildDialogContent(
            'Validation Complete',
            'All decorator checks passed successfully.',
            'success'
          )
          
          Button('Continue')
            .customDialogButton()
            .width('100%')
            .backgroundColor('#4CAF50')
            .margin({ top: 12 })
        }
        .width('100%')
        .backgroundColor('#FFFFFF')
        .borderRadius(12)
        .shadow({ radius: 8, color: 'rgba(0,0,0,0.1)' })
      }
      .customDialogCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Error Summary
      Column() {
        Text('Decorator Validation Errors')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .fontColor('#FF6B6B')
          .margin({ bottom: 12 })
        
        List() {
          ListItem() {
            Row() {
              Text('❌')
                .fontSize(14)
                .margin({ right: 8 })
              Text('@Builder + @Styles')
                .fontSize(14)
                .fontColor('#333333')
                .layoutWeight(1)
            }
            .padding(10)
            .backgroundColor('#FFF5F5')
            .borderRadius(6)
          }
          .margin({ bottom: 8 })
          
          ListItem() {
            Row() {
              Text('❌')
                .fontSize(14)
                .margin({ right: 8 })
              Text('@Extend + @Builder')
                .fontSize(14)
                .fontColor('#333333')
                .layoutWeight(1)
            }
            .padding(10)
            .backgroundColor('#FFF5F5')
            .borderRadius(6)
          }
          .margin({ bottom: 8 })
          
          ListItem() {
            Row() {
              Text('❌')
                .fontSize(14)
                .margin({ right: 8 })
              Text('@AnimatableExtend + @Builder')
                .fontSize(14)
                .fontColor('#333333')
                .layoutWeight(1)
            }
            .padding(10)
            .backgroundColor('#FFF5F5')
            .borderRadius(6)
          }
        }
        .width('100%')
      }
      .customDialogCardStyle()
      .margin({ left: 20, right: 20 })
      .layoutWeight(1)

      // Action Buttons
      Row() {
        Button('Show Error Dialog')
          .customDialogButton()
          .width('48%')
          .backgroundColor('#FF6B6B')
          .onClick(() => {
            this.showErrorDialog = true
          })
        
        Button('Show Success Dialog')
          .customDialogButton()
          .width('48%')
          .backgroundColor('#4CAF50')
          .onClick(() => {
            this.showSuccessDialog = true
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