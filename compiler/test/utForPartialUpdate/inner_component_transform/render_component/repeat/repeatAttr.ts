/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
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
@ObservedV2
class VehicleData {
  @Trace name: string;
  @Trace price: number;

  constructor(name: string, price: number) {
    this.name = name;
    this.price = price;
  }
}

@ObservedV2
class VehicleDB {
  public vehicleItems: VehicleData[] = [];

  constructor() {

  }
}

@Entry
@ComponentV2
struct entryCompSucc {
  @Local vehicleItems: VehicleData[] = new VehicleDB().vehicleItems;

  build() {
    Column() {
      List() {
        Repeat(this.vehicleItems)
          .template('default', ((((ri) => {
           Text('11111111111')
          }))), { cachedCount: 5 })
          .each(((ri) => {
            ListItem() {
              Text("Wrong")

            }.border({ width: 1 })
          }))
          .key((item, index) => 'index')
      }

      }
    }
}
`
exports.expectResult =
`"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
let VehicleData = class VehicleData {
    constructor(name, price) {
        this.name = name;
        this.price = price;
    }
};
__decorate([
    Trace
], VehicleData.prototype, "name", void 0);
__decorate([
    Trace
], VehicleData.prototype, "price", void 0);
VehicleData = __decorate([
    ObservedV2
], VehicleData);
let VehicleDB = class VehicleDB {
    constructor() {
        this.vehicleItems = [];
    }
};
VehicleDB = __decorate([
    ObservedV2
], VehicleDB);
class entryCompSucc extends ViewV2 {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda, extraInfo) {
        super(parent, elmtId, extraInfo);
        this.vehicleItems = new VehicleDB().vehicleItems;
        this.finalizeConstruction();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            List.create();
        }, List);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Repeat(this.vehicleItems, this).template('default', (ri) => {
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create('11111111111');
                }, Text);
                Text.pop();
            }, { cachedCount: 5 })
                .each((ri) => {
                {
                    const itemCreation2 = (elmtId, isInitialRender) => {
                        ListItem.create(() => { }, false);
                        ListItem.border({ width: 1 });
                    };
                    const observedDeepRender = () => {
                        this.observeComponentCreation2(itemCreation2, ListItem);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create("Wrong");
                        }, Text);
                        Text.pop();
                        ListItem.pop();
                    };
                    observedDeepRender();
                }
            })
                .key((item, index) => 'index').render(isInitialRender);
        }, Repeat);
        List.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName() {
        return "entryCompSucc";
    }
}
__decorate([
    Local
], entryCompSucc.prototype, "vehicleItems", void 0);
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new entryCompSucc(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`