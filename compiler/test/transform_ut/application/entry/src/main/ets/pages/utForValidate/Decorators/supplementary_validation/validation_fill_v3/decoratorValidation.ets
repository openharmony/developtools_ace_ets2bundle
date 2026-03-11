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

// Test Case: Decorator Syntax Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function decoratorErrorCase1() {
}

// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function decoratorErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function decoratorErrorCase3() {
}

// Correct Usage Component 1: Decorator info builder
@Builder
function buildDecoratorInfo(name: string, description: string) {
  Column() {
    Row() {
      Text('@')
        .fontSize(14)
        .fontColor('#FF9800')
      
      Text(name)
        .fontSize(16)
        .fontWeight(FontWeight.Bold)
        .fontColor('#2196F3')
        .layoutWeight(1)
        .margin({ left: 2 })
    }
    .width('100%')
    .margin({ bottom: 8 })
    
    Text(description)
      .fontSize(13)
      .fontColor('#666666')
      .lineHeight(18)
  }
  .width('100%')
  .padding(14)
  .backgroundColor('#F5F7FA')
  .borderRadius(8)
  .margin({ bottom: 10 })
}

// Correct Usage Component 2: Info card styles
@Styles
function decoratorCardStyle() {
  .width('100%')
  .padding(18)
  .backgroundColor('#FFFFFF')
  .borderRadius(14)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.06)' })
}

// Correct Usage Component 3: Syntax text extension
@Extend(Text)
function decoratorSyntaxText() {
  .fontSize(13)
  .fontColor('#E91E63')
  .backgroundColor('#FCE4EC')
  .padding({ horizontal: 8, vertical: 4 })
  .borderRadius(4)
  .fontFamily('monospace')
}

@Entry
@Component
struct DecoratorValidation {
  @State testTitle: string = 'Decorator Syntax Validation'
  @State errorCount: number = 3
  @State showSyntax: boolean = true
  @State selectedDecorator: string = '@Builder'

  build() {
    Column() {
      // Header
      Column() {
        Text(this.testTitle)
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1A1A1A')
        
        Row() {
          Text('Errors: ')
            .fontSize(14)
            .fontColor('#666666')
          Text(this.errorCount.toString())
            .fontSize(14)
            .fontWeight(FontWeight.Bold)
            .fontColor('#FF6B6B')
        }
        .margin({ top: 8 })
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Error Code Badge
      Row() {
        Text('ERR')
          .fontSize(10)
          .fontColor('#FFFFFF')
          .fontWeight(FontWeight.Bold)
          .padding({ horizontal: 6, vertical: 2 })
          .backgroundColor('#FF6B6B')
          .borderRadius(3)
          .margin({ right: 8 })
        
        Text('10905117')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .fontColor('#333333')
      }
      .padding(12)
      .backgroundColor('#FFF5F5')
      .borderRadius(8)
      .margin({ left: 20, right: 20, bottom: 16 })

      // Decorator Selector
      Column() {
        Text('Select Decorator')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        Row() {
          ForEach(['@Builder', '@Styles', '@Extend'], (decorator: string) => {
            Text(decorator)
              .fontSize(13)
              .fontWeight(this.selectedDecorator === decorator ? FontWeight.Bold : FontWeight.Normal)
              .fontColor(this.selectedDecorator === decorator ? '#FFFFFF' : '#666666')
              .padding({ horizontal: 16, vertical: 8 })
              .backgroundColor(this.selectedDecorator === decorator ? '#2196F3' : '#F5F5F5')
              .borderRadius(6)
              .margin({ right: 8 })
              .onClick(() => {
                this.selectedDecorator = decorator
              })
          })
        }
        .width('100%')
      }
      .decoratorCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Syntax Section
      if (this.showSyntax) {
        Column() {
          Row() {
            Text('Syntax Reference')
              .fontSize(16)
              .fontWeight(FontWeight.Medium)
            
            Button('Hide')
              .fontSize(12)
              .height(28)
              .backgroundColor('#E0E0E0')
              .fontColor('#666666')
              .onClick(() => {
                this.showSyntax = false
              })
          }
          .width('100%')
          .justifyContent(FlexAlign.SpaceBetween)
          .margin({ bottom: 12 })

          buildDecoratorInfo('Builder', 'Creates reusable UI component builders that can be called from build() methods')
          
          buildDecoratorInfo('Styles', 'Defines reusable style functions that can be applied to components')
          
          buildDecoratorInfo('Extend', 'Extends existing component types with additional styling options')
        }
        .decoratorCardStyle()
        .margin({ left: 20, right: 20, bottom: 16 })
      }

      // Conflict Table
      Column() {
        Text('Decorator Conflicts')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        Column() {
          // Table Header
          Row() {
            Text('Decorator 1')
              .fontSize(12)
              .fontWeight(FontWeight.Medium)
              .fontColor('#666666')
              .layoutWeight(1)
            
            Text('Decorator 2')
              .fontSize(12)
              .fontWeight(FontWeight.Medium)
              .fontColor('#666666')
              .layoutWeight(1)
            
            Text('Status')
              .fontSize(12)
              .fontWeight(FontWeight.Medium)
              .fontColor('#666666')
              .width(60)
          }
          .width('100%')
          .padding(10)
          .backgroundColor('#F5F5F5')
          .borderRadius({ topLeft: 8, topRight: 8 })
          
          Divider()
            .strokeWidth(1)
            .color('#E0E0E0')
          
          // Row 1
          Row() {
            Text('@Builder')
              .decoratorSyntaxText()
              .layoutWeight(1)
            
            Text('@Styles')
              .decoratorSyntaxText()
              .layoutWeight(1)
            
            Text('❌')
              .fontSize(16)
              .width(60)
              .textAlign(TextAlign.Center)
          }
          .width('100%')
          .padding(10)
          
          Divider()
            .strokeWidth(1)
            .color('#F0F0F0')
          
          // Row 2
          Row() {
            Text('@Extend')
              .decoratorSyntaxText()
              .layoutWeight(1)
            
            Text('@Builder')
              .decoratorSyntaxText()
              .layoutWeight(1)
            
            Text('❌')
              .fontSize(16)
              .width(60)
              .textAlign(TextAlign.Center)
          }
          .width('100%')
          .padding(10)
          
          Divider()
            .strokeWidth(1)
            .color('#F0F0F0')
          
          // Row 3
          Row() {
            Text('@AnimatableExtend')
              .decoratorSyntaxText()
              .fontSize(11)
              .layoutWeight(1)
            
            Text('@Builder')
              .decoratorSyntaxText()
              .layoutWeight(1)
            
            Text('❌')
              .fontSize(16)
              .width(60)
              .textAlign(TextAlign.Center)
          }
          .width('100%')
          .padding(10)
          .backgroundColor('#FFF5F5')
          .borderRadius({ bottomLeft: 8, bottomRight: 8 })
        }
        .width('100%')
      }
      .decoratorCardStyle()
      .margin({ left: 20, right: 20 })
      .layoutWeight(1)

      // Action Button
      Row() {
        Button('Validate Decorators')
          .width('100%')
          .height(48)
          .backgroundColor('#2196F3')
          .fontSize(16)
          .borderRadius(8)
          .onClick(() => {
            console.info('Decorator validation completed')
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