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
@Entry
@Component
struct ComA {
  uiModule = new TestUlModule4()
  build() {
    Row() {
      FeedComponent({
        createView: this.uiModule.createView()
      })
    }
  }

}

@Component
struct FeedComponent {
  @BuilderParam createView: () =>void
  build() {
  this.createView()
  }
}

class TestUlModule4 {
  builderVar
  createView(): () => void {
    return this.builderVar.builder
  }
}
`
exports.expectResult =
`"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
class ComA extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.uiModule = new TestUlModule4();
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.uiModule !== undefined) {
            this.uiModule = params.uiModule;
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
            Row.create();
        }, Row);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new FeedComponent(this, {
                        createView: typeof this.uiModule.createView() === "function" ? this.uiModule.createView() : () => {
                            this.uiModule.createView();
                        }
                    }, undefined, elmtId, () => { }, { page: "@BuilderParamReturnType.ets", line: 8 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            createView: this.uiModule.createView()
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                }
            }, { name: "FeedComponent" });
        }
        Row.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
class FeedComponent extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.createView = undefined;
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.createView !== undefined) {
            this.createView = params.createView;
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
        this.createView.bind(this)();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
class TestUlModule4 {
    createView() {
        return this.builderVar.builder;
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new ComA(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`