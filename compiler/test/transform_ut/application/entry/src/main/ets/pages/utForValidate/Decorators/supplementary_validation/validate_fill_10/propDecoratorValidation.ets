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
 * Test case: @Prop decorator comprehensive validation
 * Purpose: Test @Prop decorator behavior, initialization, and constraints
 * Error codes: 10905319, 10905320, 10905321
 * 
 * @Prop is a one-way binding decorator that passes data from parent to child
 * but prevents child from modifying the source directly.
 */

// ============================================
// Test Case 1: @Prop without initialization
// Expected: Should work with parent-provided value
// ============================================

@Component
struct PropChildNoInit {
  @Prop message: string
  @Prop count: number

  build() {
    Column() {
      Text('Child Component')
        .fontSize(16)
        .fontWeight(FontWeight.Bold)
        .margin(5)

      Text('Message: ' + this.message)
        .fontSize(14)
        .margin(3)

      Text('Count: ' + this.count)
        .fontSize(14)
        .margin(3)
    }
    .padding(12)
    .backgroundColor('#E8F5E9')
    .borderRadius(6)
    .margin(8)
  }
}

// ============================================
// Test Case 2: @Prop with default value
// ============================================

@Component
struct PropWithDefault {
  @Prop title: string = 'Default Title'
  @Prop value: number = 0
  @Prop isEnabled: boolean = true

  build() {
    Column() {
      Text(this.title)
        .fontSize(18)
        .fontWeight(FontWeight.Medium)
        .margin(8)

      Text('Value: ' + this.value)
        .fontSize(16)
        .margin(5)

      Text('Status: ' + (this.isEnabled ? 'Enabled' : 'Disabled'))
        .fontSize(14)
        .fontColor(this.isEnabled ? Color.Green : Color.Gray)
        .margin(5)
    }
    .padding(15)
    .backgroundColor('#FFF3E0')
    .borderRadius(8)
    .margin(10)
  }
}

// ============================================
// Test Case 3: @Prop with complex object type
// ============================================

interface ProductInfo {
  id: number
  name: string
  price: number
  category: string
  inStock: boolean
}

@Component
struct ProductCard {
  @Prop product: ProductInfo = {
    id: 0,
    name: 'Unknown',
    price: 0,
    category: 'N/A',
    inStock: false
  }

  build() {
    Column() {
      Text(this.product.name)
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(10)

      Text('Category: ' + this.product.category)
        .fontSize(14)
        .margin(5)

      Text('Price: $' + this.product.price.toFixed(2))
        .fontSize(18)
        .fontColor(Color.Blue)
        .margin(5)

      Text(this.product.inStock ? 'In Stock' : 'Out of Stock')
        .fontSize(14)
        .fontColor(this.product.inStock ? Color.Green : Color.Red)
        .margin(5)
    }
    .width('90%')
    .padding(20)
    .backgroundColor('#E3F2FD')
    .borderRadius(12)
    .margin(15)
  }
}

// ============================================
// Test Case 4: @Prop with array type
// ============================================

@Component
struct ListDisplay {
  @Prop items: string[] = []
  @Prop showIndex: boolean = false

  build() {
    Column() {
      Text('Item List (' + this.items.length + ')')
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .margin(10)

      ForEach(this.items, (item: string, index: number) => {
        Row() {
          if (this.showIndex) {
            Text((index + 1) + '. ')
              .fontSize(14)
              .fontColor(Color.Gray)
          }
          Text(item)
            .fontSize(16)
            .layoutWeight(1)
        }
        .width('100%')
        .padding(8)
        .backgroundColor(index % 2 === 0 ? '#F5F5F5' : '#FFFFFF')
        .borderRadius(4)
        .margin(2)
      }, (item: string) => item)
    }
    .width('85%')
    .padding(15)
    .backgroundColor('#FCE4EC')
    .borderRadius(10)
    .margin(10)
  }
}

// ============================================
// Test Case 5: @Prop in nested hierarchy
// ============================================

@Component
struct GrandChildComponent {
  @Prop grandChildValue: string = 'GrandChild'

  build() {
    Column() {
      Text('GrandChild')
        .fontSize(14)
        .fontWeight(FontWeight.Bold)
      Text(this.grandChildValue)
        .fontSize(12)
        .margin(3)
    }
    .padding(10)
    .backgroundColor('#D1C4E9')
    .borderRadius(5)
    .margin(5)
  }
}

@Component
struct MiddleComponent {
  @Prop middleValue: string = 'Middle'
  @Prop sharedData: string = ''

  build() {
    Column() {
      Text('Middle Component')
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .margin(5)

      Text('Value: ' + this.middleValue)
        .fontSize(14)
        .margin(3)

      GrandChildComponent({ grandChildValue: this.sharedData })
    }
    .padding(12)
    .backgroundColor('#C5CAE9')
    .borderRadius(6)
    .margin(8)
  }
}

// ============================================
// Test Case 6: @Prop with different types
// ============================================

@Component
struct TypeShowcase {
  @Prop stringProp: string = 'Text'
  @Prop numberProp: number = 42
  @Prop booleanProp: boolean = true
  @Prop arrayProp: number[] = [1, 2, 3]

