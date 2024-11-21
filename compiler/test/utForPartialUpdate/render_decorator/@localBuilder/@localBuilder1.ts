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

// @LocalBuilder Order of use UT
exports.source = `
class ReferenceType {
  paramString: string = '';
}

@Entry
@Component
struct localBuilderTest {
  @State variableValue: string = 'Hello World';

  build() {
    Column() {
      this.citeLocalBuilder({ paramString: this.variableValue });
      Button('Click me').onClick(() => {
        this.variableValue = 'Hi World';
      })
    }
  }

  @LocalBuilder
  citeLocalBuilder(params: ReferenceType) {
    Row() {
    }
  };
}
`
exports.expectResult =
`"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
if (PUV2ViewBase.contextStack === undefined) {
    Reflect.set(PUV2ViewBase, "contextStack", []);
}
class ReferenceType {
    constructor() {
        this.paramString = '';
    }
}
class localBuilderTest extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        this.citeLocalBuilder = (params) => {
            const parent = PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.length ? PUV2ViewBase.contextStack[PUV2ViewBase.contextStack.length - 1] : null;
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                Row.create();
            }, Row);
            Row.pop();
        };
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__variableValue = new ObservedPropertySimplePU('Hello World', this, "variableValue");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.variableValue !== undefined) {
            this.variableValue = params.variableValue;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__variableValue.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__variableValue.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get variableValue() {
        return this.__variableValue.get();
    }
    set variableValue(newValue) {
        this.__variableValue.set(newValue);
    }
    initialRender() {
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.push(this);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.citeLocalBuilder.bind(this)(makeBuilderParameterProxy("citeLocalBuilder", { paramString: () => (this["__variableValue"] ? this["__variableValue"] : this["variableValue"]) }));
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('Click me');
            Button.onClick(() => {
                this.variableValue = 'Hi World';
            });
        }, Button);
        Button.pop();
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
loadDocument(new localBuilderTest(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`
