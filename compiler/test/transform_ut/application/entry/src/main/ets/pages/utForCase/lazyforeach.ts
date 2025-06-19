/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

exports.source =
`
// BasicDataSource实现了IDataSource接口，用于管理listener监听，以及通知LazyForEach数据更新
class BasicDataSource implements IDataSource {
  private listeners: DataChangeListener[] = [];
  private originDataArray: string[] = [];

  public totalCount(): number {
    return this.originDataArray.length;
  }

  public getData(index: number): string {
    return this.originDataArray[index];
  }

  // 该方法为框架侧调用，为LazyForEach组件向其数据源处添加listener监听
  registerDataChangeListener(listener: DataChangeListener): void {
    if (this.listeners.indexOf(listener) < 0) {
      console.info('add listener');
      this.listeners.push(listener);
    }
  }

  // 该方法为框架侧调用，为对应的LazyForEach组件在数据源处去除listener监听
  unregisterDataChangeListener(listener: DataChangeListener): void {
    const pos = this.listeners.indexOf(listener);
    if (pos >= 0) {
      console.info('remove listener');
      this.listeners.splice(pos, 1);
    }
  }

  // 通知LazyForEach组件需要重载所有子组件
  notifyDataReload(): void {
    this.listeners.forEach(listener => {
      listener.onDataReloaded();
    });
  }

  // 通知LazyForEach组件需要在index对应索引处添加子组件
  notifyDataAdd(index: number): void {
    this.listeners.forEach(listener => {
      listener.onDataAdd(index);
      // 写法2：listener.onDatasetChange([{type: DataOperationType.ADD, index: index}]);
    });
  }

  // 通知LazyForEach组件在index对应索引处数据有变化，需要重建该子组件
  notifyDataChange(index: number): void {
    this.listeners.forEach(listener => {
      listener.onDataChange(index);
      // 写法2：listener.onDatasetChange([{type: DataOperationType.CHANGE, index: index}]);
    });
  }

  // 通知LazyForEach组件需要在index对应索引处删除该子组件
  notifyDataDelete(index: number): void {
    this.listeners.forEach(listener => {
      listener.onDataDelete(index);
      // 写法2：listener.onDatasetChange([{type: DataOperationType.DELETE, index: index}]);
    });
  }

  // 通知LazyForEach组件将from索引和to索引处的子组件进行交换
  notifyDataMove(from: number, to: number): void {
    this.listeners.forEach(listener => {
      listener.onDataMove(from, to);
      // 写法2：listener.onDatasetChange(
      //         [{type: DataOperationType.EXCHANGE, index: {start: from, end: to}}]);
    });
  }

  notifyDatasetChange(operations: DataOperation[]): void {
    this.listeners.forEach(listener => {
      listener.onDatasetChange(operations);
    });
  }
}

class MyDataSource extends BasicDataSource {
  private dataArray: string[] = [];

  public totalCount(): number {
    return this.dataArray.length;
  }

  public getData(index: number): string {
    return this.dataArray[index];
  }

  public moveDataWithoutNotify(from: number, to: number): void {
    let tmp = this.dataArray.splice(from, 1);
    this.dataArray.splice(to, 0, tmp[0]);
  }

  public pushData(data: string): void {
    this.dataArray.push(data);
    this.notifyDataAdd(this.dataArray.length - 1);
  }
}

@Entry
@Component
struct Parent {
  private data: MyDataSource = new MyDataSource();

  aboutToAppear(): void {
    for (let i = 0; i < 100; i++) {
      this.data.pushData(i.toString());
    }
  }

  build() {
    Row() {
      List() {
        LazyForEach(this.data, (item: string) => {
          ListItem() {
            Text(item.toString())
              .fontSize(16)
              .textAlign(TextAlign.Center)
              .size({ height: 100, width: "100%" })
          }.margin(10)
          .borderRadius(10)
          .backgroundColor("#FFFFFFFF")
        }, (item: string) => item)
          .onMove((from: number, to: number) => {
            this.data.moveDataWithoutNotify(from, to);
          })
      }
      .width('100%')
      .height('100%')
      .backgroundColor("#FFDCDCDC")
    }
  }
}
`;

