"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
if (PUV2ViewBase.contextStack === undefined) {
    Reflect.set(PUV2ViewBase, "contextStack", []);
}
class Tmp {
    constructor() {
        this.paramA1 = '';
    }
}
class HomeComponent extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        this.xx = ($$, aa = '1') => {
            const parent = PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.length ? PUV2ViewBase.contextStack[PUV2ViewBase.contextStack.length - 1] : null;
            {
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    if (isInitialRender) {
                        let componentCall = new Chind(parent ? parent : this, { message: $$.__paramA1 }, undefined, elmtId, () => { }, { page: "test/transform_ut/application/entry/src/main/ets/pages/utForPartialUpdate/render_decorator/@localBuilder/@localBuilder.ets", line: 10, col: 7 });
                        ViewPU.create(componentCall);
                        let paramsLambda = () => {
                            return {
                                message: $$.paramA1
                            };
                        };
                        componentCall.paramsGenerator_ = paramsLambda;
                    }
                    else {
                        this.updateStateVarsOfChildByElmtId(elmtId, {});
                    }
                }, { name: "Chind" });
            }
        };
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__label = new ObservedPropertySimplePU('Hello', this, "label");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.label !== undefined) {
            this.label = params.label;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__label.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__label.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get label() {
        return this.__label.get();
    }
    set label(newValue) {
        this.__label.set(newValue);
    }
    initialRender() {
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.push(this);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.height(500);
        }, Column);
        this.xx.bind(this)(makeBuilderParameterProxy("xx", { paramA1: () => (this["__label"] ? this["__label"] : this["label"]) }));
        Column.pop();
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.pop();
    }
    rerender() {
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.push(this);
        this.updateDirtyElements();
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.pop();
    }
    static getEntryName() {
        return "HomeComponent";
    }
}
class Chind extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__message = new SynchedPropertySimpleTwoWayPU(params.message, this, "message");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
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
    }
    rerender() {
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.push(this);
        this.updateDirtyElements();
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.pop();
    }
}
registerNamedRoute(() => new HomeComponent(undefined, {}), "", { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/render_decorator/@localBuilder/@localBuilder", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/render_decorator/@localBuilder/@localBuilder", integratedHsp: "false" });
//# sourceMappingURL=@localBuilder.js.map