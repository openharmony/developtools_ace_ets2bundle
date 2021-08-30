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

export const source: string = `
import router from '@system.router'
import app from '@system.app'

@Entry
@Component
struct MyComponent {
  @State offsetX1: double = 0
  @State offsetY1: double = 0
  @State offsetX2: double = 0
  @State offsetY2: double = 0
  @State offsetX3: double = 0
  @State offsetY3: double = 0

  build() {
    Column() {
       Text('fingers:1,all,offsetX: ' + this.offsetX1 + ' offsetY: ' + this.offsetY1)
        .fontSize(25)
        .width(200)
        .height(200)
        .backgroundColor('red')
        .gesture(
            PanGesture({fingers: 1, direction: Direction.All, distance: 15})
            .onActionStart((event: GestureEvent) => {
                this.offsetX1 = event.offsetX
                this.offsetY1 = event.offsetY
                console.error('pan gesture on clicked')
            })
            .onActionUpdate((event: GestureEvent) => {
                this.offsetX1 = event.offsetX
                this.offsetY1 = event.offsetY
                console.error('pan gesture on clicked')
            })
            .onActionEnd((event: GestureEvent) => {
                this.offsetX1 = event.offsetX
                this.offsetY1 = event.offsetY
                console.error('pan gesture on clicked')
            })
            .onActionCancel(() => {
            })
        )

      Text('fingers:1,horizontal,offsetX: ' + this.offsetX2 + ' offsetY: ' + this.offsetY2)
        .fontSize(25)
        .width(400)
        .height(200)
        .backgroundColor('green')
        .gesture(
            PanGesture({fingers: 1, direction: Direction.Horizontal, distance: 15})
            .onActionStart((event: GestureEvent) => {
                this.offsetX2 = event.offsetX
                this.offsetY2 = event.offsetY
                console.error('pan gesture on clicked')
            })
            .onActionUpdate((event: GestureEvent) => {
                this.offsetX2 = event.offsetX
                this.offsetY2 = event.offsetY
                console.error('pan gesture on clicked')
            })
            .onActionEnd((event: GestureEvent) => {
                this.offsetX2 = event.offsetX
                this.offsetY2 = event.offsetY
                console.error('pan gesture on clicked')
            })
            .onActionCancel(() => {
            })
        )

      Text('fingers:1,vertical,offsetX: ' + this.offsetX3 + ' offsetY: ' + this.offsetY3)
        .fontSize(25)
        .width(200)
        .height(400)
        .backgroundColor('blue')
        .gesture(
            PanGesture({fingers: 1, direction: Direction.Vertical, distance: 15})
            .onActionStart((event: GestureEvent) => {
                this.offsetX3 = event.offsetX
                this.offsetY3 = event.offsetY
                console.error('pan gesture on clicked')
            })
            .onActionUpdate((event: GestureEvent) => {
                this.offsetX3 = event.offsetX
                this.offsetY3 = event.offsetY
                console.error('pan gesture on clicked')
            })
            .onActionEnd((event: GestureEvent) => {
                this.offsetX3 = event.offsetX
                this.offsetY3 = event.offsetY
                console.error('pan gesture on clicked')
            })
            .onActionCancel(() => {
            })
        )
    }
  }
}`

