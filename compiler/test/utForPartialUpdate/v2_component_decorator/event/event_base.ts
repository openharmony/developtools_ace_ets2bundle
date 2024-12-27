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

// @Event base case
exports.source = `
@Entry
@ComponentV2
struct Index {
  @Local title: string = "Title One";
  @Local fontColor: Color = Color.Red;

  build() {
    Column() {
      Child({
        title: this.title,
        fontColor: this.fontColor,
        changeFactory: (type: number) => {
          if (type == 1) {
            this.title = "Title One";
            this.fontColor = Color.Red;
          } else if (type == 2) {
            this.title = "Title Two";
            this.fontColor = Color.Green;
          }
        }
      })
    }
  }
}

@ComponentV2
struct Child {
  @Param title: string = "";
  @Param fontColor: Color = Color.Black;
  @Event changeFactory: (x: number) => void = (x: number) => {};

  build() {
    Column() {
      Text("" + this.title)
        .fontColor(this.fontColor)
      Button("change to Title Two")
        .onClick(() => {
          this.changeFactory(2);
        })
      Button("change to Title One")
        .onClick(() => {
          this.changeFactory(1);
        })
    }
  }
}
`;
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
if (PUV2ViewBase.contextStack === undefined) {
    Reflect.set(PUV2ViewBase, "contextStack", []);
}
class Index extends ViewV2 {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda, extraInfo) {
        super(parent, elmtId, extraInfo);
        this.title = "Title One";
        this.fontColor = Color.Red;
        this.finalizeConstruction();
    }
    initialRender() {
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.push(this);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new Child(this, {
                        title: this.title,
                        fontColor: this.fontColor,
                        changeFactory: (type) => {
                            if (type == 1) {
                                this.title = "Title One";
                                this.fontColor = Color.Red;
                            }
                            else if (type == 2) {
                                this.title = "Title Two";
                                this.fontColor = Color.Green;
                            }
                        }
                    }, undefined, elmtId, () => { }, { page: "event_base.ets", line: 10, col: 7 });
                    ViewV2.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            title: this.title,
                            fontColor: this.fontColor,
                            changeFactory: (type) => {
                                if (type == 1) {
                                    this.title = "Title One";
                                    this.fontColor = Color.Red;
                                }
                                else if (type == 2) {
                                    this.title = "Title Two";
                                    this.fontColor = Color.Green;
                                }
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        title: this.title,
                        fontColor: this.fontColor
                    });
                }
            }, { name: "Child" });
        }
        Column.pop();
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.pop();
    }
    rerender() {
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.push(this);
        this.updateDirtyElements();
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.pop();
    }
    static getEntryName() {
        return "Index";
    }
}
__decorate([
    Local
], Index.prototype, "title", void 0);
__decorate([
    Local
], Index.prototype, "fontColor", void 0);
class Child extends ViewV2 {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda, extraInfo) {
        super(parent, elmtId, extraInfo);
        this.initParam("title", (params && "title" in params) ? params.title : "");
        this.initParam("fontColor", (params && "fontColor" in params) ? params.fontColor : Color.Black);
        this.changeFactory = "changeFactory" in params ? params.changeFactory : (x) => { };
        this.finalizeConstruction();
    }
    initialRender() {
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.push(this);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("" + this.title);
            Text.fontColor(this.fontColor);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel("change to Title Two");
            Button.onClick(() => {
                this.changeFactory(2);
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel("change to Title One");
            Button.onClick(() => {
                this.changeFactory(1);
            });
        }, Button);
        Button.pop();
        Column.pop();
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.pop();
    }
    updateStateVars(params) {
        if (params === undefined) {
            return;
        }
        if ("title" in params) {
            this.updateParam("title", params.title);
        }
        if ("fontColor" in params) {
            this.updateParam("fontColor", params.fontColor);
        }
    }
    rerender() {
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.push(this);
        this.updateDirtyElements();
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.pop();
    }
}
__decorate([
    Param
], Child.prototype, "title", void 0);
__decorate([
    Param
], Child.prototype, "fontColor", void 0);
__decorate([
    Event
], Child.prototype, "changeFactory", void 0);
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new Index(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`;
