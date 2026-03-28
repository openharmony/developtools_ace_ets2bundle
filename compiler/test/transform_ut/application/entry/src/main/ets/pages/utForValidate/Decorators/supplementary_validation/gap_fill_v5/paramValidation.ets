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

// Test Case: Param Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function paramErrorCase1() {
}
// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function paramErrorCase2() {
}
// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function paramErrorCase3() {
}
// Correct Usage Component 1: Parameter builder
@Builder
function buildParamRow(name: string, type: string, required: boolean, value: string) {
  Row() {
    Column() {
      Row() {
        Text(name)
          .fontSize(15)
          .fontWeight(FontWeight.Medium)
          .fontColor('#333333')
        
        if (required) {
          Text('*')
            .fontSize(12)
            .fontColor('#FF6B6B')
        }
      }
      .margin({ bottom: 4 })
      
      Text(type)
        .fontSize(11)
        .fontColor('#666666')
        .fontFamily('monospace')
    }
    .alignItems(HorizontalAlign.Start)
    .layoutWeight(1)
    
    Column() {
      Text(value)
        .fontSize(13)
        .fontColor('#2196F3')
        .fontWeight(FontWeight.Medium)
    }
    .alignItems(HorizontalAlign.End)
  }
  .width('100%')
  .padding(12)
  .backgroundColor('#F5F5F5')
  .borderRadius(8)
  .margin({ bottom: 8 })
}

// Correct Usage Component 2: Param card styles
@Styles
function paramCardStyle() {
  .width('100%')
  .padding(18)
  .backgroundColor('#FFFFFF')
  .borderRadius(14)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.06)' })
}

// Correct Usage Component 3: Param type extension
@Extend(Text)
function paramTypeText() {
  .fontSize(12)
  .fontColor('#FFFFFF')
  .padding({ horizontal: 8, vertical: 3 })
  .backgroundColor('#795548')
  .borderRadius(3)
  .fontFamily('monospace')
}

@Entry
@Component
struct ParamValidation {
  @State testTitle: string = 'Param Decorator Validation'
  @State errorCount: number = 3
  @State paramCount: number = 5
  @State validatedParams: number = 3

  build() {
    Column() {
      // Header
      Column() {
        Text(this.testTitle)
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1A1A1A')
        
        Text('Parameter Validation Testing')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ top: 6 })
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Param Stats
      Row() {
        Column() {
          Text(this.paramCount.toString())
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#795548')
          
          Text('Parameters')
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
          Text(this.validatedParams.toString())
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#4CAF50')
          
          Text('Validated')
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
      .backgroundColor('#F5F7FA')
      .borderRadius(12)
      .margin({ left: 20, right: 20, bottom: 16 })

      // Error Alert
      Row() {
        Text('⚠')
          .fontSize(24)
          .margin({ right: 12 })
        
        Column() {
          Text('Parameter Validation Errors')
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

      // Parameters List
      Column() {
        Row() {
          Text('Component Parameters')
            .fontSize(18)
            .fontWeight(FontWeight.Medium)
          
          Text(`${this.validatedParams}/${this.paramCount} validated`)
            .fontSize(12)
            .fontColor('#4CAF50')
        }
        .width('100%')
        .justifyContent(FlexAlign.SpaceBetween)
        .margin({ bottom: 12 })

        buildParamRow('title', 'string', true, '"Hello"')
        buildParamRow('count', 'number', false, '42')
        buildParamRow('isActive', 'boolean', true, 'true')
        buildParamRow('items', 'Array<T>', false, '[1,2,3]')
        buildParamRow('config', 'Object', false, '{}')
      }
      .paramCardStyle()
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
            
            Text('Invalid')
              .fontSize(11)
              .fontColor('#FF6B6B')
          }
          .padding(10)
          .backgroundColor('#FFF5F5')
          .borderRadius(6)
          .margin({ bottom: 6 })
          
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
            
            Text('Invalid')
              .fontSize(11)
              .fontColor('#FF6B6B')
          }
          .padding(10)
          .backgroundColor('#FFF5F5')
          .borderRadius(6)
          .margin({ bottom: 6 })
          
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
            
            Text('Invalid')
              .fontSize(11)
              .fontColor('#FF6B6B')
          }
          .padding(10)
          .backgroundColor('#FFF5F5')
          .borderRadius(6)
        }
        .width('100%')
      }
      .paramCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Action Buttons
      Row() {
        Button('Validate Params')
          .width('48%')
          .height(46)
          .backgroundColor('#795548')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            this.validatedParams = Math.min(this.paramCount, this.validatedParams + 1)
          })
        
        Button('Reset')
          .width('48%')
          .height(46)
          .backgroundColor('#9E9E9E')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            this.validatedParams = 0
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