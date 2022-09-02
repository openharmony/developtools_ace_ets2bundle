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
struct HomeComponent {
    private value1: string = "hello world 1"
    private value2: string = "hello world 2"
    private value3: string = "hello world 3"
    private values: Array<Text> = []
    build() {
        Column() {
            ForEach(this.values, item => {
                Column() {
                    if (this.value1) {
                        Text(this.value1)
                    }
                    if (this.value2) {
                        Text(this.value2)
                    } else {
                        Text(this.value3)
                    }
                }
            }, item => item)
            ForEach(this.values, item => {
                if (this.value1) {
                    Text(this.value1)
                }
                if (this.value2) {
                    Text(this.value2)
                } else {
                    Text(this.value3)
                }
            }, item => item)
        }
    }
}`

exports.expectResult =
`"use strict";
class HomeComponent extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.value1 = "hello world 1";
        this.value2 = "hello world 2";
        this.value3 = "hello world 3";
        this.values = [];
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.value1 !== undefined) {
            this.value1 = params.value1;
        }
        if (params.value2 !== undefined) {
            this.value2 = params.value2;
        }
        if (params.value3 !== undefined) {
            this.value3 = params.value3;
        }
        if (params.values !== undefined) {
            this.values = params.values;
        }
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id());
    }
    render() {
        Column.create();
        ForEach.create("2", this, ObservedObject.GetRawObject(this.values), item => {
            Column.create();
            If.create();
            if (this.value1) {
                If.branchId(0);
                Text.create(this.value1);
                Text.pop();
            }
            If.pop();
            If.create();
            if (this.value2) {
                If.branchId(0);
                Text.create(this.value2);
                Text.pop();
            }
            else {
                If.branchId(1);
                Text.create(this.value3);
                Text.pop();
            }
            If.pop();
            Column.pop();
        }, item => item);
        ForEach.pop();
        ForEach.create("3", this, ObservedObject.GetRawObject(this.values), item => {
            If.create();
            if (this.value1) {
                If.branchId(0);
                Text.create(this.value1);
                Text.pop();
            }
            If.pop();
            If.create();
            if (this.value2) {
                If.branchId(0);
                Text.create(this.value2);
                Text.pop();
            }
            else {
                If.branchId(1);
                Text.create(this.value3);
                Text.pop();
            }
            If.pop();
        }, item => item);
        ForEach.pop();
        Column.pop();
    }
}
loadDocument(new HomeComponent("1", undefined, {}));
`
