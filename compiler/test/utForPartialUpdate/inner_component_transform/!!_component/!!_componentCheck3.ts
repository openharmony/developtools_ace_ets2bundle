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
 * This is a test case about the use of "!!" two-way sync binding in 'Checkbox'.
 */
exports.source = `
@Entry
@ComponentV2
struct TestCheckbox {
  @Local select1: boolean = true;
  @Local select2: boolean = true;
  @Local select3: boolean = true;
  @Local select4: boolean = true;

  build() {
    Row() {
      Column() {
        Flex({ justifyContent: FlexAlign.Center, alignItems: ItemAlign.Center }) {
          Checkbox({ name: 'checkbox1', group: 'checkboxGroup' })
            .select(this.select1!!)
            .selectedColor(0x39a2db)
            .shape(CheckBoxShape.ROUNDED_SQUARE)
            .onChange((value: boolean) => {
              console.info('Checkbox1 change is'+ value)
            })
            .mark({
              strokeColor:Color.Black,
              size: 50,
              strokeWidth: 5
            })
            .unselectedColor(Color.Red)
            .width(30)
            .height(30)
          Text('Checkbox1').fontSize(20)
        }
        Flex({ justifyContent: FlexAlign.Center, alignItems: ItemAlign.Center }) {
          Checkbox({ name: 'checkbox2', group: 'checkboxGroup' })
            .select(this.select2)
            .selectedColor(0x39a2db)
            .shape(CheckBoxShape.ROUNDED_SQUARE)
            .onChange((value: boolean) => {
              console.info('Checkbox2 change is' + value)
            })
            .width(30)
            .height(30)
          Text('Checkbox2').fontSize(20)
        }
        Flex({ justifyContent: FlexAlign.Center, alignItems: ItemAlign.Center }) {
          Checkbox({ name: 'checkbox3', group: 'checkboxGroup' }) {
            Text('3333333')
            Text('Three')
            Checkbox({ name: 'checkbox4', group: 'checkboxGroup' })
            .select(this.select4!!)
          }
            .select(this.select3!!)
          Text('Checkbox3').fontSize(20)
        }
      }
      .width('100%')
    }
    .height('100%')
  }
}
`

exports.expectResult =
`"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
class TestCheckbox extends ViewV2 {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda, extraInfo) {
        super(parent, elmtId, extraInfo);
        this.select1 = true;
        this.select2 = true;
        this.select3 = true;
        this.select4 = true;
        this.finalizeConstruction();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.height('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Flex.create({ justifyContent: FlexAlign.Center, alignItems: ItemAlign.Center });
        }, Flex);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Checkbox.create({ name: 'checkbox1', group: 'checkboxGroup' });
            Checkbox.select({ value: this.select1, $value: newValue => { this.select1 = newValue; } });
            Checkbox.selectedColor(0x39a2db);
            Checkbox.shape(CheckBoxShape.ROUNDED_SQUARE);
            Checkbox.onChange((value) => {
                console.info('Checkbox1 change is' + value);
            });
            Checkbox.mark({
                strokeColor: Color.Black,
                size: 50,
                strokeWidth: 5
            });
            Checkbox.unselectedColor(Color.Red);
            Checkbox.width(30);
            Checkbox.height(30);
        }, Checkbox);
        Checkbox.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Checkbox1');
            Text.fontSize(20);
        }, Text);
        Text.pop();
        Flex.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Flex.create({ justifyContent: FlexAlign.Center, alignItems: ItemAlign.Center });
        }, Flex);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Checkbox.create({ name: 'checkbox2', group: 'checkboxGroup' });
            Checkbox.select(this.select2);
            Checkbox.selectedColor(0x39a2db);
            Checkbox.shape(CheckBoxShape.ROUNDED_SQUARE);
            Checkbox.onChange((value) => {
                console.info('Checkbox2 change is' + value);
            });
            Checkbox.width(30);
            Checkbox.height(30);
        }, Checkbox);
        Checkbox.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Checkbox2');
            Text.fontSize(20);
        }, Text);
        Text.pop();
        Flex.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Flex.create({ justifyContent: FlexAlign.Center, alignItems: ItemAlign.Center });
        }, Flex);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Checkbox.create({ name: 'checkbox3', group: 'checkboxGroup' });
            Checkbox.select({ value: this.select3, $value: newValue => { this.select3 = newValue; } });
        }, Checkbox);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('3333333');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Three');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Checkbox.create({ name: 'checkbox4', group: 'checkboxGroup' });
            Checkbox.select({ value: this.select4, $value: newValue => { this.select4 = newValue; } });
        }, Checkbox);
        Checkbox.pop();
        Checkbox.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Checkbox3');
            Text.fontSize(20);
        }, Text);
        Text.pop();
        Flex.pop();
        Column.pop();
        Row.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName() {
        return "TestCheckbox";
    }
}
__decorate([
    Local
], TestCheckbox.prototype, "select1", void 0);
__decorate([
    Local
], TestCheckbox.prototype, "select2", void 0);
__decorate([
    Local
], TestCheckbox.prototype, "select3", void 0);
__decorate([
    Local
], TestCheckbox.prototype, "select4", void 0);
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new TestCheckbox(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`
