"use strict";
let __generate__Id = 0;
function generateId() {
    return "button_" + ++__generate__Id;
}
class ButtonExample extends View {
    constructor(compilerAssignedUniqueChildId, parent, params, localStorage) {
        super(compilerAssignedUniqueChildId, parent, localStorage);
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id());
    }
    render() {
        Flex.create({ direction: FlexDirection.Column, alignItems: ItemAlign.Start, justifyContent: FlexAlign.SpaceBetween });
        Flex.create({ alignItems: ItemAlign.Center, justifyContent: FlexAlign.SpaceBetween });
        Button.createWithLabel('Ok', { type: ButtonType.Normal, stateEffect: true });
        Button.borderRadius(8);
        Button.backgroundColor(0x317aff);
        Button.width(90);
        Button.pop();
        Button.createWithChild({ type: ButtonType.Normal, stateEffect: true });
        Button.borderRadius(8);
        Button.backgroundColor(0x317aff);
        Button.width(90);
        Row.create();
        Row.alignItems(VerticalAlign.Center);
        Text.create('loading');
        Text.fontSize(12);
        Text.fontColor(0xffffff);
        Text.margin({ left: 5, right: 12 });
        Text.pop();
        Row.pop();
        Button.pop();
        Button.createWithLabel('Disable', { type: ButtonType.Normal, stateEffect: false });
        Button.opacity(0.5);
        Button.borderRadius(8);
        Button.backgroundColor(0x317aff);
        Button.width(90);
        Button.pop();
        Flex.pop();
        Flex.pop();
    }
}
loadDocument(new ButtonExample("1", undefined, {}));
//# sourceMappingURL=button.js.map