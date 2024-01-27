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
import
LinkComponentDefault, {
  LinkComponent as LinkComponent1Ref,
  LinkComponent2 as LinkComponent2Ref,
  LinkComponent3
} from './test/pages/LinkComponent'
import DefaultComponent from "./test/pages/DefaultComponent"
import AMDComponentDefault = require('./test/pages/AMDComponent')
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
      LinkComponent2Ref({
        LinkComponent2Link1: $myState1,
        LinkComponent2Link2: $myState2,
        LinkComponent2Link3: $myState3,
        LinkComponent2Link4: $myState4,
        indexState1: { count: 1 },
        indexState2: 1,
        indexState3: true,
        indexState4: 'LinkComponent2'
      })
      Text('space')
        .fontSize(20)
        .fontColor(Color.Red)
      LinkComponent1Ref({
        LinkComponent1Link1: $myState1,
        LinkComponent1Link2: $myState2,
        LinkComponent1Link3: $myState3,
        LinkComponent1Link4: $myState4,
        indexState1: { count: 1 },
        indexState2: 1,
        indexState3: true,
        indexState4: 'LinkComponent1'
      })
      DefaultComponent({
        DefaultComponentLink1: $myState1,
        DefaultComponentLink2: $myState2,
        DefaultComponentLink3: $myState3,
        DefaultComponentLink4: $myState4,
        myVar: 100,
        myVar2: 100
      })
      LinkComponentDefault({
        LinkComponent3Link1: $myState1,
        LinkComponent3Link2: $myState2,
        LinkComponent3Link3: $myState3,
        LinkComponent3Link4: $myState4,
        indexState1: { count: 1 },
        indexState2: 1,
        indexState3: true,
        indexState4: 'LinkComponent3'
      })
      AMDComponentDefault({
        AMDComponentLink1: $myState1,
        AMDComponentLink2: $myState2,
        AMDComponentLink3: $myState3,
        AMDComponentLink4: $myState4,
        myVar: 100,
        myVar2: 100
      })
      LinkComponent3({
        LinkComponent3Link1: $myState1,
        LinkComponent3Link2: $myState2,
        LinkComponent3Link3: $myState3,
        LinkComponent3Link4: $myState4,
        indexState1: { count: 1 },
        indexState2: 1,
        indexState3: true,
        indexState4: 'LinkComponent1'
      })
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
const LinkComponent_1 = __importStar(require("./test/pages/LinkComponent"));
const DefaultComponent_1 = __importDefault(require("./test/pages/DefaultComponent"));
const AMDComponentDefault = require("./test/pages/AMDComponent");
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
                    let componentCall = new LinkComponent_1.LinkComponent2(this, {
                        LinkComponent2Link1: this.__myState1,
                        LinkComponent2Link2: this.__myState2,
                        LinkComponent2Link3: this.__myState3,
                        LinkComponent2Link4: this.__myState4,
                        indexState1: { count: 1 },
                        indexState2: 1,
                        indexState3: true,
                        indexState4: 'LinkComponent2'
                    }, undefined, elmtId, () => { }, { page: "importEts.ets", line: 22 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            LinkComponent2Link1: this.myState1,
                            LinkComponent2Link2: this.myState2,
                            LinkComponent2Link3: this.myState3,
                            LinkComponent2Link4: this.myState4,
                            indexState1: { count: 1 },
                            indexState2: 1,
                            indexState3: true,
                            indexState4: 'LinkComponent2'
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                }
            }, { name: "LinkComponent2Ref" });
        }
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('space');
            Text.fontSize(20);
            Text.fontColor(Color.Red);
        }, Text);
        Text.pop();
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new LinkComponent_1.LinkComponent(this, {
                        LinkComponent1Link1: this.__myState1,
                        LinkComponent1Link2: this.__myState2,
                        LinkComponent1Link3: this.__myState3,
                        LinkComponent1Link4: this.__myState4,
                        indexState1: { count: 1 },
                        indexState2: 1,
                        indexState3: true,
                        indexState4: 'LinkComponent1'
                    }, undefined, elmtId, () => { }, { page: "importEts.ets", line: 35 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            LinkComponent1Link1: this.myState1,
                            LinkComponent1Link2: this.myState2,
                            LinkComponent1Link3: this.myState3,
                            LinkComponent1Link4: this.myState4,
                            indexState1: { count: 1 },
                            indexState2: 1,
                            indexState3: true,
                            indexState4: 'LinkComponent1'
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                }
            }, { name: "LinkComponent1Ref" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new DefaultComponent_1.default(this, {
                        DefaultComponentLink1: this.__myState1,
                        DefaultComponentLink2: this.__myState2,
                        DefaultComponentLink3: this.__myState3,
                        DefaultComponentLink4: this.__myState4,
                        myVar: 100,
                        myVar2: 100
                    }, undefined, elmtId, () => { }, { page: "importEts.ets", line: 45 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            DefaultComponentLink1: this.myState1,
                            DefaultComponentLink2: this.myState2,
                            DefaultComponentLink3: this.myState3,
                            DefaultComponentLink4: this.myState4,
                            myVar: 100,
                            myVar2: 100
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                }
            }, { name: "DefaultComponent" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new LinkComponent_1.default(this, {
                        LinkComponent3Link1: this.__myState1,
                        LinkComponent3Link2: this.__myState2,
                        LinkComponent3Link3: this.__myState3,
                        LinkComponent3Link4: this.__myState4,
                        indexState1: { count: 1 },
                        indexState2: 1,
                        indexState3: true,
                        indexState4: 'LinkComponent3'
                    }, undefined, elmtId, () => { }, { page: "importEts.ets", line: 53 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            LinkComponent3Link1: this.myState1,
                            LinkComponent3Link2: this.myState2,
                            LinkComponent3Link3: this.myState3,
                            LinkComponent3Link4: this.myState4,
                            indexState1: { count: 1 },
                            indexState2: 1,
                            indexState3: true,
                            indexState4: 'LinkComponent3'
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                }
            }, { name: "LinkComponentDefault" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new AMDComponentDefault(this, {
                        AMDComponentLink1: this.__myState1,
                        AMDComponentLink2: this.__myState2,
                        AMDComponentLink3: this.__myState3,
                        AMDComponentLink4: this.__myState4,
                        myVar: 100,
                        myVar2: 100
                    }, undefined, elmtId, () => { }, { page: "importEts.ets", line: 63 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            AMDComponentLink1: this.myState1,
                            AMDComponentLink2: this.myState2,
                            AMDComponentLink3: this.myState3,
                            AMDComponentLink4: this.myState4,
                            myVar: 100,
                            myVar2: 100
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                }
            }, { name: "AMDComponentDefault" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new LinkComponent_1.LinkComponent3(this, {
                        LinkComponent3Link1: this.__myState1,
                        LinkComponent3Link2: this.__myState2,
                        LinkComponent3Link3: this.__myState3,
                        LinkComponent3Link4: this.__myState4,
                        indexState1: { count: 1 },
                        indexState2: 1,
                        indexState3: true,
                        indexState4: 'LinkComponent1'
                    }, undefined, elmtId, () => { }, { page: "importEts.ets", line: 71 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            LinkComponent3Link1: this.myState1,
                            LinkComponent3Link2: this.myState2,
                            LinkComponent3Link3: this.myState3,
                            LinkComponent3Link4: this.myState4,
                            indexState1: { count: 1 },
                            indexState2: 1,
                            indexState3: true,
                            indexState4: 'LinkComponent1'
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                }
            }, { name: "LinkComponent3" });
        }
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
