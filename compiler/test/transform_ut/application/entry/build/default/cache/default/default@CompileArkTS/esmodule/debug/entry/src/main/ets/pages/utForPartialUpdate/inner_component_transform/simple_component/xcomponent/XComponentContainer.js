"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
class HomeComponent extends ViewPU {
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
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            XComponent.create({ id: '1', type: 'component' }, "com.example.application/application");
        }, XComponent);
        XComponent.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            XComponent.create({ id: '2', type: 1 }, "com.example.application/application");
        }, XComponent);
        XComponent.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            XComponent.create({ id: '3', type: XComponentType.COMPONENT }, "com.example.application/application");
        }, XComponent);
        XComponent.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName() {
        return "HomeComponent";
    }
}
registerNamedRoute(() => new HomeComponent(undefined, {}), "", { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/inner_component_transform/simple_component/xcomponent/XComponentContainer", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/inner_component_transform/simple_component/xcomponent/XComponentContainer", integratedHsp: "false" });
//# sourceMappingURL=XComponentContainer.js.map