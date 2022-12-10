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
import { AllStarComponent } from './test/pages/ExportStarComponent'
import TsModule from './test/pages/TsModule'

@Entry
@Component
struct ImportTest {
  @State myState1: any = new TsModule(1).method();
  @State myState2: number = 0
  @State myState3: boolean = false
  @State myState4: string = 'ImportTest'

  build() {
    Column() {
      AllStarComponent.ExportComponent({
        ExportComponent1Link1: $myState1,
        ExportComponent1Link2: $myState2,
        ExportComponent1Link3: $myState3,
        ExportComponent1Link4: $myState4,
        indexState1: { count: 1 },
        indexState2: 1,
        indexState3: true,
        indexState4: 'ExportComponent1'
      })
      AllStarComponent.default({
        ExportComponent4Link1: $myState1,
        ExportComponent4Link2: $myState2,
        ExportComponent4Link3: $myState3,
        ExportComponent4Link4: $myState4,
        indexState1: { count: 1 },
        indexState2: 1,
        indexState3: true,
        indexState4: 'ExportComponent4'
      })
    }
  }
}
`

exports.expectResult =
`"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ExportStarComponent_1 = require("./test/pages/ExportStarComponent");
const TsModule_1 = __importDefault(require("./test/pages/TsModule"));
class ImportTest extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1) {
        super(parent, __localStorage, elmtId);
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
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Column.create();
            if (!isInitialRender) {
                Column.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        {
            this.observeComponentCreation((elmtId, isInitialRender) => {
                ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                if (isInitialRender) {
                    ViewPU.create(new ExportStarComponent_1.AllStarComponent.ExportComponent(this, {
                        ExportComponent1Link1: this.__myState1,
                        ExportComponent1Link2: this.__myState2,
                        ExportComponent1Link3: this.__myState3,
                        ExportComponent1Link4: this.__myState4,
                        indexState1: { count: 1 },
                        indexState2: 1,
                        indexState3: true,
                        indexState4: 'ExportComponent1'
                    }, undefined, elmtId));
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                }
                ViewStackProcessor.StopGetAccessRecording();
            });
        }
        {
            this.observeComponentCreation((elmtId, isInitialRender) => {
                ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                if (isInitialRender) {
                    ViewPU.create(new ExportStarComponent_1.AllStarComponent.default(this, {
                        ExportComponent4Link1: this.__myState1,
                        ExportComponent4Link2: this.__myState2,
                        ExportComponent4Link3: this.__myState3,
                        ExportComponent4Link4: this.__myState4,
                        indexState1: { count: 1 },
                        indexState2: 1,
                        indexState3: true,
                        indexState4: 'ExportComponent4'
                    }, undefined, elmtId));
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                }
                ViewStackProcessor.StopGetAccessRecording();
            });
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
