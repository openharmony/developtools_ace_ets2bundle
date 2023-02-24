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
@Builder
function ComB(param: string[]) {
  ForEach(param, item => {
    ComA().backgroundColor('red')
  })
}

@Entry
@Component
struct Index {
  @State arr: string[] = ['1', '2', '3', '4', '5']

  build() {
    Column() {
      ComB(this.arr);
    }
  }
}

@Component
struct ComA {
  build() {
    Row() {
      Text('自定义组件')
        .fontSize(30)
    }
  }
}
`
exports.expectResult =
`"use strict";
function ComB(param, parent = null) {
    (parent ? parent : this).observeComponentCreation((elmtId, isInitialRender) => {
        ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
        ForEach.create();
        const forEachItemGenFunction = _item => {
            const item = _item;
            (parent ? parent : this).observeComponentCreation((elmtId, isInitialRender) => {
                ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                __Common__.create();
                __Common__.backgroundColor('red');
                if (!isInitialRender) {
                    __Common__.pop();
                }
                ViewStackProcessor.StopGetAccessRecording();
            });
            {
                (parent ? parent : this).observeComponentCreation((elmtId, isInitialRender) => {
                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                    if (isInitialRender) {
                        ViewPU.create(new ComA(parent ? parent : this, {}, undefined, elmtId));
                    }
                    else {
                        (parent ? parent : this).updateStateVarsOfChildByElmtId(elmtId, {});
                    }
                    ViewStackProcessor.StopGetAccessRecording();
                });
            }
            __Common__.pop();
        };
        (parent ? parent : this).forEachUpdateFunction(elmtId, param, forEachItemGenFunction);
        if (!isInitialRender) {
            ForEach.pop();
        }
        ViewStackProcessor.StopGetAccessRecording();
    });
    ForEach.pop();
}
class Index extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1) {
        super(parent, __localStorage, elmtId);
        this.__arr = new ObservedPropertyObjectPU(['1', '2', '3', '4', '5'], this, "arr");
        this.setInitiallyProvidedValue(params);
    }
    setInitiallyProvidedValue(params) {
        if (params.arr !== undefined) {
            this.arr = params.arr;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__arr.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__arr.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get arr() {
        return this.__arr.get();
    }
    set arr(newValue) {
        this.__arr.set(newValue);
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
        ComB.bind(this)(this.arr);
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
class ComA extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1) {
        super(parent, __localStorage, elmtId);
        this.setInitiallyProvidedValue(params);
    }
    setInitiallyProvidedValue(params) {
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
            Row.create();
            if (!isInitialRender) {
                Row.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Text.create('自定义组件');
            Text.fontSize(30);
            if (!isInitialRender) {
                Text.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        Text.pop();
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
