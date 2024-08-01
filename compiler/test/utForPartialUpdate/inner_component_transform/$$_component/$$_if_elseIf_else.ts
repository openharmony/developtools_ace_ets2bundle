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
struct Index {
  @State message: string = 'Hello'
  @State num: 0 | 1 | 2 = 0

  build() {
    Row() {
      Column() {
        Text(this.message)
        if (this.num === 0) {
            Refresh({refreshing: $$this.message})
        } else if (this.num === 1) {
            Refresh({refreshing: $$this.message})
        } else if (this.num === 2) {
            Refresh({refreshing: $$this.message})
        } else if (this.num === 3) {
            Refresh({refreshing: $$this.message})
        } else {
            Refresh({refreshing: $$this.message})
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
        this.__message = new ObservedPropertySimplePU('Hello', this, "message");
        this.__num = new ObservedPropertyObjectPU(0, this, "num");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.message !== undefined) {
            this.message = params.message;
        }
        if (params.num !== undefined) {
            this.num = params.num;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__message.purgeDependencyOnElmtId(rmElmtId);
        this.__num.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__message.aboutToBeDeleted();
        this.__num.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get message() {
        return this.__message.get();
    }
    set message(newValue) {
        this.__message.set(newValue);
    }
    get num() {
        return this.__num.get();
    }
    set num(newValue) {
        this.__num.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.message);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.num === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Refresh.create({ refreshing: { value: this.message, changeEvent: newValue => { this.message = newValue; } } });
                    }, Refresh);
                    Refresh.pop();
                });
            }
            else if (this.num === 1) {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Refresh.create({ refreshing: { value: this.message, changeEvent: newValue => { this.message = newValue; } } });
                    }, Refresh);
                    Refresh.pop();
                });
            }
            else if (this.num === 2) {
                this.ifElseBranchUpdateFunction(2, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Refresh.create({ refreshing: { value: this.message, changeEvent: newValue => { this.message = newValue; } } });
                    }, Refresh);
                    Refresh.pop();
                });
            }
            else if (this.num === 3) {
                this.ifElseBranchUpdateFunction(3, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Refresh.create({ refreshing: { value: this.message, changeEvent: newValue => { this.message = newValue; } } });
                    }, Refresh);
                    Refresh.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(4, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Refresh.create({ refreshing: { value: this.message, changeEvent: newValue => { this.message = newValue; } } });
                    }, Refresh);
                    Refresh.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
        Row.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new Index(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`
