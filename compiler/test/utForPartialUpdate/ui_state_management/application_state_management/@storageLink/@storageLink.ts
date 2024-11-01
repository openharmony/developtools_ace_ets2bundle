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
let varA = AppStorage.Link('varA')
let envLang = AppStorage.Prop('languageCode')

@Entry
@Component
struct MyComponent {
  @StorageLink('varA') varA: number = 2
  @StorageProp('languageCode') lang: string = 'en'
  private label: string = 'count'

  private aboutToAppear() {
    this.label = (this.lang === 'zh') ? '数' : 'Count'
  }

  build() {
    Row({ space: 20 }) {
      Button(this.label + ': ' + this.varA)
        .onClick(() => {
          AppStorage.Set<number>('varA', AppStorage.Get<number>('varA') + 1)
        })
      Button('lang: ' + this.lang)
        .onClick(() => {
          if (this.lang === 'zh') {
            AppStorage.Set<string>('languageCode', 'en')
          } else {
            AppStorage.Set<string>('languageCode', 'zh')
          }
          this.label = (this.lang === 'zh') ? '数' : 'Count'
        })
    }
  }
}
`
exports.expectResult =
`"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
if (PUV2ViewBase.contextStack === undefined) {
    Reflect.set(PUV2ViewBase, "contextStack", []);
}
let varA = AppStorage.Link('varA');
let envLang = AppStorage.Prop('languageCode');
class MyComponent extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__varA = this.createStorageLink('varA', 2, "varA");
        this.__lang = this.createStorageProp('languageCode', 'en', "lang");
        this.label = 'count';
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.label !== undefined) {
            this.label = params.label;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__varA.purgeDependencyOnElmtId(rmElmtId);
        this.__lang.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__varA.aboutToBeDeleted();
        this.__lang.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get varA() {
        return this.__varA.get();
    }
    set varA(newValue) {
        this.__varA.set(newValue);
    }
    get lang() {
        return this.__lang.get();
    }
    set lang(newValue) {
        this.__lang.set(newValue);
    }
    aboutToAppear() {
        this.label = (this.lang === 'zh') ? '数' : 'Count';
    }
    initialRender() {
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.push(this);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create({ space: 20 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(this.label + ': ' + this.varA);
            Button.onClick(() => {
                AppStorage.Set('varA', AppStorage.Get('varA') + 1);
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('lang: ' + this.lang);
            Button.onClick(() => {
                if (this.lang === 'zh') {
                    AppStorage.Set('languageCode', 'en');
                }
                else {
                    AppStorage.Set('languageCode', 'zh');
                }
                this.label = (this.lang === 'zh') ? '数' : 'Count';
            });
        }, Button);
        Button.pop();
        Row.pop();
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.pop();
    }
    rerender() {
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.push(this);
        this.updateDirtyElements();
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.pop();
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new MyComponent(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`
