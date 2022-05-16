/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
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

/*
  StateArrayReverse test case

  The purpose of this test case is verify what happens when re-ordering the Widgets / Components
  of same type. Here, the test is done with built-in text (not with a own subclass of JSView)

 The expectation is that TextElement objects are created only once, then put to new order.
 For this to work, each time a TextComponent is created it needs to be assigned the same unique key.

 This is why anArray is not a simple array of strings. strings are not uniquely identifyable.
 Therefore, the app needs to provide a unique id for each array item.
 We do so by making each array item an object with a unique id.

 this id should be used as the 'key' argument when creating a Text.

*/

class Item1 {
  id:number;
  label:string;

  constructor(id:number, label:string){
    this.id = id;
    this.label = label;
  }
}

@Entry
@Component
struct ShufflingArrayContainer1 {

  @State anArray:Item1[] = [
      new Item1(1, "Text 1"),
      new Item1(2, "Text 2"),
      new Item1(3, "Text 3"),
      new Item1(4, "Text 4"),
      new Item1(5, "Text 5")
    ];

  build() {
    Column(){
      ForEach(this.anArray,
              (item:Item1) => {Text(item.label)},
              (item:Item1) => item.id.toString()
              ) //ForEach
      Button("Reverse array")
        .width(500.0)
        .height(150.0)
        .onClick(() => {
          this.anArray.reverse();
          console.log("onClick handler on ShufflingArrayContainer1, this.anArray: " + JSON.stringify(this.anArray));
        }) //Button
    } // Column
  } // build
} // class
