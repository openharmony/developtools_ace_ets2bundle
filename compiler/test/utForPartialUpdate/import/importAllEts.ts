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
import * as AllComponent from './test/pages/NamespaceComponent'
import TsModule from './test/pages/TsModule'

@Entry
@Component
struct ImportTest {
  @State myState1: any = new TsModule(1).method()
  @State myState2: number = 0
  @State myState3: boolean = false
  @State myState4: string = 'ImportTest'

  build() {
    Column() {
        AllComponent.NamespaceComponent1({
            NamespaceComponent1Link1: $myState1,
            NamespaceComponent1Link2: $myState2,
            NamespaceComponent1Link3: $myState3,
            NamespaceComponent1Link4: $myState4,
            myVar: 100,
            myVar2: 80
          })
        AllComponent.NamespaceComponent1({
            NamespaceComponent1Link1: $myState1,
            NamespaceComponent1Link2: $myState2,
            NamespaceComponent1Link3: $myState3,
            NamespaceComponent1Link4: $myState4,
            myVar: 100,
            myVar2: 80
          })
          .width(100)
          AllComponent.default({
            NamespaceComponent3Link1: $myState1,
            NamespaceComponent3Link2: $myState2,
            NamespaceComponent3Link3: $myState3,
            NamespaceComponent3Link4: $myState4,
            myVar: 100,
            myVar2: 80
          })
          AllComponent.default({
            NamespaceComponent3Link1: $myState1,
            NamespaceComponent3Link2: $myState2,
            NamespaceComponent3Link3: $myState3,
            NamespaceComponent3Link4: $myState4,
            myVar: 100,
            myVar2: 80
          })
          .height(200)
    }
  }
}
`

exports.expectResult =
`"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
const AllComponent = __importStar(require("./test/pages/NamespaceComponent"));
const TsModule_1 = __importDefault(require("./test/pages/TsModule"));
class ImportTest extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__myState1 = new ObservedPropertyObjectPU(new TsModule_1.default(1).method(), this, "myState1");
        this.__myState2 = new ObservedPropertySimplePU(0, this, "myState2");
        this.__myState3 = new ObservedPropertySimplePU(false, this, "myState3");
        this.__myState4 = new ObservedPropertySimplePU('ImportTest', this, "myState4");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.myState1 !== undefined) {
            this.myState1 = params.myState1;
        }
        if (params.myState2 !== undefined) {
            this.myState2 = params.myState2;
        }
        if (params.myState3 !== undefined) {
            this.myState3 = params.myState3;
        }
        if (params.myState4 !== undefined) {
            this.myState4 = params.myState4;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__myState1.purgeDependencyOnElmtId(rmElmtId);
        this.__myState2.purgeDependencyOnElmtId(rmElmtId);
        this.__myState3.purgeDependencyOnElmtId(rmElmtId);
        this.__myState4.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__myState1.aboutToBeDeleted();
        this.__myState2.aboutToBeDeleted();
        this.__myState3.aboutToBeDeleted();
        this.__myState4.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get myState1() {
        return this.__myState1.get();
    }
    set myState1(newValue) {
        this.__myState1.set(newValue);
    }
    get myState2() {
        return this.__myState2.get();
    }
    set myState2(newValue) {
        this.__myState2.set(newValue);
    }
    get myState3() {
        return this.__myState3.get();
    }
    set myState3(newValue) {
        this.__myState3.set(newValue);
    }
    get myState4() {
        return this.__myState4.get();
    }
    set myState4(newValue) {
        this.__myState4.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new AllComponent.NamespaceComponent1(this, {
                        NamespaceComponent1Link1: this.__myState1,
                        NamespaceComponent1Link2: this.__myState2,
                        NamespaceComponent1Link3: this.__myState3,
                        NamespaceComponent1Link4: this.__myState4,
                        myVar: 100,
                        myVar2: 80
                    }, undefined, elmtId, () => { }, { page: "importAllEts.ets", line: 15, col: 9 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            NamespaceComponent1Link1: this.myState1,
                            NamespaceComponent1Link2: this.myState2,
                            NamespaceComponent1Link3: this.myState3,
                            NamespaceComponent1Link4: this.myState4,
                            myVar: 100,
                            myVar2: 80
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                }
            }, { name: "NamespaceComponent1" });
        }
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            __Common__.create();
            __Common__.width(100);
        }, __Common__);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new AllComponent.NamespaceComponent1(this, {
                        NamespaceComponent1Link1: this.__myState1,
                        NamespaceComponent1Link2: this.__myState2,
                        NamespaceComponent1Link3: this.__myState3,
                        NamespaceComponent1Link4: this.__myState4,
                        myVar: 100,
                        myVar2: 80
                    }, undefined, elmtId, () => { }, { page: "importAllEts.ets", line: 23, col: 9 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            NamespaceComponent1Link1: this.myState1,
                            NamespaceComponent1Link2: this.myState2,
                            NamespaceComponent1Link3: this.myState3,
                            NamespaceComponent1Link4: this.myState4,
                            myVar: 100,
                            myVar2: 80
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                }
            }, { name: "NamespaceComponent1" });
        }
        __Common__.pop();
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new AllComponent.default(this, {
                        NamespaceComponent3Link1: this.__myState1,
                        NamespaceComponent3Link2: this.__myState2,
                        NamespaceComponent3Link3: this.__myState3,
                        NamespaceComponent3Link4: this.__myState4,
                        myVar: 100,
                        myVar2: 80
                    }, undefined, elmtId, () => { }, { page: "importAllEts.ets", line: 32, col: 11 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            NamespaceComponent3Link1: this.myState1,
                            NamespaceComponent3Link2: this.myState2,
                            NamespaceComponent3Link3: this.myState3,
                            NamespaceComponent3Link4: this.myState4,
                            myVar: 100,
                            myVar2: 80
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                }
            }, { name: "default" });
        }
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            __Common__.create();
            __Common__.height(200);
        }, __Common__);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new AllComponent.default(this, {
                        NamespaceComponent3Link1: this.__myState1,
                        NamespaceComponent3Link2: this.__myState2,
                        NamespaceComponent3Link3: this.__myState3,
                        NamespaceComponent3Link4: this.__myState4,
                        myVar: 100,
                        myVar2: 80
                    }, undefined, elmtId, () => { }, { page: "importAllEts.ets", line: 40, col: 11 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            NamespaceComponent3Link1: this.myState1,
                            NamespaceComponent3Link2: this.myState2,
                            NamespaceComponent3Link3: this.myState3,
                            NamespaceComponent3Link4: this.myState4,
                            myVar: 100,
                            myVar2: 80
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                }
            }, { name: "default" });
        }
        __Common__.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new ImportTest(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`
