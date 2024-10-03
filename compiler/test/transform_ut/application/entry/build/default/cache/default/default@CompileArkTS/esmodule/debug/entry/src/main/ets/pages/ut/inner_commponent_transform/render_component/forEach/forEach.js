"use strict";
let __generate__Id = 0;
function generateId() {
    return "forEach_" + ++__generate__Id;
}
class Month {
    constructor(year, month, days) {
        this.year = year;
        this.month = month;
        this.days = days;
    }
}
class MyComponent extends View {
    constructor(compilerAssignedUniqueChildId, parent, params, localStorage) {
        super(compilerAssignedUniqueChildId, parent, localStorage);
        this.languages = ['ets', 'js', 'java'];
        this.weekNames = ['日', '一', '二', '三', '四', '五', '六'];
        this.__calendar = new ObservedPropertyObject([
            new Month(2020, 1, [...Array(31).keys()]),
            new Month(2020, 2, [...Array(28).keys()]),
            new Month(2020, 3, [...Array(31).keys()]),
            new Month(2020, 4, [...Array(30).keys()]),
            new Month(2020, 5, [...Array(31).keys()]),
            new Month(2020, 6, [...Array(30).keys()]),
        ], this, "calendar");
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.languages !== undefined) {
            this.languages = params.languages;
        }
        if (params.weekNames !== undefined) {
            this.weekNames = params.weekNames;
        }
        if (params.calendar !== undefined) {
            this.calendar = params.calendar;
        }
    }
    aboutToBeDeleted() {
        this.__calendar.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get calendar() {
        return this.__calendar.get();
    }
    set calendar(newValue) {
        this.__calendar.set(newValue);
    }
    render() {
        Column.create();
        Column.width(100);
        Row.create();
        ForEach.create("2", this, ObservedObject.GetRawObject(this.languages), (item, index) => {
            GridItem.create();
            Text.create(item);
            Text.fontSize(30);
            Text.pop();
            GridItem.pop();
        }, (item, index) => item);
        ForEach.pop();
        Row.pop();
        Row.create();
        ForEach.create("3", this, ObservedObject.GetRawObject(this.weekNames), (item, index) => {
            GridItem.create();
            If.create();
            if (item === '日') {
                If.branchId(0);
                Text.create(item);
                Text.fontSize(20);
                Text.fontColor(Color.Red);
                Text.pop();
            }
            else {
                If.branchId(1);
                Text.create(item);
                Text.fontSize(10);
                Text.pop();
            }
            If.pop();
            GridItem.pop();
        });
        ForEach.pop();
        Row.pop();
        Row.create();
        Button.createWithLabel('next month');
        Button.onClick(() => {
            this.calendar.shift();
            this.calendar.push({
                year: 2020,
                month: 7,
                days: [...Array(31)
                        .keys()]
            });
        });
        Button.pop();
        ForEach.create("5", this, ObservedObject.GetRawObject(this.calendar), (item) => {
            Text.create('month:' + item.month);
            Text.pop();
            Grid.create();
            Grid.rowsGap(20);
            ForEach.create("4", this, ObservedObject.GetRawObject(item.days), (day) => {
                GridItem.create();
                Text.create((day + 1).toString());
                Text.fontSize(30);
                Text.pop();
                GridItem.pop();
            }, (day) => day.toString());
            ForEach.pop();
            Grid.pop();
        }, (item) => (item.year * 12 + item.month).toString());
        ForEach.pop();
        Row.pop();
        Column.pop();
    }
}
loadDocument(new MyComponent("1", undefined, {}));
//# sourceMappingURL=forEach.js.map