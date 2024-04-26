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

exports.source = `
class ClassA {
  message: string
  constructor(message: string) {
    this.message = message
  }
}

@Entry
@Component
struct HomeComponent {
  @State arr: number[] = [0, 1, 2, 3, 4]

  build() {
    Column() {
      Repeat<number>(this.arr)
        .each((obj: RepeatItem<number>) => {
          ChildComponent()
        })
        .key((item: number, index: number) => {
          return JSON.stringify(item) +  JSON.stringify(index)
        })
    }
    .height(500)
  }
}

@Component
struct ChildComponent {
  @State arr: ClassA[] = [new ClassA('0'), new ClassA('1'), new ClassA('2')]
  count: number = 0;
  build() {
    Column() {
      Repeat<ClassA>(this.arr)
        .onMove((from: number, to: number)=>{
          this.count += 1;
        })
        .each((obj: RepeatItem<ClassA>) => {
          Text(obj.item.message)
        })
    }
    .height(500)
  }
}
`
exports.expectResult =
`"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
class ClassA {
    constructor(message) {
        this.message = message;
    }
}
class HomeComponent extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__arr = new ObservedPropertyObjectPU([0, 1, 2, 3, 4], this, "arr");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.arr !== undefined) {
            this.arr = params.arr;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__arr.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__arr.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get arr() {
        return this.__arr.get();
    }
    set arr(newValue) {
        this.__arr.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.height(500);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Repeat(this.arr, this).each((obj) => {
                {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        if (isInitialRender) {
                            let componentCall = new ChildComponent(this, {}, undefined, elmtId, () => { }, { page: "repeat.ets", line: 18, col: 11 });
                            ViewPU.create(componentCall);
                            let paramsLambda = () => {
                                return {};
                            };
                            componentCall.paramsGenerator_ = paramsLambda;
                        }
                        else {
                            this.updateStateVarsOfChildByElmtId(elmtId, {});
                        }
                    }, { name: "ChildComponent" });
                }
            })
                .key((item, index) => {
                return JSON.stringify(item) + JSON.stringify(index);
            }).render(isInitialRender);
        }, Repeat);
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
class ChildComponent extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__arr = new ObservedPropertyObjectPU([new ClassA('0'), new ClassA('1'), new ClassA('2')], this, "arr");
        this.count = 0;
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.arr !== undefined) {
            this.arr = params.arr;
        }
        if (params.count !== undefined) {
            this.count = params.count;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__arr.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__arr.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get arr() {
        return this.__arr.get();
    }
    set arr(newValue) {
        this.__arr.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.height(500);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Repeat(this.arr, this).onMove((from, to) => {
                this.count += 1;
            })
                .each((obj) => {
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(obj.item.message);
                }, Text);
                Text.pop();
            }).render(isInitialRender);
        }, Repeat);
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