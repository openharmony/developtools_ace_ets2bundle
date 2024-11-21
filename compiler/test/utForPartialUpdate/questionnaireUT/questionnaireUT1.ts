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

// Use $$syntax in builder
exports.source = `
class BottomControllerParam {
    playedTime: string = ''
    totalTime: string = ''
    playedTimeNumber: number = 0
  }
  
  @Entry
  @Component
  struct VideoPlayer {
    private totalTime: string = ''
    @State showUl: boolean = true
    @State currentPlayedTime: string = '00:00'
    @State currentPlayedTimeNumber: number = 0
    @State isFull: boolean = false
  
    @Builder bottomController($$: BottomControllerParam) {
      Text('PlayTime:' + $$.playedTimeNumber)
        .fontSize(13)
        .margin({left: 4, bottom: 12})
        .id('play_time')
      Slider({value: $$.playedTimeNumber, min: 0, max: 1000, step: 1, style: SliderStyle.OutSet})
        .width('100%')
        .margin({left: 8, right: 8})
        .trackColor(Color.Gray)
        .showSteps(true)
        .id('slider')
    }
    build() {
      Column(){
        this.bottomController({playedTime: this.currentPlayedTime, totalTime: this.totalTime, playedTimeNumber: this.currentPlayedTimeNumber})
      }
    }
  }
  
   export enum VideoState {
    Init,
    Buffering,
    Playing,
    Pause,
    Stop,
    Finish
  }
`
exports.expectResult =
`"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoState = void 0;
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
class BottomControllerParam {
    constructor() {
        this.playedTime = '';
        this.totalTime = '';
        this.playedTimeNumber = 0;
    }
}
class VideoPlayer extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.totalTime = '';
        this.__showUl = new ObservedPropertySimplePU(true, this, "showUl");
        this.__currentPlayedTime = new ObservedPropertySimplePU('00:00', this, "currentPlayedTime");
        this.__currentPlayedTimeNumber = new ObservedPropertySimplePU(0, this, "currentPlayedTimeNumber");
        this.__isFull = new ObservedPropertySimplePU(false, this, "isFull");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.totalTime !== undefined) {
            this.totalTime = params.totalTime;
        }
        if (params.showUl !== undefined) {
            this.showUl = params.showUl;
        }
        if (params.currentPlayedTime !== undefined) {
            this.currentPlayedTime = params.currentPlayedTime;
        }
        if (params.currentPlayedTimeNumber !== undefined) {
            this.currentPlayedTimeNumber = params.currentPlayedTimeNumber;
        }
        if (params.isFull !== undefined) {
            this.isFull = params.isFull;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__showUl.purgeDependencyOnElmtId(rmElmtId);
        this.__currentPlayedTime.purgeDependencyOnElmtId(rmElmtId);
        this.__currentPlayedTimeNumber.purgeDependencyOnElmtId(rmElmtId);
        this.__isFull.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__showUl.aboutToBeDeleted();
        this.__currentPlayedTime.aboutToBeDeleted();
        this.__currentPlayedTimeNumber.aboutToBeDeleted();
        this.__isFull.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get showUl() {
        return this.__showUl.get();
    }
    set showUl(newValue) {
        this.__showUl.set(newValue);
    }
    get currentPlayedTime() {
        return this.__currentPlayedTime.get();
    }
    set currentPlayedTime(newValue) {
        this.__currentPlayedTime.set(newValue);
    }
    get currentPlayedTimeNumber() {
        return this.__currentPlayedTimeNumber.get();
    }
    set currentPlayedTimeNumber(newValue) {
        this.__currentPlayedTimeNumber.set(newValue);
    }
    get isFull() {
        return this.__isFull.get();
    }
    set isFull(newValue) {
        this.__isFull.set(newValue);
    }
    bottomController($$, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('PlayTime:' + $$.playedTimeNumber);
            Text.fontSize(13);
            Text.margin({ left: 4, bottom: 12 });
            Text.id('play_time');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Slider.create({ value: $$.playedTimeNumber, min: 0, max: 1000, step: 1, style: SliderStyle.OutSet });
            Slider.width('100%');
            Slider.margin({ left: 8, right: 8 });
            Slider.trackColor(Color.Gray);
            Slider.showSteps(true);
            Slider.id('slider');
        }, Slider);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.bottomController.bind(this)(makeBuilderParameterProxy("bottomController", { playedTime: () => (this["__currentPlayedTime"] ? this["__currentPlayedTime"] : this["currentPlayedTime"]), totalTime: () => (this["__totalTime"] ? this["__totalTime"] : this["totalTime"]), playedTimeNumber: () => (this["__currentPlayedTimeNumber"] ? this["__currentPlayedTimeNumber"] : this["currentPlayedTimeNumber"]) }));
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
var VideoState;
(function (VideoState) {
    VideoState[VideoState["Init"] = 0] = "Init";
    VideoState[VideoState["Buffering"] = 1] = "Buffering";
    VideoState[VideoState["Playing"] = 2] = "Playing";
    VideoState[VideoState["Pause"] = 3] = "Pause";
    VideoState[VideoState["Stop"] = 4] = "Stop";
    VideoState[VideoState["Finish"] = 5] = "Finish";
})(VideoState = exports.VideoState || (exports.VideoState = {}));
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new VideoPlayer(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`