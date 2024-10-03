"use strict";
let __generate__Id = 0;
function generateId() {
    return "forEachSecondFunction_" + ++__generate__Id;
}
class MyComponent extends View {
    constructor(compilerAssignedUniqueChildId, parent, params, localStorage) {
        super(compilerAssignedUniqueChildId, parent, localStorage);
        this.__arr = new ObservedPropertyObject([10, 20, 30], this, "arr");
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.arr !== undefined) {
            this.arr = params.arr;
        }
    }
    aboutToBeDeleted() {
        this.__arr.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get arr() {
        return this.__arr.get();
    }
    set arr(newValue) {
        this.__arr.set(newValue);
    }
    render() {
        Column.create({ space: 5 });
        Column.width("100%");
        Column.height("100%");
        Button.createWithLabel('Reverse Array');
        Button.onClick(() => {
            this.arr.reverse();
        });
        Button.pop();
        ForEach.create("2", this, ObservedObject.GetRawObject(this.arr), (item) => {
            Text.create('item');
            Text.fontSize(18);
            Text.pop();
            Divider.create();
            Divider.strokeWidth(2);
        }, (item) => item.toString());
        ForEach.pop();
        Column.pop();
    }
}
loadDocument(new MyComponent("1", undefined, {}));
//# sourceMappingURL=forEachSecondFunction.js.map