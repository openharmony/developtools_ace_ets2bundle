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
@Entry
@Component
struct MyComponent {
    private test: string = 'Hello'
    build() {
        Column() {
        Text(this.test)
        ForEach(
            weekNames,
            (item: string, index: number) =>
                Text(item).fontSize(10)
            ,
            (item: any, index: number) => item)
        }.width(100)
    }
}`

exports.expectResult =
`"use strict";
class MyComponent extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.test = 'Hello';
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.test !== undefined) {
            this.test = params.test;
        }
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id());
    }
    render() {
        Column.create();
        Column.width(100);
        Text.create(this.test);
        Text.pop();
        ForEach.create("2", this, ObservedObject.GetRawObject(weekNames), (item, index) => {
            Text.create(item);
            Text.fontSize(10);
            Text.pop();
        }, (item, index) => item);
        ForEach.pop();
        Column.pop();
    }
}
loadDocument(new MyComponent("1", undefined, {}));
`
