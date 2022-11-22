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
struct RotationGestureExample {
  @State angle: number = 0

  build() {
    Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.SpaceBetween }) {
      Text('RotationGesture angle:' + this.angle)
    }
    .height(100).width(200).padding(20).border({ width:1 })
    .margin(80).rotate({ x:1, y:2, z:3, angle: this.angle })
    .gesture(
    RotationGesture()
      .onActionStart((event: GestureEvent) => {
        console.log('Rotation start')
      })
      .onActionUpdate((event: GestureEvent) => {
        this.angle = event.angle
      })
      .onActionEnd(() => {
        console.log('Rotation end')
      })
    )
  }
}`

exports.expectResult =
`"use strict";
class RotationGestureExample extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1) {
        super(parent, __localStorage, elmtId);
        this.__angle = new ObservedPropertySimplePU(0, this, "angle");
        this.setInitiallyProvidedValue(params);
    }
    setInitiallyProvidedValue(params) {
        if (params.angle !== undefined) {
            this.angle = params.angle;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__angle.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__angle.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get angle() {
        return this.__angle.get();
    }
    set angle(newValue) {
        this.__angle.set(newValue);
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
            Flex.rotate({ x: 1, y: 2, z: 3, angle: this.angle });
            Gesture.create(GesturePriority.Low);
            RotationGesture.create();
            RotationGesture.onActionStart((event) => {
                console.log('Rotation start');
            });
            RotationGesture.onActionUpdate((event) => {
                this.angle = event.angle;
            });
            RotationGesture.onActionEnd(() => {
                console.log('Rotation end');
            });
            RotationGesture.pop();
            Gesture.pop();
            if (!isInitialRender) {
                Flex.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Text.create('RotationGesture angle:' + this.angle);
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
loadDocument(new RotationGestureExample(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`
