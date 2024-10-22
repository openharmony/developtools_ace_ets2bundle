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
        this.local_value = "Foo";
        this.finalizeConstruction();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new TestParam(this, {
                        paramValue: this.local_value,
                        paramValue1: "hello HomeComponent",
                        $paramValue: value => { this.local_value = value; }
                    }, undefined, elmtId, () => { }, { page: "test/transform_ut/application/entry/src/main/ets/pages/utForPartialUpdate/v2_component_decorator/param_event_twoway_binding.ets", line: 8, col: 7 });
                    ViewV2.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            paramValue: this.local_value,
                            paramValue1: "hello HomeComponent"
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        paramValue: this.local_value,
                        paramValue1: "hello HomeComponent"
                    });
                }
            }, { name: "TestParam" });
        }
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new TestParam1(this, {
                        paramValue: "hello HomeComponent",
                        myEvent: (newVal) => { this.local_value = newVal; },
                        myEvent1: (newVal) => this.local_value = newVal
                    }, undefined, elmtId, () => { }, { page: "test/transform_ut/application/entry/src/main/ets/pages/utForPartialUpdate/v2_component_decorator/param_event_twoway_binding.ets", line: 12, col: 7 });
                    ViewV2.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            paramValue: "hello HomeComponent",
                            myEvent: (newVal) => { this.local_value = newVal; },
                            myEvent1: (newVal) => this.local_value = newVal
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        paramValue: "hello HomeComponent"
                    });
                }
            }, { name: "TestParam1" });
        }
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName() {
        return "HomeComponent";
    }
}
__decorate([
    Local
], HomeComponent.prototype, "local_value", void 0);
class TestParam extends ViewV2 {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda, extraInfo) {
        super(parent, elmtId, extraInfo);
        this.initParam("paramValue", (params && "paramValue" in params) ? params.paramValue : "hello TestParam");
        this.$paramValue = "$paramValue" in params ? params.$paramValue : (value) => { };
        this.initParam("paramValue1", (params && "paramValue1" in params) ? params.paramValue1 : undefined);
        this.finalizeConstruction();
    }
    initialRender() { }
    updateStateVars(params) {
        if (params === undefined) {
            return;
        }
        if ("paramValue" in params) {
            this.updateParam("paramValue", params.paramValue);
        }
        if ("paramValue1" in params) {
            this.updateParam("paramValue1", params.paramValue1);
        }
    }
    rerender() {
        this.updateDirtyElements();
    }
}
__decorate([
    Param
], TestParam.prototype, "paramValue", void 0);
__decorate([
    Event
], TestParam.prototype, "$paramValue", void 0);
__decorate([
    Param
], TestParam.prototype, "paramValue1", void 0);
class TestParam1 extends ViewV2 {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda, extraInfo) {
        super(parent, elmtId, extraInfo);
        this.initParam("paramValue", (params && "paramValue" in params) ? params.paramValue : "hello TestParam1");
        this.myEvent = "myEvent" in params ? params.myEvent : (newVal) => { };
        this.myEvent1 = "myEvent1" in params ? params.myEvent1 : () => { };
        this.finalizeConstruction();
    }
    initialRender() { }
    updateStateVars(params) {
        if (params === undefined) {
            return;
        }
        if ("paramValue" in params) {
            this.updateParam("paramValue", params.paramValue);
        }
    }
    rerender() {
        this.updateDirtyElements();
    }
}
__decorate([
    Param
], TestParam1.prototype, "paramValue", void 0);
__decorate([
    Event
], TestParam1.prototype, "myEvent", void 0);
__decorate([
    Event
], TestParam1.prototype, "myEvent1", void 0);
registerNamedRoute(() => new HomeComponent(undefined, {}), "", { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/v2_component_decorator/param_event_twoway_binding", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/v2_component_decorator/param_event_twoway_binding", integratedHsp: "false" });
//# sourceMappingURL=param_event_twoway_binding.js.map