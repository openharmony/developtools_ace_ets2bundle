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

// Test Case: ComponentV2 Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function componentV2ErrorCase1() {
}
// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function componentV2ErrorCase2() {
}
// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function componentV2ErrorCase3() {
}
// Correct Usage Component 1: V2 component builder
@Builder
function buildV2Component(name: string, version: string, status: string) {
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
      
      Text(status)
        .fontSize(12)
        .fontColor(status === 'stable' ? '#4CAF50' : '#FF9800')
    }
    .alignItems(HorizontalAlign.Start)
    .layoutWeight(1)
    
    Text('⚙')
      .fontSize(22)
      .fontColor('#00BCD4')
  }
  .width('100%')
  .padding(12)
  .backgroundColor('#E0F7FA')
  .borderRadius(8)
  .margin({ bottom: 8 })
}
// Correct Usage Component 2: ComponentV2 card styles
@Styles
function componentV2CardStyle() {
  .width('100%')
  .padding(18)
  .backgroundColor('#FFFFFF')
  .borderRadius(14)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.06)' })
}
// Correct Usage Component 3: Version badge extension
@Extend(Text)
function componentV2BadgeText() {
  .fontSize(12)
  .fontColor('#FFFFFF')
  .fontWeight(FontWeight.Bold)
  .padding({ horizontal: 10, vertical: 4 })
  .backgroundColor('#00BCD4')
  .borderRadius(4)
}
@Entry
@Component
struct ComponentV2Validation {
  @State testTitle: string = 'ComponentV2 Decorator Validation'
  @State errorCount: number = 3
  @State v2Components: number = 12
  @State migrationProgress: number = 75

  build() {
    Column() {
      // Header with V2 Badge
      Column() {
        Row() {
          Text('V2')
            .componentV2BadgeText()
            .margin({ right: 10 })
          
          Text(this.testTitle)
            .fontSize(24)
            .fontWeight(FontWeight.Bold)
            .fontColor('#1A1A1A')
        }
        .margin({ bottom: 8 })
        
        Text('Component V2 Architecture Validation')
          .fontSize(14)
          .fontColor('#666666')
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Migration Progress
      Column() {
        Text('V2 Migration Progress')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 10 })
        
        Row() {
          Text(`${this.migrationProgress}%`)
            .fontSize(14)
            .fontWeight(FontWeight.Bold)
            .fontColor('#00BCD4')
        }
        .width('100%')
        .justifyContent(FlexAlign.End)
        .margin({ bottom: 6 })

        Row() {
          Row()
            .width(`${this.migrationProgress}%`)
            .height(8)
            .backgroundColor('#00BCD4')
            .borderRadius(4)
            .animation({ duration: 500 })
        }
        .width('100%')
        .height(8)
        .backgroundColor('#E0E0E0')
        .borderRadius(4)
      }
      .width('100%')
      .padding(16)
      .backgroundColor('#E0F7FA')
      .borderRadius(12)
      .margin({ left: 20, right: 20, bottom: 16 })

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
        
        Divider()
          .vertical(true)
          .height(50)
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

      // Error Alert
      Row() {
        Text('⚠')
          .fontSize(24)
          .margin({ right: 12 })
        
        Column() {
          Text('Validation Errors Detected')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .fontColor('#FF6B6B')
          
          Text('3 decorator conflicts found in V2 components')
            .fontSize(13)
            .fontColor('#666666')
        }
        .alignItems(HorizontalAlign.Start)
        .layoutWeight(1)
        
        Text(this.errorCount.toString())
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#FF6B6B')
      }
      .width('100%')
      .padding(16)
      .backgroundColor('#FFF5F5')
      .borderRadius(12)
      .margin({ left: 20, right: 20, bottom: 16 })

      // V2 Components List
      Column() {
        Text('V2 Components')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        buildV2Component('ButtonV2', '2.0', 'stable')
        buildV2Component('CardV2', '2.1', 'stable')
        buildV2Component('InputV2', '2.0', 'beta')
        buildV2Component('ModalV2', '1.9', 'deprecated')
      }
      .componentV2CardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })
      .layoutWeight(1)

      // Error Details
      Column() {
        Text('Decorator Validation Errors')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 10 })
        
        List() {
          ListItem() {
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
          }
          .margin({ bottom: 8 })
          
          ListItem() {
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
          }
          .margin({ bottom: 8 })
          
          ListItem() {
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
        }
        .width('100%')
      }
      .componentV2CardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Action Buttons
      Row() {
        Button('Migrate to V2')
          .width('48%')
          .height(46)
          .backgroundColor('#00BCD4')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            this.migrationProgress = Math.min(100, this.migrationProgress + 5)
          })
        
        Button('Validate V2')
          .width('48%')
          .height(46)
          .backgroundColor('#2196F3')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            console.info('ComponentV2 validation completed')
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