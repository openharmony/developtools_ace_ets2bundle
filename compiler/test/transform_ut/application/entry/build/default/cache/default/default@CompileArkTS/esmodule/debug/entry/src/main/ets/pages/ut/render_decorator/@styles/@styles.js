"use strict";
let __generate__Id = 0;
function generateId() {
    return "@styles_" + ++__generate__Id;
}
class FancyUse extends View {
    constructor(compilerAssignedUniqueChildId, parent, params, localStorage) {
        super(compilerAssignedUniqueChildId, parent, localStorage);
        this.__enable = new ObservedPropertySimple(true, this, "enable");
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.enable !== undefined) {
            this.enable = params.enable;
        }
    }
    aboutToBeDeleted() {
        this.__enable.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get enable() {
        return this.__enable.get();
    }
    set enable(newValue) {
        this.__enable.set(newValue);
    }
    render() {
        Column.create({ space: 10 });
        Text.create("Fancy");
        Text.backgroundColor(Color.Red);
        Text.width(100);
        Text.height(100);
        Text.pop();
        Text.create("Fancy");
        Text.backgroundColor(Color.Blue);
        Text.width(100);
        Text.height(100);
        Text.pop();
        Button.createWithChild();
        Button.enabled(this.enable);
        Button.onClick(() => {
            this.enable = false;
        });
        ViewStackProcessor.visualState("normal");
        Button.backgroundColor(Color.Green);
        ViewStackProcessor.visualState("disabled");
        Button.backgroundColor(Color.Blue);
        ViewStackProcessor.visualState("pressed");
        Button.backgroundColor(Color.Red);
        ViewStackProcessor.visualState();
        Text.create("Fancy");
        Text.pop();
        Button.pop();
        Column.pop();
    }
}
loadDocument(new FancyUse("1", undefined, {}));
//# sourceMappingURL=@styles.js.map