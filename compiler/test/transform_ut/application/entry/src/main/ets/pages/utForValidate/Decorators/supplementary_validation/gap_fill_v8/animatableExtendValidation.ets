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

// Test Case: AnimatableExtend Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function animatableExtendErrorCase1() {
}

// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function animatableExtendErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function animatableExtendErrorCase3() {
}

// Correct Usage Component 1: Animatable extension builder
@Builder
function buildAnimatableExt(name: string, property: string, duration: number) {
  Row() {
    Column() {
      Row() {
        Text(name)
          .fontSize(15)
          .fontWeight(FontWeight.Medium)
          .fontColor('#333333')
        
        Text('anim')
          .fontSize(10)
          .fontColor('#FFFFFF')
          .padding({ horizontal: 6, vertical: 2 })
          .backgroundColor('#E91E63')
          .borderRadius(3)
          .margin({ left: 8 })
      }
      .margin({ bottom: 4 })
      
      Text(property)
        .fontSize(11)
        .fontColor('#666666')
    }
    .alignItems(HorizontalAlign.Start)
    .layoutWeight(1)
    
    Text(`${duration}ms`)
      .fontSize(13)
      .fontColor('#E91E63')
      .fontWeight(FontWeight.Medium)
  }
  .width('100%')
  .padding(12)
  .backgroundColor('#FCE4EC')
  .borderRadius(8)
  .margin({ bottom: 8 })
}

// Correct Usage Component 2: AnimatableExtend card styles
@Styles
function animatableExtendCardStyle() {
  .width('100%')
  .padding(18)
  .backgroundColor('#FFFFFF')
  .borderRadius(14)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.06)' })
}

// Correct Usage Component 3: AnimatableExtend badge extension
@Extend(Text)
function animatableExtendBadgeText() {
  .fontSize(12)
  .fontColor('#FFFFFF')
  .fontWeight(FontWeight.Medium)
  .padding({ horizontal: 8, vertical: 3 })
  .backgroundColor('#E91E63')
  .borderRadius(3)
}

@Entry
@Component
struct AnimatableExtendValidation {
  @State testTitle: string = 'AnimatableExtend Decorator Validation'
  @State errorCount: number = 3
  @State animExtensions: number = 6
  @State animDuration: number = 300

  build() {
    Column() {
      // Header
      Column() {
        Row() {
          Text('✨')
            .fontSize(24)
            .margin({ right: 8 })
          
          Text(this.testTitle)
            .fontSize(24)
            .fontWeight(FontWeight.Bold)
            .fontColor('#1A1A1A')
        }
        .margin({ bottom: 8 })
        
        Text('Animation Extension Validation')
          .fontSize(14)
          .fontColor('#666666')
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Animation Duration Slider
      Column() {
        Text('Default Duration')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ bottom: 8 })
        
        Text(`${this.animDuration}ms`)
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .fontColor('#E91E63')
          .margin({ bottom: 10 })
        
        Slider({
          value: this.animDuration,
          min: 100,
          max: 1000,
          step: 50
        })
          .width('100%')
          .selectedColor('#E91E63')
          .onChange((value: number) => {
            this.animDuration = value
          })
      }
      .width('100%')
      .padding(16)
      .backgroundColor('#FCE4EC')
      .borderRadius(12)
      .margin({ left: 20, right: 20, bottom: 16 })

      // Stats Grid
      Row() {
        Column() {
          Text(this.animExtensions.toString())
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#E91E63')
          
          Text('Extensions')
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
          Text(`${this.animDuration}ms`)
            .fontSize(20)
            .fontWeight(FontWeight.Bold)
            .fontColor('#2196F3')
          
          Text('Duration')
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
          Text('AnimatableExtend Validation Errors')
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

      // Animatable Extensions
      Column() {
        Text('Animation Extensions')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        buildAnimatableExt('fadeIn', 'opacity', 300)
        buildAnimatableExt('slideUp', 'translateY', 400)
        buildAnimatableExt('scaleUp', 'scale', 250)
        buildAnimatableExt('rotate', 'rotate', 500)
      }
      .animatableExtendCardStyle()
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
      .animatableExtendCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Control Buttons
      Row() {
        Button('Add Extension')
          .width('48%')
          .height(46)
          .backgroundColor('#E91E63')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            this.animExtensions++
          })
        
        Button('Validate')
          .width('48%')
          .height(46)
          .backgroundColor('#4CAF50')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            console.info('AnimatableExtend validation completed')
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