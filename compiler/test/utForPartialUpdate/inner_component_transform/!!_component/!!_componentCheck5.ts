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
 * This is a test case about the use of "!!" two-way sync binding in the attribute 'bindSheet'.
 */
exports.source = `
@Entry
@Component
struct SheetTransitionExample {
  @State isShow: boolean = false
  @State sheetHeight: number = 300;

  @Builder
  myBuilder() {
    Column() {
      Button("change height")
        .onClick(() => {
          this.sheetHeight = 500;
        })

      Button("Set Illegal height")
        .onClick(() => {
          this.sheetHeight = -1;
        })

      Button("close modal 1")
        .onClick(() => {
          this.isShow = false;
        })
    }
    .width('100%')
    .height('100%')
  }

  build() {
    Column() {
      Button("transition modal 1")
        .onClick(() => {
          this.isShow = true
        })
        .fontSize(20)
        .margin(10)
        .bindSheet(this.isShow!!, this.myBuilder(), {
          height: this.sheetHeight,
          backgroundColor: Color.Green,
          onWillAppear: () => {
            console.log("BindSheet onWillAppear.")
          },
          onAppear: () => {
            console.log("BindSheet onAppear.")
          },
          onWillDisappear: () => {
            console.log("BindSheet onWillDisappear.")
          },
          onDisappear: () => {
            console.log("BindSheet onDisappear.")
          }
        })
    }
  }
}
`

exports.expectResult =
`"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
class SheetTransitionExample extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__isShow = new ObservedPropertySimplePU(false, this, "isShow");
        this.__sheetHeight = new ObservedPropertySimplePU(300, this, "sheetHeight");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.isShow !== undefined) {
            this.isShow = params.isShow;
        }
        if (params.sheetHeight !== undefined) {
            this.sheetHeight = params.sheetHeight;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__isShow.purgeDependencyOnElmtId(rmElmtId);
        this.__sheetHeight.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__isShow.aboutToBeDeleted();
        this.__sheetHeight.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get isShow() {
        return this.__isShow.get();
    }
    set isShow(newValue) {
        this.__isShow.set(newValue);
    }
    get sheetHeight() {
        return this.__sheetHeight.get();
    }
    set sheetHeight(newValue) {
        this.__sheetHeight.set(newValue);
    }
    myBuilder(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel("change height");
            Button.onClick(() => {
                this.sheetHeight = 500;
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel("Set Illegal height");
            Button.onClick(() => {
                this.sheetHeight = -1;
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel("close modal 1");
            Button.onClick(() => {
                this.isShow = false;
            });
        }, Button);
        Button.pop();
        Column.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel("transition modal 1");
            Button.onClick(() => {
                this.isShow = true;
            });
            Button.fontSize(20);
            Button.margin(10);
            Button.bindSheet({ value: this.isShow, $value: newValue => { this.isShow = newValue; } }, { builder: () => {
                    this.myBuilder.call(this);
                } }, {
                height: this.sheetHeight,
                backgroundColor: Color.Green,
                onWillAppear: () => {
                    console.log("BindSheet onWillAppear.");
                },
                onAppear: () => {
                    console.log("BindSheet onAppear.");
                },
                onWillDisappear: () => {
                    console.log("BindSheet onWillDisappear.");
                },
                onDisappear: () => {
                    console.log("BindSheet onDisappear.");
                }
            });
        }, Button);
        Button.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new SheetTransitionExample(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`
