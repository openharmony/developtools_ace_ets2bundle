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

// Test Case: Builder Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function builderErrorCase1() {
}

// Error Case 2: @Extend + @Builder conflict
@Extend(Column)
@Builder
function builderErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Column)
@Builder
function builderErrorCase3() {
}

// Correct Usage Component 1: Header builder
@Builder
function buildPageHeader(title: string, subtitle: string) {
  Column() {
    Text(title)
      .fontSize(26)
      .fontWeight(FontWeight.Bold)
      .fontColor('#1A1A1A')
      .margin({ bottom: 6 })
    
    Text(subtitle)
      .fontSize(14)
      .fontColor('#666666')
      .margin({ bottom: 4 })
    
    Divider()
      .strokeWidth(2)
      .color('#E0E0E0')
      .width('60%')
      .margin({ top: 8 })
  }
  .width('100%')
  .padding({ top: 20, bottom: 16 })
  .alignItems(HorizontalAlign.Center)
}

// Correct Usage Component 2: Card styles
@Styles
function builderCardStyle() {
  .width('100%')
  .padding(20)
  .backgroundColor('#FFFFFF')
  .borderRadius(16)
  .shadow({ radius: 10, color: 'rgba(0,0,0,0.06)' })
}

// Correct Usage Component 3: Primary button extension
@Extend(Button)
function builderPrimaryButton() {
  .width('100%')
  .height(50)
  .backgroundColor('#2196F3')
  .fontColor('#FFFFFF')
  .fontSize(16)
  .fontWeight(FontWeight.Medium)
  .borderRadius(10)
}

@Entry
@Component
struct BuilderValidation {
  @State testTitle: string = 'Builder Decorator Validation'
  @State errorCount: number = 3
  @State currentStep: number = 1
  @State totalSteps: number = 5
  @State builderItems: string[] = ['Header', 'Body', 'Footer', 'Actions']

  build() {
    Column() {
      // Header using builder
      buildPageHeader(
        this.testTitle,
        'Error Code: 10905117'
      )

      // Progress Indicator
      Column() {
        Row() {
          Text('Validation Progress')
            .fontSize(14)
            .fontColor('#666666')
          
          Text(`${this.currentStep}/${this.totalSteps}`)
            .fontSize(14)
            .fontWeight(FontWeight.Medium)
            .fontColor('#2196F3')
        }
        .width('100%')
        .justifyContent(FlexAlign.SpaceBetween)
        .margin({ bottom: 8 })

        Row() {
          ForEach([1, 2, 3, 4, 5], (step: number) => {
            Column() {
              if (step <= this.currentStep) {
                Circle({ width: 12, height: 12 })
                  .fill('#2196F3')
              } else {
                Circle({ width: 12, height: 12 })
                  .fill('#E0E0E0')
              }
            }
            .layoutWeight(1)
          })
        }
        .width('100%')
        .padding({ vertical: 8 })
      }
      .padding({ left: 20, right: 20, bottom: 16 })

      // Error Summary Card
      Column() {
        Row() {
          Column() {
            Text('3')
              .fontSize(32)
              .fontWeight(FontWeight.Bold)
              .fontColor('#FF6B6B')
            
            Text('Builder Errors')
              .fontSize(12)
              .fontColor('#999999')
          }
          .alignItems(HorizontalAlign.Center)
          .layoutWeight(1)
          
          Divider()
            .vertical(true)
            .height(50)
            .strokeWidth(1)
            .color('#E0E0E0')
          
          Column() {
            Text('Builder')
              .fontSize(16)
              .fontWeight(FontWeight.Medium)
              .fontColor('#666666')
            
            Text('Validation')
              .fontSize(12)
              .fontColor('#999999')
          }
          .alignItems(HorizontalAlign.Center)
          .layoutWeight(1)
        }
        .width('100%')
        .padding(16)
        .backgroundColor('#FFF5F5')
        .borderRadius(8)
      }
      .builderCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Builder Items List
      Column() {
        Text('Builder Components')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        List() {
          ForEach(this.builderItems, (item: string, index: number) => {
            ListItem() {
              Row() {
                Row() {
                  Text((index + 1).toString())
                    .fontSize(14)
                    .fontWeight(FontWeight.Bold)
                    .fontColor('#FFFFFF')
                }
                .width(28)
                .height(28)
                .backgroundColor('#2196F3')
                .borderRadius(14)
                .justifyContent(FlexAlign.Center)
                .margin({ right: 12 })
                
                Text(item)
                  .fontSize(16)
                  .fontColor('#333333')
                  .layoutWeight(1)
                
                Text('✓')
                  .fontSize(18)
                  .fontColor('#4CAF50')
              }
              .width('100%')
              .padding(12)
              .backgroundColor('#F9F9F9')
              .borderRadius(8)
            }
            .margin({ bottom: 8 })
          })
        }
        .width('100%')
        .layoutWeight(1)
      }
      .builderCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })
      .layoutWeight(1)

      // Error Details
      Column() {
        Text('Error Details')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 10 })
        
        Column() {
          Text('@Builder cannot be combined with:')
            .fontSize(14)
            .fontColor('#666666')
            .margin({ bottom: 8 })
          
          Row() {
            Text('@Styles')
              .fontSize(13)
              .fontColor('#FF6B6B')
              .padding({ horizontal: 10, vertical: 4 })
              .backgroundColor('#FFF5F5')
              .borderRadius(4)
            
            Text('@Extend')
              .fontSize(13)
              .fontColor('#FF6B6B')
              .padding({ horizontal: 10, vertical: 4 })
              .backgroundColor('#FFF5F5')
              .borderRadius(4)
              .margin({ left: 8 })
            
            Text('@AnimatableExtend')
              .fontSize(13)
              .fontColor('#FF6B6B')
              .padding({ horizontal: 10, vertical: 4 })
              .backgroundColor('#FFF5F5')
              .borderRadius(4)
              .margin({ left: 8 })
          }
        }
        .width('100%')
        .padding(12)
        .backgroundColor('#FAFAFA')
        .borderRadius(8)
      }
      .padding({ left: 20, right: 20, bottom: 16 })

      // Navigation Buttons
      Row() {
        Button('Previous')
          .builderPrimaryButton()
          .backgroundColor(this.currentStep > 1 ? '#E0E0E0' : '#F5F5F5')
          .fontColor(this.currentStep > 1 ? '#666666' : '#999999')
          .layoutWeight(1)
          .enabled(this.currentStep > 1)
          .onClick(() => {
            if (this.currentStep > 1) {
              this.currentStep--
            }
          })
        
        Button(this.currentStep < this.totalSteps ? 'Next' : 'Complete')
          .builderPrimaryButton()
          .layoutWeight(1)
          .margin({ left: 12 })
          .onClick(() => {
            if (this.currentStep < this.totalSteps) {
              this.currentStep++
            } else {
              console.info('Validation completed')
            }
          })
      }
      .width('100%')
      .padding(20)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#FAFAFA')
  }
}