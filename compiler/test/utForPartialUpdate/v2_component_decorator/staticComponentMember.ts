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
  build() {
    Column() { 
    }
  }
}

@Builder
function testBuilder() {
  Text("testBuilder")
}

@ComponentV2
struct ChildComponent {
  @Local static local_value: string = "hello"
  @Param static param_value: string = "hello"
  @Event static event_value: Function = () => {}
  @Provider() static provider_value: number = 0
  @Consumer("a") static consumer_value: boolean = true
  @BuilderParam static builder_value: Function = testBuilder

  @Monitor("local_value")
  static testMonitor() {}

  @Computed
  static get fullName() {
    return ChildComponent.param_value
  }

  build() {
    Column() {}
  }
}
`
exports.expectResult =
`"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
if (PUV2ViewBase.contextStack === undefined) {
    Reflect.set(PUV2ViewBase, "contextStack", []);
}
class HomeComponent extends ViewV2 {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda, extraInfo) {
        super(parent, elmtId, extraInfo);
        this.finalizeConstruction();
    }
    initialRender() {
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.push(this);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        Column.pop();
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.pop();
    }
    rerender() {
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.push(this);
        this.updateDirtyElements();
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.pop();
    }
    static getEntryName() {
        return "HomeComponent";
    }
}
function testBuilder(parent = null) {
    (parent ? parent : this).observeComponentCreation2((elmtId, isInitialRender) => {
        Text.create("testBuilder");
    }, Text);
    Text.pop();
}
class ChildComponent extends ViewV2 {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda, extraInfo) {
        super(parent, elmtId, extraInfo);
        this.finalizeConstruction();
    }
    static testMonitor() { }
    static get fullName() {
        return ChildComponent.param_value;
    }
    initialRender() {
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.push(this);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        Column.pop();
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.pop();
    }
    rerender() {
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.push(this);
        this.updateDirtyElements();
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.pop();
    }
}
ChildComponent.local_value = "hello";
ChildComponent.param_value = "hello";
ChildComponent.event_value = () => { };
ChildComponent.provider_value = 0;
ChildComponent.consumer_value = true;
ChildComponent.builder_value = testBuilder;
__decorate([
    Local
], ChildComponent, "local_value", void 0);
__decorate([
    Param
], ChildComponent, "param_value", void 0);
__decorate([
    Event
], ChildComponent, "event_value", void 0);
__decorate([
    Provider()
], ChildComponent, "provider_value", void 0);
__decorate([
    Consumer("a")
], ChildComponent, "consumer_value", void 0);
__decorate([
    Monitor("local_value")
], ChildComponent, "testMonitor", null);
__decorate([
    Computed
], ChildComponent, "fullName", null);
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new HomeComponent(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`