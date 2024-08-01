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
struct TestBuilder1 {
  build() {
    Column() {
      Text("hello")
    }
  }
  @Builder
  innerBuidler(value: string) {
    Column() {
      Text("hello")
    }
  }
}

@Component
struct TestBuilderChild {
  build() {
    Column() {
      Text("hello")
    }
  }
  @Builder
  innerBuidler(value: object) {
    Column() {
      Text("hello")
    }
  }
}

@Reusable
@Component
struct TestBuilderReusable {
  build() {
    Column() {
      Text("hello")
    }
  }

  @Builder
  innerBuidler(value: string) {
    Column() {
      Text("hello")
    }
  }
}

@Builder
function commonBuilder() {}

@Builder
function testIfComponent(value: number) {
  Column() {
    if (value === 1) {
      Text('toggle1')
    } else if(value === 2) {
      Text('toggle2')
    } else if (value === 3) {
      Text('toggle3')
    } else {
      Text('toggle no thing')
    }
    if (value === 1) {
      Text('toggle1 Single')
    }
  }
}

@Builder
function testIfIdComponent(value: number) {
  Column() {
    if(value) {
      if (value < 0) {
        Text('count is negative')
          .fontSize(32)
          .id('id1')
      } else if (value % 2 === 0) {
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

    if(value) Text('odd2').fontSize(32).id('id7')

    List({space: 3}) {
      if (value) {
        ListItem() {
          Row() {
            Text().fontSize(20).margin({left:10})
          }.margin({left: 10, right: 10}).id('id11')
        }
        .id('id8')
      }
    }

    Tabs({ barPosition: BarPosition.Start, controller: null }) {
      if (value) {
        TabContent() {
          Text('111').width('100%').height('20').backgroundColor(Color.Pink)
        }
        .tabBar('pink')
        .id('id9')
      }
    }

    if (value) {
      if (value === 10) {
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

@Builder
function testItemComponent(value: Object) {
  Column() {
    List() {
      ForEach(value as string[],
        (item: string) => {
          ListItem() {
            Column() {
              Text(item)
              Text(value as string)
              Text("hello  ForEach testItemComponent")
            }
          }
        }
      )
    }
    List() {
      LazyForEach (value as IDataSource,
        (row: string) => {
          ListItem() {
            Column() {
              Text(row)
              Text(value as string)
              Text("hello LazyForEach testItemComponent")
            }
          }
        },
        (row: string) => row)
    }
  }
}

@Builder
function testTabComponent(value: object) {
  Column() {
    Tabs({ barPosition: BarPosition.Start, index: 1, controller: null}) {
      TabContent() {
        Flex() {
          Column() {
            Text('text1')
              .height(100)
              .width(200)
            Text(value.toString())
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

class BasicDataSource implements IDataSource {
  private listeners: DataChangeListener[] = []

  public totalCount(): number {
    return 0
  }
  public getData(index: number): Object {
    return new Object()
  }

  registerDataChangeListener(listener: DataChangeListener): void {
    if (this.listeners.indexOf(listener) < 0) {
      console.info('add listener')
      this.listeners.push(listener)
    }
  }
  unregisterDataChangeListener(listener: DataChangeListener): void {
    const pos = this.listeners.indexOf(listener);
    if (pos >= 0) {
      console.info('remove listener')
      this.listeners.splice(pos, 1)
    }
  }

  notifyDataReload(): void {
    this.listeners.forEach(listener => {
      listener.onDataReloaded()
    })
  }
  notifyDataAdd(index: number): void {
    this.listeners.forEach(listener => {
      listener.onDataAdd(index)
    })
  }
  notifyDataChange(index: number): void {
    this.listeners.forEach(listener => {
      listener.onDataChange(index)
    })
  }
  notifyDataDelete(index: number): void {
    this.listeners.forEach(listener => {
      listener.onDataDelete(index)
    })
  }
  notifyDataMove(from: number, to: number): void {
    this.listeners.forEach(listener => {
      listener.onDataMove(from, to)
    })
  }
}

class MyDataSource extends BasicDataSource {
  private dataArray: string[] = ['/path/image0', '/path/image1', '/path/image2', '/path/image3']

  public totalCount(): number {
    return this.dataArray.length
  }
  public getData(index: number): Object {
    return this.dataArray[index]
  }

  public addData(index: number, data: string): void {
    this.dataArray.splice(index, 0, data)
    this.notifyDataAdd(index)
  }
  public pushData(data: string): void {
    this.dataArray.push(data)
    this.notifyDataAdd(this.dataArray.length - 1)
  }
}
`
exports.expectResult =
`"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
class TestBuilder1 extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
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
            Text.create("hello");
        }, Text);
        Text.pop();
        Column.pop();
    }
    innerBuidler(value, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("hello");
        }, Text);
        Text.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
class TestBuilderChild extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
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
            Text.create("hello");
        }, Text);
        Text.pop();
        Column.pop();
    }
    innerBuidler(value, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("hello");
        }, Text);
        Text.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
class TestBuilderReusable extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    updateRecycleElmtId(oldElmtId, newElmtId) {
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("hello");
        }, Text);
        Text.pop();
        Column.pop();
    }
    innerBuidler(value, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("hello");
        }, Text);
        Text.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
function commonBuilder(parent = null) { }
function testIfComponent(value, parent = null) {
    const __value__ = value;
    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
        Column.create();
    }, Column);
    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
        If.create();
        if (value === 1) {
            (parent ? parent : this).ifElseBranchUpdateFunction(0, () => {
                (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                    Text.create('toggle1');
                }, Text);
                Text.pop();
            });
        }
        else if (value === 2) {
            (parent ? parent : this).ifElseBranchUpdateFunction(1, () => {
                (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                    Text.create('toggle2');
                }, Text);
                Text.pop();
            });
        }
        else if (value === 3) {
            (parent ? parent : this).ifElseBranchUpdateFunction(2, () => {
                (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                    Text.create('toggle3');
                }, Text);
                Text.pop();
            });
        }
        else {
            (parent ? parent : this).ifElseBranchUpdateFunction(3, () => {
                (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                    Text.create('toggle no thing');
                }, Text);
                Text.pop();
            });
        }
    }, If);
    If.pop();
    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
        If.create();
        if (value === 1) {
            (parent ? parent : this).ifElseBranchUpdateFunction(0, () => {
                (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                    Text.create('toggle1 Single');
                }, Text);
                Text.pop();
            });
        }
        else {
            this.ifElseBranchUpdateFunction(1, () => {
            });
        }
    }, If);
    If.pop();
    Column.pop();
}
function testIfIdComponent(value, parent = null) {
    const __value__ = value;
    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
        Column.create();
    }, Column);
    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
        If.create();
        if (value) {
            (parent ? parent : this).ifElseBranchUpdateFunction(0, () => {
                (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                    If.create();
                    if (value < 0) {
                        (parent ? parent : this).ifElseBranchUpdateFunction(0, () => {
                            if (!If.canRetake('id1')) {
                                (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                                    Text.create('count is negative');
                                    Text.fontSize(32);
                                    Text.id('id1');
                                }, Text);
                                Text.pop();
                            }
                        });
                    }
                    else if (value % 2 === 0) {
                        (parent ? parent : this).ifElseBranchUpdateFunction(1, () => {
                            if (!If.canRetake('id2')) {
                                (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                                    Divider.create();
                                    Divider.id('id2');
                                }, Divider);
                            }
                            if (!If.canRetake('id3')) {
                                (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                                    Text.create('even');
                                    Text.fontSize(32);
                                    Text.id('id3');
                                }, Text);
                                Text.pop();
                            }
                        });
                    }
                    else {
                        (parent ? parent : this).ifElseBranchUpdateFunction(2, () => {
                            if (!If.canRetake('id4')) {
                                (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                                    Divider.create();
                                    Divider.id('id4');
                                }, Divider);
                            }
                            if (!If.canRetake('id10')) {
                                (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                                    Column.create();
                                    Column.id('id10');
                                }, Column);
                                (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                                    Text.create('odd');
                                    Text.fontSize(32);
                                    Text.id('id5');
                                }, Text);
                                Text.pop();
                                Column.pop();
                            }
                        });
                    }
                }, If);
                If.pop();
            });
        }
        else {
            (parent ? parent : this).ifElseBranchUpdateFunction(1, () => {
                if (!If.canRetake('id6')) {
                    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                        Text.create('fail');
                        Text.id('id6');
                        Text.fontSize(32);
                    }, Text);
                    Text.pop();
                }
            });
        }
    }, If);
    If.pop();
    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
        If.create();
        if (value) {
            (parent ? parent : this).ifElseBranchUpdateFunction(0, () => {
                if (!If.canRetake('id7')) {
                    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                        Text.create('odd2');
                        Text.fontSize(32);
                        Text.id('id7');
                    }, Text);
                    Text.pop();
                }
            });
        }
        else {
            this.ifElseBranchUpdateFunction(1, () => {
            });
        }
    }, If);
    If.pop();
    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
        List.create({ space: 3 });
    }, List);
    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
        If.create();
        if (value) {
            (parent ? parent : this).ifElseBranchUpdateFunction(0, () => {
                if (!If.canRetake('id8')) {
                    {
                        const itemCreation = (elmtId, isInitialRender, value = __value__) => {
                            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                            itemCreation2(elmtId, isInitialRender, value);
                            if (!isInitialRender) {
                                ListItem.pop();
                            }
                            ViewStackProcessor.StopGetAccessRecording();
                        };
                        const itemCreation2 = (elmtId, isInitialRender, value = __value__) => {
                            ListItem.create(deepRenderFunction, true);
                            ListItem.id('id8');
                        };
                        const deepRenderFunction = (elmtId, isInitialRender, value = __value__) => {
                            itemCreation(elmtId, isInitialRender, value);
                            (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                                Row.create();
                                Row.margin({ left: 10, right: 10 });
                                Row.id('id11');
                            }, Row);
                            (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                                Text.create();
                                Text.fontSize(20);
                                Text.margin({ left: 10 });
                            }, Text);
                            Text.pop();
                            Row.pop();
                            ListItem.pop();
                        };
                        this.observeComponentCreation2(itemCreation2, ListItem);
                        ListItem.pop();
                    }
                }
            });
        }
        else {
            this.ifElseBranchUpdateFunction(1, () => {
            });
        }
    }, If);
    If.pop();
    List.pop();
    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
        Tabs.create({ barPosition: BarPosition.Start, controller: null });
    }, Tabs);
    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
        If.create();
        if (value) {
            (parent ? parent : this).ifElseBranchUpdateFunction(0, () => {
                if (!If.canRetake('id9')) {
                    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                        TabContent.create(() => {
                            (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                                Text.create('111');
                                Text.width('100%');
                                Text.height('20');
                                Text.backgroundColor(Color.Pink);
                            }, Text);
                            Text.pop();
                        });
                        TabContent.tabBar('pink');
                        TabContent.id('id9');
                    }, TabContent);
                    TabContent.pop();
                }
            });
        }
        else {
            this.ifElseBranchUpdateFunction(1, () => {
            });
        }
    }, If);
    If.pop();
    Tabs.pop();
    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
        If.create();
        if (value) {
            (parent ? parent : this).ifElseBranchUpdateFunction(0, () => {
                (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                    If.create();
                    if (value === 10) {
                        (parent ? parent : this).ifElseBranchUpdateFunction(0, () => {
                            (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                                Column.create();
                            }, Column);
                            (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                                Text.create('111');
                            }, Text);
                            Text.pop();
                            Column.pop();
                            if (!If.canRetake('id12')) {
                                (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                                    XComponent.create({ id: 'special', type: '' });
                                    XComponent.id('id12');
                                }, XComponent);
                            }
                            if (!If.canRetake('id13')) {
                                (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                                    Column.create();
                                    Column.id('id13');
                                }, Column);
                                (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                                    Text.create('11');
                                }, Text);
                                Text.pop();
                                Column.pop();
                            }
                            (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                                Column.create();
                            }, Column);
                            (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                                Text.create('222');
                            }, Text);
                            Text.pop();
                            Column.pop();
                        });
                    }
                    else {
                        this.ifElseBranchUpdateFunction(1, () => {
                        });
                    }
                }, If);
                If.pop();
            });
        }
        else {
            this.ifElseBranchUpdateFunction(1, () => {
            });
        }
    }, If);
    If.pop();
    Column.pop();
}
function testItemComponent(value, parent = null) {
    const __value__ = value;
    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
        Column.create();
    }, Column);
    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
        List.create();
    }, List);
    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
        ForEach.create();
        const forEachItemGenFunction = _item => {
            const item = _item;
            {
                const itemCreation = (elmtId, isInitialRender, value = __value__) => {
                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                    itemCreation2(elmtId, isInitialRender, value);
                    if (!isInitialRender) {
                        ListItem.pop();
                    }
                    ViewStackProcessor.StopGetAccessRecording();
                };
                const itemCreation2 = (elmtId, isInitialRender, value = __value__) => {
                    ListItem.create(deepRenderFunction, true);
                };
                const deepRenderFunction = (elmtId, isInitialRender, value = __value__) => {
                    itemCreation(elmtId, isInitialRender, value);
                    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                        Column.create();
                    }, Column);
                    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                        Text.create(item);
                    }, Text);
                    Text.pop();
                    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                        Text.create(value);
                    }, Text);
                    Text.pop();
                    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                        Text.create("hello  ForEach testItemComponent");
                    }, Text);
                    Text.pop();
                    Column.pop();
                    ListItem.pop();
                };
                this.observeComponentCreation2(itemCreation2, ListItem);
                ListItem.pop();
            }
        };
        (parent ? parent : this).forEachUpdateFunction(elmtId, value, forEachItemGenFunction);
    }, ForEach);
    ForEach.pop();
    List.pop();
    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
        List.create();
    }, List);
    {
        const __lazyForEachItemGenFunction = _item => {
            const row = _item;
            {
                const itemCreation2 = (elmtId, isInitialRender, value = __value__) => {
                    ListItem.create(() => { }, false);
                };
                const observedDeepRender = () => {
                    this.observeComponentCreation2(itemCreation2, ListItem);
                    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                        Column.create();
                    }, Column);
                    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                        Text.create(row);
                    }, Text);
                    Text.pop();
                    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                        Text.create(value);
                    }, Text);
                    Text.pop();
                    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                        Text.create("hello LazyForEach testItemComponent");
                    }, Text);
                    Text.pop();
                    Column.pop();
                    ListItem.pop();
                };
                observedDeepRender();
            }
        };
        const __lazyForEachItemIdFunc = (row) => row;
        LazyForEach.create("1", this, value, __lazyForEachItemGenFunction, __lazyForEachItemIdFunc);
        LazyForEach.pop();
    }
    List.pop();
    Column.pop();
}
function testTabComponent(value, parent = null) {
    const __value__ = value;
    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
        Column.create();
    }, Column);
    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
        Tabs.create({ barPosition: BarPosition.Start, index: 1, controller: null });
    }, Tabs);
    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
        TabContent.create(() => {
            (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                Flex.create();
                Flex.height(100);
                Flex.width(200);
            }, Flex);
            (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                Column.create();
                Column.height(100);
                Column.width(200);
            }, Column);
            (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                Text.create('text1');
                Text.height(100);
                Text.width(200);
            }, Text);
            Text.pop();
            (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
                Text.create(value.toString());
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
    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
        TabContent.create(() => {
            (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender, value = __value__) => {
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
class BasicDataSource {
    constructor() {
        this.listeners = [];
    }
    totalCount() {
        return 0;
    }
    getData(index) {
        return new Object();
    }
    registerDataChangeListener(listener) {
        if (this.listeners.indexOf(listener) < 0) {
            console.info('add listener');
            this.listeners.push(listener);
        }
    }
    unregisterDataChangeListener(listener) {
        const pos = this.listeners.indexOf(listener);
        if (pos >= 0) {
            console.info('remove listener');
            this.listeners.splice(pos, 1);
        }
    }
    notifyDataReload() {
        this.listeners.forEach(listener => {
            listener.onDataReloaded();
        });
    }
    notifyDataAdd(index) {
        this.listeners.forEach(listener => {
            listener.onDataAdd(index);
        });
    }
    notifyDataChange(index) {
        this.listeners.forEach(listener => {
            listener.onDataChange(index);
        });
    }
    notifyDataDelete(index) {
        this.listeners.forEach(listener => {
            listener.onDataDelete(index);
        });
    }
    notifyDataMove(from, to) {
        this.listeners.forEach(listener => {
            listener.onDataMove(from, to);
        });
    }
}
class MyDataSource extends BasicDataSource {
    constructor() {
        super(...arguments);
        this.dataArray = ['/path/image0', '/path/image1', '/path/image2', '/path/image3'];
    }
    totalCount() {
        return this.dataArray.length;
    }
    getData(index) {
        return this.dataArray[index];
    }
    addData(index, data) {
        this.dataArray.splice(index, 0, data);
        this.notifyDataAdd(index);
    }
    pushData(data) {
        this.dataArray.push(data);
        this.notifyDataAdd(this.dataArray.length - 1);
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new TestBuilder1(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`
