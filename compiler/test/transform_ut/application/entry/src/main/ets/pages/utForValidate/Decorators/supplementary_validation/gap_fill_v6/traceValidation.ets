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

// Test Case: Trace Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function traceErrorCase1() {
}

// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function traceErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function traceErrorCase3() {
}

// Correct Usage Component 1: Trace event builder
@Builder
function buildTraceEvent(name: string, duration: number, status: string) {
  Row() {
    Column() {
      Text(name)
        .fontSize(14)
        .fontWeight(FontWeight.Medium)
        .fontColor('#333333')
      
      Text(`${duration}ms`)
        .fontSize(12)
        .fontColor('#666666')
        .margin({ top: 2 })
    }
    .alignItems(HorizontalAlign.Start)
    .layoutWeight(1)
    
    Text(status === 'complete' ? '✓' : status === 'running' ? '◐' : '○')
      .fontSize(18)
      .fontColor(status === 'complete' ? '#4CAF50' : status === 'running' ? '#FF9800' : '#9E9E9E')
  }
  .width('100%')
  .padding(12)
  .backgroundColor(status === 'complete' ? '#E8F5E9' : '#F5F5F5')
  .borderRadius(8)
  .margin({ bottom: 8 })
}

// Correct Usage Component 2: Trace card styles
@Styles
function traceCardStyle() {
  .width('100%')
  .padding(18)
  .backgroundColor('#FFFFFF')
  .borderRadius(14)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.06)' })
}

// Correct Usage Component 3: Trace duration extension
@Extend(Text)
function traceDurationText() {
  .fontSize(28)
  .fontWeight(FontWeight.Bold)
  .fontColor('#FF9800')
}

@Entry
@Component
struct TraceValidation {
  @State testTitle: string = 'Trace Decorator Validation'
  @State errorCount: number = 3
  @State traceCount: number = 12
  @State totalDuration: number = 345

  build() {
    Column() {
      // Header
      Column() {
        Text(this.testTitle)
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1A1A1A')
        
        Text('Performance Trace Validation')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ top: 6 })
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Trace Summary
      Row() {
        Column() {
          Text(this.traceCount.toString())
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#FF9800')
          
          Text('Traces')
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
          Text(`${this.totalDuration}ms`)
            .traceDurationText()
          
          Text('Total Duration')
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
      .backgroundColor('#FFF8E1')
      .borderRadius(12)
      .margin({ left: 20, right: 20, bottom: 16 })

      // Error Alert
      Row() {
        Text('⚠')
          .fontSize(24)
          .margin({ right: 12 })
        
        Column() {
          Text('Trace Validation Errors')
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

      // Trace Events
      Column() {
        Text('Recent Trace Events')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        buildTraceEvent('Component Render', 45, 'complete')
        buildTraceEvent('Data Fetch', 120, 'complete')
        buildTraceEvent('Animation', 23, 'running')
        buildTraceEvent('Layout Calc', 8, 'complete')
      }
      .traceCardStyle()
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
      .traceCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Control Buttons
      Row() {
        Button('Start Trace')
          .width('48%')
          .height(46)
          .backgroundColor('#FF9800')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            this.totalDuration += Math.floor(Math.random() * 50)
          })
        
        Button('Validate Traces')
          .width('48%')
          .height(46)
          .backgroundColor('#4CAF50')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            console.info('Trace validation completed')
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