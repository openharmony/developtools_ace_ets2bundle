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
let NextID : number = 0;

@Observed class ClassA {
  public id : number;
  public c: number;
  constructor(c: number) {
    this.id = NextID++;
    this.c = c;
  }
}

@Observed class ClassB {
  public a: ClassA;
  constructor(a: ClassA) {
    this.a = a;
  }
}

@Component
struct ViewA {
  @ObjectLink varA : ClassA;
  build() {
    Row() {
      Text('ViewA-' + this.varA.id)
    }
  }
}

@Entry
@Component
struct ViewB {
  @State varB : ClassB = new ClassB(new ClassA(0));
  build() {
    Column() {
      Row() {
        ViewA({ varA: this.varB.a })
        Text('ViewB')
      }
    }
  }
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
let NextID = 0;
let ClassA = class ClassA {
    constructor(c) {
        this.id = NextID++;
        this.c = c;
    }
};
ClassA = __decorate([
    Observed
], ClassA);
let ClassB = class ClassB {
    constructor(a) {
        this.a = a;
    }
};
ClassB = __decorate([
    Observed
], ClassB);
class ViewA extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__varA = new SynchedPropertyNesedObjectPU(params.varA, this, "varA");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        this.__varA.set(params.varA);
    }
    updateStateVars(params) {
        this.__varA.set(params.varA);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__varA.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__varA.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get varA() {
        return this.__varA.get();
    }
    initialRender() {
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.push(this);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('ViewA-' + this.varA.id);
        }, Text);
        Text.pop();
        Row.pop();
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.pop();
    }
    rerender() {
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.push(this);
        this.updateDirtyElements();
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.pop();
    }
}
class ViewB extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__varB = new ObservedPropertyObjectPU(new ClassB(new ClassA(0)), this, "varB");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.varB !== undefined) {
            this.varB = params.varB;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__varB.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__varB.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get varB() {
        return this.__varB.get();
    }
    set varB(newValue) {
        this.__varB.set(newValue);
    }
    initialRender() {
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.push(this);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
        }, Row);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new ViewA(this, { varA: this.varB.a }, undefined, elmtId, () => { }, { page: "@observed_@objectLink.ets", line: 37, col: 9 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            varA: this.varB.a
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        varA: this.varB.a
                    });
                }
            }, { name: "ViewA" });
        }
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('ViewB');
        }, Text);
        Text.pop();
        Row.pop();
        Column.pop();
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.pop();
    }
    rerender() {
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.push(this);
        this.updateDirtyElements();
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.pop();
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new ViewB(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`
