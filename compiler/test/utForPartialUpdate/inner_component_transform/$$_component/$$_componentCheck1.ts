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
@Styles function globalFancy1() {
    .width(150)
    .height(100)
    .backgroundColor(Color.Pink)
  }
  
  @Entry
  @Component
  struct TabsExample {
    @State fontColor: string = '#182431'
    @State selectedFontColor: string = '#007DFF'
    @State currentIndex: number = 0
    private controller: TabsController = new TabsController()
  
    @Styles globalFancy() {
      .width(150)
      .height(100)
      .backgroundColor(Color.Pink)
    }
  
    @Builder tabBuilder(index: number, name: string) {
      Column() {
        Text(name)
          .fontColor(this.currentIndex === index ? this.selectedFontColor : this.fontColor)
          .fontSize(16)
          .fontWeight(this.currentIndex === index ? 500 : 400)
          .lineHeight(22)
          .margin({ top: 17, bottom: 7 })
        Divider()
          .strokeWidth(2)
          .color('#007DFF')
          .opacity(this.currentIndex === index ? 1 : 0)
      }.width('100%')
    }
  
    build() {
      Column() {
        Tabs({ barPosition: BarPosition.Start, index: $$this.currentIndex, controller: this.controller }) {
          TabContent() {
            Column()
              .width('100%')
              .height('100%')
              .backgroundColor('#00CB87')
              .globalFancy()
              .globalFancy1()
          }.tabBar(this.tabBuilder(0, 'green')).globalFancy().globalFancy1()
        }
        .vertical(false)
        .globalFancy()
        .globalFancy1()
        .barMode(BarMode.Fixed)
        .barWidth(360)
        .barHeight(56)
        .animationDuration(400)
        .onChange((index: number) => {
          this.currentIndex = index
        })
        .width(360)
        .height(296)
        .margin({ top: 52 })
        .backgroundColor('#F1F3F5')
      }.width('100%')
    }
  }
`

exports.expectResult =
`"use strict";
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
class TabsExample extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__fontColor = new ObservedPropertySimplePU('#182431', this, "fontColor");
        this.__selectedFontColor = new ObservedPropertySimplePU('#007DFF', this, "selectedFontColor");
        this.__currentIndex = new ObservedPropertySimplePU(0, this, "currentIndex");
        this.controller = new TabsController();
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params) {
        if (params.fontColor !== undefined) {
            this.fontColor = params.fontColor;
        }
        if (params.selectedFontColor !== undefined) {
            this.selectedFontColor = params.selectedFontColor;
        }
        if (params.currentIndex !== undefined) {
            this.currentIndex = params.currentIndex;
        }
        if (params.controller !== undefined) {
            this.controller = params.controller;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__fontColor.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedFontColor.purgeDependencyOnElmtId(rmElmtId);
        this.__currentIndex.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__fontColor.aboutToBeDeleted();
        this.__selectedFontColor.aboutToBeDeleted();
        this.__currentIndex.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get fontColor() {
        return this.__fontColor.get();
    }
    set fontColor(newValue) {
        this.__fontColor.set(newValue);
    }
    get selectedFontColor() {
        return this.__selectedFontColor.get();
    }
    set selectedFontColor(newValue) {
        this.__selectedFontColor.set(newValue);
    }
    get currentIndex() {
        return this.__currentIndex.get();
    }
    set currentIndex(newValue) {
        this.__currentIndex.set(newValue);
    }
    tabBuilder(index, name, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(name);
            Text.fontColor(this.currentIndex === index ? this.selectedFontColor : this.fontColor);
            Text.fontSize(16);
            Text.fontWeight(this.currentIndex === index ? 500 : 400);
            Text.lineHeight(22);
            Text.margin({ top: 17, bottom: 7 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Divider.create();
            Divider.strokeWidth(2);
            Divider.color('#007DFF');
            Divider.opacity(this.currentIndex === index ? 1 : 0);
        }, Divider);
        Column.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Tabs.create({ barPosition: BarPosition.Start, index: { value: this.currentIndex, changeEvent: newValue => { this.currentIndex = newValue; } }, controller: this.controller });
            Tabs.vertical(false);
            Tabs.width(150);
            Tabs.height(100);
            Tabs.backgroundColor(Color.Pink);
            Tabs.width(150);
            Tabs.height(100);
            Tabs.backgroundColor(Color.Pink);
            Tabs.barMode(BarMode.Fixed);
            Tabs.barWidth(360);
            Tabs.barHeight(56);
            Tabs.animationDuration(400);
            Tabs.onChange((index) => {
                this.currentIndex = index;
            });
            Tabs.width(360);
            Tabs.height(296);
            Tabs.margin({ top: 52 });
            Tabs.backgroundColor('#F1F3F5');
        }, Tabs);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Column.create();
                    Column.width('100%');
                    Column.height('100%');
                    Column.backgroundColor('#00CB87');
                    Column.width(150);
                    Column.height(100);
                    Column.backgroundColor(Color.Pink);
                    Column.width(150);
                    Column.height(100);
                    Column.backgroundColor(Color.Pink);
                }, Column);
                Column.pop();
            });
            TabContent.tabBar({ builder: () => {
                    this.tabBuilder.call(this, 0, 'green');
                } });
            TabContent.width(150);
            TabContent.height(100);
            TabContent.backgroundColor(Color.Pink);
            TabContent.width(150);
            TabContent.height(100);
            TabContent.backgroundColor(Color.Pink);
        }, TabContent);
        TabContent.pop();
        Tabs.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new TabsExample(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`