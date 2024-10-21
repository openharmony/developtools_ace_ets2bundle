"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
let storage = LocalStorage.GetShared();
let route = 'pages/Index';
let temp = { routeName: route, storage: storage, useSharedStorage: true };
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
    static getEntryName() {
        return "LocalStorageComponent";
    }
}
if (temp && temp.routeName != undefined && temp.storage != undefined) {
    registerNamedRoute(() => new LocalStorageComponent(undefined, {}, temp.useSharedStorage ? LocalStorage.getShared() : temp.storage), temp.routeName, { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/ui_state_management/application_state_management/localStorage/localStorageForThreeParam", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/ui_state_management/application_state_management/localStorage/localStorageForThreeParam", integratedHsp: "false" });
}
else if (temp && temp.routeName != undefined && temp.storage == undefined) {
    registerNamedRoute(() => new LocalStorageComponent(undefined, {}, temp.useSharedStorage ? LocalStorage.getShared() : temp.storage), temp.routeName, { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/ui_state_management/application_state_management/localStorage/localStorageForThreeParam", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/ui_state_management/application_state_management/localStorage/localStorageForThreeParam", integratedHsp: "false" });
}
else if (temp && temp.routeName == undefined && temp.storage != undefined) {
    registerNamedRoute(() => new LocalStorageComponent(undefined, {}, temp.useSharedStorage ? LocalStorage.getShared() : temp.storage), "", { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/ui_state_management/application_state_management/localStorage/localStorageForThreeParam", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/ui_state_management/application_state_management/localStorage/localStorageForThreeParam", integratedHsp: "false" });
}
else if (temp && temp.useSharedStorage != undefined) {
    registerNamedRoute(() => new LocalStorageComponent(undefined, {}, temp.useSharedStorage ? LocalStorage.getShared() : undefined), "", { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/ui_state_management/application_state_management/localStorage/localStorageForThreeParam", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/ui_state_management/application_state_management/localStorage/localStorageForThreeParam", integratedHsp: "false" });
}
else {
    registerNamedRoute(() => new LocalStorageComponent(undefined, {}, temp), "", { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/ui_state_management/application_state_management/localStorage/localStorageForThreeParam", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/ui_state_management/application_state_management/localStorage/localStorageForThreeParam", integratedHsp: "false" });
}
//# sourceMappingURL=localStorageForThreeParam.js.map