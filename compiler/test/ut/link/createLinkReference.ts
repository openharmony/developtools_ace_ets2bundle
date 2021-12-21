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
struct MyLinkTestComponent {
    @Link myLink1?: any
    @Link myLink2?: number
    @Link myLink3?: boolean
    @Link myLink4?: string

    private myVar: number = 0
    private myVar2: number

    build() {

    }
}

@Entry
@Component
struct LinkTest {
    @State myState1: any = { count: 0 }
    @State myState2: number = 0
    @State myState3: boolean = false
    @State myState4: string = 'Home'

    build() {
        Row() {
            MyLinkTestComponent({
                myLink1: $myState1,
                myLink2: this.$myState2,
                myLink3: $myState3,
                myLink4: this.$myState4,
                myVar: 100,
                myVar2: 100
            })
        }
    }
}`

exports.expectResult =
`class MyLinkTestComponent extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.__myLink1 = new SynchedPropertyObjectTwoWay(params.myLink1, this, "myLink1");
        this.__myLink2 = new SynchedPropertySimpleTwoWay(params.myLink2, this, "myLink2");
        this.__myLink3 = new SynchedPropertySimpleTwoWay(params.myLink3, this, "myLink3");
        this.__myLink4 = new SynchedPropertySimpleTwoWay(params.myLink4, this, "myLink4");
        this.myVar = 0;
        this.myVar2 = undefined;
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.myVar !== undefined) {
            this.myVar = params.myVar;
        }
        if (params.myVar2 !== undefined) {
            this.myVar2 = params.myVar2;
        }
    }
    aboutToBeDeleted() {
        this.__myLink1.aboutToBeDeleted();
        this.__myLink2.aboutToBeDeleted();
        this.__myLink3.aboutToBeDeleted();
        this.__myLink4.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get myLink1() {
        return this.__myLink1.get();
    }
    set myLink1(newValue) {
        this.__myLink1.set(newValue);
    }
    get myLink2() {
        return this.__myLink2.get();
    }
    set myLink2(newValue) {
        this.__myLink2.set(newValue);
    }
    get myLink3() {
        return this.__myLink3.get();
    }
    set myLink3(newValue) {
        this.__myLink3.set(newValue);
    }
    get myLink4() {
        return this.__myLink4.get();
    }
    set myLink4(newValue) {
        this.__myLink4.set(newValue);
    }
    render() {
    }
}
class LinkTest extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.__myState1 = new ObservedPropertyObject({ count: 0 }, this, "myState1");
        this.__myState2 = new ObservedPropertySimple(0, this, "myState2");
        this.__myState3 = new ObservedPropertySimple(false, this, "myState3");
        this.__myState4 = new ObservedPropertySimple('Home', this, "myState4");
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.myState1 !== undefined) {
            this.myState1 = params.myState1;
        }
        if (params.myState2 !== undefined) {
            this.myState2 = params.myState2;
        }
        if (params.myState3 !== undefined) {
            this.myState3 = params.myState3;
        }
        if (params.myState4 !== undefined) {
            this.myState4 = params.myState4;
        }
    }
    aboutToBeDeleted() {
        this.__myState1.aboutToBeDeleted();
        this.__myState2.aboutToBeDeleted();
        this.__myState3.aboutToBeDeleted();
        this.__myState4.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get myState1() {
        return this.__myState1.get();
    }
    set myState1(newValue) {
        this.__myState1.set(newValue);
    }
    get myState2() {
        return this.__myState2.get();
    }
    set myState2(newValue) {
        this.__myState2.set(newValue);
    }
    get myState3() {
        return this.__myState3.get();
    }
    set myState3(newValue) {
        this.__myState3.set(newValue);
    }
    get myState4() {
        return this.__myState4.get();
    }
    set myState4(newValue) {
        this.__myState4.set(newValue);
    }
    render() {
        Row.create();
        let earlierCreatedChild_2 = this.findChildById("2");
        if (earlierCreatedChild_2 == undefined) {
            View.create(new MyLinkTestComponent("2", this, {
                myLink1: this.__myState1,
                myLink2: this.__myState2,
                myLink3: this.__myState3,
                myLink4: this.__myState4,
                myVar: 100,
                myVar2: 100
            }));
        }
        else {
            earlierCreatedChild_2.updateWithValueParams({
                myVar: 100,
                myVar2: 100
            });
            View.create(earlierCreatedChild_2);
        }
        Row.pop();
    }
}
loadDocument(new LinkTest("1", undefined, {}));
`
