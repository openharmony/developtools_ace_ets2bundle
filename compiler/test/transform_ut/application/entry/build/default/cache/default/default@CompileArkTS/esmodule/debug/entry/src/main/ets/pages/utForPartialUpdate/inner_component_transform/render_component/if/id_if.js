"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
class MyComponent extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.pass = true;
        this.count = 10;
        this.controller = new TabsController();
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.pass !== undefined) {
            this.pass = params.pass;
        }
        if (params.count !== undefined) {
            this.count = params.count;
        }
        if (params.controller !== undefined) {
            this.controller = params.controller;
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
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.pass) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.count < 0) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                if (!If.canRetake('id1')) {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create('count is negative');
                                        Text.fontSize(32);
                                        Text.id('id1');
                                    }, Text);
                                    Text.pop();
                                }
                            });
                        }
                        else if (this.count % 2 === 0) {
                            this.ifElseBranchUpdateFunction(1, () => {
                                if (!If.canRetake('id2')) {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Divider.create();
                                        Divider.id('id2');
                                    }, Divider);
                                }
                                if (!If.canRetake('id3')) {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create('even');
                                        Text.fontSize(32);
                                        Text.id('id3');
                                    }, Text);
                                    Text.pop();
                                }
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(2, () => {
                                if (!If.canRetake('id4')) {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Divider.create();
                                        Divider.id('id4');
                                    }, Divider);
                                }
                                if (!If.canRetake('id10')) {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Column.create();
                                        Column.id('id10');
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create('odd');
                                        Text.fontSize(32);
                                        Text.id('id5');
                                    }, Text);
                                    Text.pop();
                                    Column.pop();
                                }
                            });
                        }
                    }, If);
                    If.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    if (!If.canRetake('id6')) {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create('fail');
                            Text.id('id6');
                            Text.fontSize(32);
                        }, Text);
                        Text.pop();
                    }
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.pass) {
                this.ifElseBranchUpdateFunction(0, () => {
                    if (!If.canRetake('id7')) {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create('odd2');
                            Text.fontSize(32);
                            Text.id('id7');
                        }, Text);
                        Text.pop();
                    }
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            List.create({ space: 3 });
        }, List);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.pass) {
                this.ifElseBranchUpdateFunction(0, () => {
                    if (!If.canRetake('id8')) {
                        {
                            const itemCreation = (elmtId, isInitialRender) => {
                                ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                itemCreation2(elmtId, isInitialRender);
                                if (!isInitialRender) {
                                    ListItem.pop();
                                }
                                ViewStackProcessor.StopGetAccessRecording();
                            };
                            const itemCreation2 = (elmtId, isInitialRender) => {
                                ListItem.create(deepRenderFunction, true);
                                ListItem.id('id8');
                            };
                            const deepRenderFunction = (elmtId, isInitialRender) => {
                                itemCreation(elmtId, isInitialRender);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create();
                                    Row.margin({ left: 10, right: 10 });
                                    Row.id('id11');
                                }, Row);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create();
                                    Text.fontSize(20);
                                    Text.margin({ left: 10 });
                                }, Text);
                                Text.pop();
                                Row.pop();
                                ListItem.pop();
                            };
                            this.observeComponentCreation2(itemCreation2, ListItem);
                            ListItem.pop();
                        }
                    }
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        List.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Tabs.create({ barPosition: BarPosition.Start, controller: this.controller });
        }, Tabs);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.pass) {
                this.ifElseBranchUpdateFunction(0, () => {
                    if (!If.canRetake('id9')) {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            TabContent.create(() => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('111');
                                    Text.width('100%');
                                    Text.height('20');
                                    Text.backgroundColor(Color.Pink);
                                }, Text);
                                Text.pop();
                            });
                            TabContent.tabBar('pink');
                            TabContent.id('id9');
                        }, TabContent);
                        TabContent.pop();
                    }
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Tabs.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.pass) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.count === 10) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Column.create();
                                }, Column);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('111');
                                }, Text);
                                Text.pop();
                                Column.pop();
                                if (!If.canRetake('id12')) {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        XComponent.create({ id: 'special', type: '' }, "com.example.application/application");
                                        XComponent.id('id12');
                                    }, XComponent);
                                }
                                if (!If.canRetake('id13')) {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Column.create();
                                        Column.id('id13');
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create('11');
                                    }, Text);
                                    Text.pop();
                                    Column.pop();
                                }
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Column.create();
                                }, Column);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('222');
                                }, Text);
                                Text.pop();
                                Column.pop();
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.pass) {
                this.ifElseBranchUpdateFunction(0, () => {
                    if (!If.canRetake('id14')) {
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            __Common__.create(true);
                            __Common__.id('id14');
                        }, __Common__);
                        {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                if (isInitialRender) {
                                    let componentCall = new Child(this, {}, undefined, elmtId, () => { }, { page: "test/transform_ut/application/entry/src/main/ets/pages/utForPartialUpdate/inner_component_transform/render_component/if/id_if.ets", line: 77, col: 11 });
                                    ViewPU.create(componentCall);
                                    let paramsLambda = () => {
                                        return {};
                                    };
                                    componentCall.paramsGenerator_ = paramsLambda;
                                }
                                else {
                                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                                }
                            }, { name: "Child" });
                        }
                        __Common__.pop();
                    }
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
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
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName() {
        return "MyComponent";
    }
}
class Child extends ViewPU {
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
            Text.create('Child');
            Text.fontSize(50);
        }, Text);
        Text.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
registerNamedRoute(() => new MyComponent(undefined, {}), "", { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/inner_component_transform/render_component/if/id_if", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/inner_component_transform/render_component/if/id_if", integratedHsp: "false" });
//# sourceMappingURL=id_if.js.map