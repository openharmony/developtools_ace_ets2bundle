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

// Test Case: Storage Decorator Validation
// Issue: @Builder cannot be used with @Styles or @Extend decorators
// Error Code: 10905117
// Expected: Decorators should not conflict with each other

// Error Case 1: @Builder + @Styles conflict
@Builder
@Styles
function storageErrorCase1() {
}

// Error Case 2: @Extend + @Builder conflict
@Extend(Text)
@Builder
function storageErrorCase2() {
}

// Error Case 3: @AnimatableExtend + @Builder conflict
@AnimatableExtend(Text)
@Builder
function storageErrorCase3() {
}

// Correct Usage Component 1: Storage info builder
@Builder
function buildStorageItem(key: string, value: string, size: string) {
  Row() {
    Column() {
      Row() {
        Text(key)
          .fontSize(14)
          .fontWeight(FontWeight.Medium)
          .fontColor('#333333')
        
        if (size === 'large') {
          Text('HOT')
            .fontSize(9)
            .fontColor('#FFFFFF')
            .padding({ horizontal: 6, vertical: 2 })
            .backgroundColor('#FF6B6B')
            .borderRadius(3)
            .margin({ left: 8 })
        }
      }
      .margin({ bottom: 4 })
      
      Text(value)
        .fontSize(12)
        .fontColor('#666666')
        .maxLines(1)
        .textOverflow({ overflow: TextOverflow.Ellipsis })
    }
    .alignItems(HorizontalAlign.Start)
    .layoutWeight(1)
    
    Text(size)
      .fontSize(12)
      .fontColor('#999999')
  }
  .width('100%')
  .padding(12)
  .backgroundColor('#F5F5F5')
  .borderRadius(8)
  .margin({ bottom: 6 })
}

// Correct Usage Component 2: Storage card styles
@Styles
function storageCardStyle() {
  .width('100%')
  .padding(18)
  .backgroundColor('#FFFFFF')
  .borderRadius(14)
  .shadow({ radius: 8, color: 'rgba(0,0,0,0.06)' })
}

// Correct Usage Component 3: Storage metric extension
@Extend(Text)
function storageMetricText() {
  .fontSize(28)
  .fontWeight(FontWeight.Bold)
  .fontColor('#00BCD4')
}

@Entry
@Component
struct StorageValidation {
  @State testTitle: string = 'Storage Decorator Validation'
  @State errorCount: number = 3
  @State storageUsed: number = 67
  @State storageTotal: number = 128
  @State storageItems: number = 245

  build() {
    Column() {
      // Header
      Column() {
        Text(this.testTitle)
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1A1A1A')
        
        Text('Local Storage Validation')
          .fontSize(14)
          .fontColor('#666666')
          .margin({ top: 6 })
      }
      .width('100%')
      .padding({ top: 24, bottom: 16 })
      .alignItems(HorizontalAlign.Center)

      // Storage Usage Card
      Column() {
        Text('Storage Usage')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 16 })
        
        // Circular progress simulation
        Column() {
          Text(`${this.storageUsed}%`)
            .storageMetricText()
          
          Text('Used')
            .fontSize(12)
            .fontColor('#999999')
            .margin({ top: 4 })
        }
        .width(120)
        .height(120)
        .backgroundColor('#E0F7FA')
        .borderRadius(60)
        .justifyContent(FlexAlign.Center)
        .margin({ bottom: 16 })
        
        // Progress bar
        Row() {
          Row()
            .width(`${this.storageUsed}%`)
            .height(8)
            .backgroundColor(this.storageUsed > 80 ? '#FF6B6B' : '#00BCD4')
            .borderRadius(4)
            .animation({ duration: 500 })
        }
        .width('100%')
        .height(8)
        .backgroundColor('#E0E0E0')
        .borderRadius(4)
        .margin({ bottom: 8 })
        
        Row() {
          Text(`${this.storageUsed} GB used`)
            .fontSize(13)
            .fontColor('#666666')
          
          Text(`${this.storageTotal} GB total`)
            .fontSize(13)
            .fontColor('#666666')
        }
        .width('100%')
        .justifyContent(FlexAlign.SpaceBetween)
      }
      .storageCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })

      // Storage Stats
      Row() {
        Column() {
          Text(this.storageItems.toString())
            .fontSize(24)
            .fontWeight(FontWeight.Bold)
            .fontColor('#00BCD4')
          
          Text('Items Stored')
            .fontSize(12)
            .fontColor('#666666')
        }
        .alignItems(HorizontalAlign.Center)
        .layoutWeight(1)
        
        Divider()
          .vertical(true)
          .height(40)
          .color('#E0E0E0')
        
        Column() {
          Text('3')
            .fontSize(24)
            .fontWeight(FontWeight.Bold)
            .fontColor('#FF6B6B')
          
          Text('Validation Errors')
            .fontSize(12)
            .fontColor('#666666')
        }
        .alignItems(HorizontalAlign.Center)
        .layoutWeight(1)
        
        Divider()
          .vertical(true)
          .height(40)
          .color('#E0E0E0')
        
        Column() {
          Text('10905117')
            .fontSize(13)
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
      .backgroundColor('#FAFAFA')
      .borderRadius(12)
      .margin({ left: 20, right: 20, bottom: 16 })

      // Stored Items
      Column() {
        Text('Stored Items')
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 12 })
        
        buildStorageItem('user_prefs', '{theme: dark, lang: en}', '2KB')
        buildStorageItem('session_token', 'eyJhbGciOiJIUzI1NiIs...', 'large')
        buildStorageItem('cached_data', 'Array(156)', '45KB')
        buildStorageItem('app_config', '{version: 1.0.2}', '1KB')
      }
      .storageCardStyle()
      .margin({ left: 20, right: 20, bottom: 16 })
      .layoutWeight(1)

      // Error Summary
      Column() {
        Text('Decorator Validation Errors')
          .fontSize(14)
          .fontWeight(FontWeight.Medium)
          .fontColor('#FF6B6B')
          .margin({ bottom: 8 })
        
        Row() {
          Text('@Builder + @Styles')
            .fontSize(12)
            .fontColor('#666666')
            .layoutWeight(1)
          Text('✗')
            .fontSize(14)
            .fontColor('#FF6B6B')
        }
        .margin({ bottom: 4 })
        
        Row() {
          Text('@Extend + @Builder')
            .fontSize(12)
            .fontColor('#666666')
            .layoutWeight(1)
          Text('✗')
            .fontSize(14)
            .fontColor('#FF6B6B')
        }
        .margin({ bottom: 4 })
        
        Row() {
          Text('@AnimatableExtend + @Builder')
            .fontSize(12)
            .fontColor('#666666')
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

      // Action Buttons
      Row() {
        Button('Clear Cache')
          .width('48%')
          .height(46)
          .backgroundColor('#9E9E9E')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            this.storageUsed = Math.max(0, this.storageUsed - 10)
            this.storageItems = Math.max(0, this.storageItems - 20)
          })
        
        Button('Validate Storage')
          .width('48%')
          .height(46)
          .backgroundColor('#00BCD4')
          .fontSize(15)
          .borderRadius(8)
          .onClick(() => {
            console.info('Storage validation completed')
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