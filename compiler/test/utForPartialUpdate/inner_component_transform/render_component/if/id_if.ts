/*
 * Copyright (c) 2023 Huawei Device Co., Ltd.
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
struct MyComponent {
  private pass: boolean = true
  private count: number = 10
  private controller: TabsController = new TabsController()

  build() {
    Column() {
      if(this.pass) {
        if (this.count < 0) {
          Text('count is negative')
            .fontSize(32)
            .id('id1')
        } else if (this.count % 2 === 0) {
          Divider()
            .id('id2')
          Text('even')
            .fontSize(32)
            .id('id3')
        } else {
          Divider()
            .id('id4')
          Column() {
            Text('odd')
              .fontSize(32)
              .id('id5')
          }
          .id('id10')
        }
      } else {
        Text('fail')
          .id('id6')
          .fontSize(32)
      }

      if(this.pass) Text('odd2').fontSize(32).id('id7')

      List({space: 3}) {
        if (this.pass) {
          ListItem() {
            Row() {
              Text().fontSize(20).margin({left:10})
            }.margin({left: 10, right: 10}).id('id11')
          }
          .id('id8')
        }
      }

      Tabs({ barPosition: BarPosition.Start, controller: this.controller }) {
        if (this.pass) {
          TabContent() {
            Text('111').width('100%').height('20').backgroundColor(Color.Pink)
          }
          .tabBar('pink')
          .id('id9')
        }
      }

      if (this.pass) {
        if (this.count === 10) {
            Column() {
              Text('111')
            }
            XComponent({id: 'special', type: ''}).id('id12')
            Column() {
                Text('11')
            }
            .id('id13')
            Column() {
              Text('222')
            }
        }
      }
    }
  }
}
`

exports.expectResult =
`"use strict";
class MyComponent extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1) {
        super(parent, __localStorage, elmtId);
        this.pass = true;
        this.count = 10;
        this.controller = new TabsController();
        this.setInitiallyProvidedValue(params);
    }
    setInitiallyProvidedValue(params) {
        if (params.pass !== undefined) {
            this.pass = params.pass;
        }
        if (params.count !== undefined) {
            this.count = params.count;
        }
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
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Column.create();
            if (!isInitialRender) {
                Column.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            If.create();
            if (this.pass) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation((elmtId, isInitialRender) => {
                        ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                        If.create();
                        if (this.count < 0) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                if (!If.canRetake('id1')) {
                                    this.observeComponentCreation((elmtId, isInitialRender) => {
                                        ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                        Text.create('count is negative');
                                        Text.fontSize(32);
                                        Text.id('id1');
                                        if (!isInitialRender) {
                                            Text.pop();
                                        }
                                        ViewStackProcessor.StopGetAccessRecording();
                                    });
                                    Text.pop();
                                }
                            });
                        }
                        else if (this.count % 2 === 0) {
                            this.ifElseBranchUpdateFunction(1, () => {
                                if (!If.canRetake('id2')) {
                                    this.observeComponentCreation((elmtId, isInitialRender) => {
                                        ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                        Divider.create();
                                        Divider.id('id2');
                                        if (!isInitialRender) {
                                            Divider.pop();
                                        }
                                        ViewStackProcessor.StopGetAccessRecording();
                                    });
                                }
                                if (!If.canRetake('id3')) {
                                    this.observeComponentCreation((elmtId, isInitialRender) => {
                                        ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                        Text.create('even');
                                        Text.fontSize(32);
                                        Text.id('id3');
                                        if (!isInitialRender) {
                                            Text.pop();
                                        }
                                        ViewStackProcessor.StopGetAccessRecording();
                                    });
                                    Text.pop();
                                }
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(2, () => {
                                if (!If.canRetake('id4')) {
                                    this.observeComponentCreation((elmtId, isInitialRender) => {
                                        ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                        Divider.create();
                                        Divider.id('id4');
                                        if (!isInitialRender) {
                                            Divider.pop();
                                        }
                                        ViewStackProcessor.StopGetAccessRecording();
                                    });
                                }
                                if (!If.canRetake('id10')) {
                                    this.observeComponentCreation((elmtId, isInitialRender) => {
                                        ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                        Column.create();
                                        Column.id('id10');
                                        if (!isInitialRender) {
                                            Column.pop();
                                        }
                                        ViewStackProcessor.StopGetAccessRecording();
                                    });
                                    this.observeComponentCreation((elmtId, isInitialRender) => {
                                        ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                        Text.create('odd');
                                        Text.fontSize(32);
                                        Text.id('id5');
                                        if (!isInitialRender) {
                                            Text.pop();
                                        }
                                        ViewStackProcessor.StopGetAccessRecording();
                                    });
                                    Text.pop();
                                    Column.pop();
                                }
                            });
                        }
                        if (!isInitialRender) {
                            If.pop();
                        }
                        ViewStackProcessor.StopGetAccessRecording();
                    });
                    If.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    if (!If.canRetake('id6')) {
                        this.observeComponentCreation((elmtId, isInitialRender) => {
                            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                            Text.create('fail');
                            Text.id('id6');
                            Text.fontSize(32);
                            if (!isInitialRender) {
                                Text.pop();
                            }
                            ViewStackProcessor.StopGetAccessRecording();
                        });
                        Text.pop();
                    }
                });
            }
            if (!isInitialRender) {
                If.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        If.pop();
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            If.create();
            if (this.pass) {
                this.ifElseBranchUpdateFunction(0, () => {
                    if (!If.canRetake('id7')) {
                        this.observeComponentCreation((elmtId, isInitialRender) => {
                            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                            Text.create('odd2');
                            Text.fontSize(32);
                            Text.id('id7');
                            if (!isInitialRender) {
                                Text.pop();
                            }
                            ViewStackProcessor.StopGetAccessRecording();
                        });
                        Text.pop();
                    }
                });
            }
            else {
                If.branchId(1);
            }
            if (!isInitialRender) {
                If.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        If.pop();
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            List.create({ space: 3 });
            if (!isInitialRender) {
                List.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            If.create();
            if (this.pass) {
                this.ifElseBranchUpdateFunction(0, () => {
                    if (!If.canRetake('id8')) {
                        {
                            const isLazyCreate = true;
                            const itemCreation = (elmtId, isInitialRender) => {
                                ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                ListItem.create(deepRenderFunction, isLazyCreate);
                                ListItem.id('id8');
                                if (!isInitialRender) {
                                    ListItem.pop();
                                }
                                ViewStackProcessor.StopGetAccessRecording();
                            };
                            const observedShallowRender = () => {
                                this.observeComponentCreation(itemCreation);
                                ListItem.pop();
                            };
                            const observedDeepRender = () => {
                                this.observeComponentCreation(itemCreation);
                                this.observeComponentCreation((elmtId, isInitialRender) => {
                                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                    Row.create();
                                    Row.margin({ left: 10, right: 10 });
                                    Row.id('id11');
                                    if (!isInitialRender) {
                                        Row.pop();
                                    }
                                    ViewStackProcessor.StopGetAccessRecording();
                                });
                                this.observeComponentCreation((elmtId, isInitialRender) => {
                                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                    Text.create();
                                    Text.fontSize(20);
                                    Text.margin({ left: 10 });
                                    if (!isInitialRender) {
                                        Text.pop();
                                    }
                                    ViewStackProcessor.StopGetAccessRecording();
                                });
                                Text.pop();
                                Row.pop();
                                ListItem.pop();
                            };
                            const deepRenderFunction = (elmtId, isInitialRender) => {
                                itemCreation(elmtId, isInitialRender);
                                this.updateFuncByElmtId.set(elmtId, itemCreation);
                                this.observeComponentCreation((elmtId, isInitialRender) => {
                                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                    Row.create();
                                    Row.margin({ left: 10, right: 10 });
                                    Row.id('id11');
                                    if (!isInitialRender) {
                                        Row.pop();
                                    }
                                    ViewStackProcessor.StopGetAccessRecording();
                                });
                                this.observeComponentCreation((elmtId, isInitialRender) => {
                                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                    Text.create();
                                    Text.fontSize(20);
                                    Text.margin({ left: 10 });
                                    if (!isInitialRender) {
                                        Text.pop();
                                    }
                                    ViewStackProcessor.StopGetAccessRecording();
                                });
                                Text.pop();
                                Row.pop();
                                ListItem.pop();
                            };
                            if (isLazyCreate) {
                                observedShallowRender();
                            }
                            else {
                                observedDeepRender();
                            }
                        }
                    }
                });
            }
            else {
                If.branchId(1);
            }
            if (!isInitialRender) {
                If.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        If.pop();
        List.pop();
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Tabs.create({ barPosition: BarPosition.Start, controller: this.controller });
            if (!isInitialRender) {
                Tabs.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            If.create();
            if (this.pass) {
                this.ifElseBranchUpdateFunction(0, () => {
                    if (!If.canRetake('id9')) {
                        this.observeComponentCreation((elmtId, isInitialRender) => {
                            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                            TabContent.create(() => {
                                this.observeComponentCreation((elmtId, isInitialRender) => {
                                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                    Text.create('111');
                                    Text.width('100%');
                                    Text.height('20');
                                    Text.backgroundColor(Color.Pink);
                                    if (!isInitialRender) {
                                        Text.pop();
                                    }
                                    ViewStackProcessor.StopGetAccessRecording();
                                });
                                Text.pop();
                            });
                            TabContent.tabBar('pink');
                            TabContent.id('id9');
                            if (!isInitialRender) {
                                TabContent.pop();
                            }
                            ViewStackProcessor.StopGetAccessRecording();
                        });
                        TabContent.pop();
                    }
                });
            }
            else {
                If.branchId(1);
            }
            if (!isInitialRender) {
                If.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        If.pop();
        Tabs.pop();
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            If.create();
            if (this.pass) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation((elmtId, isInitialRender) => {
                        ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                        If.create();
                        if (this.count === 10) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation((elmtId, isInitialRender) => {
                                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                    Column.create();
                                    if (!isInitialRender) {
                                        Column.pop();
                                    }
                                    ViewStackProcessor.StopGetAccessRecording();
                                });
                                this.observeComponentCreation((elmtId, isInitialRender) => {
                                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                    Text.create('111');
                                    if (!isInitialRender) {
                                        Text.pop();
                                    }
                                    ViewStackProcessor.StopGetAccessRecording();
                                });
                                Text.pop();
                                Column.pop();
                                if (!If.canRetake('id12')) {
                                    this.observeComponentCreation((elmtId, isInitialRender) => {
                                        ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                        XComponent.create({ id: 'special', type: '' });
                                        XComponent.id('id12');
                                        if (!isInitialRender) {
                                            XComponent.pop();
                                        }
                                        ViewStackProcessor.StopGetAccessRecording();
                                    });
                                }
                                if (!If.canRetake('id13')) {
                                    this.observeComponentCreation((elmtId, isInitialRender) => {
                                        ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                        Column.create();
                                        Column.id('id13');
                                        if (!isInitialRender) {
                                            Column.pop();
                                        }
                                        ViewStackProcessor.StopGetAccessRecording();
                                    });
                                    this.observeComponentCreation((elmtId, isInitialRender) => {
                                        ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                        Text.create('11');
                                        if (!isInitialRender) {
                                            Text.pop();
                                        }
                                        ViewStackProcessor.StopGetAccessRecording();
                                    });
                                    Text.pop();
                                    Column.pop();
                                }
                                this.observeComponentCreation((elmtId, isInitialRender) => {
                                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                    Column.create();
                                    if (!isInitialRender) {
                                        Column.pop();
                                    }
                                    ViewStackProcessor.StopGetAccessRecording();
                                });
                                this.observeComponentCreation((elmtId, isInitialRender) => {
                                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                    Text.create('222');
                                    if (!isInitialRender) {
                                        Text.pop();
                                    }
                                    ViewStackProcessor.StopGetAccessRecording();
                                });
                                Text.pop();
                                Column.pop();
                            });
                        }
                        else {
                            If.branchId(1);
                        }
                        if (!isInitialRender) {
                            If.pop();
                        }
                        ViewStackProcessor.StopGetAccessRecording();
                    });
                    If.pop();
                });
            }
            else {
                If.branchId(1);
            }
            if (!isInitialRender) {
                If.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        If.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new MyComponent(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`
