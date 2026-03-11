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

// Test Case: ReusableV2 Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function reusableV2ErrorCase1() {
}

// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function reusableV2ErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function reusableV2ErrorCase3() {
}

// Correct Usage Component 1: ReusableV2 item builder
@Builder
function buildReusableV2Item(name: string, version: string, instances: number) {
  Row() {
    Column() {
      Row() {
        Text(name)
          .fontSize(15)
          .fontWeight(FontWeight.Medium)
          .fontColor('#333333')
        
        Text('v' + version)
          .fontSize(10)
          .fontColor('#FFFFFF')
          .padding({ horizontal: 6, vertical: 2 })
          .backgroundColor('#00BCD4')
          .borderRadius(3)
          .margin({ left: 8 })
      }
      .margin({ bottom: 4 })
    }
    .alignItems(HorizontalAlign.Start)
    .layoutWeight(1)
    
    Row() {
      Text(instances.toString())
        .fontSize(16)
        .fontWeight(FontWeight.Bold)
        .fontColor('#00BCD4')
      
      Text(' instances')
        .fontSize(12)
        .fontColor('#666666')
        .margin({ left: 4 })
    }
  }
  .width('100%')
  .padding(12)
  .backgroundColor('#E0F7FA')
  .borderRadius(8)
  .margin({ bottom: 8 })
}

// Correct Usage Component 2: ReusableV2 card styles
@Styles
function reusableV2CardStyle() {
  .width('100%')
  .padding(18)
  .backgroundColor('#FFFFFF')
  .borderRadius(14)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.06)' })
}

// Correct Usage Component 3: ReusableV2 badge extension
@Extend(Text)
function reusableV2BadgeText() {
  .fontSize(12)
  .fontColor('#FFFFFF')
  .fontWeight(FontWeight.Medium)
  .padding({ horizontal: 8, vertical: 3 })
  .backgroundColor('#00BCD4')
  .borderRadius(3)
}

@Entry
@Component
struct ReusableV2Validation {
  @State testTitle: string = 'ReusableV2 Decorator Validation'
  @State errorCount: number = 3
  @State v2Components: number = 10
  @State recycledInstances: number = 156

  build() {
    Column() {
      // Header with V2 Badge
      Column() {
        Row() {
          Text('V2')
            .reusableV2BadgeText()
            .margin({ right: 10 })
          
          Text(this.testTitle)
            .fontSize(24)
            .fontWeight(FontWeight.Bold)
            .fontColor('#1A1A1A')
        }
        .margin({ bottom: 8 })
        
        Text('Reusable V2 Component Validation')
          .fontSize(14)
          .fontColor('#666666')
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Stats Grid
      Row() {
        Column() {
          Text(this.v2Components.toString())
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#00BCD4')
          
          Text('V2 Components')
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
          Text(this.recycledInstances.toString())
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#4CAF50')
          
          Text('Recycled')
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
      .backgroundColor('#E0F7FA')
      .borderRadius(12)
      .margin({ left: 20, right: 20, bottom: 16 })

      // Error Alert
      Row() {
        Text('⚠')
          .fontSize(24)
          .margin({ right: 12 })
        
        Column() {
          Text('ReusableV2 Validation Errors')
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

      // V2 Components
      Column() {
        Text('Reusable V2 Components')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        buildReusableV2Item('ListItemV2', '2.0', 45)
        buildReusableV2Item('CardV2', '2.1', 32)
        buildReusableV2Item('ButtonV2', '2.0', 28)
        buildReusableV2Item('InputV2', '2.0', 18)
      }
      .reusableV2CardStyle()
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
      .reusableV2CardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Control Buttons
      Row() {
        Button('Recycle Instance')
          .width('48%')
          .height(46)
          .backgroundColor('#00BCD4')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            this.recycledInstances++
          })
        
        Button('Validate V2')
          .width('48%')
          .height(46)
          .backgroundColor('#4CAF50')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            console.info('ReusableV2 validation completed')
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