"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
function __Text__fancy(color) {
    Text.backgroundColor(color);
}
function __Text__superFancy(size) {
    Text.fontSize(size);
    __Text__fancy(Color.Red);
}
function __Button__fancybut(color) {
    Button.backgroundColor(color);
    Button.height(100);
    ViewStackProcessor.visualState("normal");
    Button.width(200);
    ViewStackProcessor.visualState();
}
class FancyUse extends ViewPU {
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
            Row.create();
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("Just Fancy");
            __Text__fancy(Color.Yellow);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("Super Fancy Text");
            __Text__superFancy(24);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel("Fancy Button");
            __Button__fancybut(Color.Green);
        }, Button);
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 10 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("Fancy");
            __Text__fancytext(24);
        }, Text);
        Text.pop();
        Row.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName() {
        return "FancyUse";
    }
}
function __Text__fancytext(fontSize) {
    Text.fontColor(Color.Red);
    Text.fontSize(fontSize);
    Text.fontStyle(FontStyle.Italic);
}
registerNamedRoute(() => new FancyUse(undefined, {}), "", { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/render_decorator/@extend/@extend", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/render_decorator/@extend/@extend", integratedHsp: "false" });
//# sourceMappingURL=@extend.js.map