"use strict";
let __generate__Id = 0;
function generateId() {
    return "tapGesture_" + ++__generate__Id;
}
class TapGestureExample extends View {
    constructor(compilerAssignedUniqueChildId, parent, params, localStorage) {
        super(compilerAssignedUniqueChildId, parent, localStorage);
        this.__value = new ObservedPropertySimple('', this, "value");
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.value !== undefined) {
            this.value = params.value;
        }
    }
    aboutToBeDeleted() {
        this.__value.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get value() {
        return this.__value.get();
    }
    set value(newValue) {
        this.__value.set(newValue);
    }
    render() {
        Flex.create({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.SpaceBetween });
        Flex.height(200);
        Flex.width(300);
        Flex.padding(60);
        Flex.border({ width: 1 });
        Flex.margin(30);
        Gesture.create(GesturePriority.Low);
        TapGesture.create({ count: 2 });
        TapGesture.onAction(() => {
            this.value = 'TapGesture onAction';
        });
        TapGesture.pop();
        Gesture.pop();
        Text.create('Click twice');
        Text.pop();
        Text.create(this.value);
        Text.pop();
        Flex.pop();
    }
}
loadDocument(new TapGestureExample("1", undefined, {}));
//# sourceMappingURL=tapGesture.js.map