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
struct MyComponent {
  private data: MyDataSource = new MyDataSource()
  build() {
    List({space: 3}) {
      LazyForEach(this.data, (item: string) => {
        ListItem() {
          Row() {
            Image(item).width("30%").height(50)
            Text(item).fontSize(20).margin({left:10})
          }.margin({left: 10, right: 10})
        }
        .onClick(()=>{
          this.data.pushData('/path/image' + this.data.totalCount())
        })
      }, item => item)
    }
  }
}`

exports.expectResult =
`"use strict";
let __generate__Id = 0;
function generateId() {
    return "lazyForEach_" + ++__generate__Id;
}
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
class MyComponent extends View {
    constructor(compilerAssignedUniqueChildId, parent, params, localStorage) {
        super(compilerAssignedUniqueChildId, parent, localStorage);
        this.data = new MyDataSource();
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.data !== undefined) {
            this.data = params.data;
        }
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id());
    }
    render() {
        List.create({ space: 3 });
        LazyForEach.create("2", this, ObservedObject.GetRawObject(this.data), (item) => {
            this.isRenderingInProgress = true;
            ListItem.create();
            ListItem.onClick(() => {
                this.data.pushData('/path/image' + this.data.totalCount());
            });
            Row.create();
            Row.margin({ left: 10, right: 10 });
            Image.create(item);
            Image.width("30%");
            Image.height(50);
            Text.create(item);
            Text.fontSize(20);
            Text.margin({ left: 10 });
            Text.pop();
            Row.pop();
            ListItem.pop();
            this.isRenderingInProgress = false;
        }, item => item);
        LazyForEach.pop();
        List.pop();
    }
}
loadDocument(new MyComponent("1", undefined, {}));
`
