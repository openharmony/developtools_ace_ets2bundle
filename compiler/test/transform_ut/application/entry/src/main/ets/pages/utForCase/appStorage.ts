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
class Data {
  code: number;

  constructor(code: number) {
    this.code = code;
  }
}

AppStorage.setOrCreate('PropA', 47);
AppStorage.setOrCreate('PropB', new Data(50));
let storage = new LocalStorage();
storage.setOrCreate('LinkA', 48);
storage.setOrCreate('LinkB', new Data(100));

@Entry(storage)
@Component
struct Index {
  @StorageLink('PropA') storageLink: number = 1;
  @LocalStorageLink('LinkA') localStorageLink: number = 1;
  @StorageLink('PropB') storageLinkObject: Data = new Data(1);
  @LocalStorageLink('LinkB') localStorageLinkObject: Data = new Data(1);

  build() {
    Column({ space: 20 }) {
      Text('From AppStorage ' + this.storageLink)
        .onClick(() => {
          this.storageLink += 1;
        })

      Text('From LocalStorage ' + this.localStorageLink)
        .onClick(() => {
          this.localStorageLink += 1;
        })

      Text('From AppStorage ' + this.storageLinkObject.code)
        .onClick(() => {
          this.storageLinkObject.code += 1;
        })

      Text('From LocalStorage ' + this.localStorageLinkObject.code)
        .onClick(() => {
          this.localStorageLinkObject.code += 1;
        })
    }
  }
}
`;

exports.expectResult =
`
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface Index_Params {
    storageLink?: number;
    localStorageLink?: number;
    storageLinkObject?: Data;
    localStorageLinkObject?: Data;
}
class Data {
    code: number;
    constructor(code: number) {
        this.code = code;
    }
}
AppStorage.setOrCreate('PropA', 47);
AppStorage.setOrCreate('PropB', new Data(50));
let storage = new LocalStorage();
storage.setOrCreate('LinkA', 48);
storage.setOrCreate('LinkB', new Data(100));
class Index extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__storageLink = this.createStorageLink('PropA', 1, "storageLink");
        this.__storageLinkObject = this.createStorageLink('PropB', new Data(1), "storageLinkObject");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: Index_Params) {
    }
    updateStateVars(params: Index_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__storageLink.purgeDependencyOnElmtId(rmElmtId);
        this.__localStorageLink.purgeDependencyOnElmtId(rmElmtId);
        this.__storageLinkObject.purgeDependencyOnElmtId(rmElmtId);
        this.__localStorageLinkObject.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__storageLink.aboutToBeDeleted();
        this.__localStorageLink.aboutToBeDeleted();
        this.__storageLinkObject.aboutToBeDeleted();
        this.__localStorageLinkObject.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __storageLink: ObservedPropertyAbstractPU<number>;
    get storageLink() {
        return this.__storageLink.get();
    }
    set storageLink(newValue: number) {
        this.__storageLink.set(newValue);
    }
    private __localStorageLink: ObservedPropertyAbstractPU<number> = this.createLocalStorageLink<number>('LinkA', 1, "localStorageLink");
    get localStorageLink() {
        return this.__localStorageLink.get();
    }
    set localStorageLink(newValue: number) {
        this.__localStorageLink.set(newValue);
    }
    private __storageLinkObject: ObservedPropertyAbstractPU<Data>;
    get storageLinkObject() {
        return this.__storageLinkObject.get();
    }
    set storageLinkObject(newValue: Data) {
        this.__storageLinkObject.set(newValue);
    }
    private __localStorageLinkObject: ObservedPropertyAbstractPU<Data> = this.createLocalStorageLink<Data>('LinkB', new Data(1), "localStorageLinkObject");
    get localStorageLinkObject() {
        return this.__localStorageLinkObject.get();
    }
    set localStorageLinkObject(newValue: Data) {
        this.__localStorageLinkObject.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 20 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('From AppStorage ' + this.storageLink);
            Text.onClick(() => {
                this.storageLink += 1;
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('From LocalStorage ' + this.localStorageLink);
            Text.onClick(() => {
                this.localStorageLink += 1;
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('From AppStorage ' + this.storageLinkObject.code);
            Text.onClick(() => {
                this.storageLinkObject.code += 1;
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('From LocalStorage ' + this.localStorageLinkObject.code);
            Text.onClick(() => {
                this.localStorageLinkObject.code += 1;
            });
        }, Text);
        Text.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "Index";
    }
}
if (storage && storage.routeName != undefined && storage.storage != undefined) {
    registerNamedRoute(() => new Index(undefined, {}, storage.useSharedStorage ? LocalStorage.getShared() : storage.storage), storage.routeName, { bundleName: "com.example.myapplication", moduleName: "entry", pagePath: "pages/Index", pageFullPath: "entry/src/main/ets/pages/Index", integratedHsp: "false", moduleType: "followWithHap" });
}
else if (storage && storage.routeName != undefined && storage.storage == undefined) {
    registerNamedRoute(() => new Index(undefined, {}, storage.useSharedStorage ? LocalStorage.getShared() : storage.storage), storage.routeName, { bundleName: "com.example.myapplication", moduleName: "entry", pagePath: "pages/Index", pageFullPath: "entry/src/main/ets/pages/Index", integratedHsp: "false", moduleType: "followWithHap" });
}
else if (storage && storage.routeName == undefined && storage.storage != undefined) {
    registerNamedRoute(() => new Index(undefined, {}, storage.useSharedStorage ? LocalStorage.getShared() : storage.storage), "", { bundleName: "com.example.myapplication", moduleName: "entry", pagePath: "pages/Index", pageFullPath: "entry/src/main/ets/pages/Index", integratedHsp: "false", moduleType: "followWithHap" });
}
else if (storage && storage.useSharedStorage != undefined) {
    registerNamedRoute(() => new Index(undefined, {}, storage.useSharedStorage ? LocalStorage.getShared() : undefined), "", { bundleName: "com.example.myapplication", moduleName: "entry", pagePath: "pages/Index", pageFullPath: "entry/src/main/ets/pages/Index", integratedHsp: "false", moduleType: "followWithHap" });
}
else {
    registerNamedRoute(() => new Index(undefined, {}, storage), "", { bundleName: "com.example.myapplication", moduleName: "entry", pagePath: "pages/Index", pageFullPath: "entry/src/main/ets/pages/Index", integratedHsp: "false", moduleType: "followWithHap" });
}
`;
