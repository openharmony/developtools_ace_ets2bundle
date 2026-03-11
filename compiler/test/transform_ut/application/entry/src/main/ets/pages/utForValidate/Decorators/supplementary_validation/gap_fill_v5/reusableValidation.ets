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

// Test Case: Reusable Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function reusableErrorCase1() {
}
// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function reusableErrorCase2() {
}
// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function reusableErrorCase3() {
}
// Correct Usage Component 1: Reusable component builder
@Builder
function buildReusableComponent(name: string, type: string, usage: number) {
  Row() {
    Column() {
      Row() {
        Text(name)
          .fontSize(15)
          .fontWeight(FontWeight.Medium)
          .fontColor('#333333')
        
        Text(type)
          .fontSize(10)
          .fontColor('#FFFFFF')
          .padding({ horizontal: 6, vertical: 2 })
          .backgroundColor('#607D8B')
          .borderRadius(3)
          .margin({ left: 8 })
      }
      .margin({ bottom: 4 })
      
      Text(`${usage} usages`)
        .fontSize(12)
        .fontColor('#999999')
    }
    .alignItems(HorizontalAlign.Start)
    .layoutWeight(1)
    
    Text('♻')
      .fontSize(24)
      .fontColor('#607D8B')
  }
  .width('100%')
  .padding(12)
  .backgroundColor('#ECEFF1')
  .borderRadius(8)
  .margin({ bottom: 8 })
}
// Correct Usage Component 2: Reusable card styles
@Styles
function reusableCardStyle() {
  .width('100%')
  .padding(18)
  .backgroundColor('#FFFFFF')
  .borderRadius(14)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.06)' })
}
// Correct Usage Component 3: Reusable metric extension
@Extend(Text)
function reusableMetricText() {
  .fontSize(32)
  .fontWeight(FontWeight.Bold)
  .fontColor('#607D8B')
}
@Entry
@Component
struct ReusableValidation {
  @State testTitle: string = 'Reusable Decorator Validation'
  @State errorCount: number = 3
  @State reusableCount: number = 8
  @State recycleCount: number = 156

  build() {
    Column() {
      // Header
      Column() {
        Text(this.testTitle)
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1A1A1A')
        
        Text('Component Reusability Validation')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ top: 6 })
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Reusability Metrics
      Row() {
        Column() {
          Text(this.reusableCount.toString())
            .reusableMetricText()
          
          Text('Reusable Components')
            .fontSize(12)
            .fontColor('#666666')
            .margin({ top: 4 })
        }
        .alignItems(HorizontalAlign.Center)
        .layoutWeight(1)
        
        Divider()
          .vertical(true)
          .height(60)
          .color('#E0E0E0')
        
        Column() {
          Text(this.recycleCount.toString())
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#4CAF50')
          
          Text('Times Recycled')
            .fontSize(12)
            .fontColor('#666666')
            .margin({ top: 4 })
        }
        .alignItems(HorizontalAlign.Center)
        .layoutWeight(1)
        
        Divider()
          .vertical(true)
          .height(60)
          .color('#E0E0E0')
        
        Column() {
          Text('95%')
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#2196F3')
          
          Text('Reuse Rate')
            .fontSize(12)
            .fontColor('#666666')
            .margin({ top: 4 })
        }
        .alignItems(HorizontalAlign.Center)
        .layoutWeight(1)
      }
      .width('100%')
      .padding(20)
      .backgroundColor('#F5F7FA')
      .borderRadius(12)
      .margin({ left: 20, right: 20, bottom: 16 })

      // Error Banner
      Row() {
        Text('⚠')
          .fontSize(24)
          .margin({ right: 12 })
        
        Column() {
          Text('Validation Errors Found')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .fontColor('#FF6B6B')
          
          Text(`Error Code: 10905117 • ${this.errorCount} conflicts`)
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

      // Reusable Components List
      Column() {
        Text('Reusable Components')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        buildReusableComponent('Button', 'UI', 34)
        buildReusableComponent('Card', 'UI', 28)
        buildReusableComponent('InputField', 'Form', 22)
        buildReusableComponent('Modal', 'Overlay', 15)
      }
      .reusableCardStyle()
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
            Text('✗')
              .fontSize(16)
              .fontColor('#FF6B6B')
          }
          .padding(8)
          .backgroundColor('#FFF5F5')
          .borderRadius(6)
          .margin({ bottom: 6 })
          
          Row() {
            Text('@Extend + @Builder')
              .fontSize(13)
              .fontColor('#333333')
              .layoutWeight(1)
            Text('✗')
              .fontSize(16)
              .fontColor('#FF6B6B')
          }
          .padding(8)
          .backgroundColor('#FFF5F5')
          .borderRadius(6)
          .margin({ bottom: 6 })
          
          Row() {
            Text('@AnimatableExtend + @Builder')
              .fontSize(13)
              .fontColor('#333333')
              .layoutWeight(1)
            Text('✗')
              .fontSize(16)
              .fontColor('#FF6B6B')
          }
          .padding(8)
          .backgroundColor('#FFF5F5')
          .borderRadius(6)
        }
        .width('100%')
      }
      .reusableCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Action Button
      Row() {
        Button('Run Reusability Test')
          .width('100%')
          .height(48)
          .backgroundColor('#607D8B')
          .fontSize(16)
          .borderRadius(8)
          .onClick(() => {
            this.recycleCount += Math.floor(Math.random() * 10)
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