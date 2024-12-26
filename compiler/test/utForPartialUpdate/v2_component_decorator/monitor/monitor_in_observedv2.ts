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

// @Monitor case with @ObservedV2
exports.source = `
@ObservedV2
class Info {
  @Trace name: string = "Tom";
  @Trace region: string = "North";
  @Trace job: string = "Teacher";
  age: number = 25;
  // name被@Trace装饰，能够监听变化
  @Monitor("name")
  onNameChange(monitor: IMonitor) {
    console.log("name change from " + monitor.value()?.before + " to " + monitor.value()?.now);
  }
  // age未被@Trace装饰，不能监听变化
  @Monitor("age")
  onAgeChange(monitor: IMonitor) {
    console.log("age change from " + monitor.value()?.before + " to " + monitor.value()?.now);
  }
  // region与job均被@Trace装饰，能够监听变化
  @Monitor("region", "job")
  onChange(monitor: IMonitor) {
    monitor.dirty.forEach((path: string) => {
      console.log(path + " change from " + monitor.value(path)?.before + " to " + monitor.value(path)?.now);
    })
  }
}
@Entry
@ComponentV2
struct Index {
  info: Info = new Info();
  build() {
    Column() {
      Button("change name")
        .onClick(() => {
          this.info.name = "Jack"; // 能够触发onNameChange方法
        })
      Button("change age")
        .onClick(() => {
          this.info.age = 26; // 不能够触发onAgeChange方法
        })
      Button("change region")
        .onClick(() => {
          this.info.region = "South"; // 能够触发onChange方法
        })
      Button("change job")
        .onClick(() => {
          this.info.job = "Driver"; // 能够触发onChange方法
        })
    }
  }
}
`;
exports.expectResult =
`"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
if (PUV2ViewBase.contextStack === undefined) {
    Reflect.set(PUV2ViewBase, "contextStack", []);
}
let Info = class Info {
    constructor() {
        this.name = "Tom";
        this.region = "North";
        this.job = "Teacher";
        this.age = 25;
    }
    // name被@Trace装饰，能够监听变化
    onNameChange(monitor) {
        console.log("name change from " + monitor.value()?.before + " to " + monitor.value()?.now);
    }
    // age未被@Trace装饰，不能监听变化
    onAgeChange(monitor) {
        console.log("age change from " + monitor.value()?.before + " to " + monitor.value()?.now);
    }
    // region与job均被@Trace装饰，能够监听变化
    onChange(monitor) {
        monitor.dirty.forEach((path) => {
            console.log(path + " change from " + monitor.value(path)?.before + " to " + monitor.value(path)?.now);
        });
    }
};
__decorate([
    Trace
], Info.prototype, "name", void 0);
__decorate([
    Trace
], Info.prototype, "region", void 0);
__decorate([
    Trace
], Info.prototype, "job", void 0);
__decorate([
    Monitor("name")
], Info.prototype, "onNameChange", null);
__decorate([
    Monitor("age")
], Info.prototype, "onAgeChange", null);
__decorate([
    Monitor("region", "job")
], Info.prototype, "onChange", null);
Info = __decorate([
    ObservedV2
], Info);
class Index extends ViewV2 {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda, extraInfo) {
        super(parent, elmtId, extraInfo);
        this.info = new Info();
        this.finalizeConstruction();
    }
    initialRender() {
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.push(this);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel("change name");
            Button.onClick(() => {
                this.info.name = "Jack"; // 能够触发onNameChange方法
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel("change age");
            Button.onClick(() => {
                this.info.age = 26; // 不能够触发onAgeChange方法
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel("change region");
            Button.onClick(() => {
                this.info.region = "South"; // 能够触发onChange方法
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel("change job");
            Button.onClick(() => {
                this.info.job = "Driver"; // 能够触发onChange方法
            });
        }, Button);
        Button.pop();
        Column.pop();
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.pop();
    }
    rerender() {
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.push(this);
        this.updateDirtyElements();
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.pop();
    }
    static getEntryName() {
        return "Index";
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new Index(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`;
