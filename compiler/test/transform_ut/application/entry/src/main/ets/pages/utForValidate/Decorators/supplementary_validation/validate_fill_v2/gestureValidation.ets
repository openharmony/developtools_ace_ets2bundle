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

// Test Case: Gesture Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles in gesture
@Builder
@Styles
function gestureErrorCase1() {
}

// Error Case 2: @Extend + @Builder in gesture
@Extend(Button)
@Builder
function gestureErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder in gesture
@AnimatableExtend(Button)
@Builder
function gestureErrorCase3() {
}

// Correct Usage Component 1: Gesture handler builder
@Builder
function buildGestureDemo() {
  Column() {
    Text('Gesture Demo Area')
      .fontSize(18)
      .fontWeight(FontWeight.Medium)
      .margin({ bottom: 8 })
    
    Text('Tap, long press, or pan this area')
      .fontSize(14)
      .fontColor('#666666')
  }
  .width('100%')
  .height(120)
  .backgroundColor('#E3F2FD')
  .borderRadius(12)
  .justifyContent(FlexAlign.Center)
}

// Correct Usage Component 2: Gesture container styles
@Styles
function gestureContainerStyle() {
  .width('100%')
  .height(200)
  .backgroundColor('#FFFFFF')
  .borderRadius(16)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.08)' })
  .padding(16)
}

// Correct Usage Component 3: Button extension for gestures
@Extend(Button)
function gestureButtonStyle() {
  .width('100%')
  .height(48)
  .backgroundColor('#2196F3')
  .fontColor('#FFFFFF')
  .fontSize(16)
  .borderRadius(8)
}

@Entry
@Component
struct GestureValidation {
  @State testTitle: string = 'Gesture Decorator Validation'
  @State errorCount: number = 3
  @State gestureLog: string[] = []
  @State tapCount: number = 0
  @State longPressCount: number = 0

  addLog(message: string) {
    this.gestureLog.unshift(message)
    if (this.gestureLog.length > 5) {
      this.gestureLog.pop()
    }
  }

  build() {
    Column() {
      // Header
      Column() {
        Text(this.testTitle)
          .fontSize(26)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1A1A1A')
        
        Row() {
          Text('Validation Errors: ')
            .fontSize(14)
            .fontColor('#666666')
          Text(this.errorCount.toString())
            .fontSize(14)
            .fontColor('#FF6B6B')
            .fontWeight(FontWeight.Bold)
        }
        .margin({ top: 8 })
      }
      .width('100%')
      .padding({ top: 20, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Error Code Badge
      Row() {
        Text('ERROR CODE')
          .fontSize(10)
          .fontColor('#FFFFFF')
          .padding({ left: 8, right: 8, top: 4, bottom: 4 })
          .backgroundColor('#FF6B6B')
          .borderRadius(4)
        
        Text(' 10905117')
          .fontSize(14)
          .fontWeight(FontWeight.Medium)
          .fontColor('#FF6B6B')
          .margin({ left: 8 })
      }
      .padding(12)
      .backgroundColor('#FFF5F5')
      .borderRadius(8)
      .margin({ left: 20, right: 20, bottom: 16 })

      // Error Cases Summary
      Column() {
        Text('Decorator Conflicts Detected')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        Row() {
          Column() {
            Text('3')
              .fontSize(28)
              .fontWeight(FontWeight.Bold)
              .fontColor('#FF6B6B')
            Text('Conflicts')
              .fontSize(12)
              .fontColor('#999999')
          }
          .layoutWeight(1)
          
          Divider()
            .vertical(true)
            .height(40)
            .color('#E0E0E0')
          
          Column() {
            Text('Gesture')
              .fontSize(16)
              .fontWeight(FontWeight.Medium)
              .fontColor('#666666')
            Text('Context')
              .fontSize(12)
              .fontColor('#999999')
          }
          .layoutWeight(1)
        }
        .width('100%')
        .padding(16)
        .backgroundColor('#FAFAFA')
        .borderRadius(8)
      }
      .width('100%')
      .padding(20)
      .backgroundColor('#FFFFFF')
      .margin({ bottom: 16 })

      // Gesture Demo Area
      Column() {
        buildGestureDemo()
      }
      .gestureContainerStyle()
      .margin({ left: 20, right: 20 })
      .gesture(
        GestureGroup(GestureMode.Sequence,
          TapGesture({ count: 1 })
            .onAction(() => {
              this.tapCount++
              this.addLog(`Tap detected! Count: ${this.tapCount}`)
            }),
          LongPressGesture({ duration: 500 })
            .onAction(() => {
              this.longPressCount++
              this.addLog(`Long press! Count: ${this.longPressCount}`)
            })
        )
      )

      // Gesture Log
      Column() {
        Text('Gesture Event Log')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 8 })
        
        if (this.gestureLog.length === 0) {
          Text('No gestures detected yet')
            .fontSize(14)
            .fontColor('#999999')
            .italic(true)
            .padding(20)
        } else {
          List() {
            ForEach(this.gestureLog, (log: string, index: number) => {
              ListItem() {
                Row() {
                  Text(`${index + 1}.`)
                    .fontSize(12)
                    .fontColor('#999999')
                    .width(24)
                  
                  Text(log)
                    .fontSize(14)
                    .fontColor('#333333')
                    .layoutWeight(1)
                }
                .padding(8)
              }
            })
          }
          .width('100%')
          .height(100)
          .backgroundColor('#F5F5F5')
          .borderRadius(8)
          .padding(8)
        }
      }
      .width('100%')
      .padding(20)
      .layoutWeight(1)

      // Control Buttons
      Row() {
        Button('Clear Log')
          .gestureButtonStyle()
          .backgroundColor('#9E9E9E')
          .onClick(() => {
            this.gestureLog = []
            this.tapCount = 0
            this.longPressCount = 0
          })
        
        Button('Validate')
          .gestureButtonStyle()
          .margin({ left: 12 })
          .onClick(() => {
            this.addLog('Validation completed: 3 errors found')
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