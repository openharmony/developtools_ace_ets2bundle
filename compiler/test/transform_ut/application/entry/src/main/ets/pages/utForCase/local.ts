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
@ObservedV2
class Info {
  @Trace name: string;
  @Trace age: number;
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}
@Entry
@ComponentV2
struct Index {
  info: Info = new Info("Tom", 25);
  @Local localInfo: Info = new Info("Tom", 25);
  build() {
    Column() {
      Text('info: ' + this.info.name + '-' + this.info.age) // Text1
      Text('localInfo: ' + this.localInfo.name + '-' + this.localInfo.age) // Text2
      Button("change info&localInfo")
        .onClick(() => {
          this.info = new Info("Lucy", 18); // Text1不会刷新
          this.localInfo = new Info("Lucy", 18); // Text2会刷新
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
@ObservedV2
class Info {
    @Trace
    name: string;
    @Trace
    age: number;
    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }
}
class Index extends ViewV2 {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda, extraInfo) {
        super(parent, elmtId, extraInfo);
        this.info = new Info("Tom", 25);
        this.localInfo = new Info("Tom", 25);
        this.finalizeConstruction();
    }
    public resetStateVarsOnReuse(params: Object): void {
        this.localInfo = new Info("Tom", 25);
    }
    info: Info;
    @Local
    localInfo: Info;
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('info: ' + this.info.name + '-' + this.info.age);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('localInfo: ' + this.localInfo.name + '-' + this.localInfo.age);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel("change info&localInfo");
            Button.onClick(() => {
                this.info = new Info("Lucy", 18); // Text1不会刷新
                this.localInfo = new Info("Lucy", 18); // Text2会刷新
            });
        }, Button);
        Button.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "Index";
    }
}
registerNamedRoute(() => new Index(undefined, {}), "", { bundleName: "com.example.myapplication", moduleName: "entry", pagePath: "pages/Index", pageFullPath: "entry/src/main/ets/pages/Index", integratedHsp: "false", moduleType: "followWithHap" });
`;
