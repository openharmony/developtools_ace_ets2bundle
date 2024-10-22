"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
class HomeComponent extends ViewV2 {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda, extraInfo) {
        super(parent, elmtId, extraInfo);
        this.finalizeConstruction();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName() {
        return "HomeComponent";
    }
}
function testBuilder(parent = null) {
    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender) => {
        Text.create("testBuilder");
    }, Text);
    Text.pop();
}
class ChildComponent extends ViewV2 {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda, extraInfo) {
        super(parent, elmtId, extraInfo);
        this.finalizeConstruction();
    }
    static testMonitor() { }
    static get fullName() {
        return ChildComponent.param_value;
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
ChildComponent.local_value = "hello";
ChildComponent.param_value = "hello";
ChildComponent.event_value = () => { };
ChildComponent.provider_value = 0;
ChildComponent.consumer_value = true;
ChildComponent.builder_value = testBuilder;
__decorate([
    Local
], ChildComponent, "local_value", void 0);
__decorate([
    Param
], ChildComponent, "param_value", void 0);
__decorate([
    Event
], ChildComponent, "event_value", void 0);
__decorate([
    Provider()
], ChildComponent, "provider_value", void 0);
__decorate([
    Consumer("a")
], ChildComponent, "consumer_value", void 0);
__decorate([
    Monitor("local_value")
], ChildComponent, "testMonitor", null);
__decorate([
    Computed
], ChildComponent, "fullName", null);
registerNamedRoute(() => new HomeComponent(undefined, {}), "", { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/v2_component_decorator/staticComponentMember", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/v2_component_decorator/staticComponentMember", integratedHsp: "false" });
//# sourceMappingURL=staticComponentMember.js.map