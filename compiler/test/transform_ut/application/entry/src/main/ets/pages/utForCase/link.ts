/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

exports.source =
`
class GreenButtonState {
  width: number = 0;

  constructor(width: number) {
    this.width = width;
  }
}

@Component
struct GreenButton {
  @Link greenButtonState: GreenButtonState;

  build() {
    Button('Green Button')
      .width(this.greenButtonState.width)
      .height(40)
      .backgroundColor('#64bb5c')
      .fontColor('#FFFFFF')
      .onClick(() => {
        if (this.greenButtonState.width < 700) {
          // 更新class的属性，变化可以被观察到同步回父组件
          this.greenButtonState.width += 60;
        } else {
          // 更新class，变化可以被观察到同步回父组件
          this.greenButtonState = new GreenButtonState(180);
        }
      })
  }
}

@Component
struct YellowButton {
  @Link yellowButtonState: number;

  build() {
    Button('Yellow Button')
      .width(this.yellowButtonState)
      .height(40)
      .backgroundColor('#f7ce00')
      .fontColor('#FFFFFF')
      .onClick(() => {
        // 子组件的简单类型可以同步回父组件
        this.yellowButtonState += 40.0;
      })
  }
}

@Entry
@Component
struct ShufflingContainer {
  @State greenButtonState: GreenButtonState = new GreenButtonState(180);
  @State yellowButtonProp: number = 180;

  build() {
    Column() {
      Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center }) {
        // 简单类型从父组件@State向子组件@Link数据同步
        Button('Parent View: Set yellowButton')
          .width(this.yellowButtonProp)
          .height(40)
          .margin(12)
          .fontColor('#FFFFFF')
          .onClick(() => {
            this.yellowButtonProp = (this.yellowButtonProp < 700) ? this.yellowButtonProp + 40 : 100;
          })
        // class类型从父组件@State向子组件@Link数据同步
        Button('Parent View: Set GreenButton')
          .width(this.greenButtonState.width)
          .height(40)
          .margin(12)
          .fontColor('#FFFFFF')
          .onClick(() => {
            this.greenButtonState.width = (this.greenButtonState.width < 700) ? this.greenButtonState.width + 100 : 100;
          })
        // class类型初始化@Link
        GreenButton({ greenButtonState: this.greenButtonState }).margin(12)
        // 简单类型初始化@Link
        YellowButton({ yellowButtonState: this.yellowButtonProp }).margin(12)
      }
    }
  }
}
`;

