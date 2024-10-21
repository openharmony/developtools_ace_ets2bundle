"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
let varA = AppStorage.Link('varA');
let envLang = AppStorage.Prop('languageCode');
class MyComponent extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__varA = this.createStorageLink('varA', 2, "varA");
        this.__lang = this.createStorageProp('languageCode', 'en', "lang");
        this.label = 'count';
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
        this.__varA.purgeDependencyOnElmtId(rmElmtId);
        this.__lang.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__varA.aboutToBeDeleted();
        this.__lang.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get varA() {
        return this.__varA.get();
    }
    set varA(newValue) {
        this.__varA.set(newValue);
    }
    get lang() {
        return this.__lang.get();
    }
    set lang(newValue) {
        this.__lang.set(newValue);
    }
    aboutToAppear() {
        this.label = (this.lang === 'zh') ? '数' : 'Count';
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 20 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(this.label + ': ' + this.varA);
            Button.onClick(() => {
                AppStorage.Set('varA', AppStorage.Get('varA') + 1);
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('lang: ' + this.lang);
            Button.onClick(() => {
                if (this.lang === 'zh') {
                    AppStorage.Set('languageCode', 'en');
                }
                else {
                    AppStorage.Set('languageCode', 'zh');
                }
                this.label = (this.lang === 'zh') ? '数' : 'Count';
            });
        }, Button);
        Button.pop();
        Row.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName() {
        return "MyComponent";
    }
}
registerNamedRoute(() => new MyComponent(undefined, {}), "", { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/ui_state_management/application_state_management/@storageProp/@storageProp", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/ui_state_management/application_state_management/@storageProp/@storageProp", integratedHsp: "false" });
//# sourceMappingURL=@storageProp.js.map