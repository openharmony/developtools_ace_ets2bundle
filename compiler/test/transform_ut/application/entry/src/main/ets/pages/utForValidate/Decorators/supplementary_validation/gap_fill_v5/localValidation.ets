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

// Test Case: Local Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function localErrorCase1() {
}
// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function localErrorCase2() {
}
// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function localErrorCase3() {
}
// Correct Usage Component 1: Local state builder
@Builder
function buildLocalItem(name: string, scope: string, value: string) {
  Row() {
    Column() {
      Row() {
        Text(name)
          .fontSize(15)
          .fontWeight(FontWeight.Medium)
          .fontColor('#333333')
        
        Text(scope)
          .fontSize(10)
          .fontColor('#FFFFFF')
          .padding({ horizontal: 6, vertical: 2 })
          .backgroundColor('#8BC34A')
          .borderRadius(3)
          .margin({ left: 8 })
      }
      .margin({ bottom: 4 })
    }
    .alignItems(HorizontalAlign.Start)
    .layoutWeight(1)
    
    Text(value)
      .fontSize(13)
      .fontColor('#666666')
      .fontFamily('monospace')
  }
  .width('100%')
  .padding(12)
  .backgroundColor('#F1F8E9')
  .borderRadius(8)
  .margin({ bottom: 8 })
}
// Correct Usage Component 2: Local card styles
@Styles
function localCardStyle() {
  .width('100%')
  .padding(18)
  .backgroundColor('#FFFFFF')
  .borderRadius(14)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.06)' })
}
// Correct Usage Component 3: Local scope extension
@Extend(Text)
function localScopeText() {
  .fontSize(12)
  .fontColor('#FFFFFF')
  .fontWeight(FontWeight.Medium)
  .padding({ horizontal: 8, vertical: 3 })
  .backgroundColor('#8BC34A')
  .borderRadius(3)
}
@Entry
@Component
struct LocalValidation {
  @State testTitle: string = 'Local Decorator Validation'
  @State errorCount: number = 3
  @State localVars: number = 6
  @State currentScope: string = 'Component'

  build() {
    Column() {
      // Header
      Column() {
        Text(this.testTitle)
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1A1A1A')
        
        Row() {
          Text('Scope: ')
            .fontSize(14)
            .fontColor('#666666')
          
          Text(this.currentScope)
            .localScopeText()
        }
        .margin({ top: 8 })
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Local Stats
      Row() {
        Column() {
          Text(this.localVars.toString())
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#8BC34A')
          
          Text('Local Variables')
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
          Text('3')
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#2196F3')
          
          Text('Scopes')
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
          Text('Local Scope Validation Errors')
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

      // Local Variables List
      Column() {
        Text('Local Variables')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        buildLocalItem('counter', 'local', '0')
        buildLocalItem('isVisible', 'local', 'true')
        buildLocalItem('userName', 'local', '"user"')
        buildLocalItem('items', 'local', '[]')
      }
      .localCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })
      .layoutWeight(1)

      // Scope Selector
      Column() {
        Text('Select Scope')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 10 })
        
        Row() {
          ForEach(['Component', 'Function', 'Block'], (scope: string) => {
            Text(scope)
              .fontSize(13)
              .fontWeight(this.currentScope === scope ? FontWeight.Bold : FontWeight.Normal)
              .fontColor(this.currentScope === scope ? '#FFFFFF' : '#666666')
              .padding({ horizontal: 16, vertical: 8 })
              .backgroundColor(this.currentScope === scope ? '#8BC34A' : '#F5F5F5')
              .borderRadius(6)
              .margin({ right: 8 })
              .onClick(() => {
                this.currentScope = scope
              })
          })
        }
        .width('100%')
      }
      .localCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Error Details
      Column() {
        Text('Decorator Conflicts')
          .fontSize(14)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 8 })
        
        Row() {
          Text('@Builder + @Styles')
            .fontSize(12)
            .fontColor('#333333')
            .layoutWeight(1)
          Text('✗')
            .fontSize(14)
            .fontColor('#FF6B6B')
        }
        .margin({ bottom: 4 })
        
        Row() {
          Text('@Extend + @Builder')
            .fontSize(12)
            .fontColor('#333333')
            .layoutWeight(1)
          Text('✗')
            .fontSize(14)
            .fontColor('#FF6B6B')
        }
        .margin({ bottom: 4 })
        
        Row() {
          Text('@AnimatableExtend + @Builder')
            .fontSize(12)
            .fontColor('#333333')
            .layoutWeight(1)
          Text('✗')
            .fontSize(14)
            .fontColor('#FF6B6B')
        }
      }
      .width('100%')
      .padding(14)
      .backgroundColor('#FFF5F5')
      .borderRadius(8)
      .margin({ left: 20, right: 20, bottom: 16 })

      // Action Button
      Row() {
        Button('Validate Local Scope')
          .width('100%')
          .height(48)
          .backgroundColor('#8BC34A')
          .fontSize(16)
          .borderRadius(8)
          .onClick(() => {
            console.info('Local scope validation completed')
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