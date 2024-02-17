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
  @State scale: number = 1

  build() {
    Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.SpaceBetween }) {
      Text('PinchGesture scale:' + this.scale)
    }
    .height(100).width(200).padding(20).border({ width: 1 }).margin(80)
    .scale({ x: this.scale, y: this.scale, z: this.scale })
    .gesture(
    PinchGesture()
      .onActionStart((event: GestureEvent) => {
        console.info('Pinch start')
      })
      .onActionUpdate((event: GestureEvent) => {
        this.scale = event.scale
      })
      .onActionEnd(() => {
        console.info('Pinch end')
      })
    )
  }
}`

exports.expectResult =
`"use strict";
let __generate__Id = 0;
function generateId() {
    return "pinchGesture_" + ++__generate__Id;
}
class PinchGestureExample extends View {
    constructor(compilerAssignedUniqueChildId, parent, params, localStorage) {
        super(compilerAssignedUniqueChildId, parent, localStorage);
        this.__scale = new ObservedPropertySimple(1, this, "scale");
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.scale !== undefined) {
            this.scale = params.scale;
        }
    }
    aboutToBeDeleted() {
        this.__scale.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get scale() {
        return this.__scale.get();
    }
    set scale(newValue) {
        this.__scale.set(newValue);
    }
    render() {
        Flex.create({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.SpaceBetween });
        Flex.height(100);
        Flex.width(200);
        Flex.padding(20);
        Flex.border({ width: 1 });
        Flex.margin(80);
        Flex.scale({ x: this.scale, y: this.scale, z: this.scale });
        Gesture.create(GesturePriority.Low);
        PinchGesture.create();
        PinchGesture.onActionStart((event) => {
            console.info('Pinch start');
        });
        PinchGesture.onActionUpdate((event) => {
            this.scale = event.scale;
        });
        PinchGesture.onActionEnd(() => {
            console.info('Pinch end');
        });
        PinchGesture.pop();
        Gesture.pop();
        Text.create('PinchGesture scale:' + this.scale);
        Text.pop();
        Flex.pop();
    }
}
loadDocument(new PinchGestureExample("1", undefined, {}));
`
