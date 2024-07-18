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
function func1(){}

@Component
struct Child {
  @BuilderParam build1: ()=>void
  build() {
    Text('Child')
  }
}

@Entry
@Component
struct Parent {
  build() {
    Column() {
      ForEach([1], (item: number)=>{
        Column(){
          Child() {
            Text('example1')
          }
          Repeat([1])
            .each((repeatItem: RepeatItem<number>)=>{
              Child() {
                Text('example2')
              }
              Text('example6')
                .onClick(()=>{
                  func1()
                  {
                    let b = 1;
                  }
                })
            })
            .key((item: number)=>{
              func1()
              {
                let b = 1;
              }
              return item.toString()
            })
            .template('1', (repeatItem: RepeatItem<number>)=>{
              Child() {
                Text('example3')
              }
              Text('example4')
                .onClick(()=>{
                  func1()
                  {
                    let b = 1;
                  }
                })
            })
        }
      }, (item: number)=>{
        return item.toString()
      })
    }.onClick(()=>{
      func1()
      {
        let b = 1;
      }
    })
  }
}`;

exports.expectResult =
`"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
function func1() { }
class Child extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.build1 = undefined;
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.build1 !== undefined) {
            this.build1 = params.build1;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Child');
        }, Text);
        Text.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
class Parent extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.onClick(() => {
                func1();
                {
                    let b = 1;
                }
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const item = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Column.create();
                }, Column);
                {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        if (isInitialRender) {
                            let componentCall = new Child(this, {
                                build1: () => {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create('example1');
                                    }, Text);
                                    Text.pop();
                                }
                            }, undefined, elmtId, () => { }, { page: "build_ui_in_correct_place.ets", line: 19, col: 11 });
                            ViewPU.create(componentCall);
                            let paramsLambda = () => {
                                return {
                                    build1: () => {
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create('example1');
                                        }, Text);
                                        Text.pop();
                                    }
                                };
                            };
                            componentCall.paramsGenerator_ = paramsLambda;
                        }
                        else {
                            this.updateStateVarsOfChildByElmtId(elmtId, {});
                        }
                    }, { name: "Child" });
                }
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Repeat([1], this).each((repeatItem) => {
                        {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                if (isInitialRender) {
                                    let componentCall = new Child(this, {
                                        build1: () => {
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                Text.create('example2');
                                            }, Text);
                                            Text.pop();
                                        }
                                    }, undefined, elmtId, () => { }, { page: "build_ui_in_correct_place.ets", line: 24, col: 15 });
                                    ViewPU.create(componentCall);
                                    let paramsLambda = () => {
                                        return {
                                            build1: () => {
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Text.create('example2');
                                                }, Text);
                                                Text.pop();
                                            }
                                        };
                                    };
                                    componentCall.paramsGenerator_ = paramsLambda;
                                }
                                else {
                                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                                }
                            }, { name: "Child" });
                        }
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create('example6');
                            Text.onClick(() => {
                                func1();
                                {
                                    let b = 1;
                                }
                            });
                        }, Text);
                        Text.pop();
                    })
                        .key((item) => {
                        func1();
                        {
                            let b = 1;
                        }
                        return item.toString();
                    })
                        .template('1', (repeatItem) => {
                        {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                if (isInitialRender) {
                                    let componentCall = new Child(this, {
                                        build1: () => {
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                Text.create('example3');
                                            }, Text);
                                            Text.pop();
                                        }
                                    }, undefined, elmtId, () => { }, { page: "build_ui_in_correct_place.ets", line: 43, col: 15 });
                                    ViewPU.create(componentCall);
                                    let paramsLambda = () => {
                                        return {
                                            build1: () => {
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Text.create('example3');
                                                }, Text);
                                                Text.pop();
                                            }
                                        };
                                    };
                                    componentCall.paramsGenerator_ = paramsLambda;
                                }
                                else {
                                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                                }
                            }, { name: "Child" });
                        }
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create('example4');
                            Text.onClick(() => {
                                func1();
                                {
                                    let b = 1;
                                }
                            });
                        }, Text);
                        Text.pop();
                    }).render(isInitialRender);
                }, Repeat);
                Column.pop();
            };
            this.forEachUpdateFunction(elmtId, [1], forEachItemGenFunction, (item) => {
                return item.toString();
            }, false, false);
        }, ForEach);
        ForEach.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new Parent(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`;
