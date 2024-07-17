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
class BottomControllerParam {
    playedTime: string = '';
    totalTime: string = '';
    playedTimeNumber: number = 0;
}

@Entry
@Component
export struct VideoPlayer {
    private totalTime: string = '';
    @State currentPlayedTime: string = "00:00";
    @State currentPlayedTimeNumber: number = 1;

    @Builder
    bottomController($$: BottomControllerParam) {
        Column() {
            Text('Hello' + $$.playedTimeNumber)
                .fontSize(13)
                .margin({ left: 4, bottom: 12 })
                .id("played_time")

            TextInput({ text: $$.totalTime, placeholder: 'builder test' })
                .placeholderColor(Color.Grey)
                .placeholderFont({ size: 14, weight: 400 })
                .caretColor(Color.Blue)
                .width(300)

            Slider({
                value: $$.playedTimeNumber,
                min: 0,
                max: 1000,
                step: 1,
                style: SliderStyle.OutSet
            })
            .width('100%')
            .margin({ left: 8, right: 8 })
            .trackColor(Color.Gray)
            .showSteps(true)
            .id("slider")
        }
    }

    build() {
        Column() {
            this.bottomController(
                {
                    playedTime: this.currentPlayedTime,
                    totalTime: this.totalTime,
                    playedTimeNumber: this.currentPlayedTimeNumber
                }
            )
        }
    }
}
`
exports.expectResult =
`"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoPlayer = void 0;
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
if (PUV2ViewBase.contextStack === undefined) {
    Reflect.set(PUV2ViewBase, "contextStack", []);
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
        this.__currentPlayedTime = new ObservedPropertySimplePU("00:00", this, "currentPlayedTime");
        this.__currentPlayedTimeNumber = new ObservedPropertySimplePU(1, this, "currentPlayedTimeNumber");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.totalTime !== undefined) {
            this.totalTime = params.totalTime;
        }
        if (params.currentPlayedTime !== undefined) {
            this.currentPlayedTime = params.currentPlayedTime;
        }
        if (params.currentPlayedTimeNumber !== undefined) {
            this.currentPlayedTimeNumber = params.currentPlayedTimeNumber;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__currentPlayedTime.purgeDependencyOnElmtId(rmElmtId);
        this.__currentPlayedTimeNumber.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__currentPlayedTime.aboutToBeDeleted();
        this.__currentPlayedTimeNumber.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
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
    bottomController($$, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('Hello' + $$.playedTimeNumber);
            Text.fontSize(13);
            Text.margin({ left: 4, bottom: 12 });
            Text.id("played_time");
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: $$.totalTime, placeholder: 'builder test' });
            TextInput.placeholderColor(Color.Grey);
            TextInput.placeholderFont({ size: 14, weight: 400 });
            TextInput.caretColor(Color.Blue);
            TextInput.width(300);
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Slider.create({
                value: $$.playedTimeNumber,
                min: 0,
                max: 1000,
                step: 1,
                style: SliderStyle.OutSet
            });
            Slider.width('100%');
            Slider.margin({ left: 8, right: 8 });
            Slider.trackColor(Color.Gray);
            Slider.showSteps(true);
            Slider.id("slider");
        }, Slider);
        Column.pop();
    }
    initialRender() {
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.push(this);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.bottomController.bind(this)(makeBuilderParameterProxy("bottomController", { playedTime: () => (this["__currentPlayedTime"] ? this["__currentPlayedTime"] : this["currentPlayedTime"]), totalTime: () => (this["__totalTime"] ? this["__totalTime"] : this["totalTime"]), playedTimeNumber: () => (this["__currentPlayedTimeNumber"] ? this["__currentPlayedTimeNumber"] : this["currentPlayedTimeNumber"]) }));
        Column.pop();
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.pop();
    }
    rerender() {
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.push(this);
        this.updateDirtyElements();
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.pop();
    }
}
exports.VideoPlayer = VideoPlayer;
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new VideoPlayer(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`
