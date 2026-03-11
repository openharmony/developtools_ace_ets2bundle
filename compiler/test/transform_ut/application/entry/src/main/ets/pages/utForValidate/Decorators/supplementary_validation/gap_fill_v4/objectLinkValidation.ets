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

// Test Case: ObjectLink Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function objectLinkErrorCase1() {
}

// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function objectLinkErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function objectLinkErrorCase3() {
}

// Correct Usage Component 1: Object link builder
@Builder
function buildObjectLink(objName: string, linkType: string, isLinked: boolean) {
  Row() {
    Row() {
      Text(linkType)
        .fontSize(11)
        .fontColor('#FFFFFF')
        .fontWeight(FontWeight.Medium)
        .padding({ horizontal: 8, vertical: 3 })
        .backgroundColor('#673AB7')
        .borderRadius(4)
    }
    .margin({ right: 10 })
    
    Column() {
      Text(objName)
        .fontSize(15)
        .fontWeight(FontWeight.Medium)
        .fontColor('#333333')
      
      Text(isLinked ? 'Linked' : 'Unlinked')
        .fontSize(11)
        .fontColor(isLinked ? '#4CAF50' : '#9E9E9E')
        .margin({ top: 2 })
    }
    .alignItems(HorizontalAlign.Start)
    .layoutWeight(1)
    
    Text(isLinked ? '🔗' : '○')
      .fontSize(20)
  }
  .width('100%')
  .padding(12)
  .backgroundColor(isLinked ? '#EDE7F6' : '#F5F5F5')
  .borderRadius(8)
  .margin({ bottom: 8 })
}

// Correct Usage Component 2: ObjectLink card styles
@Styles
function objectLinkCardStyle() {
  .width('100%')
  .padding(18)
  .backgroundColor('#FFFFFF')
  .borderRadius(14)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.06)' })
}

// Correct Usage Component 3: ObjectLink header extension
@Extend(Text)
function objectLinkHeaderText() {
  .fontSize(22)
  .fontWeight(FontWeight.Bold)
  .fontColor('#673AB7')
}

@Entry
@Component
struct ObjectLinkValidation {
  @State testTitle: string = 'ObjectLink Decorator Validation'
  @State errorCount: number = 3
  @State linkedObjects: number = 7
  @State totalObjects: number = 12

  build() {
    Column() {
      // Header
      Column() {
        Text(this.testTitle)
          .fontSize(26)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1A1A1A')
        
        Text('Object Linking Validation')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ top: 6 })
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Link Statistics
      Column() {
        Text('Object Link Status')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 16 })
        
        Row() {
          // Linked circle
          Stack() {
            Circle({ width: 80, height: 80 })
              .fill('#EDE7F6')
            
            Column() {
              Text(this.linkedObjects.toString())
                .objectLinkHeaderText()
              
              Text('Linked')
                .fontSize(11)
                .fontColor('#673AB7')
            }
          }
          .margin({ right: 20 })
          
          Divider()
            .vertical(true)
            .height(60)
            .color('#E0E0E0')
            .margin({ right: 20 })
          
          // Stats column
          Column() {
            Row() {
              Text('Total Objects:')
                .fontSize(14)
                .fontColor('#666666')
              Text(this.totalObjects.toString())
                .fontSize(14)
                .fontWeight(FontWeight.Medium)
                .fontColor('#333333')
                .margin({ left: 8 })
            }
            .margin({ bottom: 8 })
            
            Row() {
              Text('Linked:')
                .fontSize(14)
                .fontColor('#666666')
              Text(this.linkedObjects.toString())
                .fontSize(14)
                .fontWeight(FontWeight.Medium)
                .fontColor('#4CAF50')
                .margin({ left: 8 })
            }
            .margin({ bottom: 8 })
            
            Row() {
              Text('Unlinked:')
                .fontSize(14)
                .fontColor('#666666')
              Text((this.totalObjects - this.linkedObjects).toString())
                .fontSize(14)
                .fontWeight(FontWeight.Medium)
                .fontColor('#9E9E9E')
                .margin({ left: 8 })
            }
          }
          .alignItems(HorizontalAlign.Start)
          .layoutWeight(1)
        }
        .width('100%')
        .justifyContent(FlexAlign.Center)
      }
      .objectLinkCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Error Alert Banner
      Row() {
        Text('⚠')
          .fontSize(24)
          .fontColor('#FF6B6B')
          .margin({ right: 12 })
        
        Column() {
          Text('3 Validation Errors Detected')
            .fontSize(15)
            .fontWeight(FontWeight.Medium)
            .fontColor('#FF6B6B')
          
          Text('Error Code: 10905117')
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

      // Linked Objects List
      Column() {
        Text('Linked Objects')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        buildObjectLink('UserProfile', 'Model', true)
        buildObjectLink('AppSettings', 'Config', true)
        buildObjectLink('SessionData', 'Data', true)
        buildObjectLink('TempCache', 'Cache', false)
      }
      .objectLinkCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })
      .layoutWeight(1)

      // Error Details
      Column() {
        Text('Decorator Conflict Details')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 10 })
        
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
        .margin({ bottom: 8 })
        
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
        .margin({ bottom: 8 })
        
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
      }
      .objectLinkCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Action Buttons
      Row() {
        Button('Link All')
          .width('30%')
          .height(44)
          .backgroundColor('#673AB7')
          .fontSize(14)
          .borderRadius(8)
          .onClick(() => {
            this.linkedObjects = this.totalObjects
          })
        
        Button('Unlink All')
          .width('30%')
          .height(44)
          .margin({ left: 8, right: 8 })
          .backgroundColor('#9E9E9E')
          .fontSize(14)
          .borderRadius(8)
          .onClick(() => {
            this.linkedObjects = 0
          })
        
        Button('Validate')
          .width('30%')
          .height(44)
          .backgroundColor('#2196F3')
          .fontSize(14)
          .borderRadius(8)
          .onClick(() => {
            console.info('ObjectLink validation completed')
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