exports.expectResult =
`
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface Parent_Params {
    data?: MyDataSource;
}
// BasicDataSource实现了IDataSource接口，用于管理listener监听，以及通知LazyForEach数据更新
class BasicDataSource implements IDataSource {
    private listeners: DataChangeListener[] = [];
    private originDataArray: string[] = [];
    public totalCount(): number {
        return this.originDataArray.length;
    }
    public getData(index: number): string {
        return this.originDataArray[index];
    }
    // 该方法为框架侧调用，为LazyForEach组件向其数据源处添加listener监听
    registerDataChangeListener(listener: DataChangeListener): void {
        if (this.listeners.indexOf(listener) < 0) {
            console.info('add listener');
            this.listeners.push(listener);
        }
    }
    // 该方法为框架侧调用，为对应的LazyForEach组件在数据源处去除listener监听
    unregisterDataChangeListener(listener: DataChangeListener): void {
        const pos = this.listeners.indexOf(listener);
        if (pos >= 0) {
            console.info('remove listener');
            this.listeners.splice(pos, 1);
        }
    }
    // 通知LazyForEach组件需要重载所有子组件
    notifyDataReload(): void {
        this.listeners.forEach(listener => {
            listener.onDataReloaded();
        });
    }
    // 通知LazyForEach组件需要在index对应索引处添加子组件
    notifyDataAdd(index: number): void {
        this.listeners.forEach(listener => {
            listener.onDataAdd(index);
            // 写法2：listener.onDatasetChange([{type: DataOperationType.ADD, index: index}]);
        });
    }
    // 通知LazyForEach组件在index对应索引处数据有变化，需要重建该子组件
    notifyDataChange(index: number): void {
        this.listeners.forEach(listener => {
            listener.onDataChange(index);
            // 写法2：listener.onDatasetChange([{type: DataOperationType.CHANGE, index: index}]);
        });
    }
    // 通知LazyForEach组件需要在index对应索引处删除该子组件
    notifyDataDelete(index: number): void {
        this.listeners.forEach(listener => {
            listener.onDataDelete(index);
            // 写法2：listener.onDatasetChange([{type: DataOperationType.DELETE, index: index}]);
        });
    }
    // 通知LazyForEach组件将from索引和to索引处的子组件进行交换
    notifyDataMove(from: number, to: number): void {
        this.listeners.forEach(listener => {
            listener.onDataMove(from, to);
            // 写法2：listener.onDatasetChange(
            //         [{type: DataOperationType.EXCHANGE, index: {start: from, end: to}}]);
        });
    }
    notifyDatasetChange(operations: DataOperation[]): void {
        this.listeners.forEach(listener => {
            listener.onDatasetChange(operations);
        });
    }
}
class MyDataSource extends BasicDataSource {
    private dataArray: string[] = [];
    public totalCount(): number {
        return this.dataArray.length;
    }
    public getData(index: number): string {
        return this.dataArray[index];
    }
    public moveDataWithoutNotify(from: number, to: number): void {
        let tmp = this.dataArray.splice(from, 1);
        this.dataArray.splice(to, 0, tmp[0]);
    }
    public pushData(data: string): void {
        this.dataArray.push(data);
        this.notifyDataAdd(this.dataArray.length - 1);
    }
}
class Parent extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.data = new MyDataSource();
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: Parent_Params) {
        if (params.data !== undefined) {
            this.data = params.data;
        }
    }
    updateStateVars(params: Parent_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private data: MyDataSource;
    aboutToAppear(): void {
        for (let i = 0; i < 100; i++) {
            this.data.pushData(i.toString());
        }
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            List.create();
            List.width('100%');
            List.height('100%');
            List.backgroundColor("#FFDCDCDC");
        }, List);
        {
            const __lazyForEachItemGenFunction = _item => {
                const item = _item;
                {
                    const itemCreation2 = (elmtId, isInitialRender) => {
                        ListItem.create(() => { }, false);
                        ListItem.margin(10);
                        ListItem.borderRadius(10);
                        ListItem.backgroundColor("#FFFFFFFF");
                    };
                    const observedDeepRender = () => {
                        this.observeComponentCreation2(itemCreation2, ListItem);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(item.toString());
                            Text.fontSize(16);
                            Text.textAlign(TextAlign.Center);
                            Text.size({ height: 100, width: "100%" });
                        }, Text);
                        Text.pop();
                        ListItem.pop();
                    };
                    observedDeepRender();
                }
            };
            const __lazyForEachItemIdFunc = (item: string) => item;
            LazyForEach.create("1", this, this.data, __lazyForEachItemGenFunction, __lazyForEachItemIdFunc);
            LazyForEach.onMove((from: number, to: number) => {
                this.data.moveDataWithoutNotify(from, to);
            });
            LazyForEach.pop();
        }
        List.pop();
        Row.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "Parent";
    }
}
registerNamedRoute(() => new Parent(undefined, {}), "", { bundleName: "com.example.myapplication", moduleName: "entry", pagePath: "pages/Index", pageFullPath: "entry/src/main/ets/pages/Index", integratedHsp: "false", moduleType: "followWithHap" });
`;
