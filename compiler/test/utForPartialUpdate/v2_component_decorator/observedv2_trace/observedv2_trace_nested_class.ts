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

// @ObservedV2 and @Trace nested class
exports.source = `
@ObservedV2
class Pencil {
  @Trace length: number = 21; // 当length变化时，会刷新关联的组件
}
class Bag {
  width: number = 50;
  height: number = 60;
  pencil: Pencil = new Pencil();
}
class Son {
  age: number = 5;
  school: string = "some";
  bag: Bag = new Bag();
}

@Entry
@ComponentV2
struct Page {
  son: Son = new Son();
  renderTimes: number = 0;
  isRender(id: number): number {
    console.info('id:' + id +  'renderTimes:' + this.renderTimes);
    this.renderTimes++;
    return 40;
  }

  build() {
    Column() {
      Text('pencil length' + this.son.bag.pencil.length)
        .fontSize(this.isRender(1))   // UINode (1)
      Button("change length")
        .onClick(() => {
          // 点击更改length值，UINode（1）会刷新
          this.son.bag.pencil.length += 100;
        })
      Button("assign Son")
        .onClick(() => {
          // 由于变量son非状态变量，因此无法刷新UINode（1）
          this.son = new Son();
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
let Pencil = class Pencil {
    constructor() {
        this.length = 21; // 当length变化时，会刷新关联的组件
    }
};
__decorate([
    Trace
], Pencil.prototype, "length", void 0);
Pencil = __decorate([
    ObservedV2
], Pencil);
class Bag {
    constructor() {
        this.width = 50;
        this.height = 60;
        this.pencil = new Pencil();
    }
}
class Son {
    constructor() {
        this.age = 5;
        this.school = "some";
        this.bag = new Bag();
    }
}
class Page extends ViewV2 {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda, extraInfo) {
        super(parent, elmtId, extraInfo);
        this.son = new Son();
        this.renderTimes = 0;
        this.finalizeConstruction();
    }
    isRender(id) {
        console.info('id:' + id + 'renderTimes:' + this.renderTimes);
        this.renderTimes++;
        return 40;
    }
    initialRender() {
        PUV2ViewBase.contextStack && PUV2ViewBase.contextStack.push(this);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('pencil length' + this.son.bag.pencil.length);
            Text.fontSize(this.isRender(1));
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel("change length");
            Button.onClick(() => {
                // 点击更改length值，UINode（1）会刷新
                this.son.bag.pencil.length += 100;
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel("assign Son");
            Button.onClick(() => {
                // 由于变量son非状态变量，因此无法刷新UINode（1）
                this.son = new Son();
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
        return "Page";
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new Page(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`;
