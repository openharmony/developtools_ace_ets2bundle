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

// Test Case: Animation Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles in animation
@Builder
@Styles
function animationErrorCase1() {
}

// Error Case 2: @Extend + @Builder in animation
@Extend(Text)
@Builder
function animationErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function animationErrorCase3() {
}

// Correct Usage Component 1: Animation builder
@Builder
function buildAnimationDemo() {
  Column() {
    Text('Animation Demo')
      .fontSize(20)
      .fontWeight(FontWeight.Bold)
      .margin({ bottom: 12 })
    
    Column() {
      Text('Animated Box')
        .fontSize(14)
        .fontColor('#FFFFFF')
    }
    .width(100)
    .height(100)
    .backgroundColor('#FF6B6B')
    .borderRadius(12)
    .justifyContent(FlexAlign.Center)
    .shadow({ radius: 8, color: 'rgba(255,107,107,0.4)' })
  }
  .padding(20)
}

// Correct Usage Component 2: Animation styles
@Styles
function animationCardStyle() {
  .width('100%')
  .padding(16)
  .backgroundColor('#FFFFFF')
  .borderRadius(16)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.1)' })
}

// Correct Usage Component 3: Animatable extension
@AnimatableExtend(Text)
function animatableTextStyle() {
  .fontSize(18)
  .fontColor('#2196F3')
  .fontWeight(FontWeight.Medium)
}

@Entry
@Component
struct AnimationValidation {
  @State testTitle: string = 'Animation Decorator Validation'
  @State errorCount: number = 3
  @State animationPlaying: boolean = false
  @State progress: number = 0
  @State scaleValue: number = 1

  build() {
    Column() {
      // Animated Header
      Column() {
        Text(this.testTitle)
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1A1A1A')
          .scale({ x: this.scaleValue, y: this.scaleValue })
          .animation({
            duration: 1000,
            curve: Curve.EaseInOut,
            iterations: -1,
            playMode: PlayMode.Alternate
          })
        
        Text('Decorator Conflict Detection')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ top: 8 })
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)
      .onAppear(() => {
        this.scaleValue = 1.05
      })

      // Progress indicator
      Column() {
        Row() {
          Text('Validation Progress')
            .fontSize(14)
            .fontColor('#666666')
          
          Text(`${Math.round(this.progress)}%`)
            .fontSize(14)
            .fontWeight(FontWeight.Medium)
            .fontColor('#2196F3')
        }
        .width('100%')
        .justifyContent(FlexAlign.SpaceBetween)
        .margin({ bottom: 8 })

        Row() {
          Row()
            .width(`${this.progress}%`)
            .height(6)
            .backgroundColor('#2196F3')
            .borderRadius(3)
            .animation({
              duration: 500,
              curve: Curve.EaseOut
            })
        }
        .width('100%')
        .height(6)
        .backgroundColor('#E0E0E0')
        .borderRadius(3)
      }
      .width('100%')
      .padding({ left: 20, right: 20, bottom: 16 })

      // Error Summary Card
      Column() {
        Row() {
          Column() {
            Text('3')
              .fontSize(36)
              .fontWeight(FontWeight.Bold)
              .fontColor('#FF6B6B')
            
            Text('Errors Found')
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
            Text('10905117')
              .fontSize(18)
              .fontWeight(FontWeight.Medium)
              .fontColor('#666666')
            
            Text('Error Code')
              .fontSize(12)
              .fontColor('#999999')
          }
          .alignItems(HorizontalAlign.Center)
          .layoutWeight(1)
        }
        .width('100%')
      }
      .animationCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Error Details List
      Column() {
        Text('⚠️ Conflict Cases')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .fontColor('#FF6B6B')
          .margin({ bottom: 12 })
        
        List() {
          ListItem() {
            Row() {
              Text('1')
                .fontSize(14)
                .fontWeight(FontWeight.Bold)
                .fontColor('#FFFFFF')
                .width(24)
                .height(24)
                .backgroundColor('#FF6B6B')
                .borderRadius(12)
                .textAlign(TextAlign.Center)
              
              Text('@Builder + @Styles')
                .fontSize(15)
                .fontColor('#333333')
                .margin({ left: 12 })
                .layoutWeight(1)
            }
            .padding(12)
          }
          
          ListItem() {
            Row() {
              Text('2')
                .fontSize(14)
                .fontWeight(FontWeight.Bold)
                .fontColor('#FFFFFF')
                .width(24)
                .height(24)
                .backgroundColor('#FF6B6B')
                .borderRadius(12)
                .textAlign(TextAlign.Center)
              
              Text('@Extend + @Builder')
                .fontSize(15)
                .fontColor('#333333')
                .margin({ left: 12 })
                .layoutWeight(1)
            }
            .padding(12)
          }
          
          ListItem() {
            Row() {
              Text('3')
                .fontSize(14)
                .fontWeight(FontWeight.Bold)
                .fontColor('#FFFFFF')
                .width(24)
                .height(24)
                .backgroundColor('#FF6B6B')
                .borderRadius(12)
                .textAlign(TextAlign.Center)
              
              Text('@AnimatableExtend + @Builder')
                .fontSize(15)
                .fontColor('#333333')
                .margin({ left: 12 })
                .layoutWeight(1)
            }
            .padding(12)
          }
        }
        .width('100%')
        .divider({ strokeWidth: 1, color: '#F0F0F0' })
      }
      .animationCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })
      .layoutWeight(1)

      // Control Buttons
      Row() {
        Button(this.animationPlaying ? '⏸ Pause' : '▶ Play Animation')
          .fontSize(15)
          .height(48)
          .layoutWeight(1)
          .backgroundColor(this.animationPlaying ? '#FF9800' : '#4CAF50')
          .onClick(() => {
            this.animationPlaying = !this.animationPlaying
            if (this.animationPlaying) {
              this.startProgressAnimation()
            }
          })
        
        Button('Reset')
          .fontSize(15)
          .height(48)
          .margin({ left: 12 })
          .layoutWeight(1)
          .backgroundColor('#2196F3')
          .onClick(() => {
            this.progress = 0
            this.animationPlaying = false
          })
      }
      .width('100%')
      .padding(20)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F7FA')
  }

  startProgressAnimation() {
    let interval = setInterval(() => {
      if (!this.animationPlaying) {
        clearInterval(interval)
        return
      }
      if (this.progress >= 100) {
        this.progress = 0
      } else {
        this.progress += 2
      }
    }, 50)
  }
}