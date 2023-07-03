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
struct PinchGestureExample {
  @State scale2: number = 1

  build() {
    Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.SpaceBetween }) {
      Text('PinchGesture scale:' + this.scale2)
    }
    .height(100).width(200).padding(20).border({ width: 1 }).margin(80)
    .scale({ x: this.scale2, y: this.scale2, z: this.scale2 })
    .gesture(
    PinchGesture()
      .onActionStart((event: GestureEvent) => {
        console.info('Pinch start')
      })
      .onActionUpdate((event: GestureEvent) => {
        this.scale2 = event.scale
      })
      .onActionEnd(() => {
        console.info('Pinch end')
      })
    )
  }
}`

exports.expectResult =
`"use strict";
class PinchGestureExample extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1) {
        super(parent, __localStorage, elmtId);
        this.__scale2 = new ObservedPropertySimplePU(1, this, "scale2");
        this.setInitiallyProvidedValue(params);
    }
    setInitiallyProvidedValue(params) {
        if (params.scale2 !== undefined) {
            this.scale2 = params.scale2;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__scale2.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__scale2.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get scale2() {
        return this.__scale2.get();
    }
    set scale2(newValue) {
        this.__scale2.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Flex.create({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.SpaceBetween });
            Flex.height(100);
            Flex.width(200);
            Flex.padding(20);
            Flex.border({ width: 1 });
            Flex.margin(80);
            Flex.scale({ x: this.scale2, y: this.scale2, z: this.scale2 });
            Gesture.create(GesturePriority.Low);
            PinchGesture.create();
            PinchGesture.onActionStart((event) => {
                console.info('Pinch start');
            });
            PinchGesture.onActionUpdate((event) => {
                this.scale2 = event.scale;
            });
            PinchGesture.onActionEnd(() => {
                console.info('Pinch end');
            });
            PinchGesture.pop();
            Gesture.pop();
            if (!isInitialRender) {
                Flex.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Text.create('PinchGesture scale:' + this.scale2);
            if (!isInitialRender) {
                Text.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        Text.pop();
        Flex.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new PinchGestureExample(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`
