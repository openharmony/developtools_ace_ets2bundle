"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
class ClassA {
    constructor(message) {
        this.message = message;
    }
}
class ChildComponent extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__arr = new ObservedPropertyObjectPU([new ClassA('0'), new ClassA('1'), new ClassA('2')], this, "arr");
        this.count = 0;
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.arr !== undefined) {
            this.arr = params.arr;
        }
        if (params.count !== undefined) {
            this.count = params.count;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__arr.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__arr.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get arr() {
        return this.__arr.get();
    }
    set arr(newValue) {
        this.__arr.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            List.create();
            List.height(500);
        }, List);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Repeat(this.arr, this).each((obj) => {
                {
                    const itemCreation2 = (elmtId, isInitialRender) => {
                        ListItem.create(() => { }, false);
                    };
                    const observedDeepRender = () => {
                        this.observeComponentCreation2(itemCreation2, ListItem);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(obj.item.message);
                        }, Text);
                        Text.pop();
                        ListItem.pop();
                    };
                    observedDeepRender();
                }
            })
                .key((item) => {
                return JSON.stringify(item);
            })
                .virtualScroll({ totalCount: this.arr.length })
                .templateId((item, index) => {
                return index.toString();
            })
                .template('1', (obj) => {
                {
                    const itemCreation2 = (elmtId, isInitialRender) => {
                        ListItem.create(() => { }, false);
                    };
                    const observedDeepRender = () => {
                        this.observeComponentCreation2(itemCreation2, ListItem);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(obj.item.message);
                        }, Text);
                        Text.pop();
                        ListItem.pop();
                    };
                    observedDeepRender();
                }
            }).render(isInitialRender);
        }, Repeat);
        List.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new ChildComponent(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();