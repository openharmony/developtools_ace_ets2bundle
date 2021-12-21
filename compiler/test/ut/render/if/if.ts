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
        if (this.test === 'Hello') {
            Text(this.test)
        }

        if (this.test === 'Hello') {
            Text(this.test)
            Button()
            .width(20)
            .height(20)
        } else if (this.test === 'World') {
            Text('World')
        } else if (this.test === 'Hello World') {
            Text(this.test)
            Text('World')
        }
        else {

        }

        if (this.test === 'Hello') Text(this.test)
        else if (this.test === '') Button()
                                    .width(20)
                                    .height(20)

        if (this.test === 'Hello') {
            Text(this.test)
        }

        Text(this.test)
        Button()
            .width(20)
            .height(20)

        if (true) {
            if (this.test === 'Hello') {
            if (1) {
                Text(this.test)
            }
            } else {
            if (0) {
                Button()
                .width(20)
                .height(20)
            } else if (1) {

            }
            }
        }

        if (this.test !== 'Hello') if (this.test !== 'World') Button()
                                                                .width(20)
                                                                .height(20)
        }.width(100)
    }
}`

exports.expectResult =
`class MyComponent extends View {
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
        If.create();
        if (this.test === 'Hello') {
            If.branchId(0);
            Text.create(this.test);
            Text.pop();
        }
        If.pop();
        If.create();
        if (this.test === 'Hello') {
            If.branchId(0);
            Text.create(this.test);
            Text.pop();
            Button.createWithLabel();
            Button.width(20);
            Button.height(20);
            Button.pop();
        }
        else if (this.test === 'World') {
            If.branchId(1);
            Text.create('World');
            Text.pop();
        }
        else if (this.test === 'Hello World') {
            If.branchId(2);
            Text.create(this.test);
            Text.pop();
            Text.create('World');
            Text.pop();
        }
        else {
            If.branchId(3);
        }
        If.pop();
        If.create();
        if (this.test === 'Hello') {
            If.branchId(0);
            Text.create(this.test);
            Text.pop();
        }
        else if (this.test === '') {
            If.branchId(1);
            Button.createWithLabel();
            Button.width(20);
            Button.height(20);
            Button.pop();
        }
        If.pop();
        If.create();
        if (this.test === 'Hello') {
            If.branchId(0);
            Text.create(this.test);
            Text.pop();
        }
        If.pop();
        Text.create(this.test);
        Text.pop();
        Button.createWithLabel();
        Button.width(20);
        Button.height(20);
        Button.pop();
        If.create();
        if (true) {
            If.branchId(0);
            If.create();
            if (this.test === 'Hello') {
                If.branchId(0);
                If.create();
                if (1) {
                    If.branchId(0);
                    Text.create(this.test);
                    Text.pop();
                }
                If.pop();
            }
            else {
                If.branchId(1);
                If.create();
                if (0) {
                    If.branchId(0);
                    Button.createWithLabel();
                    Button.width(20);
                    Button.height(20);
                    Button.pop();
                }
                else if (1) {
                    If.branchId(1);
                }
                If.pop();
            }
            If.pop();
        }
        If.pop();
        If.create();
        if (this.test !== 'Hello') {
            If.create();
            If.branchId(0);
            if (this.test !== 'World') {
                If.branchId(0);
                Button.createWithLabel();
                Button.width(20);
                Button.height(20);
                Button.pop();
            }
            If.pop();
        }
        If.pop();
        Column.pop();
    }
}
loadDocument(new MyComponent("1", undefined, {}));
`
