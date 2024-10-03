"use strict";
let __generate__Id = 0;
function generateId() {
    return "rotationGesture_" + ++__generate__Id;
}
class RotationGestureExample extends View {
    constructor(compilerAssignedUniqueChildId, parent, params, localStorage) {
        super(compilerAssignedUniqueChildId, parent, localStorage);
        this.__angle = new ObservedPropertySimple(0, this, "angle");
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.angle !== undefined) {
            this.angle = params.angle;
        }
    }
    aboutToBeDeleted() {
        this.__angle.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get angle() {
        return this.__angle.get();
    }
    set angle(newValue) {
        this.__angle.set(newValue);
    }
    render() {
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
        Text.create('RotationGesture angle:' + this.angle);
        Text.pop();
        Flex.pop();
    }
}
loadDocument(new RotationGestureExample("1", undefined, {}));
//# sourceMappingURL=rotationGesture.js.map