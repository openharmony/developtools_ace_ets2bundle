"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
class PinchGestureExample extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__scale2 = new ObservedPropertySimplePU(1, this, "scale2");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.scale2 !== undefined) {
            this.scale2 = params.scale2;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__scale2.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__scale2.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get scale2() {
        return this.__scale2.get();
    }
    set scale2(newValue) {
        this.__scale2.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Flex.create({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.SpaceBetween });
            Flex.height(100);
            Flex.width(200);
            Flex.padding(20);
            Flex.border({ width: 1 });
            Flex.margin(80);
            Flex.scale({ x: this.scale2, y: this.scale2, z: this.scale2 });
            Gesture.create(GesturePriority.Low);
            PinchGesture.create();
            PinchGesture.onActionStart((event) => {
                console.info('Pinch start');
            });
            PinchGesture.onActionUpdate((event) => {
                this.scale2 = event.scale;
            });
            PinchGesture.onActionEnd(() => {
                console.info('Pinch end');
            });
            PinchGesture.pop();
            Gesture.pop();
        }, Flex);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('PinchGesture scale:' + this.scale2);
        }, Text);
        Text.pop();
        Flex.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName() {
        return "PinchGestureExample";
    }
}
registerNamedRoute(() => new PinchGestureExample(undefined, {}), "", { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/inner_component_transform/gesture_component/pinchGesture", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/inner_component_transform/gesture_component/pinchGesture", integratedHsp: "false" });
//# sourceMappingURL=pinchGesture.js.map