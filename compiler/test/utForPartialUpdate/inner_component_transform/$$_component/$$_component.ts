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
}
`

exports.expectResult =
`"use strict";
const value5 = [true, false];
let value6 = { item1: true };
let isCountDown = false;
class HomeComponent extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1) {
        super(parent, __localStorage, elmtId);
        this.value1 = "hello world 1";
        this.value2 = "hello world 2";
        this.value3 = "hello world 3";
        this.value4 = false;
        this.count = 1000;
        this.myTimeController = new TextTimerController();
        this.__format = new ObservedPropertySimplePU("hh:mm:ss:ms", this, "format");
        this.setInitiallyProvidedValue(params);
    }
    setInitiallyProvidedValue(params) {
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
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__format.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__format.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get format() {
        return this.__format.get();
    }
    set format(newValue) {
        this.__format.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Column.create();
            Column.height(500);
            if (!isInitialRender) {
                Column.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Row.create();
            if (!isInitialRender) {
                Row.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Text.create(this.value1);
            if (!isInitialRender) {
                Text.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        Text.pop();
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Radio.create({ value: "Radio", group: "1" });
            Radio.checked(this.value4, newValue => { this.value4 = newValue; });
            if (!isInitialRender) {
                Radio.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        Row.pop();
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Row.create();
            Row.width(20);
            if (!isInitialRender) {
                Row.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Button.createWithChild();
            Button.bindPopup({ value: this.value4, changeEvent: newValue => { this.value4 = newValue; } }, { message: "This is $$ for regular" });
            Button.width(100);
            Button.height(20);
            if (!isInitialRender) {
                Button.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Text.create(this.value1);
            Text.bindPopup({ value: value5[0], changeEvent: newValue => { value5[0] = newValue; } }, { message: "This is $$ for Array" });
            if (!isInitialRender) {
                Text.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        Text.pop();
        Button.pop();
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Text.create(this.value2);
            Text.fontSize(100);
            Text.bindPopup({ value: value6.item1, changeEvent: newValue => { value6.item1 = newValue; } }, { message: "This is $$ for Obj" });
            if (!isInitialRender) {
                Text.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        Text.pop();
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Text.create(this.value3);
            if (!isInitialRender) {
                Text.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        Text.pop();
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Radio.create({ value: "Radio", group: "1" });
            Radio.checked(value5[0], newValue => { value5[0] = newValue; });
            if (!isInitialRender) {
                Radio.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        Row.pop();
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Row.create();
            if (!isInitialRender) {
                Row.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            TextTimer.create({ controller: this.myTimeController, isCountDown: { value: isCountDown, changeEvent: newValue => { isCountDown = newValue; } }, count: { value: this.count, changeEvent: newValue => { this.count = newValue; } } });
            TextTimer.format(this.format, newValue => { this.format = newValue; });
            if (!isInitialRender) {
                TextTimer.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        TextTimer.pop();
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Button.createWithLabel("start");
            Button.onClick(() => {
                this.myTimeController.start();
            });
            if (!isInitialRender) {
                Button.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        Button.pop();
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Button.createWithLabel("pause");
            Button.onClick(() => {
                this.myTimeController.pause();
            });
            if (!isInitialRender) {
                Button.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        Button.pop();
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Button.createWithLabel("reset");
            Button.onClick(() => {
                this.myTimeController.reset();
            });
            if (!isInitialRender) {
                Button.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        Button.pop();
        Row.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new HomeComponent(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`