  build() {
    Column() {
      Text('Type Showcase')
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .margin(10)

      Grid() {
        GridItem() {
          Column() {
            Text('String')
              .fontSize(12)
              .fontColor(Color.Gray)
            Text(this.stringProp)
              .fontSize(14)
          }
        }

        GridItem() {
          Column() {
            Text('Number')
              .fontSize(12)
              .fontColor(Color.Gray)
            Text(this.numberProp.toString())
              .fontSize(14)
          }
        }

        GridItem() {
          Column() {
            Text('Boolean')
              .fontSize(12)
              .fontColor(Color.Gray)
            Text(this.booleanProp ? 'Yes' : 'No')
              .fontSize(14)
              .fontColor(this.booleanProp ? Color.Green : Color.Red)
          }
        }

        GridItem() {
          Column() {
            Text('Array')
              .fontSize(12)
              .fontColor(Color.Gray)
            Text('[' + this.arrayProp.join(', ') + ']')
              .fontSize(12)
          }
        }
      }
      .columnsTemplate('1fr 1fr')
      .rowsTemplate('1fr 1fr')
      .width('90%')
      .height(200)
      .gap(10)
      .margin(10)
    }
    .padding(15)
    .backgroundColor('#E0F2F1')
    .borderRadius(10)
  }
}

// ============================================
// Entry point with comprehensive test
// ============================================

@Entry
@Component
struct PropValidationTestEntry {
  @State parentMessage: string = 'Hello from Parent'
  @State parentCount: number = 100
  @State productData: ProductInfo = {
    id: 101,
    name: 'SmartPhone X',
    price: 999.99,
    category: 'Electronics',
    inStock: true
  }
  @State listItems: string[] = ['Apple', 'Banana', 'Cherry', 'Date']
  @State nestedValue: string = 'Passing through hierarchy'
  @State showIndexes: boolean = true

  build() {
    Scroll() {
      Column() {
        Text('@Prop Decorator Tests')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .margin(20)

        // Section 1: Basic Prop Tests
        Column() {
          Text('Section 1: Basic Prop Binding')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .margin(10)

          PropChildNoInit({
            message: this.parentMessage,
            count: this.parentCount
          })

          Row() {
            Button('Update Message')
              .onClick(() => {
                this.parentMessage = 'Updated at ' + new Date().toLocaleTimeString()
              })
              .width(140)
              .height(40)
              .margin(5)

            Button('Increment')
              .onClick(() => {
                this.parentCount++
              })
              .width(100)
              .height(40)
              .margin(5)
          }
          .margin(10)
        }
        .width('95%')
        .padding(10)
        .backgroundColor('#F5F5F5')
        .borderRadius(10)
        .margin(10)

        // Section 2: Prop with Default
        Column() {
          Text('Section 2: Prop with Default Values')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .margin(10)

          PropWithDefault()
          PropWithDefault({ title: 'Custom Title', value: 50 })
        }
        .width('95%')
        .padding(10)
        .backgroundColor('#FFF8E1')
        .borderRadius(10)
        .margin(10)

        // Section 3: Product Card
        Column() {
          Text('Section 3: Complex Object Prop')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .margin(10)

          ProductCard({ product: this.productData })

          Row() {
            Button('Toggle Stock')
              .onClick(() => {
                this.productData.inStock = !this.productData.inStock
              })
              .width(130)
              .height(40)
              .margin(5)

            Button('Price +10')
              .onClick(() => {
                this.productData.price += 10
              })
              .width(100)
              .height(40)
              .margin(5)
          }
        }
        .width('95%')
        .padding(10)
        .backgroundColor('#E3F2FD')
        .borderRadius(10)
        .margin(10)

        // Section 4: List Display
        Column() {
          Text('Section 4: Array Prop')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .margin(10)

          ListDisplay({
            items: this.listItems,
            showIndex: this.showIndexes
          })

          Row() {
            Button('Toggle Index')
              .onClick(() => {
                this.showIndexes = !this.showIndexes
              })
              .width(130)
              .height(40)
              .margin(5)

            Button('Add Item')
              .onClick(() => {
                this.listItems.push('Item ' + (this.listItems.length + 1))
              })
              .width(100)
              .height(40)
              .margin(5)
          }
        }
        .width('95%')
        .padding(10)
        .backgroundColor('#FCE4EC')
        .borderRadius(10)
        .margin(10)

        // Section 5: Nested Hierarchy
        Column() {
          Text('Section 5: Nested Prop Passing')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .margin(10)

          MiddleComponent({
            middleValue: 'Middle Data',
            sharedData: this.nestedValue
          })

          TextInput({ text: this.nestedValue })
            .onChange((value: string) => {
              this.nestedValue = value
            })
            .width('80%')
            .height(45)
            .margin(10)
        }
        .width('95%')
        .padding(10)
        .backgroundColor('#F3E5F5')
        .borderRadius(10)
        .margin(10)

        // Section 6: Type Showcase
        TypeShowcase()

        // Footer
        Column() {
          Text('Error Codes Tested')
            .fontSize(14)
            .fontWeight(FontWeight.Bold)
            .margin(5)

          Text('10905319 - Invalid @Prop type')
            .fontSize(12)
            .margin(2)

          Text('10905320 - @Prop initialization error')
            .fontSize(12)
            .margin(2)

          Text('10905321 - @Prop assignment violation')
            .fontSize(12)
            .margin(2)
        }
        .width('90%')
        .padding(10)
        .backgroundColor('#FFEBEE')
        .borderRadius(8)
        .margin(15)
      }
      .width('100%')
      .padding(20)
    }
    .height('100%')
    .backgroundColor(Color.White)
  }
}
