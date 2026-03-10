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
 * Test case: Component specific child restriction error
 * Purpose: Verify certain components can only have specific child components
 * Error code: 10905219
 * 
 * Background:
 * - Some components restrict child types for proper functionality
 * - This ensures component hierarchy integrity
 * - Each container has specific child requirements
 */

@Component
struct ComponentSpecificChildError {
  build() {
    Column() {
      // Error: List with wrong child type - 10905219
      List() {
        Text('Wrong child')  // This should be ListItem
      }
      
      // Error: Grid with wrong child - 10905219
      Grid() {
        Column() {  // This should be GridItem
          Text('Wrong child')
        }
      }
    }
    .padding(10)
  }
}

@Entry
@Component
struct TestSpecificChildRestriction {
  @State testTitle: string = 'Component Child Restriction Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
        .textAlign(TextAlign.Center)
      
      // Error explanation section
      Column() {
        Text('Error: 10905219')
          .fontSize(18)
          .fontColor(Color.Red)
          .fontWeight(FontWeight.Bold)
          .margin(10)
        
        Text('Components can only have specific child types')
          .fontSize(14)
          .margin(10)
          .textAlign(TextAlign.Center)
        
        Text('List → ListItem/Section/ListItemGroup')
          .fontSize(12)
          .fontColor(Color.Orange)
          .margin(5)
        
        Text('Grid → GridItem')
          .fontSize(12)
          .fontColor(Color.Orange)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .borderRadius(8)
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .backgroundColor('#FAFAFA')
  }
}

// Example showing all correct child relationships
@Component
struct CorrectChildRelationships {
  @State items: string[] = ['A', 'B', 'C']

  build() {
    Column() {
      Text('Correct Child Component Examples')
        .fontSize(18)
        .fontWeight(FontWeight.Medium)
        .margin(15)
      
      // List example
      Text('List → ListItem:')
        .fontSize(14)
        .margin(10)
      
      List() {
        ForEach(this.items, (item: string) => {
          ListItem() {
            Text(`Item: ${item}`)
              .fontSize(14)
              .margin(5)
          }
        }, (item: string) => item)
      }
      .width('100%')
      .height(120)
      .backgroundColor('#E8F5E9')
      .margin(5)
      
      // Grid example
      Text('Grid → GridItem:')
        .fontSize(14)
        .margin(10)
      
      Grid() {
        ForEach(this.items, (item: string) => {
          GridItem() {
            Text(item)
              .fontSize(14)
              .margin(5)
          }
        }, (item: string) => item)
      }
      .width('100%')
      .height(100)
      .backgroundColor('#E3F2FD')
      .margin(5)
      .columnsTemplate('1fr 1fr 1fr')
    }
    .padding(15)
    .backgroundColor('#FFFFFF')
    .borderRadius(8)
    .margin(10)
  }
}

// Documentation component
@Component
struct ChildRestrictionDocumentation {
  @State docTitle: string = 'Child Component Guidelines'

  build() {
    Column() {
      Text(this.docTitle)
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin(15)
      
      Text('Container → Required Child Types:')
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .margin(10)
      
      Text('List → ListItem/Section/ListItemGroup')
        .fontSize(14)
        .margin(8)
        .fontColor(Color.Blue)
      
      Text('Grid → GridItem')
        .fontSize(14)
        .margin(8)
        .fontColor(Color.Blue)
      
      Text('Error code: 10905219')
        .fontSize(12)
        .fontColor(Color.Red)
        .margin(5)
    }
    .padding(20)
    .backgroundColor('#FFF8E1')
    .borderRadius(8)
    .margin(10)
  }
}
