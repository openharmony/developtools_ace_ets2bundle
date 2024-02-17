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
const value5: boolean[] = [true, false]
let value6: {item1: boolean} = {item1: true}
let isCountDown: boolean = false

@Entry
@Component
struct HomeComponent {
  private value1: string = "hello world 1"
  private value2: string = "hello world 2"
  private value3: string = "hello world 3"
  private value4: boolean = false
  private count: number = 1000;
  myTimeController: TextTimerController  = new TextTimerController();
  @State format: string = "hh:mm:ss:ms"

  build() {
    Column() {
      Row() {
        Text(this.value1)
        Radio({value: "Radio", group: "1"})
          .checked($$this.value4)
      }
      Row() {
        Button() {
          Text(this.value1)
            .bindPopup($$value5[0], {message: "This is $$ for Array"})
        }
        .bindPopup($$this.value4, {message: "This is $$ for regular"})
        .width(100)
        .height(20)
        Text(this.value2)
          .fontSize(100)
          .bindPopup($$value6.item1, {message: "This is $$ for Obj"})
        Text(this.value3)
        Radio({value: "Radio", group: "1"})
          .checked($$value5[0])
      }
      .width(20)
      Row(){
        TextTimer({controller: this.myTimeController, isCountDown: $$isCountDown, count: $$this.count})
          .format($$this.format)
        Button("start")
          .onClick(()=>{
            this.myTimeController.start();
          })
        Button("pause")
          .onClick(()=>{
            this.myTimeController.pause();
          })
        Button("reset")
          .onClick(()=>{
            this.myTimeController.reset();
          })
      }
    }
    .height(500)
  }
}`

exports.expectResult =
`"use strict";
let __generate__Id = 0;
function generateId() {
    return "$$_component_" + ++__generate__Id;
}
const value5 = [true, false];
let value6 = { item1: true };
let isCountDown = false;
class HomeComponent extends View {
    constructor(compilerAssignedUniqueChildId, parent, params, localStorage) {
        super(compilerAssignedUniqueChildId, parent, localStorage);
        this.value1 = "hello world 1";
        this.value2 = "hello world 2";
        this.value3 = "hello world 3";
        this.value4 = false;
        this.count = 1000;
        this.myTimeController = new TextTimerController();
        this.__format = new ObservedPropertySimple("hh:mm:ss:ms", this, "format");
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.value1 !== undefined) {
            this.value1 = params.value1;
        }
        if (params.value2 !== undefined) {
            this.value2 = params.value2;
        }
        if (params.value3 !== undefined) {
            this.value3 = params.value3;
        }
        if (params.value4 !== undefined) {
            this.value4 = params.value4;
        }
        if (params.count !== undefined) {
            this.count = params.count;
        }
        if (params.myTimeController !== undefined) {
            this.myTimeController = params.myTimeController;
        }
        if (params.format !== undefined) {
            this.format = params.format;
        }
    }
    aboutToBeDeleted() {
        this.__format.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get format() {
        return this.__format.get();
    }
    set format(newValue) {
        this.__format.set(newValue);
    }
    render() {
        Column.create();
        Column.height(500);
        Row.create();
        Text.create(this.value1);
        Text.pop();
        Radio.create({ value: "Radio", group: "1" });
        Radio.checked(this.value4, newValue => { this.value4 = newValue; });
        Row.pop();
        Row.create();
        Row.width(20);
        Button.createWithChild();
        Button.bindPopup({ value: this.value4, changeEvent: newValue => { this.value4 = newValue; } }, { message: "This is $$ for regular" });
        Button.width(100);
        Button.height(20);
        Text.create(this.value1);
        Text.bindPopup({ value: value5[0], changeEvent: newValue => { value5[0] = newValue; } }, { message: "This is $$ for Array" });
        Text.pop();
        Button.pop();
        Text.create(this.value2);
        Text.fontSize(100);
        Text.bindPopup({ value: value6.item1, changeEvent: newValue => { value6.item1 = newValue; } }, { message: "This is $$ for Obj" });
        Text.pop();
        Text.create(this.value3);
        Text.pop();
        Radio.create({ value: "Radio", group: "1" });
        Radio.checked(value5[0], newValue => { value5[0] = newValue; });
        Row.pop();
        Row.create();
        TextTimer.create({ controller: this.myTimeController, isCountDown: { value: isCountDown, changeEvent: newValue => { isCountDown = newValue; } }, count: { value: this.count, changeEvent: newValue => { this.count = newValue; } } });
        TextTimer.format(this.format, newValue => { this.format = newValue; });
        TextTimer.pop();
        Button.createWithLabel("start");
        Button.onClick(() => {
            this.myTimeController.start();
        });
        Button.pop();
        Button.createWithLabel("pause");
        Button.onClick(() => {
            this.myTimeController.pause();
        });
        Button.pop();
        Button.createWithLabel("reset");
        Button.onClick(() => {
            this.myTimeController.reset();
        });
        Button.pop();
        Row.pop();
        Column.pop();
    }
}
loadDocument(new HomeComponent("1", undefined, {}));
`
