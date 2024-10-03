"use strict";
let __generate__Id = 0;
function generateId() {
    return "forEachTwo_" + ++__generate__Id;
}
class Index extends View {
    constructor(compilerAssignedUniqueChildId, parent, params, localStorage) {
        super(compilerAssignedUniqueChildId, parent, localStorage);
        this.__WIDTH_AND_HEIGHT = new ObservedPropertyObject([
            { w: 10, h: 10 },
            { w: 20, h: 20 },
            { w: 30, h: 30 },
            { w: 40, h: 40 },
            { w: 50, h: 50 }
        ], this, "WIDTH_AND_HEIGHT");
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.WIDTH_AND_HEIGHT !== undefined) {
            this.WIDTH_AND_HEIGHT = params.WIDTH_AND_HEIGHT;
        }
    }
    aboutToBeDeleted() {
        this.__WIDTH_AND_HEIGHT.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get WIDTH_AND_HEIGHT() {
        return this.__WIDTH_AND_HEIGHT.get();
    }
    set WIDTH_AND_HEIGHT(newValue) {
        this.__WIDTH_AND_HEIGHT.set(newValue);
    }
    render() {
        Row.create();
        Row.height('100%');
        Column.create();
        Column.width('100%');
        ForEach.create("2", this, ObservedObject.GetRawObject(this.WIDTH_AND_HEIGHT), ({ w, h }) => {
            Button.createWithLabel();
            Button.width(w);
            Button.height(h);
            Button.pop();
        }, item => item.toString());
        ForEach.pop();
        Column.pop();
        Row.pop();
    }
}
loadDocument(new Index("1", undefined, {}));
//# sourceMappingURL=forEachTwo.js.map