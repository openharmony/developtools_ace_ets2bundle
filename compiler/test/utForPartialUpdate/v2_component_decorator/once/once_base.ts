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

// @Once base case
exports.source = `
@ComponentV2
struct ChildComponent {
  @Param @Once onceParam: string = "";
  build() {
    Column() {
      Text('onceParam: ' + this.onceParam)
    }
  }
}
@Entry
@ComponentV2
struct MyComponent {
  @Local message: string = "Hello World";
  build() {
    Column() {
      Text('Parent message: ' + this.message)
      Button('change message')
        .onClick(() => {
          this.message = 'Hello Tomorrow';
        })
      ChildComponent({ onceParam: this.message })
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
class ChildComponent extends ViewV2 {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda, extraInfo) {
        super(parent, elmtId, extraInfo);
        this.initParam("onceParam", (params && "onceParam" in params) ? params.onceParam : "");
        this.finalizeConstruction();
    }
    initialRender() {
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.push(this);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('onceParam: ' + this.onceParam);
        }, Text);
        Text.pop();
        Column.pop();
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.pop();
    }
    updateStateVars(params) {
        if (params === undefined) {
            return;
        }
        if ("onceParam" in params) {
            this.updateParam("onceParam", params.onceParam);
        }
    }
    rerender() {
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.push(this);
        this.updateDirtyElements();
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.pop();
    }
}
__decorate([
    Param,
    Once
], ChildComponent.prototype, "onceParam", void 0);
class MyComponent extends ViewV2 {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda, extraInfo) {
        super(parent, elmtId, extraInfo);
        this.message = "Hello World";
        this.finalizeConstruction();
    }
    initialRender() {
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.push(this);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Parent message: ' + this.message);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('change message');
            Button.onClick(() => {
                this.message = 'Hello Tomorrow';
            });
        }, Button);
        Button.pop();
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new ChildComponent(this, { onceParam: this.message }, undefined, elmtId, () => { }, { page: "once_base.ets", line: 22, col: 7 });
                    ViewV2.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            onceParam: this.message
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        onceParam: this.message
                    });
                }
            }, { name: "ChildComponent" });
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
        return "MyComponent";
    }
}
__decorate([
    Local
], MyComponent.prototype, "message", void 0);
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new MyComponent(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`;
