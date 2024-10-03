"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
class RotationGestureExample extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__angle = new ObservedPropertySimplePU(0, this, "angle");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.angle !== undefined) {
            this.angle = params.angle;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__angle.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__angle.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get angle() {
        return this.__angle.get();
    }
    set angle(newValue) {
        this.__angle.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Flex.create({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.SpaceBetween });
            Flex.height(100);
            Flex.width(200);
            Flex.padding(20);
            Flex.border({ width: 1 });
            Flex.margin(80);
            Flex.rotate({ x: 1, y: 2, z: 3, angle: this.angle });
            Gesture.create(GesturePriority.Low);
            RotationGesture.create();
            RotationGesture.onActionStart((event) => {
                console.log('Rotation start');
            });
            RotationGesture.onActionUpdate((event) => {
                this.angle = event.angle;
            });
            RotationGesture.onActionEnd(() => {
                console.log('Rotation end');
            });
            RotationGesture.pop();
            Gesture.pop();
        }, Flex);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('RotationGesture angle:' + this.angle);
        }, Text);
        Text.pop();
        Flex.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName() {
        return "RotationGestureExample";
    }
}
registerNamedRoute(() => new RotationGestureExample(undefined, {}), "", { bundleName: "com.example.application", moduleName: "application", pagePath: "pages/utForPartialUpdate/inner_component_transform/gesture_component/rotationGesture", pageFullPath: "application/entry/src/main/ets/pages/utForPartialUpdate/inner_component_transform/gesture_component/rotationGesture", integratedHsp: "false" });
//# sourceMappingURL=rotationGesture.js.map