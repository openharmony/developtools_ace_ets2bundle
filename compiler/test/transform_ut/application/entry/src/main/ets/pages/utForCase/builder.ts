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
@Entry
@Component
struct PrivateBuilder {
  @State builder_value: string = 'Hello';

  @Builder
  builder() {
    Column() {
      Text(this.builder_value)
        .width(230)
        .height(40)
        .backgroundColor('#ffeae5e5')
        .borderRadius(20)
        .margin(12)
        .textAlign(TextAlign.Center)
    }
  }

  aboutToAppear(): void {
    setTimeout(() => {
      this.builder_value = 'Hello World';
    }, 2000);
  }

  build() {
    Row() {
      Column() {
        Text(this.builder_value)
          .width(230)
          .height(40)
          .backgroundColor('#ffeae5e5')
          .borderRadius(20)
          .textAlign(TextAlign.Center)
        this.builder()
        Button('点击改变builder_value内容')
          .onClick(() => {
            this.builder_value = 'builder_value被点击了';
          })
      }
      .height('100%')
      .width('100%')
    }
  }
}
`;

exports.expectResult =
`
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface PrivateBuilder_Params {
    builder_value?: string;
}
class PrivateBuilder extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__builder_value = new ObservedPropertySimplePU('Hello', this, "builder_value");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: PrivateBuilder_Params) {
        if (params.builder_value !== undefined) {
            this.builder_value = params.builder_value;
        }
    }
    updateStateVars(params: PrivateBuilder_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__builder_value.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__builder_value.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __builder_value: ObservedPropertySimplePU<string>;
    get builder_value() {
        return this.__builder_value.get();
    }
    set builder_value(newValue: string) {
        this.__builder_value.set(newValue);
    }
    builder(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.builder_value);
            Text.width(230);
            Text.height(40);
            Text.backgroundColor('#ffeae5e5');
            Text.borderRadius(20);
            Text.margin(12);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        Column.pop();
    }
    aboutToAppear(): void {
        setTimeout(() => {
            this.builder_value = 'Hello World';
        }, 2000);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.height('100%');
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.builder_value);
            Text.width(230);
            Text.height(40);
            Text.backgroundColor('#ffeae5e5');
            Text.borderRadius(20);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.builder.bind(this)();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('点击改变builder_value内容');
            Button.onClick(() => {
                this.builder_value = 'builder_value被点击了';
            });
        }, Button);
        Button.pop();
        Column.pop();
        Row.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "PrivateBuilder";
    }
}
registerNamedRoute(() => new PrivateBuilder(undefined, {}), "", { bundleName: "com.example.myapplication", moduleName: "entry", pagePath: "pages/Index", pageFullPath: "entry/src/main/ets/pages/Index", integratedHsp: "false", moduleType: "followWithHap" });
`;
