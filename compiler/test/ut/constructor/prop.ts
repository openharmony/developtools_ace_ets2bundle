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
struct MyPropComponent {
    @Prop myProp1?: any
    @Prop myProp2?: number
    @Prop myProp3?: boolean
    @Prop myProp4?: string

    private myVar: number = 0
    private myVar2: number

    build() {

    }
}`

exports.expectResult =
`class MyPropComponent extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.__myProp2 = new SynchedPropertySimpleOneWay(params.myProp2, this, "myProp2");
        this.__myProp3 = new SynchedPropertySimpleOneWay(params.myProp3, this, "myProp3");
        this.__myProp4 = new SynchedPropertySimpleOneWay(params.myProp4, this, "myProp4");
        this.myVar = 0;
        this.myVar2 = undefined;
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        this.myProp1 = params.myProp1;
        this.myProp2 = params.myProp2;
        this.myProp3 = params.myProp3;
        this.myProp4 = params.myProp4;
        if (params.myVar !== undefined) {
            this.myVar = params.myVar;
        }
        if (params.myVar2 !== undefined) {
            this.myVar2 = params.myVar2;
        }
    }
    aboutToBeDeleted() {
        this.__myProp1.aboutToBeDeleted();
        this.__myProp2.aboutToBeDeleted();
        this.__myProp3.aboutToBeDeleted();
        this.__myProp4.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get myProp1() {
        return this.__myProp1.get();
    }
    set myProp1(newValue) {
        this.__myProp1.set(newValue);
    }
    get myProp2() {
        return this.__myProp2.get();
    }
    set myProp2(newValue) {
        this.__myProp2.set(newValue);
    }
    get myProp3() {
        return this.__myProp3.get();
    }
    set myProp3(newValue) {
        this.__myProp3.set(newValue);
    }
    get myProp4() {
        return this.__myProp4.get();
    }
    set myProp4(newValue) {
        this.__myProp4.set(newValue);
    }
    render() {
    }
}
loadDocument(new MyPropComponent("1", undefined, {}));
`
