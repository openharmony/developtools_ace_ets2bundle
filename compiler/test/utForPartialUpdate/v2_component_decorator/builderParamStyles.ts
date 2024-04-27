/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
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
@Entry
@ComponentV2
struct HomeComponent {
  @BuilderParam buildTest: () => void
  @BuilderParam buildTest1: () => void = this.testBuilder

  @Builder
  testBuilder() {
    Text("hello testBuilder")
  }

  @Styles
  testStyles() {
    .backgroundColor(Color.Red)
  }

  @Styles useStateStyles() {
    .stateStyles({
      normal: {
        .width(200)
      }
    })
  }

  build() {
    Column() {
      Button() {
        Text("hello HomeComponent")
        .fontSize(30)
        .testStyles()
      }
      .stateStyles({
        normal: {
          .backgroundColor(Color.Green)
        },
        disabled: this.testStyles,
        pressed: this.useStateStyles
      })
      Text("Fancy")
        .useStateStyles()
    }
  }
}
`
exports.expectResult =
`"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
class HomeComponent extends ViewV2 {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda, extraInfo) {
        super(parent, elmtId, extraInfo);
        this.buildTest = "buildTest" in params ? params.buildTest : undefined;
        this.buildTest1 = "buildTest1" in params ? params.buildTest1 : this.testBuilder;
        this.finalizeConstruction();
    }
    testBuilder(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("hello testBuilder");
        }, Text);
        Text.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithChild();
            ViewStackProcessor.visualState("normal");
            Button.backgroundColor(Color.Green);
            ViewStackProcessor.visualState("disabled");
            Button.backgroundColor(Color.Red);
            ViewStackProcessor.visualState("pressed");
            ViewStackProcessor.visualState("normal");
            Button.width(200);
            ViewStackProcessor.visualState();
            ViewStackProcessor.visualState();
        }, Button);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("hello HomeComponent");
            Text.fontSize(30);
            Text.backgroundColor(Color.Red);
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
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName() {
        return "HomeComponent";
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new HomeComponent(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`