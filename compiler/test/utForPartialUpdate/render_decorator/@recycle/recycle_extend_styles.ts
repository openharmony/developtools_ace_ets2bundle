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
@Extend(Button) function fancybut(color:string|Color){
  .backgroundColor(color)
  .width(200)
  .height(100)
}

@Recycle
@Component
struct ExtendComponent {
  @State width_value: string = "100%"
  build() {
    Column(){
      Button("Fancy Button").fancybut(Color.Green)
      Button("Fancy Button").fancybut(Color.Green).height(100).width(this.width_value)
    }
  }
}

@Styles function globalFancy() {
  .backgroundColor(Color.Red)
}

@Recycle
@Component
struct StylesComponent {
  enable: boolean = true
  @State width_value: string = "100%"
  @State size_value: number = 50
  @Styles componentFancy() {
    .backgroundColor(Color.Blue)
    .width(this.width_value)
  }
  build() {
    Column({ space: 10 }) {
      Text("Fancy")
        .globalFancy()
        .width(this.width_value)
        .height(100)
      Text("Fancy")
        .componentFancy()
        .fontSize(this.size_value)
        .height(100)
      Button() {
        Text("Fancy")
          .globalFancy()
          .fontSize(this.size_value)
          .height(100)
      }
      .enabled(this.enable)
      .onClick(() => {
        this.enable = false
      })
      .componentFancy()
      .height(100)
      .stateStyles({
        normal: {
          .backgroundColor(Color.Green)
          .width(this.width_value)
        },
        disabled: this.componentFancy,
        pressed: globalFancy
      })
    }
  }
}`

exports.expectResult =
`"use strict";
function __Button__fancybut(color) {
    Button.backgroundColor(color);
    Button.width(200);
    Button.height(100);
}
class ExtendComponent extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1) {
        super(parent, __localStorage, elmtId);
        this.__width_value = new ObservedPropertySimplePU("100%", this, "width_value");
        this.setInitiallyProvidedValue(params);
    }
    setInitiallyProvidedValue(params) {
        if (params.width_value !== undefined) {
            this.width_value = params.width_value;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__width_value.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__width_value.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    updateRecycleElmtId(oldElmtId, newElmtId) {
        this.__width_value.updateElmtId(oldElmtId, newElmtId);
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
            Column.create();
            if (!isInitialRender) {
                Column.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Button.createWithLabel("Fancy Button");
            __Button__fancybut(Color.Green);
            if (!isInitialRender) {
                Button.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        Button.pop();
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Button.createWithLabel("Fancy Button");
            __Button__fancybut(Color.Green);
            Button.width(this.width_value);
            if (!isInitialRender) {
                Button.pop();
            }
            else {
                Button.height(100);
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        Button.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
class StylesComponent extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1) {
        super(parent, __localStorage, elmtId);
        this.enable = true;
        this.__width_value = new ObservedPropertySimplePU("100%", this, "width_value");
        this.__size_value = new ObservedPropertySimplePU(50, this, "size_value");
        this.setInitiallyProvidedValue(params);
    }
    setInitiallyProvidedValue(params) {
        if (params.enable !== undefined) {
            this.enable = params.enable;
        }
        if (params.width_value !== undefined) {
            this.width_value = params.width_value;
        }
        if (params.size_value !== undefined) {
            this.size_value = params.size_value;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__width_value.purgeDependencyOnElmtId(rmElmtId);
        this.__size_value.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__width_value.aboutToBeDeleted();
        this.__size_value.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    updateRecycleElmtId(oldElmtId, newElmtId) {
        this.__width_value.updateElmtId(oldElmtId, newElmtId);
        this.__size_value.updateElmtId(oldElmtId, newElmtId);
    }
    get width_value() {
        return this.__width_value.get();
    }
    set width_value(newValue) {
        this.__width_value.set(newValue);
    }
    get size_value() {
        return this.__size_value.get();
    }
    set size_value(newValue) {
        this.__size_value.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Column.create({ space: 10 });
            if (!isInitialRender) {
                Column.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Text.create("Fancy");
            Text.backgroundColor(Color.Red);
            Text.width(this.width_value);
            if (!isInitialRender) {
                Text.pop();
            }
            else {
                Text.height(100);
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        Text.pop();
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Text.create("Fancy");
            Text.backgroundColor(Color.Blue);
            Text.width(this.width_value);
            Text.fontSize(this.size_value);
            if (!isInitialRender) {
                Text.pop();
            }
            else {
                Text.height(100);
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        Text.pop();
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Button.createWithChild();
            Button.onClick(() => {
                this.enable = false;
            });
            Button.backgroundColor(Color.Blue);
            Button.width(this.width_value);
            ViewStackProcessor.visualState("normal");
            Button.backgroundColor(Color.Green);
            Button.width(this.width_value);
            ViewStackProcessor.visualState("disabled");
            Button.backgroundColor(Color.Blue);
            Button.width(this.width_value);
            ViewStackProcessor.visualState("pressed");
            Button.backgroundColor(Color.Red);
            ViewStackProcessor.visualState();
            if (!isInitialRender) {
                Button.pop();
            }
            else {
                Button.enabled(this.enable);
                Button.height(100);
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Text.create("Fancy");
            Text.backgroundColor(Color.Red);
            Text.fontSize(this.size_value);
            if (!isInitialRender) {
                Text.pop();
            }
            else {
                Text.height(100);
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        Text.pop();
        Button.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
`