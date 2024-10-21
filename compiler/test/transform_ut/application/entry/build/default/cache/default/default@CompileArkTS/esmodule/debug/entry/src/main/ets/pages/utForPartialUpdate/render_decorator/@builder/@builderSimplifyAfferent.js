"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
const test_value = "hello";
class testDemo extends ViewPU {
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
            Text.create('main page');
            Text.fontSize(50);
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        overBuilder.bind(this)(makeBuilderParameterProxy("overBuilder", { test_value: () => test_value }));
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName() {
        return "testDemo";
    }
}
function overBuilder($$, parent = null) {
    const __$$__ = $$;
    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, $$ = __$$__) => {
        Column.create();
    }, Column);
    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, $$ = __$$__) => {
        Text.create($$.test_value);
        Text.fontSize(40);
        Text.fontWeight(FontWeight.Bold);
    }, Text);
    Text.pop();
    Column.pop();
}
registerNamedRoute(() => new testDemo(undefined, {}), "", { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/render_decorator/@builder/@builderSimplifyAfferent", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/render_decorator/@builder/@builderSimplifyAfferent", integratedHsp: "false" });
//# sourceMappingURL=@builderSimplifyAfferent.js.map