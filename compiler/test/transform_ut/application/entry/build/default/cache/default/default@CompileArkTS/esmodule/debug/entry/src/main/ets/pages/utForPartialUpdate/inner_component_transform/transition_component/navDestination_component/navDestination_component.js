"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
class PageOne extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.pageInfos = new NavPathStack();
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.pageInfos !== undefined) {
            this.pageInfos = params.pageInfos;
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
            NavDestination.create(() => {
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Column.create();
                    Column.width('100%');
                    Column.height('100%');
                }, Column);
                Column.pop();
            }, { moduleName: "application", pagePath: "application/entry/src/main/ets/pages/utForPartialUpdate/inner_component_transform/transition_component/navDestination_component/navDestination_component" });
            NavDestination.title('pageOne');
        }, NavDestination);
        NavDestination.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            NavDestination.create(() => { }, { moduleName: "application", pagePath: "application/entry/src/main/ets/pages/utForPartialUpdate/inner_component_transform/transition_component/navDestination_component/navDestination_component" });
        }, NavDestination);
        NavDestination.pop();
        Row.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName() {
        return "PageOne";
    }
}
registerNamedRoute(() => new PageOne(undefined, {}), "", { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/inner_component_transform/transition_component/navDestination_component/navDestination_component", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/inner_component_transform/transition_component/navDestination_component/navDestination_component", integratedHsp: "false" });
//# sourceMappingURL=navDestination_component.js.map