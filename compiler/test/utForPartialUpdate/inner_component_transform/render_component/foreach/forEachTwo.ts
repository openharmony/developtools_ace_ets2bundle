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
@Entry
@Component
struct Index {
  @State WIDTH_AND_HEIGHT: Array<{ w: number, h: number }> = [
    { w: 10, h: 10 },
    { w: 20, h: 20 },
    { w: 30, h: 30 },
    { w: 40, h: 40 },
    { w: 50, h: 50 }
  ]
  build() {
    Row() {
      Column() {
        ForEach(this.WIDTH_AND_HEIGHT, ({ w, h }) => {
          Button()
            .width(w)
            .height(h)
        }, item => item.toString())
      }
      .width('100%')
    }
    .height('100%')
  }
}`

exports.expectResult =
`"use strict";
class Index extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1) {
        super(parent, __localStorage, elmtId);
        this.__WIDTH_AND_HEIGHT = new ObservedPropertyObjectPU([
            { w: 10, h: 10 },
            { w: 20, h: 20 },
            { w: 30, h: 30 },
            { w: 40, h: 40 },
            { w: 50, h: 50 }
        ], this, "WIDTH_AND_HEIGHT");
        this.setInitiallyProvidedValue(params);
    }
    setInitiallyProvidedValue(params) {
        if (params.WIDTH_AND_HEIGHT !== undefined) {
            this.WIDTH_AND_HEIGHT = params.WIDTH_AND_HEIGHT;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__WIDTH_AND_HEIGHT.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__WIDTH_AND_HEIGHT.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get WIDTH_AND_HEIGHT() {
        return this.__WIDTH_AND_HEIGHT.get();
    }
    set WIDTH_AND_HEIGHT(newValue) {
        this.__WIDTH_AND_HEIGHT.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Row.create();
            Row.height('100%');
            if (!isInitialRender) {
                Row.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Column.create();
            Column.width('100%');
            if (!isInitialRender) {
                Column.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const { w, h } = _item;
                this.observeComponentCreation((elmtId, isInitialRender) => {
                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                    Button.createWithLabel();
                    Button.width(w);
                    Button.height(h);
                    if (!isInitialRender) {
                        Button.pop();
                    }
                    ViewStackProcessor.StopGetAccessRecording();
                });
                Button.pop();
            };
            this.forEachUpdateFunction(elmtId, this.WIDTH_AND_HEIGHT, forEachItemGenFunction, item => item.toString(), false, false);
            if (!isInitialRender) {
                ForEach.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        ForEach.pop();
        Column.pop();
        Row.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new Index(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`
