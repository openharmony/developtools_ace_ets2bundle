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

class Item{
    id:number = 0;
    label:string = '';

    constructor(id:number, label:string){
        this.id = id;
        this.label = label;
    }
}

@Component
struct CustomRow {
    item:Item;

    build(){
        Row(){
            Text("label: ")
            Text(this.item.label)
            Text(", cap: ")
            Text(this.item.label.toUpperCase())
            Text(", rev: ")
            Text(this.item.label.split("").reverse().join(""))
        }
    }
}

@Component
struct CustomText {
    item:Item;

    build() {
        Column() {
            Text(this.item.label)
        }
    }
}

@Entry
@Component
struct ShufflingArrayContainer {
    @State anArray:Item[] = [
      new Item(1, "Text 1"),
      new Item(2, "Text 2"),
      new Item(3, "Text 3"),
      new Item(4, "Text 4"),
      new Item(5, "Text 5")
    ];

    build() {
        Column(){
            ForEach(this.anArray,
                (item:Item) => {CustomRow({ item:item })},
                (item:Item) => item.id.toString()
            ) //ForEach
            Button("Reverse anArray")
            .width(500.0)
            .height(150.0)
            .onClick(() => {
                // replace entire array
                this.anArray = (this.anArray[0].id == 1) ?
                    [
                        new Item(10, "Text A"),
                        new Item(20, "Text B"),
                        new Item(30, "Text C"),
                        new Item(40, "Text D"),
                        new Item(50, "Text E")
                    ] : [
                        new Item(1, "Text 1"),
                        new Item(2, "Text 2"),
                        new Item(3, "Text 3"),
                        new Item(4, "Text 4"),
                        new Item(5, "Text 5")
                    ];
                console.log("click handler on ShufflingArrayContainer, this.anArray: " + JSON.stringify(this.anArray));
            }) // click
        } //Column
    } //build
}  //struct
