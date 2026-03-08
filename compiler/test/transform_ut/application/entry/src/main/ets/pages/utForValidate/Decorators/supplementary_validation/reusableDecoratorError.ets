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

/**
 * Test case: Reusable decorator error
 * Purpose: Verify @Reusable decorator usage and validation
 * Error code: 10905900
 */

// ============================================
// Test Case 1: @Reusable without @Component
// Expected Error: 10905900
// ============================================

@Reusable
class ReusableWithoutComponent {
  data: string = ''
}

// ============================================
// Test Case 2: @Reusable with wrong parameters
// Expected Error: 10905900
// ============================================

@Reusable({ invalidParam: true })
@Component
struct ReusableWithWrongParams {
  @State content: string = ''

  build() {
    Column() {
      Text(this.content)
    }
  }
}

// ============================================
// Test Case 3: @Reusable with @ComponentV2
// Expected Error: 10905900
// ============================================

@Reusable
@ComponentV2
struct ReusableWithV2 {
  @Local title: string = ''

  build() {
    Column() {
      Text(this.title)
    }
  }
}

// ============================================
// Test Case 4: Correct @Reusable usage
// ============================================

@Reusable
@Component
struct ReusableListItem {
  @Prop itemId: number = 0
  @Prop itemTitle: string = ''
  @Prop itemDescription: string = ''
  @Prop isSelected: boolean = false

  build() {
    Column() {
      Row() {
        Column() {
          Text(this.itemTitle)
            .fontSize(16)
            .fontWeight(FontWeight.Bold)
            .fontColor(this.isSelected ? '#1890FF' : '#333333')

          Text(this.itemDescription)
            .fontSize(12)
            .fontColor('#666666')
            .margin({ top: 4 })
        }
        .alignItems(HorizontalAlign.Start)
        .layoutWeight(1)

        if (this.isSelected) {
          Text('✓')
            .fontSize(20)
            .fontColor('#1890FF')
        }
      }
      .width('100%')
      .padding(15)
      .backgroundColor(this.isSelected ? '#E6F7FF' : '#FFFFFF')
      .borderRadius(8)
    }
    .margin(5)
    .shadow({ radius: 3, color: '#20000000' })
  }
}

@Reusable
@Component
struct ReusableCard {
  @Prop title: string = ''
  @Prop imageUrl: string = ''
  @Prop price: number = 0
  @Prop rating: number = 0

  build() {
    Column() {
      Column() {
        Text(this.title)
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin(10)

        Text('Price: $' + this.price.toFixed(2))
          .fontSize(16)
          .fontColor('#FF6B6B')
          .margin(5)

        Text('Rating: ' + this.rating + ' ★')
          .fontSize(14)
          .fontColor('#FFB800')
          .margin(5)
      }
      .width('100%')
      .padding(15)
      .backgroundColor('#FFFFFF')
      .borderRadius(12)
    }
    .width(200)
    .margin(10)
    .shadow({ radius: 5, color: '#30000000' })
  }
}

@Component
struct CorrectReusableUsage {
  @State items: Array<{ id: number; title: string; desc: string }> = [
    { id: 1, title: 'Item 1', desc: 'Description for item 1' },
    { id: 2, title: 'Item 2', desc: 'Description for item 2' },
    { id: 3, title: 'Item 3', desc: 'Description for item 3' },
  ]
  @State selectedId: number = -1

  build() {
    Column() {
      Text('Reusable Components Demo')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      List() {
        ForEach(this.items, (item: { id: number; title: string; desc: string }) => {
          ListItem() {
            ReusableListItem({
              itemId: item.id,
              itemTitle: item.title,
              itemDescription: item.desc,
              isSelected: this.selectedId === item.id
            })
          }
          .onClick(() => {
            this.selectedId = item.id
          })
        })
      }
      .width('90%')
      .layoutWeight(1)
      .margin(20)

      Text('Selected: ' + (this.selectedId > 0 ? 'Item ' + this.selectedId : 'None'))
        .fontSize(16)
        .margin(10)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F5F5')
  }
}

// ============================================
// Test Case 5: @Reusable with recycle parameters
// ============================================

@Reusable
@Component
struct ReusableImageCard {
  @Prop imageId: string = ''
  @Prop imageName: string = ''
  @Prop imageSize: string = ''
  @Prop isFavorite: boolean = false

