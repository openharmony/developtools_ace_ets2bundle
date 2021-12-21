/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE2.0
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
  @State text_num: number = 0.0

  build() {
    Column() {
      Text('fingers:2,angle: ' + this.text_num)
        .fontSize(25)
        .width(400)
        .height(400)
        .backgroundColor('red')
        .gesture(
            RotationGesture({fingers: 2, angle: 5})
            .onActionStart((event: GestureEvent) => {
                this.text_num = event.angle
                console.error('rotation gesture on clicked')
            })
            .onActionUpdate((event: GestureEvent) => {
                this.text_num = event.angle
                console.error('rotation gesture on clicked')
            })
            .onActionEnd((event: GestureEvent) => {
                this.text_num = event.angle
                console.error('rotation gesture on clicked')
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
        this.__text_num = new ObservedPropertySimple(0.0, this, "text_num");
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
        Text.create('fingers:2,angle: ' + this.text_num);
        Text.fontSize(25);
        Text.width(400);
        Text.height(400);
        Text.backgroundColor('red');
        Gesture.create(GesturePriority.Low);
        RotationGesture.create({ fingers: 2, angle: 5 });
        RotationGesture.onActionStart((event) => {
            this.text_num = event.angle;
            console.error('rotation gesture on clicked');
        });
        RotationGesture.onActionUpdate((event) => {
            this.text_num = event.angle;
            console.error('rotation gesture on clicked');
        });
        RotationGesture.onActionEnd((event) => {
            this.text_num = event.angle;
            console.error('rotation gesture on clicked');
        });
        RotationGesture.onActionCancel(() => {
        });
        RotationGesture.pop();
        Gesture.pop();
        Text.pop();
        Column.pop();
    }
}
loadDocument(new MyComponent("1", undefined, {}));
`
