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
@Entry
@Component
struct TabSimple {
  private controller: TabsController = new TabsController();
  build() {
    Column() {
      Tabs({ barPosition: BarPosition.Start, index: 1, controller: this.controller}) {
        TabContent() {
          Flex() {
            Column() {
              Text('text1')
              .height(100)
              .width(200)
              Text('xxx')
              .height(100)
              .width(200)
            }
            .height(100)
            .width(200)
          }
            .height(100)
            .width(200)
        }
        .tabBar("TabBar")
        .height(100)
        .width(200)
        TabContent() {
          Text('text2')
        }
        .tabBar("TabBar 2")
        .height(100)
        .width(200)
      }
    }
  }
}
`
exports.expectResult =
`"use strict";
class TabSimple extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.controller = new TabsController();
        this.setInitiallyProvidedValue(params);
    }
    setInitiallyProvidedValue(params) {
        if (params.controller !== undefined) {
            this.controller = params.controller;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Tabs.create({ barPosition: BarPosition.Start, index: 1, controller: this.controller });
        }, Tabs);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Flex.create();
                    Flex.height(100);
                    Flex.width(200);
                }, Flex);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Column.create();
                    Column.height(100);
                    Column.width(200);
                }, Column);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create('text1');
                    Text.height(100);
                    Text.width(200);
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create('xxx');
                    Text.height(100);
                    Text.width(200);
                }, Text);
                Text.pop();
                Column.pop();
                Flex.pop();
            });
            TabContent.tabBar("TabBar");
            TabContent.height(100);
            TabContent.width(200);
        }, TabContent);
        TabContent.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create('text2');
                }, Text);
                Text.pop();
            });
            TabContent.tabBar("TabBar 2");
            TabContent.height(100);
            TabContent.width(200);
        }, TabContent);
        TabContent.pop();
        Tabs.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new TabSimple(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`