  aboutToRecycle(): void {
    console.log('Recycling image card: ' + this.imageId)
  }

  build() {
    Column() {
      Column() {
        Text(this.imageName)
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .margin(8)

        Text('Size: ' + this.imageSize)
          .fontSize(12)
          .fontColor('#999999')
          .margin(4)

        Text(this.isFavorite ? '♥ Favorite' : '♡')
          .fontSize(14)
          .fontColor(this.isFavorite ? '#FF6B6B' : '#CCCCCC')
          .margin(8)
      }
      .width('100%')
      .padding(12)
      .backgroundColor('#FFFFFF')
      .borderRadius(10)
    }
    .width(160)
    .margin(8)
    .shadow({ radius: 4, color: '#20000000' })
  }
}

@Component
struct RecyclePoolDemo {
  @State imageList: Array<{ id: string; name: string; size: string; favorite: boolean }> = [
    { id: '1', name: 'Photo 1', size: '2.5 MB', favorite: true },
    { id: '2', name: 'Photo 2', size: '1.8 MB', favorite: false },
    { id: '3', name: 'Photo 3', size: '3.2 MB', favorite: false },
    { id: '4', name: 'Photo 4', size: '1.5 MB', favorite: true },
    { id: '5', name: 'Photo 5', size: '2.1 MB', favorite: false },
  ]

  build() {
    Column() {
      Text('Recycle Pool Demo')
        .fontSize(22)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Text('Reusable components with recycle callbacks')
        .fontSize(14)
        .fontColor('#666666')
        .margin(10)

      Grid() {
        ForEach(this.imageList, (img: { id: string; name: string; size: string; favorite: boolean }) => {
          GridItem() {
            ReusableImageCard({
              imageId: img.id,
              imageName: img.name,
              imageSize: img.size,
              isFavorite: img.favorite
            })
          }
        })
      }
      .columnsTemplate('1fr 1fr')
      .width('100%')
      .height(400)
      .margin(10)

      Button('Add More Images')
        .onClick(() => {
          const newId = (this.imageList.length + 1).toString()
          this.imageList.push({
            id: newId,
            name: `Photo ${newId}`,
            size: (Math.random() * 3 + 1).toFixed(1) + ' MB',
            favorite: Math.random() > 0.5
          })
        })
        .width(200)
        .height(45)
        .margin(10)
    }
    .width('100%')
    .height('100%')
    .padding(20)
  }
}

// ============================================
// Entry point for testing
// ============================================

@Entry
@Component
struct TestReusableDecorator {
  @State testTitle: string = '@Reusable Decorator Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)

      Column() {
        Text('Testing Error Code: 10905900')
          .fontSize(18)
          .fontColor(Color.Red)
          .margin(5)

        Text('@Reusable without @Component')
          .fontSize(14)
          .margin(5)

        Text('@Reusable with wrong parameters')
          .fontSize(14)
          .margin(5)

        Text('@Reusable with @ComponentV2')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)

      Column() {
        Text('@Reusable Rules:')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .margin(5)

        Text('1. Must be used with @Component')
          .fontSize(14)
          .margin(2)

        Text('2. Only works with V1 components')
          .fontSize(14)
          .margin(2)

        Text('3. Enables component recycling')
          .fontSize(14)
          .margin(2)

        Text('4. Must use @Prop for data')
          .fontSize(14)
          .margin(2)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFF3E0')
      .margin(10)

      Column() {
        Text('Correct Usage:')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)

        Text('@Reusable')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('@Component')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('struct MyItem {')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('  @Prop data: string = ""')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)

        Text('}')
          .fontSize(14)
          .fontColor(Color.Green)
          .margin(2)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#E8F5E9')
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}
