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
struct TransitionExample {
  @State btnW: number = 50
  @State btnH: number = 50
  @State btn1: boolean = false
  @State show: string = "show"
  build() {
    Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center,}) {
      Button(this.show)
        .onClick(() => {
          animateTo({ duration: 1000 }, () => {
            this.btn1 = !this.btn1
            if(this.btn1){
              this.show = "hide"
            }else{
              this.show = "show"
            }
          })
        })
      if (this.btn1) {
        Button()
          .width("80%").height(30)
          .transition({ type: TransitionType.Insert, scale: {x:0,y:1.0}})
          .transition({ type: TransitionType.Delete, scale: { x: 1.0, y: 0.0 }})
      }
      Button('animation')
          .width(this.btnW).height(this.btnH)
          .onClick(() => {
            this.btnW += 50
          })
          .animation({
            duration: 1000, // 动画时长
            curve: Curve.EaseOut, // 动画曲线
            delay: 200, // 动画延迟
            iterations: 1, // 播放次数
            playMode: PlayMode.Normal // 动画模式
          })
    }.height(400).width("100%").padding({top:100})
  }
}
`

exports.expectResult =
`"use strict";
class TransitionExample extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1) {
        super(parent, __localStorage, elmtId);
        this.__btnW = new ObservedPropertySimplePU(50, this, "btnW");
        this.__btnH = new ObservedPropertySimplePU(50, this, "btnH");
        this.__btn1 = new ObservedPropertySimplePU(false, this, "btn1");
        this.__show = new ObservedPropertySimplePU("show", this, "show");
        this.setInitiallyProvidedValue(params);
    }
    setInitiallyProvidedValue(params) {
        if (params.btnW !== undefined) {
            this.btnW = params.btnW;
        }
        if (params.btnH !== undefined) {
            this.btnH = params.btnH;
        }
        if (params.btn1 !== undefined) {
            this.btn1 = params.btn1;
        }
        if (params.show !== undefined) {
            this.show = params.show;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__btnW.purgeDependencyOnElmtId(rmElmtId);
        this.__btnH.purgeDependencyOnElmtId(rmElmtId);
        this.__btn1.purgeDependencyOnElmtId(rmElmtId);
        this.__show.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__btnW.aboutToBeDeleted();
        this.__btnH.aboutToBeDeleted();
        this.__btn1.aboutToBeDeleted();
        this.__show.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get btnW() {
        return this.__btnW.get();
    }
    set btnW(newValue) {
        this.__btnW.set(newValue);
    }
    get btnH() {
        return this.__btnH.get();
    }
    set btnH(newValue) {
        this.__btnH.set(newValue);
    }
    get btn1() {
        return this.__btn1.get();
    }
    set btn1(newValue) {
        this.__btn1.set(newValue);
    }
    get show() {
        return this.__show.get();
    }
    set show(newValue) {
        this.__show.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Flex.create({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, });
            Flex.height(400);
            Flex.width("100%");
            Flex.padding({ top: 100 });
            if (!isInitialRender) {
                Flex.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Button.createWithLabel(this.show);
            Button.onClick(() => {
                Context.animateTo({ duration: 1000 }, () => {
                    this.btn1 = !this.btn1;
                    if (this.btn1) {
                        this.show = "hide";
                    }
                    else {
                        this.show = "show";
                    }
                });
            });
            if (!isInitialRender) {
                Button.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        Button.pop();
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            If.create();
            if (this.btn1) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation((elmtId, isInitialRender) => {
                        ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                        Button.createWithLabel();
                        Button.width("80%");
                        Button.height(30);
                        Button.transition({ type: TransitionType.Insert, scale: { x: 0, y: 1.0 } });
                        Button.transition({ type: TransitionType.Delete, scale: { x: 1.0, y: 0.0 } });
                        if (!isInitialRender) {
                            Button.pop();
                        }
                        ViewStackProcessor.StopGetAccessRecording();
                    });
                    Button.pop();
                });
            }
            else {
                If.branchId(1);
            }
            if (!isInitialRender) {
                If.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        If.pop();
        this.observeComponentCreation((elmtId, isInitialRender) => {
            ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
            Button.createWithLabel('animation');
            Context.animation({
                duration: 1000,
                curve: Curve.EaseOut,
                delay: 200,
                iterations: 1,
                playMode: PlayMode.Normal // 动画模式
            });
            Button.width(this.btnW);
            Button.height(this.btnH);
            Button.onClick(() => {
                this.btnW += 50;
            });
            Context.animation(null);
            if (!isInitialRender) {
                Button.pop();
            }
            ViewStackProcessor.StopGetAccessRecording();
        });
        Button.pop();
        Flex.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new TransitionExample(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`
