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

// Test Case: Watch Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function watchErrorCase1() {
}

// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function watchErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function watchErrorCase3() {
}

// Correct Usage Component 1: Watch status builder
@Builder
function buildWatchStatus(watchName: string, isWatching: boolean, lastTrigger: string) {
  Row() {
    Column() {
      Text(watchName)
        .fontSize(15)
        .fontWeight(FontWeight.Medium)
        .fontColor('#333333')
      
      Text(`Last: ${lastTrigger}`)
        .fontSize(11)
        .fontColor('#999999')
        .margin({ top: 2 })
    }
    .alignItems(HorizontalAlign.Start)
    .layoutWeight(1)
    
    Column() {
      Row() {
        Circle({ width: 8, height: 8 })
          .fill(isWatching ? '#4CAF50' : '#9E9E9E')
        
        Text(isWatching ? 'Watching' : 'Stopped')
          .fontSize(12)
          .fontColor(isWatching ? '#4CAF50' : '#9E9E9E')
          .margin({ left: 6 })
      }
    }
  }
  .width('100%')
  .padding(12)
  .backgroundColor(isWatching ? '#E8F5E9' : '#F5F5F5')
  .borderRadius(8)
  .margin({ bottom: 8 })
}

// Correct Usage Component 2: Watch card styles
@Styles
function watchCardStyle() {
  .width('100%')
  .padding(18)
  .backgroundColor('#FFFFFF')
  .borderRadius(14)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.06)' })
}

// Correct Usage Component 3: Watch counter extension
@Extend(Text)
function watchCounterText() {
  .fontSize(36)
  .fontWeight(FontWeight.Bold)
  .fontColor('#FF5722')
}

@Entry
@Component
struct WatchValidation {
  @State testTitle: string = 'Watch Decorator Validation'
  @State errorCount: number = 3
  @State watchCount: number = 5
  @State triggerCount: number = 128
  @State isWatching: boolean = true
  @State lastTrigger: string = '2s ago'

  build() {
    Column() {
      // Header
      Column() {
        Text(this.testTitle)
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1A1A1A')
        
        Text('State Watch Validation')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ top: 6 })
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Watch Counter Display
      Column() {
        Text('Trigger Count')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ bottom: 8 })
        
        Text(this.triggerCount.toString())
          .watchCounterText()
          .animation({ duration: 300 })
        
        Text(`Last triggered: ${this.lastTrigger}`)
          .fontSize(12)
          .fontColor('#999999')
          .margin({ top: 8 })
      }
      .width('100%')
      .padding(20)
      .backgroundColor('#FBE9E7')
      .borderRadius(12)
      .margin({ left: 20, right: 20, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Stats Row
      Row() {
        Column() {
          Text(this.watchCount.toString())
            .fontSize(24)
            .fontWeight(FontWeight.Bold)
            .fontColor('#FF5722')
          
          Text('Active Watches')
            .fontSize(12)
            .fontColor('#666666')
        }
        .alignItems(HorizontalAlign.Center)
        .layoutWeight(1)
        
        Divider()
          .vertical(true)
          .height(40)
          .color('#E0E0E0')
        
        Column() {
          Text(this.errorCount.toString())
            .fontSize(24)
            .fontWeight(FontWeight.Bold)
            .fontColor('#FF6B6B')
          
          Text('Errors')
            .fontSize(12)
            .fontColor('#666666')
        }
        .alignItems(HorizontalAlign.Center)
        .layoutWeight(1)
        
        Divider()
          .vertical(true)
          .height(40)
          .color('#E0E0E0')
        
        Column() {
          Text('10905117')
            .fontSize(13)
            .fontWeight(FontWeight.Medium)
            .fontColor('#FF9800')
          
          Text('Error Code')
            .fontSize(11)
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

      // Watch List
      Column() {
        Row() {
          Text('Active Watchers')
            .fontSize(18)
            .fontWeight(FontWeight.Medium)
          
          Button(this.isWatching ? 'Stop All' : 'Start All')
            .fontSize(12)
            .height(32)
            .backgroundColor(this.isWatching ? '#FF6B6B' : '#4CAF50')
            .onClick(() => {
              this.isWatching = !this.isWatching
            })
        }
        .width('100%')
        .justifyContent(FlexAlign.SpaceBetween)
        .margin({ bottom: 12 })

        buildWatchStatus('counterWatch', this.isWatching, this.lastTrigger)
        buildWatchStatus('statusWatch', this.isWatching, '5s ago')
        buildWatchStatus('dataWatch', this.isWatching, '12s ago')
      }
      .watchCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })
      .layoutWeight(1)

      // Error Panel
      Column() {
        Text('⚠ Validation Errors')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .fontColor('#FF6B6B')
          .margin({ bottom: 10 })
        
        List() {
          ListItem() {
            Row() {
              Text('@Builder + @Styles')
                .fontSize(13)
                .fontColor('#333333')
              Text('Invalid combination')
                .fontSize(11)
                .fontColor('#FF6B6B')
            }
            .width('100%')
            .padding(8)
          }
          
          ListItem() {
            Row() {
              Text('@Extend + @Builder')
                .fontSize(13)
                .fontColor('#333333')
              Text('Invalid combination')
                .fontSize(11)
                .fontColor('#FF6B6B')
            }
            .width('100%')
            .padding(8)
          }
          
          ListItem() {
            Row() {
              Text('@AnimatableExtend + @Builder')
                .fontSize(13)
                .fontColor('#333333')
              Text('Invalid combination')
                .fontSize(11)
                .fontColor('#FF6B6B')
            }
            .width('100%')
            .padding(8)
          }
        }
        .width('100%')
        .backgroundColor('#FFF5F5')
        .borderRadius(8)
        .padding(8)
      }
      .watchCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Control Buttons
      Row() {
        Button('Trigger Watch')
          .width('48%')
          .height(46)
          .backgroundColor('#FF5722')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            this.triggerCount++
            this.lastTrigger = 'just now'
          })
        
        Button('Validate')
          .width('48%')
          .height(46)
          .backgroundColor('#2196F3')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            console.info('Watch validation completed')
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