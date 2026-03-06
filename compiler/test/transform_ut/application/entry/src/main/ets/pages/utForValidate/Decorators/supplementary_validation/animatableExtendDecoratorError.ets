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

/**
 * Test case: AnimatableExtend decorator error
 * Purpose: Verify @AnimatableExtend decorator usage and validation
 * Error code: 10905600
 */

// ============================================
// Test Case 1: @AnimatableExtend without target
// Expected Error: 10905600
// ============================================

@AnimatableExtend
function animatableWithoutTarget() {
  .width(100)
  .height(100)
  .backgroundColor('#FF0000')
}

// ============================================
// Test Case 2: @AnimatableExtend with invalid target
// Expected Error: 10905600
// ============================================

@AnimatableExtend(InvalidTarget)
function animatableInvalidTarget() {
  .width(200)
  .height(200)
}

// ============================================
// Test Case 3: @AnimatableExtend with multiple parameters
// Expected Error: 10905600
// ============================================

@AnimatableExtend(Rect)
function animatableWithMultiParams(start: number, end: number, duration: number) {
  .width(start)
  .height(end)
  .animation({ duration: duration })
}

// ============================================
// Test Case 4: Correct @AnimatableExtend usage
// ============================================

@AnimatableExtend(Text)
function animatableTextWidth(start: number, end: number) {
  .width(start + (end - start) * 0.5)
  .fontSize(16 + (24 - 16) * 0.5)
  .animation({ duration: 1000, curve: Curve.EaseInOut })
}

@AnimatableExtend(Column)
function animatableColumnHeight(start: number, end: number) {
  .height(start + (end - start) * 0.5)
  .backgroundColor('#1890FF')
  .animation({ duration: 800, curve: Curve.Spring })
}

@AnimatableExtend(Image)
function animatableImageScale(start: number, end: number) {
  .scale({ x: start + (end - start) * 0.5, y: start + (end - start) * 0.5 })
  .animation({ duration: 500, curve: Curve.Linear })
}

@AnimatableExtend(Button)
function animatableButtonWidth(start: number, end: number) {
  .width(start + (end - start) * 0.5)
  .height(50 + (70 - 50) * 0.5)
  .animation({ duration: 600, curve: Curve.Ease })
}

@Component
struct CorrectAnimatableExtendUsage {
  @State textWidth: number = 100
  @State colHeight: number = 100
  @State imgScale: number = 0.5
  @State btnWidth: number = 120

  build() {
    Column() {
      Text('Animatable Text')
        .animatableTextWidth(100, 300)
        .margin(20)
        .onClick(() => {
          this.textWidth = this.textWidth === 100 ? 300 : 100
        })

      Column() {
        Text('Animatable Column')
          .fontColor(Color.White)
      }
      .animatableColumnHeight(100, 200)
      .margin(20)
      .onClick(() => {
        this.colHeight = this.colHeight === 100 ? 200 : 100
      })

      Image($r('app.media.icon'))
        .animatableImageScale(0.5, 1.5)
        .margin(20)
        .onClick(() => {
          this.imgScale = this.imgScale === 0.5 ? 1.5 : 0.5
        })

      Button('Animatable Button')
        .animatableButtonWidth(120, 250)
        .margin(20)
        .onClick(() => {
          this.btnWidth = this.btnWidth === 120 ? 250 : 120
        })
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F5F5')
    .padding(20)
  }
}

// ============================================
// Test Case 5: @AnimatableExtend with curve variations
// ============================================

@AnimatableExtend(Text)
function animatableWithEaseIn(start: number, end: number) {
  .width(start + (end - start) * 0.5)
  .animation({ duration: 1000, curve: Curve.EaseIn })
}

@AnimatableExtend(Text)
function animatableWithEaseOut(start: number, end: number) {
  .width(start + (end - start) * 0.5)
  .animation({ duration: 1000, curve: Curve.EaseOut })
}

@AnimatableExtend(Column)
function animatableWithSpring(start: number, end: number) {
  .height(start + (end - start) * 0.5)
  .animation({ duration: 800, curve: Curve.Spring })
}

@Component
struct AnimatableCurvesDemo {
  @State width1: number = 100
  @State width2: number = 100
  @State height3: number = 80

  build() {
    Column() {
      Text('EaseIn Animation')
        .animatableWithEaseIn(100, 300)
        .backgroundColor('#FF6B6B')
        .fontColor(Color.White)
        .padding(10)
        .margin(10)
        .onClick(() => {
          this.width1 = this.width1 === 100 ? 300 : 100
        })

      Text('EaseOut Animation')
        .animatableWithEaseOut(100, 300)
        .backgroundColor('#4ECDC4')
        .fontColor(Color.White)
        .padding(10)
        .margin(10)
        .onClick(() => {
          this.width2 = this.width2 === 100 ? 300 : 100
        })

      Column() {
        Text('Spring Animation')
          .fontColor(Color.White)
          .fontWeight(FontWeight.Bold)
      }
      .animatableWithSpring(80, 150)
      .backgroundColor('#45B7D1')
      .width(200)
      .margin(10)
      .onClick(() => {
        this.height3 = this.height3 === 80 ? 150 : 80
      })

      Button('Animate All')
        .onClick(() => {
          this.width1 = this.width1 === 100 ? 300 : 100
          this.width2 = this.width2 === 100 ? 300 : 100
          this.height3 = this.height3 === 80 ? 150 : 80
        })
        .margin(20)
    }
    .width('100%')
    .height('100%')
    .padding(20)
  }
}

// ============================================
// Entry point for testing
// ============================================

@Entry
@Component
struct TestAnimatableExtendDecorator {
  @State testTitle: string = '@AnimatableExtend Decorator Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing Error Code: 10905600')
          .fontSize(18)
          .fontColor(Color.Red)
          .margin(5)

        Text('@AnimatableExtend without target')
          .fontSize(14)
          .margin(5)

        Text('@AnimatableExtend with invalid target')
          .fontSize(14)
          .margin(5)

        Text('@AnimatableExtend with wrong params')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      Column() {
        Text('@AnimatableExtend Rules:')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin(5)

        Text('1. Must specify target component')
          .fontSize(14)
          .margin(2)

        Text('2. Target must support animation')
          .fontSize(14)
          .margin(2)

        Text('3. Exactly 2 parameters: start/end')
          .fontSize(14)
          .margin(2)

        Text('4. Used for animatable properties')
          .fontSize(14)
          .margin(2)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .margin(10)

      Column() {
        Text('Correct Usage:')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)

        Text('@AnimatableExtend(Text)')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('function animateText(start: number,')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('                         end: number) {')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('  .width(start + (end-start)/2)')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('  .animation({ duration: 1000 })')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('}')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#E8F5E9')
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}
