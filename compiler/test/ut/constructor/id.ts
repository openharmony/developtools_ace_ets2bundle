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
struct HomeComponent {
    private value1: string = "1"
    value2: string = "2"
    @Prop value3: number
    @State value4: Array<number> = [1, 2, 3]
    @Link value5: string
    value6: string
    private value7: string
    @State value8: string = "value8"

    build() {
      Column() {
        ForEach([],
          item => {
            Column() {
              Banner()
              Text('1')
              if (this.value1) {
                Banner({value2: '2'})
                Text('2')
              }
            }
          },
          item => item
        )
        Banner({value1: '2', value2: '3', value3: '4'})
        Text('3')
        if (true) {
          Banner({value1: '3', value2: '2', value3: '1'})
          Text('4')
        }
      }
      .height(500)
    }
  }

@Component
struct Banner {
    private value1: string = "hello world 4"
    private value2: string = "hello world 5"
    private value3: string = "hello world 6"

    build() {
      Column() {
        Text(this.value1)
        Text(this.value2)
        Text(this.value3)
      }
    }
}`

export const expectResult: string =
`class HomeComponent extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.value1 = "1";
        this.value2 = "2";
        this.__value3 = new SynchedPropertySimpleOneWay(params.value3, this, "value3");
        this.__value4 = new ObservedPropertyObject([1, 2, 3], this, "value4");
        this.__value5 = new SynchedPropertySimpleTwoWay(params.value5, this, "value5");
        this.value6 = undefined;
        this.value7 = undefined;
        this.__value8 = new ObservedPropertySimple("value8", this, "value8");
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.value1 !== undefined) {
            this.value1 = params.value1;
        }
        if (params.value2 !== undefined) {
            this.value2 = params.value2;
        }
        this.value3 = params.value3;
        if (params.value4 !== undefined) {
            this.value4 = params.value4;
        }
        if (params.value6 !== undefined) {
            this.value6 = params.value6;
        }
        if (params.value7 !== undefined) {
            this.value7 = params.value7;
        }
        if (params.value8 !== undefined) {
            this.value8 = params.value8;
        }
    }
    aboutToBeDeleted() {
        this.__value3.aboutToBeDeleted();
        this.__value4.aboutToBeDeleted();
        this.__value5.aboutToBeDeleted();
        this.__value8.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get value3() {
        return this.__value3.get();
    }
    set value3(newValue) {
        this.__value3.set(newValue);
    }
    get value4() {
        return this.__value4.get();
    }
    set value4(newValue) {
        this.__value4.set(newValue);
    }
    get value5() {
        return this.__value5.get();
    }
    set value5(newValue) {
        this.__value5.set(newValue);
    }
    get value8() {
        return this.__value8.get();
    }
    set value8(newValue) {
        this.__value8.set(newValue);
    }
    render() {
        Column.create();
        Column.height(500);
        ForEach.create("4", this, ObservedObject.GetRawObject([]), item => {
            Column.create();
            let earlierCreatedChild_2 = this.findChildById("2");
            if (earlierCreatedChild_2 == undefined) {
                View.create(new Banner("2", this, {}));
            }
            else {
                earlierCreatedChild_2.updateWithValueParams({});
                if (!earlierCreatedChild_2.needsUpdate()) {
                    earlierCreatedChild_2.markStatic();
                }
                View.create(earlierCreatedChild_2);
            }
            Text.create('1');
            Text.pop();
            If.create();
            if (this.value1) {
                If.branchId(0);
                let earlierCreatedChild_3 = this.findChildById("3");
                if (earlierCreatedChild_3 == undefined) {
                    View.create(new Banner("3", this, { value2: '2' }));
                }
                else {
                    earlierCreatedChild_3.updateWithValueParams({
                        value2: '2'
                    });
                    if (!earlierCreatedChild_3.needsUpdate()) {
                        earlierCreatedChild_3.markStatic();
                    }
                    View.create(earlierCreatedChild_3);
                }
                Text.create('2');
                Text.pop();
            }
            If.pop();
            Column.pop();
        }, item => item);
        ForEach.pop();
        let earlierCreatedChild_5 = this.findChildById("5");
        if (earlierCreatedChild_5 == undefined) {
            View.create(new Banner("5", this, { value1: '2', value2: '3', value3: '4' }));
        }
        else {
            earlierCreatedChild_5.updateWithValueParams({
                value1: '2', value2: '3', value3: '4'
            });
            if (!earlierCreatedChild_5.needsUpdate()) {
                earlierCreatedChild_5.markStatic();
            }
            View.create(earlierCreatedChild_5);
        }
        Text.create('3');
        Text.pop();
        If.create();
        if (true) {
            If.branchId(0);
            let earlierCreatedChild_6 = this.findChildById("6");
            if (earlierCreatedChild_6 == undefined) {
                View.create(new Banner("6", this, { value1: '3', value2: '2', value3: '1' }));
            }
            else {
                earlierCreatedChild_6.updateWithValueParams({
                    value1: '3', value2: '2', value3: '1'
                });
                if (!earlierCreatedChild_6.needsUpdate()) {
                    earlierCreatedChild_6.markStatic();
                }
                View.create(earlierCreatedChild_6);
            }
            Text.create('4');
            Text.pop();
        }
        If.pop();
        Column.pop();
    }
}
class Banner extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.value1 = "hello world 4";
        this.value2 = "hello world 5";
        this.value3 = "hello world 6";
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
loadDocument(new HomeComponent("1", undefined, {}));
`
