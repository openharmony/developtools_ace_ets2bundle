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

// Test Case: State Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles in state management
@Builder
@Styles
function stateErrorCase1() {
}

// Error Case 2: @Extend + @Builder in state context
@Extend(Column)
@Builder
function stateErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder in state
@AnimatableExtend(Column)
@Builder
function stateErrorCase3() {
}

// Correct Usage Component 1: State management builder
@Builder
function buildStateDemo() {
  Column() {
    Text('State Management Demo')
      .fontSize(20)
      .fontWeight(FontWeight.Bold)
      .margin({ bottom: 12 })
    
    Row() {
      Text('Counter: ')
        .fontSize(16)
        .fontColor('#666666')
      
      Text('Dynamic Value')
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .fontColor('#2196F3')
    }
    .padding(12)
    .backgroundColor('#E3F2FD')
    .borderRadius(8)
  }
  .width('100%')
  .padding(16)
}

// Correct Usage Component 2: State card styles
@Styles
function stateCardStyle() {
  .width('100%')
  .padding(20)
  .backgroundColor('#FFFFFF')
  .borderRadius(16)
  .shadow({ radius: 10, color: 'rgba(0,0,0,0.05)' })
  .margin({ bottom: 16 })
}

// Correct Usage Component 3: State text extension
@Extend(Text)
function stateLabelText() {
  .fontSize(14)
  .fontColor('#666666')
  .margin({ bottom: 4 })
}

@Entry
@Component
struct StateValidation {
  @State testTitle: string = 'State Decorator Validation'
  @State errorCount: number = 3
  @State counter: number = 0
  @State isValidating: boolean = false
  @State validationStep: number = 0

  build() {
    Column() {
      // Header
      Column() {
        Text(this.testTitle)
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1A1A1A')
        
        Text('Error Code: 10905117')
          .fontSize(14)
          .fontColor('#FF6B6B')
          .margin({ top: 8 })
      }
      .width('100%')
      .padding({ top: 24, bottom: 20 })
      .alignItems(HorizontalAlign.Center)

      // Validation Status Card
      Column() {
        Row() {
          Column() {
            Text(this.isValidating ? 'Validating...' : 'Ready')
              .fontSize(14)
              .fontColor(this.isValidating ? '#2196F3' : '#4CAF50')
            
            Text(`Step ${this.validationStep}/3`)
              .fontSize(12)
              .fontColor('#999999')
              .margin({ top: 4 })
          }
          .alignItems(HorizontalAlign.Center)
          .layoutWeight(1)
          
          if (this.isValidating) {
            LoadingProgress()
              .width(32)
              .height(32)
              .color('#2196F3')
          } else {
            Text('✓')
              .fontSize(24)
              .fontColor('#4CAF50')
          }
        }
        .width('100%')
      }
      .stateCardStyle()
      .backgroundColor(this.isValidating ? '#E3F2FD' : '#E8F5E9')
      .margin({ left: 20, right: 20 })

      // Error Summary
      Column() {
        Text('Validation Results')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 16 })
        
        // Error 1
        Row() {
          Column() {
            Text('@Builder + @Styles')
              .fontSize(15)
              .fontWeight(FontWeight.Medium)
              .fontColor('#333333')
            
            Text('Invalid decorator combination')
              .fontSize(12)
              .fontColor('#FF6B6B')
              .margin({ top: 2 })
          }
          .alignItems(HorizontalAlign.Start)
          .layoutWeight(1)
          
          Text('❌')
            .fontSize(20)
        }
        .width('100%')
        .padding(12)
        .backgroundColor('#FFF5F5')
        .borderRadius(8)
        .margin({ bottom: 8 })

        // Error 2
        Row() {
          Column() {
            Text('@Extend + @Builder')
              .fontSize(15)
              .fontWeight(FontWeight.Medium)
              .fontColor('#333333')
            
            Text('Invalid decorator combination')
              .fontSize(12)
              .fontColor('#FF6B6B')
              .margin({ top: 2 })
          }
          .alignItems(HorizontalAlign.Start)
          .layoutWeight(1)
          
          Text('❌')
            .fontSize(20)
        }
        .width('100%')
        .padding(12)
        .backgroundColor('#FFF5F5')
        .borderRadius(8)
        .margin({ bottom: 8 })

        // Error 3
        Row() {
          Column() {
            Text('@AnimatableExtend + @Builder')
              .fontSize(15)
              .fontWeight(FontWeight.Medium)
              .fontColor('#333333')
            
            Text('Invalid decorator combination')
              .fontSize(12)
              .fontColor('#FF6B6B')
              .margin({ top: 2 })
          }
          .alignItems(HorizontalAlign.Start)
          .layoutWeight(1)
          
          Text('❌')
            .fontSize(20)
        }
        .width('100%')
        .padding(12)
        .backgroundColor('#FFF5F5')
        .borderRadius(8)
      }
      .stateCardStyle()
      .margin({ left: 20, right: 20 })

      // State Counter Demo
      Column() {
        Text('State Counter Demo')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        Row() {
          Button('-')
            .width(48)
            .height(48)
            .fontSize(20)
            .backgroundColor('#FF6B6B')
            .onClick(() => {
              if (this.counter > 0) {
                this.counter--
              }
            })
          
          Text(this.counter.toString())
            .fontSize(32)
            .fontWeight(FontWeight.Bold)
            .fontColor('#2196F3')
            .layoutWeight(1)
            .textAlign(TextAlign.Center)
          
          Button('+')
            .width(48)
            .height(48)
            .fontSize(20)
            .backgroundColor('#4CAF50')
            .onClick(() => {
              this.counter++
            })
        }
        .width('100%')
      }
      .stateCardStyle()
      .margin({ left: 20, right: 20, top: 16 })
      .layoutWeight(1)

      // Action Buttons
      Row() {
        Button('Start Validation')
          .width('100%')
          .height(48)
          .backgroundColor('#2196F3')
          .enabled(!this.isValidating)
          .onClick(() => {
            this.isValidating = true
            this.validationStep = 0
            this.runValidationSteps()
          })
      }
      .width('100%')
      .padding(20)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#FAFAFA')
  }

  runValidationSteps() {
    let step = 0
    let interval = setInterval(() => {
      step++
      this.validationStep = step
      if (step >= 3) {
        clearInterval(interval)
        this.isValidating = false
      }
    }, 800)
  }
}