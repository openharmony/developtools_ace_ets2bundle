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
let isCountDown:boolean = false
@Entry
@Component
struct TextTimerComponent {
  myTimeController: TextTimerController  = new TextTimerController();
  private count: number = 1000;
  @State format: string = "hh:mm:ss:ms"
  build() {
    Column() {
      TextTimer({controller: this.myTimeController, isCountDown:$$isCountDown, count:$$this.count})
        .format($$this.format)
      Row(){
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
  }
}`

exports.expectResult =
`let isCountDown = false;
class TextTimerComponent extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.myTimeController = new TextTimerController();
        this.count = 1000;
        this.__format = new ObservedPropertySimple("hh:mm:ss:ms", this, "format");
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.myTimeController !== undefined) {
            this.myTimeController = params.myTimeController;
        }
        if (params.count !== undefined) {
            this.count = params.count;
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
        TextTimer.create({ controller: this.myTimeController, isCountDown: { value: isCountDown, changeEvent: newValue => { isCountDown = newValue; } }, count: { value: this.count, changeEvent: newValue => { this.count = newValue; } } });
        TextTimer.format(this.format, newValue => { this.format = newValue; });
        TextTimer.pop();
        Row.create();
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
loadDocument(new TextTimerComponent("1", undefined, {}));
`