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

export const source: string = `
@Entry
@Component
struct MyComponent2 {
    @State arr: number[] = [10, 20, 30]

    build() {
        Column() {
            Button() {
                Text('Reverse Array')
            }.onClick(() => {
                this.arr.reverse()
            })

            ForEach(this.arr,                         // Parameter 1: array to be iterated
                    (item: number) => {               // Parameter 2: item generator
                        Column() {
                            Divider()
                        }
                    },
                    (item: number) => item.toString() // Parameter 3: unique key generator, which is optional but recommended.
            )
        }
    }
}`

export const expectResult: string =
`class MyComponent2 extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.__arr = new ObservedPropertyObject([10, 20, 30], this, "arr");
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.arr !== undefined) {
            this.arr = params.arr;
        }
    }
    aboutToBeDeleted() {
        this.__arr.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get arr() {
        return this.__arr.get();
    }
    set arr(newValue) {
        this.__arr.set(newValue);
    }
    render() {
        Column.create();
        Button.createWithChild();
        Button.onClick(() => {
            this.arr.reverse();
        });
        Text.create('Reverse Array');
        Text.pop();
        Button.pop();
        ForEach.create("2", this, ObservedObject.GetRawObject(this.arr), // Parameter 1: array to be iterated
        (item) => {
            Column.create();
            Divider.create();
            Column.pop();
        }, (item) => item.toString() // Parameter 3: unique key generator, which is optional but recommended.
        );
        ForEach.pop();
        Column.pop();
    }
}
loadDocument(new MyComponent2("1", undefined, {}));
`
