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

@Entry
@Component
export struct FancyUseExp {
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
    }
  }
}
`

exports.expectResult =
`"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FancyUseExp = void 0;
class FancyUseExp extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1) {
        super(parent, __localStorage, elmtId);
        this.__enable = new ObservedPropertySimplePU(true, this, "enable");
        this.setInitiallyProvidedValue(params);
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
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Column.create({ space: 10 });
            if (!isInitialRender) {
                Column.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Text.create("Fancy");
            Text.backgroundColor(Color.Red);
            Text.width(100);
            Text.height(100);
            if (!isInitialRender) {
                Text.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        Text.pop();
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Text.create("Fancy");
            Text.backgroundColor(Color.Blue);
            Text.width(100);
            Text.height(100);
            if (!isInitialRender) {
                Text.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        Text.pop();
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
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
            if (!isInitialRender) {
                Button.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Text.create("Fancy");
            if (!isInitialRender) {
                Text.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        Text.pop();
        Button.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
exports.FancyUseExp = FancyUseExp;
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new FancyUseExp(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`
