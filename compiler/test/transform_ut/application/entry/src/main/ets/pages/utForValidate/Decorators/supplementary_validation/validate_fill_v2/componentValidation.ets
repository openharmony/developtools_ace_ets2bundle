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

// Test Case: Component Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function componentErrorCase1() {
}

// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function componentErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function componentErrorCase3() {
}

// Correct Usage Component 1: Standalone @Builder
@Builder
function buildComponentHeader(title: string) {
  Column() {
    Text(title)
      .fontSize(24)
      .fontWeight(FontWeight.Bold)
      .margin({ bottom: 10 })
    Divider()
      .strokeWidth(2)
      .color('#E0E0E0')
  }
  .width('100%')
  .padding(16)
}

// Correct Usage Component 2: Standalone @Styles
@Styles
function componentCardStyle() {
  .backgroundColor('#F5F5F5')
  .borderRadius(12)
  .padding(16)
  .margin(8)
  .shadow({ radius: 4, color: 'rgba(0,0,0,0.1)' })
}

// Correct Usage Component 3: @Extend for Text styling
@Extend(Text)
function componentPrimaryText() {
  .fontSize(16)
  .fontColor('#333333')
  .maxLines(2)
  .textOverflow({ overflow: TextOverflow.Ellipsis })
}

@Entry
@Component
struct ComponentValidation {
  @State testTitle: string = 'Component Decorator Validation'
  @State errorCount: number = 3
  @State showDetails: boolean = false

  build() {
    Column() {
      // Title Section
      Column() {
        Text(this.testTitle)
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1A1A1A')
          .margin({ bottom: 8 })
        
        Text(`Error Cases: ${this.errorCount}`)
          .fontSize(14)
          .fontColor('#FF6B6B')
          .margin({ bottom: 16 })
      }
      .width('100%')
      .alignItems(HorizontalAlign.Start)
      .padding({ left: 20, right: 20, top: 20 })

      Divider()
        .strokeWidth(1)
        .color('#E8E8E8')
        .margin({ left: 20, right: 20 })

      // Error Explanation Panel
      Column() {
        Row() {
          Text('⚠️ Error Details')
            .fontSize(18)
            .fontWeight(FontWeight.Medium)
            .fontColor('#FF6B6B')
          
          Button(this.showDetails ? 'Hide' : 'Show')
            .fontSize(12)
            .height(28)
            .onClick(() => {
              this.showDetails = !this.showDetails
            })
        }
        .width('100%')
        .justifyContent(FlexAlign.SpaceBetween)
        .margin({ bottom: 12 })

        if (this.showDetails) {
          Column() {
            Text('Error 1: @Builder cannot be used with @Styles')
              .fontSize(14)
              .fontColor('#666666')
              .margin({ bottom: 8 })
            
            Text('Error 2: @Extend cannot be combined with @Builder')
              .fontSize(14)
              .fontColor('#666666')
              .margin({ bottom: 8 })
            
            Text('Error 3: @AnimatableExtend conflicts with @Builder')
              .fontSize(14)
              .fontColor('#666666')
          }
          .width('100%')
          .padding(12)
          .backgroundColor('#FFF5F5')
          .borderRadius(8)
          .margin({ bottom: 12 })
        }

        Text('Error Code: 10905117')
          .fontSize(13)
          .fontColor('#999999')
          .fontStyle(FontStyle.Italic)
      }
      .width('100%')
      .padding(20)
      .backgroundColor('#FFFFFF')

      Divider()
        .strokeWidth(1)
        .color('#E8E8E8')
        .margin({ left: 20, right: 20 })

      // Best Practices Section
      Column() {
        Text('✅ Best Practices')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .fontColor('#4CAF50')
          .margin({ bottom: 16 })

        List() {
          ListItem() {
            Row() {
              Text('• Use @Builder for reusable UI components')
                .fontSize(14)
                .fontColor('#333333')
            }
            .padding({ vertical: 8 })
          }
          
          ListItem() {
            Row() {
              Text('• Use @Styles for component styling')
                .fontSize(14)
                .fontColor('#333333')
            }
            .padding({ vertical: 8 })
          }
          
          ListItem() {
            Row() {
              Text('• Use @Extend for extending existing components')
                .fontSize(14)
                .fontColor('#333333')
            }
            .padding({ vertical: 8 })
          }
          
          ListItem() {
            Row() {
              Text('• Never combine conflicting decorators')
                .fontSize(14)
                .fontColor('#333333')
            }
            .padding({ vertical: 8 })
          }
        }
        .width('100%')
        .divider({ strokeWidth: 1, color: '#F0F0F0' })
      }
      .width('100%')
      .padding(20)

      // Correct Usage Examples
      Column() {
        Text('📋 Correct Usage Examples')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .fontColor('#2196F3')
          .margin({ bottom: 16 })

        // Example 1: @Builder usage
        Column() {
          buildComponentHeader('Example Component')
          
          Text('This demonstrates proper @Builder usage')
            .componentPrimaryText()
        }
        .componentCardStyle()
        .margin({ bottom: 16 })

        // Example 2: Interactive button
        Button('Run Component Test')
          .width('100%')
          .height(44)
          .backgroundColor('#2196F3')
          .fontColor('#FFFFFF')
          .borderRadius(8)
          .onClick(() => {
            console.log('Component test executed')
          })
      }
      .width('100%')
      .padding(20)
      .layoutWeight(1)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#FAFAFA')
  }
}