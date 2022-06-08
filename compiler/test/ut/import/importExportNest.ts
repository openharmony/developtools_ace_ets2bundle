/*
 * Copyright (c) 2022 Huawei Device Co., Ltd.
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
import { Base, BaseTest } from './test/pages/ImportNestAll';

@Entry
@Component
struct ImportTest {
  @State testState1: string = 'Base'
  @State testState2: number = 0
  @State testState3: object = { name: 'Base' }
  @State testState4: string = 'BaseTest'
  @State testState5: number = 1
  @State testState6: object = { name: 'BaseTest' }

  build() {
    Column() {
      Base({
        testStr: $testState1,
        testNum: $testState2,
        testObj: $testState3
      })
      BaseTest({
        testStr: $testState4,
        testNum: $testState5,
        testObj: $testState6
      })
    }
  }
}
`

exports.expectResult =
`"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ImportNestAll_1 = require("./test/pages/ImportNestAll");
class ImportTest extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.__testState1 = new ObservedPropertySimple('Base', this, "testState1");
        this.__testState2 = new ObservedPropertySimple(0, this, "testState2");
        this.__testState3 = new ObservedPropertyObject({ name: 'Base' }, this, "testState3");
        this.__testState4 = new ObservedPropertySimple('BaseTest', this, "testState4");
        this.__testState5 = new ObservedPropertySimple(1, this, "testState5");
        this.__testState6 = new ObservedPropertyObject({ name: 'BaseTest' }, this, "testState6");
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.testState1 !== undefined) {
            this.testState1 = params.testState1;
        }
        if (params.testState2 !== undefined) {
            this.testState2 = params.testState2;
        }
        if (params.testState3 !== undefined) {
            this.testState3 = params.testState3;
        }
        if (params.testState4 !== undefined) {
            this.testState4 = params.testState4;
        }
        if (params.testState5 !== undefined) {
            this.testState5 = params.testState5;
        }
        if (params.testState6 !== undefined) {
            this.testState6 = params.testState6;
        }
    }
    aboutToBeDeleted() {
        this.__testState1.aboutToBeDeleted();
        this.__testState2.aboutToBeDeleted();
        this.__testState3.aboutToBeDeleted();
        this.__testState4.aboutToBeDeleted();
        this.__testState5.aboutToBeDeleted();
        this.__testState6.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get testState1() {
        return this.__testState1.get();
    }
    set testState1(newValue) {
        this.__testState1.set(newValue);
    }
    get testState2() {
        return this.__testState2.get();
    }
    set testState2(newValue) {
        this.__testState2.set(newValue);
    }
    get testState3() {
        return this.__testState3.get();
    }
    set testState3(newValue) {
        this.__testState3.set(newValue);
    }
    get testState4() {
        return this.__testState4.get();
    }
    set testState4(newValue) {
        this.__testState4.set(newValue);
    }
    get testState5() {
        return this.__testState5.get();
    }
    set testState5(newValue) {
        this.__testState5.set(newValue);
    }
    get testState6() {
        return this.__testState6.get();
    }
    set testState6(newValue) {
        this.__testState6.set(newValue);
    }
    render() {
        Column.create();
        let earlierCreatedChild_2 = this.findChildById("2");
        if (earlierCreatedChild_2 == undefined) {
            View.create(new ImportNestAll_1.Base("2", this, {
                testStr: this.__testState1,
                testNum: this.__testState2,
                testObj: this.__testState3
            }));
        }
        else {
            earlierCreatedChild_2.updateWithValueParams({});
            View.create(earlierCreatedChild_2);
        }
        let earlierCreatedChild_3 = this.findChildById("3");
        if (earlierCreatedChild_3 == undefined) {
            View.create(new ImportNestAll_1.BaseTest("3", this, {
                testStr: this.__testState4,
                testNum: this.__testState5,
                testObj: this.__testState6
            }));
        }
        else {
            earlierCreatedChild_3.updateWithValueParams({});
            View.create(earlierCreatedChild_3);
        }
        Column.pop();
    }
}
loadDocument(new ImportTest("1", undefined, {}));
`