export const expectResult: string =
`var router = globalThis.requireNativeModule('system.router');
var app = globalThis.requireNativeModule('system.app');
class MyComponent extends View {
    constructor(compilerAssignedUniqueChildId, parent, params) {
        super(compilerAssignedUniqueChildId, parent);
        this.__offsetX1 = new ObservedPropertyObject(0, this, "offsetX1");
        this.__offsetY1 = new ObservedPropertyObject(0, this, "offsetY1");
        this.__offsetX2 = new ObservedPropertyObject(0, this, "offsetX2");
        this.__offsetY2 = new ObservedPropertyObject(0, this, "offsetY2");
        this.__offsetX3 = new ObservedPropertyObject(0, this, "offsetX3");
        this.__offsetY3 = new ObservedPropertyObject(0, this, "offsetY3");
        this.updateWithValueParams(params);
    }
    updateWithValueParams(params) {
        if (params.offsetX1 !== undefined) {
            this.offsetX1 = params.offsetX1;
        }
        if (params.offsetY1 !== undefined) {
            this.offsetY1 = params.offsetY1;
        }
        if (params.offsetX2 !== undefined) {
            this.offsetX2 = params.offsetX2;
        }
        if (params.offsetY2 !== undefined) {
            this.offsetY2 = params.offsetY2;
        }
        if (params.offsetX3 !== undefined) {
            this.offsetX3 = params.offsetX3;
        }
        if (params.offsetY3 !== undefined) {
            this.offsetY3 = params.offsetY3;
        }
    }
    aboutToBeDeleted() {
        this.__offsetX1.aboutToBeDeleted();
        this.__offsetY1.aboutToBeDeleted();
        this.__offsetX2.aboutToBeDeleted();
        this.__offsetY2.aboutToBeDeleted();
        this.__offsetX3.aboutToBeDeleted();
        this.__offsetY3.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id());
    }
    get offsetX1() {
        return this.__offsetX1.get();
    }
    set offsetX1(newValue) {
        this.__offsetX1.set(newValue);
    }
    get offsetY1() {
        return this.__offsetY1.get();
    }
    set offsetY1(newValue) {
        this.__offsetY1.set(newValue);
    }
    get offsetX2() {
        return this.__offsetX2.get();
    }
    set offsetX2(newValue) {
        this.__offsetX2.set(newValue);
    }
    get offsetY2() {
        return this.__offsetY2.get();
    }
    set offsetY2(newValue) {
        this.__offsetY2.set(newValue);
    }
    get offsetX3() {
        return this.__offsetX3.get();
    }
    set offsetX3(newValue) {
        this.__offsetX3.set(newValue);
    }
    get offsetY3() {
        return this.__offsetY3.get();
    }
    set offsetY3(newValue) {
        this.__offsetY3.set(newValue);
    }
    render() {
        Column.create();
        Text.create('fingers:1,all,offsetX: ' + this.offsetX1 + ' offsetY: ' + this.offsetY1);
        Text.fontSize(25);
        Text.width(200);
        Text.height(200);
        Text.backgroundColor('red');
        Gesture.create(GesturePriority.Low);
        PanGesture.create({ fingers: 1, direction: Direction.All, distance: 15 });
        PanGesture.onActionStart((event) => {
            this.offsetX1 = event.offsetX;
            this.offsetY1 = event.offsetY;
            console.error('pan gesture on clicked');
        });
        PanGesture.onActionUpdate((event) => {
            this.offsetX1 = event.offsetX;
            this.offsetY1 = event.offsetY;
            console.error('pan gesture on clicked');
        });
        PanGesture.onActionEnd((event) => {
            this.offsetX1 = event.offsetX;
            this.offsetY1 = event.offsetY;
            console.error('pan gesture on clicked');
        });
        PanGesture.onActionCancel(() => {
        });
        PanGesture.pop();
        Gesture.pop();
        Text.pop();
        Text.create('fingers:1,horizontal,offsetX: ' + this.offsetX2 + ' offsetY: ' + this.offsetY2);
        Text.fontSize(25);
        Text.width(400);
        Text.height(200);
        Text.backgroundColor('green');
        Gesture.create(GesturePriority.Low);
        PanGesture.create({ fingers: 1, direction: Direction.Horizontal, distance: 15 });
        PanGesture.onActionStart((event) => {
            this.offsetX2 = event.offsetX;
            this.offsetY2 = event.offsetY;
            console.error('pan gesture on clicked');
        });
        PanGesture.onActionUpdate((event) => {
            this.offsetX2 = event.offsetX;
            this.offsetY2 = event.offsetY;
            console.error('pan gesture on clicked');
        });
        PanGesture.onActionEnd((event) => {
            this.offsetX2 = event.offsetX;
            this.offsetY2 = event.offsetY;
            console.error('pan gesture on clicked');
        });
        PanGesture.onActionCancel(() => {
        });
        PanGesture.pop();
        Gesture.pop();
        Text.pop();
        Text.create('fingers:1,vertical,offsetX: ' + this.offsetX3 + ' offsetY: ' + this.offsetY3);
        Text.fontSize(25);
        Text.width(200);
        Text.height(400);
        Text.backgroundColor('blue');
        Gesture.create(GesturePriority.Low);
        PanGesture.create({ fingers: 1, direction: Direction.Vertical, distance: 15 });
        PanGesture.onActionStart((event) => {
            this.offsetX3 = event.offsetX;
            this.offsetY3 = event.offsetY;
            console.error('pan gesture on clicked');
        });
        PanGesture.onActionUpdate((event) => {
            this.offsetX3 = event.offsetX;
            this.offsetY3 = event.offsetY;
            console.error('pan gesture on clicked');
        });
        PanGesture.onActionEnd((event) => {
            this.offsetX3 = event.offsetX;
            this.offsetY3 = event.offsetY;
            console.error('pan gesture on clicked');
        });
        PanGesture.onActionCancel(() => {
        });
        PanGesture.pop();
        Gesture.pop();
        Text.pop();
        Column.pop();
    }
}
loadDocument(new MyComponent("1", undefined, {}));
`
