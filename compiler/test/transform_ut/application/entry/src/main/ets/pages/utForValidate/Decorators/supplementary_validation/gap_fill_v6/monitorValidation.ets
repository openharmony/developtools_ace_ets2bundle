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

// Test Case: Monitor Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function monitorErrorCase1() {
}

// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function monitorErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function monitorErrorCase3() {
}

// Correct Usage Component 1: Monitor metric builder
@Builder
function buildMonitorMetric(name: string, value: number, unit: string, status: string) {
  Column() {
    Row() {
      Text(name)
        .fontSize(14)
        .fontColor('#666666')
      
      Text(status === 'good' ? '●' : status === 'warning' ? '●' : '●')
        .fontSize(10)
        .fontColor(status === 'good' ? '#4CAF50' : status === 'warning' ? '#FF9800' : '#FF6B6B')
    }
    .width('100%')
    .justifyContent(FlexAlign.SpaceBetween)
    .margin({ bottom: 6 })
    
    Row() {
      Text(value.toString())
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .fontColor('#333333')
      
      Text(unit)
        .fontSize(12)
        .fontColor('#999999')
        .margin({ left: 4, bottom: 2 })
    }
  }
  .width('100%')
  .padding(14)
  .backgroundColor('#F5F5F5')
  .borderRadius(8)
}

// Correct Usage Component 2: Monitor card styles
@Styles
function monitorCardStyle() {
  .width('100%')
  .padding(18)
  .backgroundColor('#FFFFFF')
  .borderRadius(14)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.06)' })
}

// Correct Usage Component 3: Monitor alert extension
@Extend(Text)
function monitorAlertText() {
  .fontSize(13)
  .fontColor('#FFFFFF')
  .fontWeight(FontWeight.Medium)
  .padding({ horizontal: 10, vertical: 4 })
  .backgroundColor('#FF6B6B')
  .borderRadius(4)
}

@Entry
@Component
struct MonitorValidation {
  @State testTitle: string = 'Monitor Decorator Validation'
  @State errorCount: number = 3
  @State cpuUsage: number = 45
  @State memoryUsage: number = 68
  @State activeMonitors: number = 5

  build() {
    Column() {
      // Header
      Column() {
        Text(this.testTitle)
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1A1A1A')
        
        Text('Performance Monitor Validation')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ top: 6 })
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Monitor Status Bar
      Row() {
        Column() {
          Text('Monitors')
            .fontSize(12)
            .fontColor('#666666')
          
          Text(this.activeMonitors.toString())
            .fontSize(20)
            .fontWeight(FontWeight.Bold)
            .fontColor('#2196F3')
        }
        .alignItems(HorizontalAlign.Center)
        .layoutWeight(1)
        
        Divider()
          .vertical(true)
          .height(40)
          .color('#E0E0E0')
        
        Column() {
          Text('Status')
            .fontSize(12)
            .fontColor('#666666')
          
          Text('Active')
            .fontSize(14)
            .fontWeight(FontWeight.Medium)
            .fontColor('#4CAF50')
        }
        .alignItems(HorizontalAlign.Center)
        .layoutWeight(1)
        
        Divider()
          .vertical(true)
          .height(40)
          .color('#E0E0E0')
        
        Column() {
          Text('Errors')
            .fontSize(12)
            .fontColor('#666666')
          
          Text(this.errorCount.toString())
            .fontSize(20)
            .fontWeight(FontWeight.Bold)
            .fontColor('#FF6B6B')
        }
        .alignItems(HorizontalAlign.Center)
        .layoutWeight(1)
      }
      .width('100%')
      .padding(16)
      .backgroundColor('#FAFAFA')
      .borderRadius(12)
      .margin({ left: 20, right: 20, bottom: 16 })

      // Metrics Grid
      Column() {
        Text('System Metrics')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        Row() {
          buildMonitorMetric('CPU Usage', this.cpuUsage, '%', this.cpuUsage > 80 ? 'critical' : 'good')
            .layoutWeight(1)
            .margin({ right: 8 })
          
          buildMonitorMetric('Memory', this.memoryUsage, '%', this.memoryUsage > 80 ? 'warning' : 'good')
            .layoutWeight(1)
        }
        .width('100%')
        .margin({ bottom: 8 })

        Row() {
          buildMonitorMetric('Disk I/O', 23, 'MB/s', 'good')
            .layoutWeight(1)
            .margin({ right: 8 })
          
          buildMonitorMetric('Network', 156, 'KB/s', 'good')
            .layoutWeight(1)
        }
        .width('100%')
      }
      .monitorCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Error Alert
      Row() {
        Text('⚠')
          .fontSize(24)
          .margin({ right: 12 })
        
        Column() {
          Text('Monitor Validation Errors')
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
      .monitorCardStyle()
      .margin({ left: 20, right: 20 })
      .layoutWeight(1)

      // Control Buttons
      Row() {
        Button('Refresh Metrics')
          .width('48%')
          .height(46)
          .backgroundColor('#2196F3')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            this.cpuUsage = Math.floor(Math.random() * 100)
            this.memoryUsage = Math.floor(Math.random() * 100)
          })
        
        Button('Validate Monitors')
          .width('48%')
          .height(46)
          .backgroundColor('#4CAF50')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            console.info('Monitor validation completed')
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