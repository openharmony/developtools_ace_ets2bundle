"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
function func1() { }
class Child extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.build1 = undefined;
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.build1 !== undefined) {
            this.build1 = params.build1;
        }
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
            Text.create('Child');
        }, Text);
        Text.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
class Parent extends ViewPU {
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
            Column.onClick(() => {
                func1();
                {
                    let b = 1;
                }
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const item = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Column.create();
                }, Column);
                {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        if (isInitialRender) {
                            let componentCall = new Child(this, {
                                build1: () => {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create('example1');
                                    }, Text);
                                    Text.pop();
                                }
                            }, undefined, elmtId, () => { }, { page: "test/transform_ut/application/entry/src/main/ets/pages/utForPartialUpdate/ui_context/build_ui_in_correct_place.ets", line: 18, col: 11 });
                            ViewPU.create(componentCall);
                            let paramsLambda = () => {
                                return {
                                    build1: () => {
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create('example1');
                                        }, Text);
                                        Text.pop();
                                    }
                                };
                            };
                            componentCall.paramsGenerator_ = paramsLambda;
                        }
                        else {
                            this.updateStateVarsOfChildByElmtId(elmtId, {});
                        }
                    }, { name: "Child" });
                }
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Repeat([1], this).each((repeatItem) => {
                        {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                if (isInitialRender) {
                                    let componentCall = new Child(this, {
                                        build1: () => {
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                Text.create('example2');
                                            }, Text);
                                            Text.pop();
                                        }
                                    }, undefined, elmtId, () => { }, { page: "test/transform_ut/application/entry/src/main/ets/pages/utForPartialUpdate/ui_context/build_ui_in_correct_place.ets", line: 23, col: 15 });
                                    ViewPU.create(componentCall);
                                    let paramsLambda = () => {
                                        return {
                                            build1: () => {
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Text.create('example2');
                                                }, Text);
                                                Text.pop();
                                            }
                                        };
                                    };
                                    componentCall.paramsGenerator_ = paramsLambda;
                                }
                                else {
                                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                                }
                            }, { name: "Child" });
                        }
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create('example6');
                            Text.onClick(() => {
                                func1();
                                {
                                    let b = 1;
                                }
                            });
                        }, Text);
                        Text.pop();
                    })
                        .key((item) => {
                        func1();
                        {
                            let b = 1;
                        }
                        return item.toString();
                    })
                        .template('1', (repeatItem) => {
                        {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                if (isInitialRender) {
                                    let componentCall = new Child(this, {
                                        build1: () => {
                                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                Text.create('example3');
                                            }, Text);
                                            Text.pop();
                                        }
                                    }, undefined, elmtId, () => { }, { page: "test/transform_ut/application/entry/src/main/ets/pages/utForPartialUpdate/ui_context/build_ui_in_correct_place.ets", line: 42, col: 15 });
                                    ViewPU.create(componentCall);
                                    let paramsLambda = () => {
                                        return {
                                            build1: () => {
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Text.create('example3');
                                                }, Text);
                                                Text.pop();
                                            }
                                        };
                                    };
                                    componentCall.paramsGenerator_ = paramsLambda;
                                }
                                else {
                                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                                }
                            }, { name: "Child" });
                        }
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create('example4');
                            Text.onClick(() => {
                                func1();
                                {
                                    let b = 1;
                                }
                            });
                        }, Text);
                        Text.pop();
                    }).render(isInitialRender);
                }, Repeat);
                Column.pop();
            };
            this.forEachUpdateFunction(elmtId, [1], forEachItemGenFunction, (item) => {
                return item.toString();
            }, false, false);
        }, ForEach);
        ForEach.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName() {
        return "Parent";
    }
}
registerNamedRoute(() => new Parent(undefined, {}), "", { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/ui_context/build_ui_in_correct_place", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/ui_context/build_ui_in_correct_place", integratedHsp: "false" });
//# sourceMappingURL=build_ui_in_correct_place.js.map