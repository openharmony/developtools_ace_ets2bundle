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
@Styles function globalFancy() {
  .backgroundColor(Color.Red)
}

@Styles function useStateStyles() {
  .stateStyles({
    normal: {
      .width(200)
    }
  })
}

@Entry
@Component
struct FancyUse {
  @State enable: boolean = true
  @Styles componentFancy() {
    .backgroundColor(Color.Blue)
  }
  build() {
    Column({ space: 10 }) {
      Text("Fancy")
        .globalFancy()
        .width(100)
        .height(100)
      Text("Fancy")
        .componentFancy()
        .width(100)
        .height(100)
      Button() {
        Text("Fancy")
      }
      .enabled(this.enable)
      .onClick(() => {
        this.enable = false
      })
      .stateStyles({
        normal: {
          .backgroundColor(Color.Green)
        },
        disabled: this.componentFancy,
        pressed: globalFancy
      })
      Text("Fancy")
        .useStateStyles()
    }
  }
}`

exports.expectResult =
`"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
if (PUV2ViewBase.contextStack === undefined) {
    Reflect.set(PUV2ViewBase, "contextStack", []);
}
class FancyUse extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__enable = new ObservedPropertySimplePU(true, this, "enable");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.enable !== undefined) {
            this.enable = params.enable;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__enable.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__enable.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get enable() {
        return this.__enable.get();
    }
    set enable(newValue) {
        this.__enable.set(newValue);
    }
    initialRender() {
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.push(this);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create({ space: 10 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("Fancy");
            Text.backgroundColor(Color.Red);
            Text.width(100);
            Text.height(100);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("Fancy");
            Text.backgroundColor(Color.Blue);
            Text.width(100);
            Text.height(100);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithChild();
            Button.enabled(this.enable);
            Button.onClick(() => {
                this.enable = false;
            });
            ViewStackProcessor.visualState("normal");
            Button.backgroundColor(Color.Green);
            ViewStackProcessor.visualState("disabled");
            Button.backgroundColor(Color.Blue);
            ViewStackProcessor.visualState("pressed");
            Button.backgroundColor(Color.Red);
            ViewStackProcessor.visualState();
        }, Button);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("Fancy");
        }, Text);
        Text.pop();
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("Fancy");
            ViewStackProcessor.visualState("normal");
            Text.width(200);
            ViewStackProcessor.visualState();
        }, Text);
        Text.pop();
        Column.pop();
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.pop();
    }
    rerender() {
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.push(this);
        this.updateDirtyElements();
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.pop();
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new FancyUse(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`
