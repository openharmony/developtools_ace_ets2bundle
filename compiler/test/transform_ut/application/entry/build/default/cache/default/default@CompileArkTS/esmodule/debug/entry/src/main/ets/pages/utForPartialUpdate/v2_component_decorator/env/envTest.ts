/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
return c > 3 && r && Object.defineProperty(target, key, r), r;
};
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}

class testNon extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__message = new ObservedPropertySimplePU('Hello world', this, "message");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.message !== undefined) {
            this.message = params.message;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__message.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__message.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }

    get message() {
        return this.__message.get();
    }
    set message(newValue) {
        this.__message.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
        }, Row);
        builderTest.bind(this)(this.message);
        Row.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName() {
        return "testNon";
    }
}
class testNonV2 extends ViewV2 {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda, extraInfo) {
        super(parent, elmtId, extraInfo);
        this.initParam("test", (params && "test" in params) ? params.test : undefined);
        this.finalizeConstruction();
    }
   resetStateVarsOnReuse(params) {
        this.resetParam("test", (params && "test" in params) ? params.test : undefined);
    }

    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.test);
            Text.fontSize(30);
        }, Text);
        Text.pop();
        Row.pop();
    }
    updateStateVars(params) {
        if (params === undefined) {
            return;
        }
        if ("test" in params) {
            this.updateParam("test", params.test);
        }
    }
    rerender() {
        this.updateDirtyElements();
    }
}
__decorate([
   Param
], testNonV2.prototype, "test", void 0);

function builderTest($$, parent = null) {
    const __$$__ = $$;
    {
        (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, $$ = __$$__) => {
            if (isInitialRender) {
                let componentCall = new testNonV2(parent ? parent : this, { test: this.__$ }, undefined, elmtId, () => { }, { page: "test/transform_ut/application/entry/src/main/ets/pages/utForPartialUpdate/v2_component_decorator/env/envTest.ets", line: 39, col: 3 });
                ViewV2.create(componentCall);
                let paramsLambda = () => {
                    return {
                        test: this.$
                    };
                };
                componentCall.paramsGenerator_ = paramsLambda;
            }
            else {
                (parent ? parent : this).updateStateVarsOfChildByElmtId(elmtId, {
                    test: this.__$
                });
            }
        }, { name: "testNonV2" });
    }
}
registerNamedRoute(() => new testNon(undefined, {}), "", { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/v2_component_decorator/env/envTest", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/v2_component_decorator/env/envTest", integratedHsp: "false", moduleType: "followWithHap" });
//# sourceMappingURL=envTest.js.map
