"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
let route = 'pages/Index';
class LocalStorageComponent extends ViewPU {
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
            Column.create();
            Column.height(500);
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
{
    let routeNameNode = route;
    registerNamedRoute(() => new LocalStorageComponent(undefined, {}), routeNameNode, { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/ui_state_management/application_state_management/localStorage/localStorageForRoute", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/ui_state_management/application_state_management/localStorage/localStorageForRoute", integratedHsp: "false" });
}
//# sourceMappingURL=localStorageForRoute.js.map