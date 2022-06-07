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
import { AllStarComponent } from './test/pages/ExportStarComponent'
import TsModule from './test/pages/TsModule'

@Entry
@Component
struct ImportTest {
  @State myState1: any = new TsModule(1).method()
  @State myState2: number = 0
  @State myState3: boolean = false
  @State myState4: string = 'ImportTest'

  build() {
    Column() {
        AllStarComponent.ExportComponent({
            ExportComponent1Link1: $myState1,
            ExportComponent1Link2: $myState2,
            ExportComponent1Link3: $myState3,
            ExportComponent1Link4: $myState4,
            indexState1: { count: 1 },
            indexState2: 1,
            indexState3: true,
            indexState4: 'ExportComponent1'
          })
          AllStarComponent.default({
            ExportComponent4Link1: $myState1,
            ExportComponent4Link2: $myState2,
            ExportComponent4Link3: $myState3,
            ExportComponent4Link4: $myState4,
            indexState1: { count: 1 },
            indexState2: 1,
            indexState3: true,
            indexState4: 'ExportComponent4'
          })
    }
  }
}
`

exports.expectResult =
`import { AllStarComponent } from './test/pages/ExportStarComponent';
import TsModule from './test/pages/TsModule';
class ImportTest extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.__myState1 = new ObservedPropertyObject(new TsModule(1).method(), this, "myState1");
        this.__myState2 = new ObservedPropertySimple(0, this, "myState2");
        this.__myState3 = new ObservedPropertySimple(false, this, "myState3");
        this.__myState4 = new ObservedPropertySimple('ImportTest', this, "myState4");
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
        Column.create();
        let earlierCreatedChild_2 = this.findChildById("2");
        if (earlierCreatedChild_2 == undefined) {
            View.create(new AllStarComponent.ExportComponent("2", this, {
                ExportComponent1Link1: this.__myState1,
                ExportComponent1Link2: this.__myState2,
                ExportComponent1Link3: this.__myState3,
                ExportComponent1Link4: this.__myState4,
                indexState1: { count: 1 },
                indexState2: 1,
                indexState3: true,
                indexState4: 'ExportComponent1'
            }));
        }
        else {
            earlierCreatedChild_2.updateWithValueParams({
                indexState1: { count: 1 },
                indexState2: 1,
                indexState3: true,
                indexState4: 'ExportComponent1'
            });
            View.create(earlierCreatedChild_2);
        }
        let earlierCreatedChild_3 = this.findChildById("3");
        if (earlierCreatedChild_3 == undefined) {
            View.create(new AllStarComponent.default("3", this, {
                ExportComponent4Link1: this.__myState1,
                ExportComponent4Link2: this.__myState2,
                ExportComponent4Link3: this.__myState3,
                ExportComponent4Link4: this.__myState4,
                indexState1: { count: 1 },
                indexState2: 1,
                indexState3: true,
                indexState4: 'ExportComponent4'
            }));
        }
        else {
            earlierCreatedChild_3.updateWithValueParams({
                indexState1: { count: 1 },
                indexState2: 1,
                indexState3: true,
                indexState4: 'ExportComponent4'
            });
            View.create(earlierCreatedChild_3);
        }
        Column.pop();
    }
}
loadDocument(new ImportTest("1", undefined, {}));
`
