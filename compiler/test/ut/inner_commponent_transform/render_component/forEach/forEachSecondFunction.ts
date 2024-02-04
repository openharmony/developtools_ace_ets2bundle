/*
 * Copyright (c) 2022 Huawei Device Co., Ltd.
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
struct MyComponent {
  @State arr: number[] = [10, 20, 30];
  build() {
    Column({ space: 5 }) {
      Button('Reverse Array')
        .onClick(() => {
          this.arr.reverse();
        })
      ForEach(this.arr, ((item: number) => {
        Text('item').fontSize(18)
        Divider().strokeWidth(2)
      }), (item: number) => item.toString())
    }.width("100%").height("100%")
  }
}`

exports.expectResult =
`"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
let __generate__Id = 0;
function generateId() {
    return "forEachSecondFunction_" + ++__generate__Id;
}
class MyComponent extends View {
    constructor(compilerAssignedUniqueChildId, parent, params, localStorage) {
        super(compilerAssignedUniqueChildId, parent, localStorage);
        this.__arr = new ObservedPropertyObject([10, 20, 30], this, "arr");
        this.updateWithValueParams(params);
        this.finalizeConstruction();
    }
    updateWithValueParams(params) {
        if (params.arr !== undefined) {
            this.arr = params.arr;
        }
    }
    aboutToBeDeleted() {
        this.__arr.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get arr() {
        return this.__arr.get();
    }
    set arr(newValue) {
        this.__arr.set(newValue);
    }
    render() {
        Column.create({ space: 5 });
        Column.width("100%");
        Column.height("100%");
        Button.createWithLabel('Reverse Array');
        Button.onClick(() => {
            this.arr.reverse();
        });
        Button.pop();
        ForEach.create("2", this, ObservedObject.GetRawObject(this.arr), (item) => {
            Text.create('item');
            Text.fontSize(18);
            Text.pop();
            Divider.create();
            Divider.strokeWidth(2);
        }, (item) => item.toString());
        ForEach.pop();
        Column.pop();
    }
}
loadDocument(new MyComponent("1", undefined, {}));
`
