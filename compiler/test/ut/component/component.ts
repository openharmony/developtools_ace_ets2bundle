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
@Component
@Entry
struct MyComponent {
    private value1: string = "hello world 1"
    private value2: string = "hello world 2"
    private value3: string = "hello world 3"

    build() {
        Column() {
            Text(this.value1)
            Text(this.value2)
            Text(this.value3)
        }
    }
}`

exports.expectResult =
`class MyComponent extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.value1 = "hello world 1";
        this.value2 = "hello world 2";
        this.value3 = "hello world 3";
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
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id());
    }
    render() {
        Column.create();
        Text.create(this.value1);
        Text.pop();
        Text.create(this.value2);
        Text.pop();
        Text.create(this.value3);
        Text.pop();
        Column.pop();
    }
}
loadDocument(new MyComponent("1", undefined, {}));
`
