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

// Test Case: Consume Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function consumeErrorCase1() {
}

// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function consumeErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function consumeErrorCase3() {
}

// Correct Usage Component 1: Consumer builder
@Builder
function buildConsumerItem(name: string, status: string, usage: number) {
  Row() {
    Column() {
      Text(name)
        .fontSize(15)
        .fontWeight(FontWeight.Medium)
        .fontColor('#333333')
      
      Text(status)
        .fontSize(12)
        .fontColor(usage > 80 ? '#FF6B6B' : '#4CAF50')
        .margin({ top: 2 })
    }
    .alignItems(HorizontalAlign.Start)
    .layoutWeight(1)
    
    Column() {
      Text(`${usage}%`)
        .fontSize(16)
        .fontWeight(FontWeight.Bold)
        .fontColor(usage > 80 ? '#FF6B6B' : '#333333')
      
      // Usage bar
      Row() {
        Row()
          .width(`${usage}%`)
          .height(4)
          .backgroundColor(usage > 80 ? '#FF6B6B' : '#4CAF50')
          .borderRadius(2)
      }
      .width(60)
      .height(4)
      .backgroundColor('#E0E0E0')
      .borderRadius(2)
      .margin({ top: 4 })
    }
    .alignItems(HorizontalAlign.End)
  }
  .width('100%')
  .padding(12)
  .backgroundColor('#F9F9F9')
  .borderRadius(8)
  .margin({ bottom: 8 })
}

// Correct Usage Component 2: Consumer card styles
@Styles
function consumeCardStyle() {
  .width('100%')
  .padding(18)
  .backgroundColor('#FFFFFF')
  .borderRadius(14)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.06)' })
}

// Correct Usage Component 3: Consumer label extension
@Extend(Text)
function consumeLabelText() {
  .fontSize(13)
  .fontColor('#666666')
  .width(100)
}

@Entry
@Component
struct ConsumeValidation {
  @State testTitle: string = 'Consume Decorator Validation'
  @State errorCount: number = 3
  @State totalConsumed: number = 3
  @State consumerItems: Array<{ name: string, status: string, usage: number }> = [
    { name: 'Consumer A', status: 'Active', usage: 45 },
    { name: 'Consumer B', status: 'High Usage', usage: 92 },
    { name: 'Consumer C', status: 'Active', usage: 67 }
  ]

  build() {
    Column() {
      // Header
      Column() {
        Text(this.testTitle)
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1A1A1A')
        
        Text('Consumer Dependency Validation')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ top: 6 })
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Stats Dashboard
      Row() {
        Column() {
          Text(this.totalConsumed.toString())
            .fontSize(32)
            .fontWeight(FontWeight.Bold)
            .fontColor('#FF9800')
          
          Text('Active Consumers')
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
            .fontSize(32)
            .fontWeight(FontWeight.Bold)
            .fontColor('#FF6B6B')
          
          Text('Errors Found')
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
          Text('10905117')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .fontColor('#FF9800')
          
          Text('Error Code')
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

      // Consumer List
      Column() {
        Text('Consumer Registry')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        List() {
          ForEach(this.consumerItems, (item: { name: string, status: string, usage: number }) => {
            ListItem() {
              buildConsumerItem(item.name, item.status, item.usage)
            }
          })
        }
        .width('100%')
        .layoutWeight(1)
      }
      .consumeCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })
      .layoutWeight(1)

      // Error Details
      Column() {
        Text('Validation Errors')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .fontColor('#FF6B6B')
          .margin({ bottom: 10 })
        
        Column() {
          Row() {
            Text('1. @Builder + @Styles')
              .fontSize(13)
              .fontColor('#333333')
              .layoutWeight(1)
            Text('Invalid')
              .fontSize(11)
              .fontColor('#FF6B6B')
          }
          .padding(8)
          .backgroundColor('#FFF5F5')
          .borderRadius(6)
          .margin({ bottom: 6 })
          
          Row() {
            Text('2. @Extend + @Builder')
              .fontSize(13)
              .fontColor('#333333')
              .layoutWeight(1)
            Text('Invalid')
              .fontSize(11)
              .fontColor('#FF6B6B')
          }
          .padding(8)
          .backgroundColor('#FFF5F5')
          .borderRadius(6)
          .margin({ bottom: 6 })
          
          Row() {
            Text('3. @AnimatableExtend + @Builder')
              .fontSize(13)
              .fontColor('#333333')
              .layoutWeight(1)
            Text('Invalid')
              .fontSize(11)
              .fontColor('#FF6B6B')
          }
          .padding(8)
          .backgroundColor('#FFF5F5')
          .borderRadius(6)
        }
        .width('100%')
      }
      .consumeCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Action Button
      Row() {
        Button('Refresh Consumers')
          .width('100%')
          .height(48)
          .backgroundColor('#FF9800')
          .fontSize(16)
          .borderRadius(8)
          .onClick(() => {
            // Refresh consumer data
            this.consumerItems = this.consumerItems.map(item => ({
              ...item,
              usage: Math.floor(Math.random() * 100)
            }))
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