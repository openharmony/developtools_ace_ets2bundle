"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
class StatePage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__counter = new ObservedPropertySimplePU(0, this, "counter");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.counter !== undefined) {
            this.counter = params.counter;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__counter.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__counter.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get counter() {
        return this.__counter.get();
    }
    set counter(newValue) {
        this.__counter.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("counter:" + this.counter);
        }, Text);
        Text.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName() {
        return "StatePage";
    }
}
registerNamedRoute(() => new StatePage(undefined, {}), "", { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/ui_state_management/inner_struct_state_management/@state/@state", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/ui_state_management/inner_struct_state_management/@state/@state", integratedHsp: "false" });
//# sourceMappingURL=@state.js.map