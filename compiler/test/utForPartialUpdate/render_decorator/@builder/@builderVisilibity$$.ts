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
interface Model {
  readonly vis: Boolean;
  readonly data: Array<String>;
  readonly width: number;

}

@Builder function comp($$: Model) {
  Column() {
    Child()
      .visibility($$.vis ? Visibility.Visible : Visibility.Hidden)
      .width($$.vis ? 100: 200)
  }
}

@Component
struct Child {
  build() {
    Text('TEST')
  }
}

@Entry
@Component
export struct visibility$$Demo {
  @State data: Array<String> = [];
  @State vis: Boolean = false;
  @State w: number = 100;

  aboutToAppear(): void {
    this.data = ['test', 'test2']
  }

  build() {
    Column() {
      comp({vis: this.vis, data: this.data, width: this.w})
    }
    .height('100%')
  }
}
`
exports.expectResult =
`"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visibility$$Demo = void 0;
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
function comp($$, parent = null) {
    const __$$__ = $$;
    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, $$ = __$$__) => {
        Column.create();
    }, Column);
    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, $$ = __$$__) => {
        __Common__.create();
        __Common__.visibility($$.vis ? Visibility.Visible : Visibility.Hidden);
        __Common__.width($$.vis ? 100 : 200);
    }, __Common__);
    {
        (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, $$ = __$$__) => {
            if (isInitialRender) {
                let componentCall = new Child(typeof PUV2ViewBase !== "undefined" && parent instanceof PUV2ViewBase ? parent : this, {}, undefined, elmtId, () => { }, { page: "@builderVisilibity$$.ets", line: 11, col: 5 });
                ViewPU.create(componentCall);
                let paramsLambda = () => {
                    return {};
                };
                componentCall.paramsGenerator_ = paramsLambda;
            }
            else {
                (parent ? parent : this).updateStateVarsOfChildByElmtId(elmtId, {});
            }
        }, { name: "Child" });
    }
    __Common__.pop();
    Column.pop();
}
class Child extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
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
            Text.create('TEST');
        }, Text);
        Text.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
class visibility$$Demo extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__data = new ObservedPropertyObjectPU([], this, "data");
        this.__vis = new ObservedPropertyObjectPU(false, this, "vis");
        this.__w = new ObservedPropertySimplePU(100, this, "w");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.data !== undefined) {
            this.data = params.data;
        }
        if (params.vis !== undefined) {
            this.vis = params.vis;
        }
        if (params.w !== undefined) {
            this.w = params.w;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__data.purgeDependencyOnElmtId(rmElmtId);
        this.__vis.purgeDependencyOnElmtId(rmElmtId);
        this.__w.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__data.aboutToBeDeleted();
        this.__vis.aboutToBeDeleted();
        this.__w.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get data() {
        return this.__data.get();
    }
    set data(newValue) {
        this.__data.set(newValue);
    }
    get vis() {
        return this.__vis.get();
    }
    set vis(newValue) {
        this.__vis.set(newValue);
    }
    get w() {
        return this.__w.get();
    }
    set w(newValue) {
        this.__w.set(newValue);
    }
    aboutToAppear() {
        this.data = ['test', 'test2'];
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.height('100%');
        }, Column);
        comp.bind(this)(makeBuilderParameterProxy("comp", { vis: () => (this["__vis"] ? this["__vis"] : this["vis"]), data: () => (this["__data"] ? this["__data"] : this["data"]), width: () => (this["__w"] ? this["__w"] : this["w"]) }), this);
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
exports.visibility$$Demo = visibility$$Demo;
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new visibility$$Demo(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`
