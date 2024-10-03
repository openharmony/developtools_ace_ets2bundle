"use strict";
let __generate__Id = 0;
function generateId() {
    return "swipeGesture_" + ++__generate__Id;
}
class SwipeGestureExample extends View {
    constructor(compilerAssignedUniqueChildId, parent, params, localStorage) {
        super(compilerAssignedUniqueChildId, parent, localStorage);
        this.__rotateAngle = new ObservedPropertySimple(0, this, "rotateAngle");
        this.__speed = new ObservedPropertySimple(1, this, "speed");
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.rotateAngle !== undefined) {
            this.rotateAngle = params.rotateAngle;
        }
        if (params.speed !== undefined) {
            this.speed = params.speed;
        }
    }
    aboutToBeDeleted() {
        this.__rotateAngle.aboutToBeDeleted();
        this.__speed.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get rotateAngle() {
        return this.__rotateAngle.get();
    }
    set rotateAngle(newValue) {
        this.__rotateAngle.set(newValue);
    }
    get speed() {
        return this.__speed.get();
    }
    set speed(newValue) {
        this.__speed.set(newValue);
    }
    render() {
        Column.create();
        Column.border({ width: 2 });
        Column.width(260);
        Column.height(260);
        Column.rotate({ x: 0, y: 0, z: 1, angle: this.rotateAngle });
        Gesture.create(GesturePriority.Low);
        SwipeGesture.create({ fingers: 1, direction: SwipeDirection.Vertical });
        SwipeGesture.onAction((event) => {
            this.speed = event.speed;
            this.rotateAngle = event.angle;
        });
        SwipeGesture.pop();
        Gesture.pop();
        Text.create("SwipGesture speed : " + this.speed);
        Text.pop();
        Text.create("SwipGesture angle : " + this.rotateAngle);
        Text.pop();
        Column.pop();
    }
}
loadDocument(new SwipeGestureExample("1", undefined, {}));
//# sourceMappingURL=swipeGesture.js.map