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

// Test Case: If Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function ifErrorCase1() {
}

// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function ifErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function ifErrorCase3() {
}

// Correct Usage Component 1: Condition builder
@Builder
function buildConditionBlock(condition: string, status: boolean) {
  Column() {
    Row() {
      Text('if')
        .fontSize(14)
        .fontColor('#E91E63')
        .fontWeight(FontWeight.Bold)
        .fontFamily('monospace')
        .margin({ right: 8 })
      
      Text(`(${condition})`)
        .fontSize(13)
        .fontColor('#333333')
        .fontFamily('monospace')
        .layoutWeight(1)
      
      Text(status ? 'true' : 'false')
        .fontSize(12)
        .fontColor(status ? '#4CAF50' : '#FF6B6B')
        .padding({ horizontal: 8, vertical: 2 })
        .backgroundColor(status ? '#E8F5E9' : '#FFF5F5')
        .borderRadius(4)
    }
    .width('100%')
    
    // Block content preview
    Column() {
      Text('{ ... }')
        .fontSize(12)
        .fontColor('#999999')
        .fontFamily('monospace')
    }
    .width('100%')
    .padding(8)
    .backgroundColor('#FAFAFA')
    .borderRadius(4)
    .margin({ top: 8 })
  }
  .width('100%')
  .padding(12)
  .backgroundColor('#FCE4EC')
  .borderRadius(8)
  .margin({ bottom: 8 })
}

// Correct Usage Component 2: If card styles
@Styles
function ifCardStyle() {
  .width('100%')
  .padding(18)
  .backgroundColor('#FFFFFF')
  .borderRadius(14)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.06)' })
}

// Correct Usage Component 3: If status extension
@Extend(Text)
function ifStatusText() {
  .fontSize(14)
  .fontColor('#FFFFFF')
  .fontWeight(FontWeight.Medium)
  .padding({ horizontal: 10, vertical: 4 })
  .borderRadius(4)
}

@Entry
@Component
struct IfValidation {
  @State testTitle: string = 'If Decorator Validation'
  @State errorCount: number = 3
  @State conditionCount: number = 5
  @State showDetails: boolean = true
  @State isActive: boolean = true

  build() {
    Column() {
      // Header
      Column() {
        Text(this.testTitle)
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1A1A1A')
        
        Text('Conditional Rendering Validation')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ top: 6 })
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Toggle Section
      Column() {
        Text('Test Conditions')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        Row() {
          Text('showDetails')
            .fontSize(14)
            .fontColor('#333333')
            .layoutWeight(1)
          
          Toggle({ type: ToggleType.Switch, isOn: this.showDetails })
            .selectedColor('#E91E63')
            .onChange((isOn: boolean) => {
              this.showDetails = isOn
            })
        }
        .width('100%')
        .margin({ bottom: 8 })
        
        Row() {
          Text('isActive')
            .fontSize(14)
            .fontColor('#333333')
            .layoutWeight(1)
          
          Toggle({ type: ToggleType.Switch, isOn: this.isActive })
            .selectedColor('#E91E63')
            .onChange((isOn: boolean) => {
              this.isActive = isOn
            })
        }
        .width('100%')
      }
      .width('100%')
      .padding(16)
      .backgroundColor('#FCE4EC')
      .borderRadius(12)
      .margin({ left: 20, right: 20, bottom: 16 })

      // Stats Grid
      Row() {
        Column() {
          Text(this.conditionCount.toString())
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#E91E63')
          
          Text('Conditions')
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
          Text('2')
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
        Text('⚠')
          .fontSize(24)
          .margin({ right: 12 })
        
        Column() {
          Text('If Validation Errors')
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

      // Conditions
      Column() {
        Text('Conditional Blocks')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        buildConditionBlock('showDetails', this.showDetails)
        buildConditionBlock('isActive', this.isActive)
        buildConditionBlock('isLoggedIn', false)
      }
      .ifCardStyle()
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
      .ifCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Control Buttons
      Row() {
        Button('Toggle All')
          .width('48%')
          .height(46)
          .backgroundColor('#E91E63')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            this.showDetails = !this.showDetails
            this.isActive = !this.isActive
          })
        
        Button('Validate')
          .width('48%')
          .height(46)
          .backgroundColor('#4CAF50')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            console.info('If validation completed')
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