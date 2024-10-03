"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
class TextInputExample extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__text = new ObservedPropertySimplePU('', this, "text");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.text !== undefined) {
            this.text = params.text;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__text.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__text.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get text() {
        return this.__text.get();
    }
    set text(newValue) {
        this.__text.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 20 });
            Column.width('100%');
            Column.height('100%');
            Column.justifyContent(FlexAlign.Center);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.text);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: { value: this.text, changeEvent: newValue => { this.text = newValue; } } });
            TextInput.placeholderColor(Color.Grey);
            TextInput.placeholderFont({ size: 14, weight: 400 });
            TextInput.width(150);
            TextInput.height(100);
            TextInput.backgroundColor(Color.Pink);
            TextInput.width(150);
            TextInput.height(100);
            TextInput.backgroundColor(Color.Pink);
            TextInput.caretColor(Color.Blue);
            TextInput.width(300);
        }, TextInput);
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName() {
        return "TextInputExample";
    }
}
registerNamedRoute(() => new TextInputExample(undefined, {}), "", { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/inner_component_transform/$$_component/$$_componentCheck5", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/inner_component_transform/$$_component/$$_componentCheck5", integratedHsp: "false" });
//# sourceMappingURL=$$_componentCheck5.js.map