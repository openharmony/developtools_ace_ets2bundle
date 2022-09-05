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
struct IFView {
  @State toggle1: boolean = false;
  @State toggle2: boolean = false;
  @State toggle3: boolean = false;

  build() {
    Column() {
      if (this.toggle1) {
        Text('toggle1')
      } else if(this.toggle2) {
        Text('toggle2')
      } else if (this.toggle3) {
        Text('toggle3')
      } else {
        Text('toggle no thing')
      }
    }
  }
}
`
exports.expectResult =
`"use strict";
class IFView extends ViewPU {
    constructor(parent, params, __localStorage) {
        super(parent, __localStorage);
        this.__toggle1 = new ObservedPropertySimplePU(false, this, "toggle1");
        this.__toggle2 = new ObservedPropertySimplePU(false, this, "toggle2");
        this.__toggle3 = new ObservedPropertySimplePU(false, this, "toggle3");
        this.setInitiallyProvidedValue(params);
    }
    setInitiallyProvidedValue(params) {
        if (params.toggle1 !== undefined) {
            this.toggle1 = params.toggle1;
        }
        if (params.toggle2 !== undefined) {
            this.toggle2 = params.toggle2;
        }
        if (params.toggle3 !== undefined) {
            this.toggle3 = params.toggle3;
        }
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__toggle1.purgeDependencyOnElmtId(rmElmtId);
        this.__toggle2.purgeDependencyOnElmtId(rmElmtId);
        this.__toggle3.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__toggle1.aboutToBeDeleted();
        this.__toggle2.aboutToBeDeleted();
        this.__toggle3.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get toggle1() {
        return this.__toggle1.get();
    }
    set toggle1(newValue) {
        this.__toggle1.set(newValue);
    }
    get toggle2() {
        return this.__toggle2.get();
    }
    set toggle2(newValue) {
        this.__toggle2.set(newValue);
    }
    get toggle3() {
        return this.__toggle3.get();
    }
    set toggle3(newValue) {
        this.__toggle3.set(newValue);
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
            If.create();
            if (this.toggle1) {
                If.branchId(0);
                this.observeComponentCreation((elmtId, isInitialRender) => {
                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                    Text.create('toggle1');
                    if (!isInitialRender) {
                        Text.pop();
                    }
                    ViewStackProcessor.StopGetAccessRecording();
                });
                Text.pop();
            }
            else if (this.toggle2) {
                If.branchId(1);
                this.observeComponentCreation((elmtId, isInitialRender) => {
                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                    Text.create('toggle2');
                    if (!isInitialRender) {
                        Text.pop();
                    }
                    ViewStackProcessor.StopGetAccessRecording();
                });
                Text.pop();
            }
            else if (this.toggle3) {
                If.branchId(2);
                this.observeComponentCreation((elmtId, isInitialRender) => {
                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                    Text.create('toggle3');
                    if (!isInitialRender) {
                        Text.pop();
                    }
                    ViewStackProcessor.StopGetAccessRecording();
                });
                Text.pop();
            }
            else {
                If.branchId(3);
                this.observeComponentCreation((elmtId, isInitialRender) => {
                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                    Text.create('toggle no thing');
                    if (!isInitialRender) {
                        Text.pop();
                    }
                    ViewStackProcessor.StopGetAccessRecording();
                });
                Text.pop();
            }
            if (!isInitialRender) {
                If.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        If.pop();
        Column.pop();
    }
    rerender() {
        this.__toggle1.markDependentElementsDirty(this);
        this.__toggle2.markDependentElementsDirty(this);
        this.__toggle3.markDependentElementsDirty(this);
        this.updateDirtyElements();
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new IFView(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`