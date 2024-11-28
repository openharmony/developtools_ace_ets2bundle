/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
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
 * This is a test case about the use of "!!" two-way sync binding in the component 'Radio'.
 */
exports.source = `
@Entry
@Component
struct RadioExample {
  @State check1: boolean = false
  @State check2: boolean = false

  build() {
    Flex({ direction: FlexDirection.Row, justifyContent: FlexAlign.Center, alignItems: ItemAlign.Center }) {
      Column() {
        Text('Radio1')
        Radio({ value: 'Radio1', group: 'radioGroup' }).checked(this.check1!!)
          .radioStyle({
            checkedBackgroundColor: Color.Pink
          })
          .height(50)
          .width(50)
          .onChange((isChecked: boolean) => {
            console.log('Radio1 status is ' + isChecked)
          })
      }
      Column() {
        Text('Radio2')
        Radio({ value: 'Radio2', group: 'radioGroup' }).checked(this.check2)
          .radioStyle({
            checkedBackgroundColor: Color.Pink
          })
          .height(50)
          .width(50)
          .onChange((isChecked: boolean) => {
            console.log('Radio2 status is ' + isChecked)
          })
      }
      Column() {
        Text('Radio3')
        Radio({ value: 'Radio3', group: 'radioGroup' }).checked(false)
          .radioStyle({
            checkedBackgroundColor: Color.Pink
          })
          .height(50)
          .width(50)
          .onChange((isChecked: boolean) => {
            console.log('Radio3 status is ' + isChecked)
          })
      }
    }.padding({ top: 30 })
  }
}
`

exports.expectResult =
`"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
class RadioExample extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__check1 = new ObservedPropertySimplePU(false, this, "check1");
        this.__check2 = new ObservedPropertySimplePU(false, this, "check2");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.check1 !== undefined) {
            this.check1 = params.check1;
        }
        if (params.check2 !== undefined) {
            this.check2 = params.check2;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__check1.purgeDependencyOnElmtId(rmElmtId);
        this.__check2.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__check1.aboutToBeDeleted();
        this.__check2.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get check1() {
        return this.__check1.get();
    }
    set check1(newValue) {
        this.__check1.set(newValue);
    }
    get check2() {
        return this.__check2.get();
    }
    set check2(newValue) {
        this.__check2.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Flex.create({ direction: FlexDirection.Row, justifyContent: FlexAlign.Center, alignItems: ItemAlign.Center });
            Flex.padding({ top: 30 });
        }, Flex);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Radio1');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Radio.create({ value: 'Radio1', group: 'radioGroup' });
            Radio.checked({ value: this.check1, $value: newValue => { this.check1 = newValue; } });
            Radio.radioStyle({
                checkedBackgroundColor: Color.Pink
            });
            Radio.height(50);
            Radio.width(50);
            Radio.onChange((isChecked) => {
                console.log('Radio1 status is ' + isChecked);
            });
        }, Radio);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Radio2');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Radio.create({ value: 'Radio2', group: 'radioGroup' });
            Radio.checked(this.check2);
            Radio.radioStyle({
                checkedBackgroundColor: Color.Pink
            });
            Radio.height(50);
            Radio.width(50);
            Radio.onChange((isChecked) => {
                console.log('Radio2 status is ' + isChecked);
            });
        }, Radio);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Radio3');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Radio.create({ value: 'Radio3', group: 'radioGroup' });
            Radio.checked(false);
            Radio.radioStyle({
                checkedBackgroundColor: Color.Pink
            });
            Radio.height(50);
            Radio.width(50);
            Radio.onChange((isChecked) => {
                console.log('Radio3 status is ' + isChecked);
            });
        }, Radio);
        Column.pop();
        Flex.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new RadioExample(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`
