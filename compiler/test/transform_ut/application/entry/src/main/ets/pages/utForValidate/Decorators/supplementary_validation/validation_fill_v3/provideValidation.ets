/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
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

// Test Case: Provide Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function provideErrorCase1() {
}

// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function provideErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function provideErrorCase3() {
}

// Correct Usage Component 1: Provider info builder
@Builder
function buildProviderInfo(name: string, value: string, type: string) {
  Column() {
    Row() {
      Text(name)
        .fontSize(15)
        .fontWeight(FontWeight.Medium)
        .fontColor('#333333')
        .layoutWeight(1)
      
      Text(type)
        .fontSize(11)
        .fontColor('#FFFFFF')
        .padding({ horizontal: 8, vertical: 3 })
        .backgroundColor('#9C27B0')
        .borderRadius(4)
    }
    .width('100%')
    .margin({ bottom: 6 })
    
    Text(value)
      .fontSize(14)
      .fontColor('#666666')
      .maxLines(1)
      .textOverflow({ overflow: TextOverflow.Ellipsis })
  }
  .width('100%')
  .padding(14)
  .backgroundColor('#F3E5F5')
  .borderRadius(8)
  .margin({ bottom: 10 })
}

// Correct Usage Component 2: Provider card styles
@Styles
function provideCardStyle() {
  .width('100%')
  .padding(18)
  .backgroundColor('#FFFFFF')
  .borderRadius(14)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.06)' })
}

// Correct Usage Component 3: Provider value extension
@Extend(Text)
function provideValueText() {
  .fontSize(20)
  .fontWeight(FontWeight.Bold)
  .fontColor('#9C27B0')
}

@Entry
@Component
struct ProvideValidation {
  @State testTitle: string = 'Provide Decorator Validation'
  @State errorCount: number = 3
  @State providerCount: number = 5
  @State isProviding: boolean = false

  build() {
    Column() {
      // Header
      Column() {
        Text(this.testTitle)
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1A1A1A')
        
        Row() {
          Text('Dependency Provider Validation')
            .fontSize(14)
            .fontColor('#666666')
        }
        .margin({ top: 6 })
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Status Banner
      Row() {
        Column() {
          Text('Provider Status')
            .fontSize(14)
            .fontColor('#666666')
          
          Text(this.isProviding ? 'Active' : 'Idle')
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .fontColor(this.isProviding ? '#4CAF50' : '#9E9E9E')
        }
        .alignItems(HorizontalAlign.Center)
        .layoutWeight(1)
        
        Divider()
          .vertical(true)
          .height(50)
          .color('#E0E0E0')
        
        Column() {
          Text('Providers')
            .fontSize(14)
            .fontColor('#666666')
          
          Text(this.providerCount.toString())
            .fontSize(24)
            .fontWeight(FontWeight.Bold)
            .fontColor('#9C27B0')
        }
        .alignItems(HorizontalAlign.Center)
        .layoutWeight(1)
        
        Divider()
          .vertical(true)
          .height(50)
          .color('#E0E0E0')
        
        Column() {
          Text('Errors')
            .fontSize(14)
            .fontColor('#666666')
          
          Text(this.errorCount.toString())
            .fontSize(24)
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

      // Provider List
      Column() {
        Row() {
          Text('Registered Providers')
            .fontSize(18)
            .fontWeight(FontWeight.Medium)
          
          Button(this.isProviding ? 'Stop' : 'Start')
            .fontSize(12)
            .height(32)
            .backgroundColor(this.isProviding ? '#FF6B6B' : '#4CAF50')
            .onClick(() => {
              this.isProviding = !this.isProviding
            })
        }
        .width('100%')
        .justifyContent(FlexAlign.SpaceBetween)
        .margin({ bottom: 12 })

        buildProviderInfo('ConfigProvider', '/app/config', 'service')
        buildProviderInfo('ThemeProvider', 'purple-dark', 'theme')
        buildProviderInfo('DataProvider', 'user-session-123', 'data')
      }
      .provideCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Error Panel
      Column() {
        Text('Validation Errors')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .fontColor('#FF6B6B')
          .margin({ bottom: 12 })
        
        Column() {
          Text('Error Code: 10905117')
            .fontSize(14)
            .fontWeight(FontWeight.Medium)
            .fontColor('#FF6B6B')
            .margin({ bottom: 8 })
          
          Text('The following decorator combinations are invalid:')
            .fontSize(13)
            .fontColor('#666666')
            .margin({ bottom: 8 })
          
          Row() {
            Text('@Builder')
              .fontSize(12)
              .fontColor('#E91E63')
              .backgroundColor('#FCE4EC')
              .padding({ horizontal: 6, vertical: 2 })
              .borderRadius(3)
            
            Text(' + ')
              .fontSize(12)
              .fontColor('#999999')
            
            Text('@Styles')
              .fontSize(12)
              .fontColor('#E91E63')
              .backgroundColor('#FCE4EC')
              .padding({ horizontal: 6, vertical: 2 })
              .borderRadius(3)
          }
          .margin({ bottom: 4 })
          
          Row() {
            Text('@Extend')
              .fontSize(12)
              .fontColor('#E91E63')
              .backgroundColor('#FCE4EC')
              .padding({ horizontal: 6, vertical: 2 })
              .borderRadius(3)
            
            Text(' + ')
              .fontSize(12)
              .fontColor('#999999')
            
            Text('@Builder')
              .fontSize(12)
              .fontColor('#E91E63')
              .backgroundColor('#FCE4EC')
              .padding({ horizontal: 6, vertical: 2 })
              .borderRadius(3)
          }
          .margin({ bottom: 4 })
          
          Row() {
            Text('@AnimatableExtend')
              .fontSize(12)
              .fontColor('#E91E63')
              .backgroundColor('#FCE4EC')
              .padding({ horizontal: 6, vertical: 2 })
              .borderRadius(3)
            
            Text(' + ')
              .fontSize(12)
              .fontColor('#999999')
            
            Text('@Builder')
              .fontSize(12)
              .fontColor('#E91E63')
              .backgroundColor('#FCE4EC')
              .padding({ horizontal: 6, vertical: 2 })
              .borderRadius(3)
          }
        }
        .width('100%')
        .padding(14)
        .backgroundColor('#FFF5F5')
        .borderRadius(8)
      }
      .provideCardStyle()
      .margin({ left: 20, right: 20 })
      .layoutWeight(1)

      // Action Button
      Row() {
        Button('Validate Providers')
          .width('100%')
          .height(48)
          .backgroundColor('#9C27B0')
          .fontSize(16)
          .borderRadius(8)
          .onClick(() => {
            console.info('Provider validation executed')
            this.isProviding = true
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