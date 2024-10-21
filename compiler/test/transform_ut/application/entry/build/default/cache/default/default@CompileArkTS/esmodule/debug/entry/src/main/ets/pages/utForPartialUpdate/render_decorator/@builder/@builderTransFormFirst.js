"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
class TestBuilder1 extends ViewPU {
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
            Text.create("hello");
        }, Text);
        Text.pop();
        Column.pop();
    }
    innerBuidler(value, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("hello");
        }, Text);
        Text.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName() {
        return "TestBuilder1";
    }
}
class TestBuilderChild extends ViewPU {
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
            Text.create("hello");
        }, Text);
        Text.pop();
        Column.pop();
    }
    innerBuidler(value, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("hello");
        }, Text);
        Text.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
function testIfIdComponent(value, parent = null) {
    const __value__ = value;
    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
        Column.create();
    }, Column);
    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
        If.create();
        if (value) {
            (parent ? parent : this).ifElseBranchUpdateFunction(0, () => {
                if (!If.canRetake('id14')) {
                    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                        __Common__.create(true);
                        __Common__.id('id14');
                    }, __Common__);
                    {
                        (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                            if (isInitialRender) {
                                let componentCall = new TestBuilderChild(parent ? parent : this, {}, undefined, elmtId, () => { }, { page: "test/transform_ut/application/entry/src/main/ets/pages/utForPartialUpdate/render_decorator/@builder/@builderTransFormFirst.ets", line: 36, col: 7 });
                                ViewPU.create(componentCall);
                                let paramsLambda = () => {
                                    return {};
                                };
                                componentCall.paramsGenerator_ = paramsLambda;
                            }
                            else {
                                (parent ? parent : this).updateStateVarsOfChildByElmtId(elmtId, {});
                            }
                        }, { name: "TestBuilderChild" });
                    }
                    __Common__.pop();
                }
                (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                    Text.create('111');
                }, Text);
                Text.pop();
            });
        }
        else {
            this.ifElseBranchUpdateFunction(1, () => {
            });
        }
    }, If);
    If.pop();
    Column.pop();
}
registerNamedRoute(() => new TestBuilder1(undefined, {}), "", { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/render_decorator/@builder/@builderTransFormFirst", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/render_decorator/@builder/@builderTransFormFirst", integratedHsp: "false" });
//# sourceMappingURL=@builderTransFormFirst.js.map