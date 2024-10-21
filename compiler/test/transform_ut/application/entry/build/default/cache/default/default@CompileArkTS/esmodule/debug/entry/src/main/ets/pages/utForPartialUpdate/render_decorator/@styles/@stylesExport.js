if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
export class FancyUseExp extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__enable = new ObservedPropertySimplePU(true, this, "enable");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.enable !== undefined) {
            this.enable = params.enable;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__enable.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__enable.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get enable() {
        return this.__enable.get();
    }
    set enable(newValue) {
        this.__enable.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("Fancy");
            Text.backgroundColor(Color.Red);
            Text.width(100);
            Text.height(100);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("Fancy");
            Text.backgroundColor(Color.Blue);
            Text.width(100);
            Text.height(100);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithChild();
            Button.enabled(this.enable);
            Button.onClick(() => {
                this.enable = false;
            });
            ViewStackProcessor.visualState("normal");
            Button.backgroundColor(Color.Green);
            ViewStackProcessor.visualState("disabled");
            Button.backgroundColor(Color.Blue);
            ViewStackProcessor.visualState("pressed");
            Button.backgroundColor(Color.Red);
            ViewStackProcessor.visualState();
        }, Button);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("Fancy");
        }, Text);
        Text.pop();
        Button.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName() {
        return "FancyUseExp";
    }
}
registerNamedRoute(() => new FancyUseExp(undefined, {}), "", { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/render_decorator/@styles/@stylesExport", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/render_decorator/@styles/@stylesExport", integratedHsp: "false" });
//# sourceMappingURL=@stylesExport.js.map