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
@Styles function globalFancy1() {
    .width(150)
    .height(100)
    .backgroundColor(Color.Pink)
  }
  
  @Entry
  @Component
  struct Index {
    @State applyToAll: boolean = false;
  @Styles globalFancy() {
    .width(150)
    .height(100)
    .backgroundColor(Color.Pink)
  }
    build() {
      Column() {
        if (1) {
          Row() {
            Checkbox()
              .select($$this.applyToAll)
              .shape(CheckBoxShape.ROUNDED_SQUARE)
              .selectedColor('red')
              .unselectedColor('red')
              .globalFancy1()
              .globalFancy()
              .mark({
                strokeColor: 'red'
              })
              .width(30)
              .height(30)
          }
        }
      }
    }
  }
`

exports.expectResult =
`"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
class Index extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__applyToAll = new ObservedPropertySimplePU(false, this, "applyToAll");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.applyToAll !== undefined) {
            this.applyToAll = params.applyToAll;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__applyToAll.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__applyToAll.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get applyToAll() {
        return this.__applyToAll.get();
    }
    set applyToAll(newValue) {
        this.__applyToAll.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (1) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Checkbox.create();
                        Checkbox.select(this.applyToAll, newValue => { this.applyToAll = newValue; });
                        Checkbox.shape(CheckBoxShape.ROUNDED_SQUARE);
                        Checkbox.selectedColor('red');
                        Checkbox.unselectedColor('red');
                        Checkbox.width(150);
                        Checkbox.height(100);
                        Checkbox.backgroundColor(Color.Pink);
                        Checkbox.width(150);
                        Checkbox.height(100);
                        Checkbox.backgroundColor(Color.Pink);
                        Checkbox.mark({
                            strokeColor: 'red'
                        });
                        Checkbox.width(30);
                        Checkbox.height(30);
                    }, Checkbox);
                    Checkbox.pop();
                    Row.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new Index(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`
