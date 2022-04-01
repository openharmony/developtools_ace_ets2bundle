/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
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
import router from '@system.router'
import app from '@system.app'

@Entry
@Component
struct MyComponent {
  @State text_num: float = 0.0

  build() {
    Column() {
      Text('fingers:2,scale: ' + this.text_num)
        .fontSize(25)
        .width(400)
        .height(400)
        .backgroundColor('red')
        .gesture(
            PinchGesture({fingers: 2, distance: 18})
            .onActionStart((event: GestureEvent) => {
                this.text_num = event.scale
                console.error('pinch gesture on clicked')
            })
            .onActionUpdate((event: GestureEvent) => {
                this.text_num = event.scale
                console.error('pinch gesture on clicked')
            })
            .onActionEnd((event: GestureEvent) => {
                this.text_num = event.scale
                console.error('pinch gesture on clicked')
            })
            .onActionCancel(() => {
            })
        )
    }
  }
}`

exports.expectResult =
`var router = globalThis.requireNativeModule('system.router');
var app = globalThis.requireNativeModule('system.app');
class MyComponent extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.__text_num = new ObservedPropertyObject(0.0, this, "text_num");
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.text_num !== undefined) {
            this.text_num = params.text_num;
        }
    }
    aboutToBeDeleted() {
        this.__text_num.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get text_num() {
        return this.__text_num.get();
    }
    set text_num(newValue) {
        this.__text_num.set(newValue);
    }
    render() {
        Column.create();
        Text.create('fingers:2,scale: ' + this.text_num);
        Text.fontSize(25);
        Text.width(400);
        Text.height(400);
        Text.backgroundColor('red');
        Gesture.create(GesturePriority.Low);
        PinchGesture.create({ fingers: 2, distance: 18 });
        PinchGesture.onActionStart((event) => {
            this.text_num = event.scale;
            console.error('pinch gesture on clicked');
        });
        PinchGesture.onActionUpdate((event) => {
            this.text_num = event.scale;
            console.error('pinch gesture on clicked');
        });
        PinchGesture.onActionEnd((event) => {
            this.text_num = event.scale;
            console.error('pinch gesture on clicked');
        });
        PinchGesture.onActionCancel(() => {
        });
        PinchGesture.pop();
        Gesture.pop();
        Text.pop();
        Column.pop();
    }
}
loadDocument(new MyComponent("1", undefined, {}));
`
