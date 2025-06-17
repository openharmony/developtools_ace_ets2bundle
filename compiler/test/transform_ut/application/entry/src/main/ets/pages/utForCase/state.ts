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
class Model {
  public value: string;

  constructor(value: string) {
    this.value = value;
  }
}

@Entry
@Component
struct EntryComponent {
  build() {
    Column() {
      // 此处指定的参数都将在初始渲染时覆盖本地定义的默认值，并不是所有的参数都需要从父组件初始化
      MyComponent({ count: 1, increaseBy: 2 })
        .width(300)
      MyComponent({ title: new Model('Hello World 2'), count: 7 })
    }
  }
}

@Component
struct MyComponent {
  @State title: Model = new Model('Hello World');
  @State count: number = 0;
  increaseBy: number = 1;

  build() {
    Column() {
      Text('' + this.title.value)
        .margin(10)
      Button('Click to change title')
        .onClick(() => {
          // @State变量的更新将触发上面的Text组件内容更新
          this.title.value = this.title.value === 'Hello ArkUI' ? 'Hello World' : 'Hello ArkUI';
        })
        .width(300)
        .margin(10)

      Button('Click to increase count =' + this.count)
        .onClick(() => {
          // @State变量的更新将触发该Button组件的内容更新
          this.count += this.increaseBy;
        })
        .width(300)
        .margin(10)
    }
  }
}
`;

exports.expectResult =
`
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface MyComponent_Params {
    title?: Model;
    count?: number;
    increaseBy?: number;
}
interface EntryComponent_Params {
}
class Model {
    public value: string;
    constructor(value: string) {
        this.value = value;
    }
}
class EntryComponent extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: EntryComponent_Params) {
    }
    updateStateVars(params: EntryComponent_Params) {
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
            __Common__.create();
            __Common__.width(300);
        }, __Common__);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new 
                    // 此处指定的参数都将在初始渲染时覆盖本地定义的默认值，并不是所有的参数都需要从父组件初始化
                    MyComponent(this, { count: 1, increaseBy: 2 }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 15, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            count: 1,
                            increaseBy: 2
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                }
            }, { name: "MyComponent" });
        }
        __Common__.pop();
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new MyComponent(this, { title: new Model('Hello World 2'), count: 7 }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 17, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            title: new Model('Hello World 2'),
                            count: 7
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                }
            }, { name: "MyComponent" });
        }
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "EntryComponent";
    }
}
class MyComponent extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__title = new ObservedPropertyObjectPU(new Model('Hello World'), this, "title");
        this.__count = new ObservedPropertySimplePU(0, this, "count");
        this.increaseBy = 1;
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: MyComponent_Params) {
        if (params.title !== undefined) {
            this.title = params.title;
        }
        if (params.count !== undefined) {
            this.count = params.count;
        }
        if (params.increaseBy !== undefined) {
            this.increaseBy = params.increaseBy;
        }
    }
    updateStateVars(params: MyComponent_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__title.purgeDependencyOnElmtId(rmElmtId);
        this.__count.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__title.aboutToBeDeleted();
        this.__count.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __title: ObservedPropertyObjectPU<Model>;
    get title() {
        return this.__title.get();
    }
    set title(newValue: Model) {
        this.__title.set(newValue);
    }
    private __count: ObservedPropertySimplePU<number>;
    get count() {
        return this.__count.get();
    }
    set count(newValue: number) {
        this.__count.set(newValue);
    }
    private increaseBy: number;
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('' + this.title.value);
            Text.margin(10);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('Click to change title');
            Button.onClick(() => {
                // @State变量的更新将触发上面的Text组件内容更新
                this.title.value = this.title.value === 'Hello ArkUI' ? 'Hello World' : 'Hello ArkUI';
            });
            Button.width(300);
            Button.margin(10);
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('Click to increase count =' + this.count);
            Button.onClick(() => {
                // @State变量的更新将触发该Button组件的内容更新
                this.count += this.increaseBy;
            });
            Button.width(300);
            Button.margin(10);
        }, Button);
        Button.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
registerNamedRoute(() => new EntryComponent(undefined, {}), "", { bundleName: "com.example.myapplication", moduleName: "entry", pagePath: "pages/Index", pageFullPath: "entry/src/main/ets/pages/Index", integratedHsp: "false", moduleType: "followWithHap" });
`;
