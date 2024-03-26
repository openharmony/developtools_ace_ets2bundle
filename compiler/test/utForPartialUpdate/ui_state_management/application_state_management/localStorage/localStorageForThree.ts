/*
 * Copyright (c) 2023 Huawei Device Co., Ltd.
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
let storage = LocalStorage.GetShared();
let route = 'pages/Index';

class ClassA {
}

@Entry({
  routeName: route,
  storage: storage,
  useSharedStorage: true
})
@Component
struct LocalStorageComponent {
    @LocalStorageLink("storageSimpleProp") simpleVarName: number = 0;
    @LocalStorageProp("storageObjectProp") objectName: ClassA = new ClassA("x");
    build() {
        Column() {       
        }
    }
}
`
exports.expectResult =
`"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
let storage = LocalStorage.GetShared();
let route = 'pages/Index';
class ClassA {
}
class LocalStorageComponent extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        this.__simpleVarName = this.createLocalStorageLink("storageSimpleProp", 0, "simpleVarName");
        this.__objectName = this.createLocalStorageProp("storageObjectProp", new ClassA("x"), "objectName");
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
        this.__simpleVarName.purgeDependencyOnElmtId(rmElmtId);
        this.__objectName.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__simpleVarName.aboutToBeDeleted();
        this.__objectName.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get simpleVarName() {
        return this.__simpleVarName.get();
    }
    set simpleVarName(newValue) {
        this.__simpleVarName.set(newValue);
    }
    get objectName() {
        return this.__objectName.get();
    }
    set objectName(newValue) {
        this.__objectName.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
{
    let routeNameNode = route;
    if (routeNameNode != undefined) {
        registerNamedRoute(() => new LocalStorageComponent(undefined, {}, true ? LocalStorage.getShared() : storage), routeNameNode, { bundleName: "", moduleName: "", pagePath: "localStorageForThree" });
    }
    else {
        ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
        loadDocument(new LocalStorageComponent(undefined, {}, true ? LocalStorage.getShared() : storage));
        ViewStackProcessor.StopGetAccessRecording();
    }
}
`
