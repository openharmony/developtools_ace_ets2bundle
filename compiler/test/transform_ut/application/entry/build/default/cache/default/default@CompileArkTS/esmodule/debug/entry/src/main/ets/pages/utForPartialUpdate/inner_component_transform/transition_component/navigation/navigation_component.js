"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
class Index extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.pageStack = new NavPathStack();
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.pageStack !== undefined) {
            this.pageStack = params.pageStack;
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
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Navigation.create(this.pageStack, { moduleName: "application", pagePath: "application/entry/src/main/ets/pages/utForPartialUpdate/inner_component_transform/transition_component/navigation/navigation_component", isUserCreateStack: true });
            Navigation.title('Main');
        }, Navigation);
        Navigation.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Navigation.create(new NavPathStack(), { moduleName: "application", pagePath: "application/entry/src/main/ets/pages/utForPartialUpdate/inner_component_transform/transition_component/navigation/navigation_component", isUserCreateStack: false });
            Navigation.title('Main');
        }, Navigation);
        Navigation.pop();
        Row.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName() {
        return "Index";
    }
}
registerNamedRoute(() => new Index(undefined, {}), "", { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/inner_component_transform/transition_component/navigation/navigation_component", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/inner_component_transform/transition_component/navigation/navigation_component", integratedHsp: "false" });
//# sourceMappingURL=navigation_component.js.map