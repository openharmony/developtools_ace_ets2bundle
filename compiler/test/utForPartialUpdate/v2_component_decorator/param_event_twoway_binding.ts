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
@Entry
@ComponentV2
struct HomeComponent {
  @Local local_value: string = "Foo"

  build() {
    Column() {
      TestParam({
        paramValue: this.local_value!!,
        paramValue1: "hello HomeComponent"
      })
      TestParam1({
        paramValue: "hello HomeComponent",
        myEvent: (newVal: string) => { this.local_value = newVal },
        myEvent1: (newVal: string) => this.local_value = newVal
      })
    }
  }
}

@ComponentV2
struct TestParam {
  // Two way binding
  @Param paramValue: string = "hello TestParam"
  @Event $paramValue: (value: string) => void = (value: string) => {}
  @Require @Param paramValue1: string
  
  build() {}
}

@ComponentV2
struct TestParam1 {
  @Param paramValue: string = "hello TestParam1"
  @Event myEvent: (newVal: number) => void = (newVal: number) => {}
  @Event myEvent1: (newVal: number) => void
  
  build() {}
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
if (PUV2ViewBase.contextStack === undefined) {
    Reflect.set(PUV2ViewBase, "contextStack", []);
}
class HomeComponent extends ViewV2 {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda, extraInfo) {
        super(parent, elmtId, extraInfo);
        this.local_value = "Foo";
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
                    let componentCall = new TestParam(this, {
                        paramValue: this.local_value,
                        paramValue1: "hello HomeComponent",
                        $paramValue: value => { this.local_value = value; }
                    }, undefined, elmtId, () => { }, { page: "param_event_twoway_binding.ets", line: 9, col: 7 });
                    ViewV2.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            paramValue: this.local_value,
                            paramValue1: "hello HomeComponent"
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        paramValue: this.local_value,
                        paramValue1: "hello HomeComponent"
                    });
                }
            }, { name: "TestParam" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new TestParam1(this, {
                        paramValue: "hello HomeComponent",
                        myEvent: (newVal) => { this.local_value = newVal; },
                        myEvent1: (newVal) => this.local_value = newVal
                    }, undefined, elmtId, () => { }, { page: "param_event_twoway_binding.ets", line: 13, col: 7 });
                    ViewV2.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            paramValue: "hello HomeComponent",
                            myEvent: (newVal) => { this.local_value = newVal; },
                            myEvent1: (newVal) => this.local_value = newVal
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        paramValue: "hello HomeComponent"
                    });
                }
            }, { name: "TestParam1" });
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
        return "HomeComponent";
    }
}
__decorate([
    Local
], HomeComponent.prototype, "local_value", void 0);
class TestParam extends ViewV2 {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda, extraInfo) {
        super(parent, elmtId, extraInfo);
        this.initParam("paramValue", (params && "paramValue" in params) ? params.paramValue : "hello TestParam");
        this.$paramValue = "$paramValue" in params ? params.$paramValue : (value) => { };
        this.initParam("paramValue1", (params && "paramValue1" in params) ? params.paramValue1 : undefined);
        this.finalizeConstruction();
    }
    initialRender() { }
    updateStateVars(params) {
        if (params === undefined) {
            return;
        }
        if ("paramValue" in params) {
            this.updateParam("paramValue", params.paramValue);
        }
        if ("paramValue1" in params) {
            this.updateParam("paramValue1", params.paramValue1);
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
], TestParam.prototype, "paramValue", void 0);
__decorate([
    Event
], TestParam.prototype, "$paramValue", void 0);
__decorate([
    Param
], TestParam.prototype, "paramValue1", void 0);
class TestParam1 extends ViewV2 {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda, extraInfo) {
        super(parent, elmtId, extraInfo);
        this.initParam("paramValue", (params && "paramValue" in params) ? params.paramValue : "hello TestParam1");
        this.myEvent = "myEvent" in params ? params.myEvent : (newVal) => { };
        this.myEvent1 = "myEvent1" in params ? params.myEvent1 : undefined;
        this.finalizeConstruction();
    }
    initialRender() { }
    updateStateVars(params) {
        if (params === undefined) {
            return;
        }
        if ("paramValue" in params) {
            this.updateParam("paramValue", params.paramValue);
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
], TestParam1.prototype, "paramValue", void 0);
__decorate([
    Event
], TestParam1.prototype, "myEvent", void 0);
__decorate([
    Event
], TestParam1.prototype, "myEvent1", void 0);
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new HomeComponent(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`