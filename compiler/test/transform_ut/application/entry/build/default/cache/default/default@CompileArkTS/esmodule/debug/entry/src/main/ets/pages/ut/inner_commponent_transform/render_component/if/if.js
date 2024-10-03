let __generate__Id = 0;
function generateId() {
    return "if_" + ++__generate__Id;
}
import { TestComponent } from '../../../../../test/TestComponent';
import { Animal } from '../../../../../test/TsModule';
class MyComponent extends View {
    constructor(compilerAssignedUniqueChildId, parent, params, localStorage) {
        super(compilerAssignedUniqueChildId, parent, localStorage);
        this.pass = true;
        this.count = 10;
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.pass !== undefined) {
            this.pass = params.pass;
        }
        if (params.count !== undefined) {
            this.count = params.count;
        }
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id());
    }
    render() {
        Column.create();
        If.create();
        if (this.pass) {
            If.branchId(0);
            If.create();
            if (this.count < 0) {
                If.branchId(0);
                Text.create('count is negative');
                Text.fontSize(32);
                Text.pop();
            }
            else if (this.count % 2 === 0) {
                If.branchId(1);
                Divider.create();
                Text.create('even');
                Text.fontSize(32);
                Text.pop();
            }
            else {
                If.branchId(2);
                Divider.create();
                Text.create('odd');
                Text.fontSize(32);
                Text.pop();
            }
            If.pop();
        }
        else {
            If.branchId(1);
            Text.create('fail');
            Text.fontSize(32);
            Text.pop();
        }
        If.pop();
        If.create();
        if (Animal.Dog) {
            If.branchId(0);
            let earlierCreatedChild_2 = (this && this.findChildById) ? this.findChildById("2") : undefined;
            if (earlierCreatedChild_2 == undefined) {
                View.create(new TestComponent("2", this, { content: 'if (import enum)' }));
            }
            else {
                earlierCreatedChild_2.updateWithValueParams({
                    content: 'if (import enum)'
                });
                if (!earlierCreatedChild_2.needsUpdate()) {
                    earlierCreatedChild_2.markStatic();
                }
                View.create(earlierCreatedChild_2);
            }
            Divider.create();
        }
        If.pop();
        Column.pop();
    }
}
loadDocument(new MyComponent("1", undefined, {}));
//# sourceMappingURL=if.js.map