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
class DataModel{
    private myData1: number = 0
}

@Entry
@Component
struct MyStateComponent {
    @State myState1: any = { count: 0 }
    @State myState2: number = 0
    @State myState3: boolean = false
    @State myState4: string = 'Home'
    @State myState5: DataModel = new DataModel()

    private myVar : number = 0
    private myVar2 : number

    build() {

    }
}`

export const expectResult: string =
`class DataModel {
    constructor() {
        this.myData1 = 0;
    }
}
class MyStateComponent extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.__myState1 = new ObservedPropertyObject({ count: 0 }, this, "myState1");
        this.__myState2 = new ObservedPropertySimple(0, this, "myState2");
        this.__myState3 = new ObservedPropertySimple(false, this, "myState3");
        this.__myState4 = new ObservedPropertySimple('Home', this, "myState4");
        this.__myState5 = new ObservedPropertyObject(new DataModel(), this, "myState5");
        this.myVar = 0;
        this.myVar2 = undefined;
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
        if (params.myState5 !== undefined) {
            this.myState5 = params.myState5;
        }
        if (params.myVar !== undefined) {
            this.myVar = params.myVar;
        }
        if (params.myVar2 !== undefined) {
            this.myVar2 = params.myVar2;
        }
    }
    aboutToBeDeleted() {
        this.__myState1.aboutToBeDeleted();
        this.__myState2.aboutToBeDeleted();
        this.__myState3.aboutToBeDeleted();
        this.__myState4.aboutToBeDeleted();
        this.__myState5.aboutToBeDeleted();
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
    get myState5() {
        return this.__myState5.get();
    }
    set myState5(newValue) {
        this.__myState5.set(newValue);
    }
    render() {
    }
}
loadDocument(new MyStateComponent("1", undefined, {}));
`