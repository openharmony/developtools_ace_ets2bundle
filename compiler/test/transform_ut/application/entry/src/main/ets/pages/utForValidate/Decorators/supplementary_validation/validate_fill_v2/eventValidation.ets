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

// Test Case: Event Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles in event handling
@Builder
@Styles
function eventErrorCase1() {
}

// Error Case 2: @Extend + @Builder in events
@Extend(Button)
@Builder
function eventErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder in events
@AnimatableExtend(Button)
@Builder
function eventErrorCase3() {
}

// Correct Usage Component 1: Event handler builder
@Builder
function buildEventDemo() {
  Column() {
    Text('Event Handling Demo')
      .fontSize(20)
      .fontWeight(FontWeight.Bold)
      .margin({ bottom: 12 })
    
    Row() {
      Text('Status: ')
        .fontSize(16)
        .fontColor('#666666')
      
      Text('Active')
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .fontColor('#4CAF50')
    }
    .padding(12)
    .backgroundColor('#E8F5E9')
    .borderRadius(8)
    .width('100%')
  }
  .width('100%')
  .padding(16)
}

// Correct Usage Component 2: Event card styles
@Styles
function eventCardStyle() {
  .width('100%')
  .padding(20)
  .backgroundColor('#FFFFFF')
  .borderRadius(16)
  .shadow({ radius: 10, color: 'rgba(0,0,0,0.06)' })
}

// Correct Usage Component 3: Event button extension
@Extend(Button)
function eventActionButton() {
  .width('100%')
  .height(50)
  .fontSize(16)
  .fontWeight(FontWeight.Medium)
  .borderRadius(10)
}

@Entry
@Component
struct EventValidation {
  @State testTitle: string = 'Event Decorator Validation'
  @State errorCount: number = 3
  @State eventLog: string[] = []
  @State buttonClicks: number = 0
  @State validationPassed: boolean = false

  addEventLog(event: string) {
    const timestamp = new Date().toLocaleTimeString()
    this.eventLog.unshift(`[${timestamp}] ${event}`)
    if (this.eventLog.length > 6) {
      this.eventLog.pop()
    }
  }

  build() {
    Column() {
      // Header Section
      Column() {
        Text(this.testTitle)
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1A1A1A')
        
        Text('Event Handler Decorator Testing')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ top: 6 })
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Error Code Banner
      Row() {
        Text('⚠')
          .fontSize(20)
          .fontColor('#FFFFFF')
          .margin({ right: 8 })
        
        Column() {
          Text('DECORATOR CONFLICT DETECTED')
            .fontSize(11)
            .fontColor('#FFFFFF')
            .fontWeight(FontWeight.Medium)
          
          Text('Error Code: 10905117')
            .fontSize(13)
            .fontColor('#FFFFFF')
        }
        .alignItems(HorizontalAlign.Start)
        .layoutWeight(1)
      }
      .width('100%')
      .padding(16)
      .backgroundColor('#FF6B6B')
      .margin({ left: 20, right: 20, bottom: 16 })

      // Error Summary Grid
      Column() {
        Text('Conflict Summary')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 16 })
        
        Row() {
          // Error 1
          Column() {
            Text('1')
              .fontSize(24)
              .fontWeight(FontWeight.Bold)
              .fontColor('#FF6B6B')
            
            Text('@Builder + @Styles')
              .fontSize(11)
              .fontColor('#666666')
              .textAlign(TextAlign.Center)
              .maxLines(2)
          }
          .layoutWeight(1)
          .padding(12)
          .backgroundColor('#FFF5F5')
          .borderRadius(8)
          .margin({ right: 8 })

          // Error 2
          Column() {
            Text('2')
              .fontSize(24)
              .fontWeight(FontWeight.Bold)
              .fontColor('#FF6B6B')
            
            Text('@Extend + @Builder')
              .fontSize(11)
              .fontColor('#666666')
              .textAlign(TextAlign.Center)
              .maxLines(2)
          }
          .layoutWeight(1)
          .padding(12)
          .backgroundColor('#FFF5F5')
          .borderRadius(8)
          .margin({ right: 8 })

          // Error 3
          Column() {
            Text('3')
              .fontSize(24)
              .fontWeight(FontWeight.Bold)
              .fontColor('#FF6B6B')
            
            Text('@AnimatableExtend + @Builder')
              .fontSize(11)
              .fontColor('#666666')
              .textAlign(TextAlign.Center)
              .maxLines(2)
          }
          .layoutWeight(1)
          .padding(12)
          .backgroundColor('#FFF5F5')
          .borderRadius(8)
        }
        .width('100%')
      }
      .eventCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Event Log Section
      Column() {
        Row() {
          Text('Event Log')
            .fontSize(18)
            .fontWeight(FontWeight.Medium)
          
          Text(`${this.eventLog.length} events`)
            .fontSize(12)
            .fontColor('#999999')
        }
        .width('100%')
        .justifyContent(FlexAlign.SpaceBetween)
        .margin({ bottom: 12 })

        if (this.eventLog.length === 0) {
          Column() {
            Text('No events recorded')
              .fontSize(14)
              .fontColor('#999999')
              .italic(true)
          }
          .width('100%')
          .height(100)
          .justifyContent(FlexAlign.Center)
          .backgroundColor('#F9F9F9')
          .borderRadius(8)
        } else {
          List() {
            ForEach(this.eventLog, (log: string, index: number) => {
              ListItem() {
                Row() {
                  Circle({ width: 8, height: 8 })
                    .fill('#2196F3')
                    .margin({ right: 8 })
                  
                  Text(log)
                    .fontSize(13)
                    .fontColor('#333333')
                    .layoutWeight(1)
                }
                .padding(10)
              }
            })
          }
          .width('100%')
          .height(120)
          .backgroundColor('#F5F7FA')
          .borderRadius(8)
          .padding(8)
        }
      }
      .eventCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })
      .layoutWeight(1)

      // Action Buttons
      Column() {
        Button(`Click Counter: ${this.buttonClicks}`)
          .eventActionButton()
          .backgroundColor('#2196F3')
          .margin({ bottom: 12 })
          .onClick(() => {
            this.buttonClicks++
            this.addEventLog(`Button clicked: ${this.buttonClicks} times`)
          })
        
        Row() {
          Button('Clear Log')
            .eventActionButton()
            .backgroundColor('#9E9E9E')
            .onClick(() => {
              this.eventLog = []
              this.addEventLog('Log cleared')
            })
          
          Button('Run Test')
            .eventActionButton()
            .margin({ left: 12 })
            .backgroundColor(this.validationPassed ? '#4CAF50' : '#FF9800')
            .onClick(() => {
              this.validationPassed = !this.validationPassed
              this.addEventLog(`Validation ${this.validationPassed ? 'passed' : 'reset'}`)
            })
        }
      }
      .width('100%')
      .padding(20)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#FAFAFA')
  }
}