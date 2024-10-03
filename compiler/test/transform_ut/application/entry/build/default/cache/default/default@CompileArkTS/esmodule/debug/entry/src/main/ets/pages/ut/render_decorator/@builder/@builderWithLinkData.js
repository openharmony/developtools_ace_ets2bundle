"use strict";
let __generate__Id = 0;
function generateId() {
    return "@builderWithLinkData_" + ++__generate__Id;
}
class TitleComp extends View {
    constructor(compilerAssignedUniqueChildId, parent, params, localStorage) {
        super(compilerAssignedUniqueChildId, parent, localStorage);
        this.__title = new SynchedPropertySimpleTwoWay(params.title, this, "title");
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
    }
    aboutToBeDeleted() {
        this.__title.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get title() {
        return this.__title.get();
    }
    set title(newValue) {
        this.__title.set(newValue);
    }
    render() {
        Text.create(this.title);
        Text.pop();
    }
}
class TestPage extends View {
    constructor(compilerAssignedUniqueChildId, parent, params, localStorage) {
        super(compilerAssignedUniqueChildId, parent, localStorage);
        this.__value = new ObservedPropertySimple('hello world', this, "value");
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
    TitleCompView(parent = null) {
        let earlierCreatedChild_2 = ((parent ? parent : this) && (parent ? parent : this).findChildById) ? (parent ? parent : this).findChildById(generateId()) : undefined;
        if (earlierCreatedChild_2 == undefined) {
            View.create(new TitleComp("@builderWithLinkData_" + __generate__Id, parent ? parent : this, { title: this.__value }));
        }
        else {
            earlierCreatedChild_2.updateWithValueParams({});
            View.create(earlierCreatedChild_2);
        }
    }
    render() {
        Flex.create();
        this.TitleCompView(this);
        Flex.pop();
    }
}
loadDocument(new TestPage("1", undefined, {}));
//# sourceMappingURL=@builderWithLinkData.js.map