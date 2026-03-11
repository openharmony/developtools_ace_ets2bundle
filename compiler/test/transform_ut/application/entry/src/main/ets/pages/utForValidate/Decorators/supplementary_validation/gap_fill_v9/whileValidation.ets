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

// Test Case: While Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function whileErrorCase1() {
}

// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function whileErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function whileErrorCase3() {
}

// Correct Usage Component 1: While loop builder
@Builder
function buildWhileLoop(iteration: number, condition: string, active: boolean) {
  Row() {
    Column() {
      Row() {
        Text('while')
          .fontSize(14)
          .fontColor('#795548')
          .fontWeight(FontWeight.Bold)
          .fontFamily('monospace')
          .margin({ right: 8 })
        
        Text(`(${condition})`)
          .fontSize(13)
          .fontColor('#333333')
          .fontFamily('monospace')
          .layoutWeight(1)
      }
      .margin({ bottom: 4 })
      
      Text(`Iteration: ${iteration}`)
        .fontSize(11)
        .fontColor('#666666')
    }
    .alignItems(HorizontalAlign.Start)
    .layoutWeight(1)
    
    Text(active ? '▶' : '⏸')
      .fontSize(18)
      .fontColor(active ? '#4CAF50' : '#9E9E9E')
  }
  .width('100%')
  .padding(12)
  .backgroundColor(active ? '#EFEBE9' : '#F5F5F5')
  .borderRadius(8)
  .margin({ bottom: 8 })
}

// Correct Usage Component 2: While card styles
@Styles
function whileCardStyle() {
  .width('100%')
  .padding(18)
  .backgroundColor('#FFFFFF')
  .borderRadius(14)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.06)' })
}

// Correct Usage Component 3: While counter extension
@Extend(Text)
function whileCounterText() {
  .fontSize(32)
  .fontWeight(FontWeight.Bold)
  .fontColor('#795548')
}

@Entry
@Component
struct WhileValidation {
  @State testTitle: string = 'While Decorator Validation'
  @State errorCount: number = 3
  @State iterationCount: number = 5
  @State maxIterations: number = 10
  @State isRunning: boolean = true

  build() {
    Column() {
      // Header
      Column() {
        Text(this.testTitle)
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1A1A1A')
        
        Text('While Loop Validation')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ top: 6 })
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Iteration Counter
      Column() {
        Text('Current Iteration')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ bottom: 8 })
        
        Text(`${this.iterationCount}/${this.maxIterations}`)
          .whileCounterText()
      }
      .width('100%')
      .padding(20)
      .backgroundColor('#EFEBE9')
      .borderRadius(12)
      .margin({ left: 20, right: 20, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Progress Bar
      Column() {
        Row() {
          Row()
            .width(`${(this.iterationCount / this.maxIterations) * 100}%`)
            .height(8)
            .backgroundColor('#795548')
            .borderRadius(4)
            .animation({ duration: 300 })
        }
        .width('100%')
        .height(8)
        .backgroundColor('#E0E0E0')
        .borderRadius(4)
      }
      .width('100%')
      .padding({ left: 20, right: 20, bottom: 16 })

      // Stats Grid
      Row() {
        Column() {
          Text(this.iterationCount.toString())
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#795548')
          
          Text('Iterations')
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
          Text(this.isRunning ? 'Running' : 'Stopped')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .fontColor(this.isRunning ? '#4CAF50' : '#9E9E9E')
          
          Text('Status')
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
          Text('While Validation Errors')
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

      // While Loops
      Column() {
        Text('Active While Loops')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        buildWhileLoop(this.iterationCount, 'i < max', this.isRunning)
        buildWhileLoop(3, 'hasMoreData', false)
        buildWhileLoop(8, 'isProcessing', this.isRunning)
      }
      .whileCardStyle()
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
      .whileCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Control Buttons
      Row() {
        Button(this.isRunning ? 'Stop' : 'Start')
          .width('30%')
          .height(46)
          .backgroundColor(this.isRunning ? '#FF6B6B' : '#4CAF50')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            this.isRunning = !this.isRunning
          })
        
        Button('Next')
          .width('30%')
          .height(46)
          .margin({ left: 8, right: 8 })
          .backgroundColor('#795548')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            if (this.iterationCount < this.maxIterations) {
              this.iterationCount++
            }
          })
        
        Button('Validate')
          .width('30%')
          .height(46)
          .backgroundColor('#2196F3')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            console.info('While validation completed')
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