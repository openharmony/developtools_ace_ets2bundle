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

exports.source = `
@Entry
@Component
struct CompA {
  size: number = 100;
  @State customPopupArrow: boolean = false
  @Builder SquareText(label: string){
  Text(label)
    .width(1 * this.size)
    .height(1 * this.size)
  }
@Builder RowOfSquareTexts (label1: string, label2: string){
  Row(){
    this.SquareText(label1)
    this.SquareText(label2)
  }
  .width(1 * this.size)
  .height(1 * this.size)
}

@Builder popupBuilder() {
  Flex({direction: FlexDirection.Column, justifyContent: FlexAlign.Center, alignItem: ItemAlign.Center}){
    Text('Content of CustomPopup')
      .fontSize(20)
  }
  .width(100)
  .height(50)
}

  build(){
    Column(){
      Row(){
        this.SquareText("A")
        this.SquareText("B")
      }
      .width(2 * this.size)
      .height(1 * this.size)
      .bindPopup(this.customPopupArrow, {
        builder: this.popupBuilder,
        placement: Placement.Bottom,
        maskColor: 0x01000000,
        popupColor: Color.Red,
        enableArrow: true,
        onStateChange: (e) => {
          if(!e.isVisible){
            this.customPopupArrow = false
          }
        }
      })
      this.RowOfSquareTexts("C", "D")
    }
    .width(2 * this.size)
    .height(2 * this.size)
  }
}`

exports.expectResult =
`"use strict";
class CompA extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.size = 100;
        this.__customPopupArrow = new ObservedPropertySimple(false, this, "customPopupArrow");
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.size !== undefined) {
            this.size = params.size;
        }
        if (params.customPopupArrow !== undefined) {
            this.customPopupArrow = params.customPopupArrow;
        }
    }
    aboutToBeDeleted() {
        this.__customPopupArrow.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get customPopupArrow() {
        return this.__customPopupArrow.get();
    }
    set customPopupArrow(newValue) {
        this.__customPopupArrow.set(newValue);
    }
    SquareText(label) {
        Text.create(label);
        Text.width(1 * this.size);
        Text.height(1 * this.size);
        Text.pop();
    }
    RowOfSquareTexts(label1, label2) {
        Row.create();
        Row.width(1 * this.size);
        Row.height(1 * this.size);
        this.SquareText(label1);
        this.SquareText(label2);
        Row.pop();
    }
    popupBuilder() {
        Flex.create({ direction: FlexDirection.Column, justifyContent: FlexAlign.Center, alignItem: ItemAlign.Center });
        Flex.width(100);
        Flex.height(50);
        Text.create('Content of CustomPopup');
        Text.fontSize(20);
        Text.pop();
        Flex.pop();
    }
    render() {
        Column.create();
        Column.width(2 * this.size);
        Column.height(2 * this.size);
        Row.create();
        Row.width(2 * this.size);
        Row.height(1 * this.size);
        Row.bindPopup(this.customPopupArrow, {
            builder: { builder: this.popupBuilder.bind(this) },
            placement: Placement.Bottom,
            maskColor: 0x01000000,
            popupColor: Color.Red,
            enableArrow: true,
            onStateChange: (e) => {
                if (!e.isVisible) {
                    this.customPopupArrow = false;
                }
            }
        });
        this.SquareText("A");
        this.SquareText("B");
        Row.pop();
        this.RowOfSquareTexts("C", "D");
        Column.pop();
    }
}
loadDocument(new CompA("1", undefined, {}));
`
