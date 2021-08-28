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
struct MyLinkComponent {
    @Link myLink1?: any
    @Link myLink2?: number
    @Link myLink3?: boolean
    @Link myLink4?: string

    private myVar: number = 0
    private myVar2: number

    build() {

    }
}`

export const expectResult: string =
`class MyLinkComponent extends View {
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
loadDocument(new MyLinkComponent("1", undefined, {}));
`