exports.expectResult =
`
if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface ShufflingContainer_Params {
    greenButtonState?: GreenButtonState;
    yellowButtonProp?: number;
}
interface YellowButton_Params {
    yellowButtonState?: number;
}
interface GreenButton_Params {
    greenButtonState?: GreenButtonState;
}
class GreenButtonState {
    width: number = 0;
    constructor(width: number) {
        this.width = width;
    }
}
class GreenButton extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__greenButtonState = new SynchedPropertyObjectTwoWayPU(params.greenButtonState, this, "greenButtonState");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: GreenButton_Params) {
    }
    updateStateVars(params: GreenButton_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__greenButtonState.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__greenButtonState.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __greenButtonState: SynchedPropertySimpleOneWayPU<GreenButtonState>;
    get greenButtonState() {
        return this.__greenButtonState.get();
    }
    set greenButtonState(newValue: GreenButtonState) {
        this.__greenButtonState.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('Green Button');
            Button.width(this.greenButtonState.width);
            Button.height(40);
            Button.backgroundColor('#64bb5c');
            Button.fontColor('#FFFFFF');
            Button.onClick(() => {
                if (this.greenButtonState.width < 700) {
                    // 更新class的属性，变化可以被观察到同步回父组件
                    this.greenButtonState.width += 60;
                }
                else {
                    // 更新class，变化可以被观察到同步回父组件
                    this.greenButtonState = new GreenButtonState(180);
                }
            });
        }, Button);
        Button.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
class YellowButton extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__yellowButtonState = new SynchedPropertySimpleTwoWayPU(params.yellowButtonState, this, "yellowButtonState");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: YellowButton_Params) {
    }
    updateStateVars(params: YellowButton_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__yellowButtonState.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__yellowButtonState.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __yellowButtonState: SynchedPropertySimpleTwoWayPU<number>;
    get yellowButtonState() {
        return this.__yellowButtonState.get();
    }
    set yellowButtonState(newValue: number) {
        this.__yellowButtonState.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('Yellow Button');
            Button.width(this.yellowButtonState);
            Button.height(40);
            Button.backgroundColor('#f7ce00');
            Button.fontColor('#FFFFFF');
            Button.onClick(() => {
                // 子组件的简单类型可以同步回父组件
                this.yellowButtonState += 40.0;
            });
        }, Button);
        Button.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
class ShufflingContainer extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__greenButtonState = new ObservedPropertyObjectPU(new GreenButtonState(180), this, "greenButtonState");
        this.__yellowButtonProp = new ObservedPropertySimplePU(180, this, "yellowButtonProp");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: ShufflingContainer_Params) {
        if (params.greenButtonState !== undefined) {
            this.greenButtonState = params.greenButtonState;
        }
        if (params.yellowButtonProp !== undefined) {
            this.yellowButtonProp = params.yellowButtonProp;
        }
    }
    updateStateVars(params: ShufflingContainer_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__greenButtonState.purgeDependencyOnElmtId(rmElmtId);
        this.__yellowButtonProp.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__greenButtonState.aboutToBeDeleted();
        this.__yellowButtonProp.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __greenButtonState: ObservedPropertyObjectPU<GreenButtonState>;
    get greenButtonState() {
        return this.__greenButtonState.get();
    }
    set greenButtonState(newValue: GreenButtonState) {
        this.__greenButtonState.set(newValue);
    }
    private __yellowButtonProp: ObservedPropertySimplePU<number>;
    get yellowButtonProp() {
        return this.__yellowButtonProp.get();
    }
    set yellowButtonProp(newValue: number) {
        this.__yellowButtonProp.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Flex.create({ direction: FlexDirection.Column, alignItems: ItemAlign.Center });
        }, Flex);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // 简单类型从父组件@State向子组件@Link数据同步
            Button.createWithLabel('Parent View: Set yellowButton');
            // 简单类型从父组件@State向子组件@Link数据同步
            Button.width(this.yellowButtonProp);
            // 简单类型从父组件@State向子组件@Link数据同步
            Button.height(40);
            // 简单类型从父组件@State向子组件@Link数据同步
            Button.margin(12);
            // 简单类型从父组件@State向子组件@Link数据同步
            Button.fontColor('#FFFFFF');
            // 简单类型从父组件@State向子组件@Link数据同步
            Button.onClick(() => {
                this.yellowButtonProp = (this.yellowButtonProp < 700) ? this.yellowButtonProp + 40 : 100;
            });
        }, Button);
        // 简单类型从父组件@State向子组件@Link数据同步
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            // class类型从父组件@State向子组件@Link数据同步
            Button.createWithLabel('Parent View: Set GreenButton');
            // class类型从父组件@State向子组件@Link数据同步
            Button.width(this.greenButtonState.width);
            // class类型从父组件@State向子组件@Link数据同步
            Button.height(40);
            // class类型从父组件@State向子组件@Link数据同步
            Button.margin(12);
            // class类型从父组件@State向子组件@Link数据同步
            Button.fontColor('#FFFFFF');
            // class类型从父组件@State向子组件@Link数据同步
            Button.onClick(() => {
                this.greenButtonState.width = (this.greenButtonState.width < 700) ? this.greenButtonState.width + 100 : 100;
            });
        }, Button);
        // class类型从父组件@State向子组件@Link数据同步
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            __Common__.create();
            __Common__.margin(12);
        }, __Common__);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new 
                    // class类型初始化@Link
                    GreenButton(this, { greenButtonState: this.__greenButtonState }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 76, col: 9 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            greenButtonState: this.greenButtonState
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                }
            }, { name: "GreenButton" });
        }
        __Common__.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            __Common__.create();
            __Common__.margin(12);
        }, __Common__);
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new 
                    // 简单类型初始化@Link
                    YellowButton(this, { yellowButtonState: this.__yellowButtonProp }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/Index.ets", line: 78, col: 9 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            yellowButtonState: this.yellowButtonProp
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                }
            }, { name: "YellowButton" });
        }
        __Common__.pop();
        Flex.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "ShufflingContainer";
    }
}
registerNamedRoute(() => new ShufflingContainer(undefined, {}), "", { bundleName: "com.example.myapplication", moduleName: "entry", pagePath: "pages/Index", pageFullPath: "entry/src/main/ets/pages/Index", integratedHsp: "false", moduleType: "followWithHap" });
`;
