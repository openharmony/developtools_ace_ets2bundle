"use strict";
let __generate__Id = 0;
function generateId() {
    return "longPressGesture_" + ++__generate__Id;
}
class LongPressGestureExample extends View {
    constructor(compilerAssignedUniqueChildId, parent, params, localStorage) {
        super(compilerAssignedUniqueChildId, parent, localStorage);
        this.__count = new ObservedPropertySimple(0, this, "count");
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.count !== undefined) {
            this.count = params.count;
        }
    }
    aboutToBeDeleted() {
        this.__count.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get count() {
        return this.__count.get();
    }
    set count(newValue) {
        this.__count.set(newValue);
    }
    render() {
        Flex.create({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.SpaceBetween });
        Flex.height(200);
        Flex.width(300);
        Flex.padding(60);
        Flex.border({ width: 1 });
        Flex.margin(30);
        Gesture.create(GesturePriority.Low);
        LongPressGesture.create({ repeat: true });
        LongPressGesture.onAction((event) => {
            if (event.repeat) {
                this.count++;
            }
        });
        LongPressGesture.onActionEnd(() => {
            this.count = 0;
        });
        LongPressGesture.pop();
        Gesture.pop();
        Text.create('LongPress onAction:' + this.count);
        Text.pop();
        Flex.pop();
    }
}
loadDocument(new LongPressGestureExample("1", undefined, {}));
//# sourceMappingURL=longPressGesture.js.map