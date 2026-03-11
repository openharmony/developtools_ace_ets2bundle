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

// Test Case: TryCatch Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function tryCatchErrorCase1() {
}

// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function tryCatchErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function tryCatchErrorCase3() {
}

// Correct Usage Component 1: Try-catch block builder
@Builder
function buildTryCatchBlock(blockType: string, hasError: boolean, handled: boolean) {
  Column() {
    Row() {
      Text(blockType)
        .fontSize(14)
        .fontColor(blockType === 'try' ? '#4CAF50' : (blockType === 'catch' ? '#FF9800' : '#2196F3'))
        .fontWeight(FontWeight.Bold)
        .fontFamily('monospace')
        .layoutWeight(1)
      
      if (hasError) {
        Text('⚠')
          .fontSize(14)
          .fontColor('#FF6B6B')
      }
      
      if (handled) {
        Text('✓')
          .fontSize(12)
          .fontColor('#4CAF50')
          .margin({ left: 8 })
      }
    }
    .width('100%')
    
    // Block content
    Column() {
      Text('{ ... }')
        .fontSize(11)
        .fontColor('#999999')
        .fontFamily('monospace')
    }
    .width('100%')
    .padding(8)
    .backgroundColor('#FAFAFA')
    .borderRadius(4)
    .margin({ top: 6 })
  }
  .width('100%')
  .padding(12)
  .backgroundColor(blockType === 'try' ? '#E8F5E9' : (blockType === 'catch' ? '#FFF8E1' : '#E3F2FD'))
  .borderRadius(8)
  .margin({ bottom: 8 })
}

// Correct Usage Component 2: TryCatch card styles
@Styles
function tryCatchCardStyle() {
  .width('100%')
  .padding(18)
  .backgroundColor('#FFFFFF')
  .borderRadius(14)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.06)' })
}

// Correct Usage Component 3: TryCatch counter extension
@Extend(Text)
function tryCatchCounterText() {
  .fontSize(28)
  .fontWeight(FontWeight.Bold)
  .fontColor('#FF9800')
}

@Entry
@Component
struct TryCatchValidation {
  @State testTitle: string = 'TryCatch Decorator Validation'
  @State errorCount: number = 3
  @State tryBlocks: number = 4
  @State caughtErrors: number = 2
  @State showError: boolean = false

  build() {
    Column() {
      // Header
      Column() {
        Text(this.testTitle)
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1A1A1A')
        
        Text('Exception Handling Validation')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ top: 6 })
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Error Toggle
      Column() {
        Row() {
          Text('Simulate Error')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .fontColor('#333333')
            .layoutWeight(1)
          
          Toggle({ type: ToggleType.Switch, isOn: this.showError })
            .selectedColor('#FF9800')
            .onChange((isOn: boolean) => {
              this.showError = isOn
            })
        }
        .width('100%')
      }
      .width('100%')
      .padding(16)
      .backgroundColor(this.showError ? '#FFF8E1' : '#F5F5F5')
      .borderRadius(12)
      .margin({ left: 20, right: 20, bottom: 16 })

      // Stats Grid
      Row() {
        Column() {
          Text(this.tryBlocks.toString())
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#4CAF50')
          
          Text('Try Blocks')
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
          Text(this.caughtErrors.toString())
            .tryCatchCounterText()
          
          Text('Caught')
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
          Text('TryCatch Validation Errors')
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

      // Try-Catch Blocks
      Column() {
        Text('Exception Handling')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        buildTryCatchBlock('try', this.showError, false)
        buildTryCatchBlock('catch', this.showError, this.showError)
        buildTryCatchBlock('finally', false, true)
      }
      .tryCatchCardStyle()
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
      .tryCatchCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Control Buttons
      Row() {
        Button('Throw Error')
          .width('48%')
          .height(46)
          .backgroundColor('#FF6B6B')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            this.showError = true
            this.caughtErrors++
          })
        
        Button('Validate')
          .width('48%')
          .height(46)
          .backgroundColor('#FF9800')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            console.info('TryCatch validation completed')
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