"use strict";
let __generate__Id = 0;
function generateId() {
    return "localStorage_" + ++__generate__Id;
}
let storage = LocalStorage.GetShared();
class ClassA {
    constructor(a) {
        this.id = 1;
        this.type = 2;
        this.a = "aaa";
        this.a = a;
    }
}
class LocalStorageComponent extends View {
    constructor(compilerAssignedUniqueChildId, parent, params, localStorage) {
        super(compilerAssignedUniqueChildId, parent, localStorage);
        this.__simpleVarName = this.localStorage_.setAndLink("storageSimpleProp", 0, this, "simpleVarName");
        this.__objectName = this.localStorage_.setAndProp("storageObjectProp", new ClassA("x"), this, "objectName");
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
    }
    aboutToBeDeleted() {
        this.__simpleVarName.aboutToBeDeleted();
        this.__objectName.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get simpleVarName() {
        return this.__simpleVarName.get();
    }
    set simpleVarName(newValue) {
        this.__simpleVarName.set(newValue);
    }
    get objectName() {
        return this.__objectName.get();
    }
    set objectName(newValue) {
        this.__objectName.set(newValue);
    }
    render() {
        Column.create();
        Column.height(500);
        Text.create(this.objectName.a);
        Text.onClick(() => {
            this.simpleVarName += 1;
            this.objectName.a = this.objectName.a === 'x' ? 'yex' : 'no';
        });
        Text.pop();
        Column.pop();
    }
}
loadDocument(new LocalStorageComponent("1", undefined, {}, storage));
//# sourceMappingURL=localStorage.js.map