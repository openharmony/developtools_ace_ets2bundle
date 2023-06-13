/*
 * Copyright (c) 2023 Huawei Device Co., Ltd.
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
@Reuseable
@Component
struct GestureTest {
  @State count: number = 0
  @State width_value: string = "100%"

  build() {
    Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.SpaceBetween }) {
      Text('LongPress onAction:' + this.count)
      .height(100)
      .width(width_value)
    }
    .height(100).width(this.width_value).padding(60).border({ width:1 }).margin(30)
    .gesture(
      LongPressGesture({ repeat: true })
        .onAction((event: GestureEvent) => {
          if (event.repeat) { this.count++ }
        })
        .onActionEnd(() => {
          this.count = 0
        })
    )
  }
}`

exports.expectResult =
`"use strict";
class GestureTest extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1) {
        super(parent, __localStorage, elmtId);
        this.__count = new ObservedPropertySimplePU(0, this, "count");
        this.__width_value = new ObservedPropertySimplePU("100%", this, "width_value");
        this.setInitiallyProvidedValue(params);
    }
    setInitiallyProvidedValue(params) {
        if (params.count !== undefined) {
            this.count = params.count;
        }
        if (params.width_value !== undefined) {
            this.width_value = params.width_value;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__count.purgeDependencyOnElmtId(rmElmtId);
        this.__width_value.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__count.aboutToBeDeleted();
        this.__width_value.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    updateRecycleElmtId(oldElmtId, newElmtId) {
        this.__count.updateElmtId(oldElmtId, newElmtId);
        this.__width_value.updateElmtId(oldElmtId, newElmtId);
    }
    get count() {
        return this.__count.get();
    }
    set count(newValue) {
        this.__count.set(newValue);
    }
    get width_value() {
        return this.__width_value.get();
    }
    set width_value(newValue) {
        this.__width_value.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Flex.create({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.SpaceBetween });
            Flex.width(this.width_value);
            Gesture.create(GesturePriority.Low);
            LongPressGesture.create({ repeat: true });
            LongPressGesture.onAction((event) => {
                if (event.repeat) {
                    this.count++;
                }
            });
            LongPressGesture.onActionEnd(() => {
                this.count = 0;
            });
            LongPressGesture.pop();
            Gesture.pop();
            if (!isInitialRender) {
                Flex.pop();
            }
            else {
                Flex.height(100);
                Flex.padding(60);
                Flex.border({ width: 1 });
                Flex.margin(30);
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Text.create('LongPress onAction:' + this.count);
            Text.width(width_value);
            if (!isInitialRender) {
                Text.pop();
            }
            else {
                Text.height(100);
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
`