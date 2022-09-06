/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

exports.source = `
// class without @Component convert tool will not process.
class Month {
    year: number = 2010; // why add assignment here, TS grammar required, if not it will omit by TSC.
    month: number = 2;
    days: number[] = [1, 2];

    constructor(year:number, month:number, days:number[]){
        this.year = year;
        this.month = month;
        this.days = days;
    }
}

@Component
@Entry
struct Calendar {

// simulate with 6 months
@State calendar : Month[] = [
    new Month(2020, 1, [...Array(31).keys()]),
    new Month(2020, 2, [...Array(28).keys()]),
    new Month(2020, 3, [...Array(31).keys()]),
    new Month(2020, 4, [...Array(30).keys()]),
    new Month(2020, 5, [...Array(31).keys()]),
    new Month(2020, 6, [...Array(30).keys()])
]

    build() {
        Column() {
            Button() {
                Text('next month')
            }.onClick(() => {
                this.calendar.shift()
                this.calendar.push(new Month(2020, 7, [...Array(31).keys()]))
            })

            ForEach(this.calendar,
                    (item: Month) => {
                        ForEach(item.days,
                                (day : number) => {
                                    Text('day')
                                },
                                (day : number) => day.toString()
                            ) // inner ForEach
                    },
                    (item: Month) => (item.year * 12 + item.month).toString() // field is used together with year and month as the unique ID of the month.
            ) // outer ForEach
        }
    }
}`

exports.expectResult =
`"use strict";
// class without @Component convert tool will not process.
class Month {
    constructor(year, month, days) {
        this.year = 2010; // why add assignment here, TS grammar required, if not it will omit by TSC.
        this.month = 2;
        this.days = [1, 2];
        this.year = year;
        this.month = month;
        this.days = days;
    }
}
class Calendar extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.__calendar = new ObservedPropertyObject([
            new Month(2020, 1, [...Array(31).keys()]),
            new Month(2020, 2, [...Array(28).keys()]),
            new Month(2020, 3, [...Array(31).keys()]),
            new Month(2020, 4, [...Array(30).keys()]),
            new Month(2020, 5, [...Array(31).keys()]),
            new Month(2020, 6, [...Array(30).keys()])
        ], this, "calendar");
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
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
        Button.createWithChild();
        Button.onClick(() => {
            this.calendar.shift();
            this.calendar.push(new Month(2020, 7, [...Array(31).keys()]));
        });
        Text.create('next month');
        Text.pop();
        Button.pop();
        ForEach.create("3", this, ObservedObject.GetRawObject(this.calendar), (item) => {
            ForEach.create("2", this, ObservedObject.GetRawObject(item.days), (day) => {
                Text.create('day');
                Text.pop();
            }, (day) => day.toString()); // inner ForEach
            ForEach.pop();
        }, (item) => (item.year * 12 + item.month).toString() // field is used together with year and month as the unique ID of the month.
        ); // outer ForEach
        ForEach.pop();
        Column.pop();
    }
}
loadDocument(new Calendar("1", undefined, {}));
`
