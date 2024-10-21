"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
class CustomX extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__fruit = new SynchedPropertySimpleOneWayPU(params.fruit, this, "fruit");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.fruit === undefined) {
            this.__fruit.set('香蕉');
        }
    }
    updateStateVars(params) {
        this.__fruit.reset(params.fruit);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__fruit.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__fruit.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get fruit() {
        return this.__fruit.get();
    }
    set fruit(newValue) {
        this.__fruit.set(newValue);
    }
    initialRender() {
    }
    rerender() {
        this.updateDirtyElements();
    }
}
class CustomY extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__parentFruit = new ObservedPropertySimplePU('苹果', this, "parentFruit");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.parentFruit !== undefined) {
            this.parentFruit = params.parentFruit;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__parentFruit.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__parentFruit.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get parentFruit() {
        return this.__parentFruit.get();
    }
    set parentFruit(newValue) {
        this.__parentFruit.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
        }, Row);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                  let componentCall = new CustomX(this, { fruit: this.parentFruit }, undefined, elmtId, () => { }, { page: "test/transform_ut/application/entry/src/main/ets/pages/utForPartialUpdate/ui_state_management/inner_struct_state_management/@prop/@prop.ets", line: 14, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            fruit: this.parentFruit
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        fruit: this.parentFruit
                    });
                }
            }, { name: "CustomX" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                  let componentCall = new CustomX(this, {}, undefined, elmtId, () => { }, { page: "test/transform_ut/application/entry/src/main/ets/pages/utForPartialUpdate/ui_state_management/inner_struct_state_management/@prop/@prop.ets", line: 15, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {};
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                }
            }, { name: "CustomX" });
        }
        Row.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName() {
      return "CustomY";
  }
}
registerNamedRoute(() => new CustomY(undefined, {}), "", { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/ui_state_management/inner_struct_state_management/@prop/@prop", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/ui_state_management/inner_struct_state_management/@prop/@prop", integratedHsp: "false" });
//# sourceMappingURL=@prop.js.map