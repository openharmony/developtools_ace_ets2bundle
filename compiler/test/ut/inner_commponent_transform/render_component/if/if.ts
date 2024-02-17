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
import { TestComponent } from './test/pages/TestComponent';
import { Animal } from './test/pages/TsModule';

@Entry
@Component
struct MyComponent {
  private pass: boolean = true
  private count: number = 10
  build() {
    Column() {
      if(this.pass) {
        if (this.count < 0) {
          Text('count is negative')
            .fontSize(32)
        } else if (this.count % 2 === 0) {
          Divider()
          Text('even')
            .fontSize(32)
        } else {
          Divider()
          Text('odd')
            .fontSize(32)
        }
      }else{
        Text('fail')
          .fontSize(32)
      }

      if(Animal.Dog){
        TestComponent({content: 'if (import enum)'})
        Divider()
      }
    }
  }
}
`

exports.expectResult =
`"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let __generate__Id = 0;
function generateId() {
    return "if_" + ++__generate__Id;
}
const TestComponent_1 = require("./test/pages/TestComponent");
const TsModule_1 = require("./test/pages/TsModule");
class MyComponent extends View {
    constructor(compilerAssignedUniqueChildId, parent, params, localStorage) {
        super(compilerAssignedUniqueChildId, parent, localStorage);
        this.pass = true;
        this.count = 10;
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.pass !== undefined) {
            this.pass = params.pass;
        }
        if (params.count !== undefined) {
            this.count = params.count;
        }
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id());
    }
    render() {
        Column.create();
        If.create();
        if (this.pass) {
            If.branchId(0);
            If.create();
            if (this.count < 0) {
                If.branchId(0);
                Text.create('count is negative');
                Text.fontSize(32);
                Text.pop();
            }
            else if (this.count % 2 === 0) {
                If.branchId(1);
                Divider.create();
                Text.create('even');
                Text.fontSize(32);
                Text.pop();
            }
            else {
                If.branchId(2);
                Divider.create();
                Text.create('odd');
                Text.fontSize(32);
                Text.pop();
            }
            If.pop();
        }
        else {
            If.branchId(1);
            Text.create('fail');
            Text.fontSize(32);
            Text.pop();
        }
        If.pop();
        If.create();
        if (TsModule_1.Animal.Dog) {
            If.branchId(0);
            let earlierCreatedChild_2 = (this && this.findChildById) ? this.findChildById("2") : undefined;
            if (earlierCreatedChild_2 == undefined) {
                View.create(new TestComponent_1.TestComponent("2", this, { content: 'if (import enum)' }));
            }
            else {
                earlierCreatedChild_2.updateWithValueParams({
                    content: 'if (import enum)'
                });
                if (!earlierCreatedChild_2.needsUpdate()) {
                    earlierCreatedChild_2.markStatic();
                }
                View.create(earlierCreatedChild_2);
            }
            Divider.create();
        }
        If.pop();
        Column.pop();
    }
}
loadDocument(new MyComponent("1", undefined, {}));
`
