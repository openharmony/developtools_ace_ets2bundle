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
        this.__WIDTH_AND_HEIGHT = new ObservedPropertyObjectPU([
            { w: 10, h: 10 },
            { w: 20, h: 20 },
            { w: 30, h: 30 },
            { w: 40, h: 40 },
            { w: 50, h: 50 }
        ], this, "WIDTH_AND_HEIGHT");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.WIDTH_AND_HEIGHT !== undefined) {
            this.WIDTH_AND_HEIGHT = params.WIDTH_AND_HEIGHT;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__WIDTH_AND_HEIGHT.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__WIDTH_AND_HEIGHT.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get WIDTH_AND_HEIGHT() {
        return this.__WIDTH_AND_HEIGHT.get();
    }
    set WIDTH_AND_HEIGHT(newValue) {
        this.__WIDTH_AND_HEIGHT.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.height('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const { w, h } = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Button.createWithLabel();
                    Button.width(w);
                    Button.height(h);
                }, Button);
                Button.pop();
            };
            this.forEachUpdateFunction(elmtId, this.WIDTH_AND_HEIGHT, forEachItemGenFunction, item => item.toString(), false, false);
        }, ForEach);
        ForEach.pop();
        Column.pop();
        Row.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName() {
        return "Index";
    }
}
registerNamedRoute(() => new Index(undefined, {}), "", { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/inner_component_transform/render_component/foreach/forEachTwo", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/inner_component_transform/render_component/foreach/forEachTwo", integratedHsp: "false" });
//# sourceMappingURL=forEachTwo.js.map