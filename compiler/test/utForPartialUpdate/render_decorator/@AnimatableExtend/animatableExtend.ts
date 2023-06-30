/*
 * Copyright (c) 2023 Huawei Device Co., Ltd.
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
@AnimatableExtend(Polyline)
function animatablePoints(points: number) {
  .strokeOpacity(points)
  .backgroundColor(Color.Red)
}

@AnimatableExtend(Text)
function attributeExtend() {
  .fontSize(50)
}

@Entry
@Component
struct HomeComponent {
  points: number = 1

  build() {
    Column() {
      Polyline()
        .animatablePoints(this.points)
        .strokeWidth(3)
        .height(100)
        .width(100)
      Text("hello")
        .attributeExtend()
    }
  }
}
`

exports.expectResult = `"use strict";
function animatablePoints(points, elmtId, isInitialRender, parent) {
    if (isInitialRender) {
        Polyline.createAnimatableProperty("animatablePoints", points, (points) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            ViewStackProcessor.GetAndPushFrameNode("Polyline", elmtId);
            Polyline.strokeOpacity(points);
            Polyline.backgroundColor(Color.Red);
            ViewStackProcessor.StopGetAccessRecording();
            parent.finishUpdateFunc(elmtId);
        });
        Polyline.strokeOpacity(points);
        Polyline.backgroundColor(Color.Red);
    }
    else {
        Polyline.updateAnimatableProperty("animatablePoints", points);
    }
}
function attributeExtend(elmtId, isInitialRender, parent) {
    if (isInitialRender) {
        Text.createAnimatableProperty("attributeExtend", () => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            ViewStackProcessor.GetAndPushFrameNode("Text", elmtId);
            Text.fontSize(50);
            ViewStackProcessor.StopGetAccessRecording();
            parent.finishUpdateFunc(elmtId);
        });
        Text.fontSize(50);
    }
    else {
        Text.updateAnimatableProperty("attributeExtend");
    }
}
class HomeComponent extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1) {
        super(parent, __localStorage, elmtId);
        this.points = 1;
        this.setInitiallyProvidedValue(params);
    }
    setInitiallyProvidedValue(params) {
        if (params.points !== undefined) {
            this.points = params.points;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
    }
    aboutToBeDeleted() {
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    initialRender() {
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Column.create();
            if (!isInitialRender) {
                Column.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Polyline.create();
            animatablePoints(this.points, elmtId, isInitialRender, this);
            if (!isInitialRender) {
                Polyline.pop();
            }
            else {
                Polyline.strokeWidth(3);
                Polyline.height(100);
                Polyline.width(100);
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Text.create("hello");
            attributeExtend(elmtId, isInitialRender, this);
            if (!isInitialRender) {
                Text.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        Text.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new HomeComponent(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`