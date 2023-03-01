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
class BasicDataSource implements IDataSource {
  private listeners: DataChangeListener[] = []

  public totalCount(): number {
      return 0
  }
  public getData(index: number): any {
      return undefined
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
  public getData(index: number): any {
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

@Entry
@Component
struct Test {
private data: MyDataSource = new MyDataSource()
build() {
  Grid() {
    LazyForEach (this.data,
    (row) => {
      GridItem() {
        Text(row)
      }
    },
    row => row)
  }
}
}
`
exports.expectResult =
`"use strict";
class BasicDataSource {
    constructor() {
        this.listeners = [];
    }
    totalCount() {
        return 0;
    }
    getData(index) {
        return undefined;
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
class Test extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1) {
        super(parent, __localStorage, elmtId);
        this.data = new MyDataSource();
        this.setInitiallyProvidedValue(params);
    }
    setInitiallyProvidedValue(params) {
        if (params.data !== undefined) {
            this.data = params.data;
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
            Grid.create();
            if (!isInitialRender) {
                Grid.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        {
            const __lazyForEachItemGenFunction = _item => {
                const row = _item;
                {
                    const isLazyCreate = (globalThis.__lazyForEachItemGenFunction !== undefined) && true && (Grid.willUseProxy() === true);
                    const itemCreation = (elmtId, isInitialRender) => {
                        ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                        GridItem.create(deepRenderFunction, isLazyCreate);
                        if (!isInitialRender) {
                            GridItem.pop();
                        }
                        ViewStackProcessor.StopGetAccessRecording();
                    };
                    const observedShallowRender = () => {
                        this.observeComponentCreation(itemCreation);
                        GridItem.pop();
                    };
                    const observedDeepRender = () => {
                        this.observeComponentCreation(itemCreation);
                        this.observeComponentCreation((elmtId, isInitialRender) => {
                            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                            Text.create(row);
                            if (!isInitialRender) {
                                Text.pop();
                            }
                            ViewStackProcessor.StopGetAccessRecording();
                        });
                        Text.pop();
                        GridItem.pop();
                    };
                    const deepRenderFunction = (elmtId, isInitialRender) => {
                        itemCreation(elmtId, isInitialRender);
                        this.updateFuncByElmtId.set(elmtId, itemCreation);
                        this.observeComponentCreation((elmtId, isInitialRender) => {
                            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                            Text.create(row);
                            if (!isInitialRender) {
                                Text.pop();
                            }
                            ViewStackProcessor.StopGetAccessRecording();
                        });
                        Text.pop();
                        GridItem.pop();
                    };
                    if (isLazyCreate) {
                        observedShallowRender();
                    }
                    else {
                        observedDeepRender();
                    }
                }
            };
            const __lazyForEachItemIdFunc = row => row;
            LazyForEach.create("1", this, this.data, __lazyForEachItemGenFunction, __lazyForEachItemIdFunc);
            LazyForEach.pop();
        }
        Grid.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new Test(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`