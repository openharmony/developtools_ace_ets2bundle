/*
 * Copyright (c) 2023 Huawei Device Co., Ltd.
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
struct HomeComponent {
  @State state_value: string = "100%"
  @State value: number = 1
  build() {
    Column() {
      child({propvalue: this.value, linkvalue: this.value})
        .border({width: 3, color: Color.Red})
        .width(this.state_value)
      Text("aa")
        .width(this.state_value)
        .height(100)
    }
    .width(this.state_value)
    .height(100)
  }
}

@Reusable
@Component
struct child {
  @Prop propvalue: number;
  @Link linkvalue: number;
  @State state_value: number = 1;
  @State width_value: string = "100%"
  reguar_value: number = 50;
  controller: TabsController = new TabsController();
  @State heightValue: number = 100
  build() {
    Column() {
      AnimationTest()
        .border({width: 3, color: Color.Red})
        .height(this.heightValue)

      Text("hello")
        .width(this.propvalue)
        .fontSize(this.reguar_value)
        .height(100)
        .fontColor(Color.Red)
        .border({width: this.propvalue, color: Color.Red, radius: 100})
      Button() {
        Text("hhhhhhhhhhhhh")
          .fontSize(this.state_value)
          .width(100)
      }
      .border({width: this.reguar_value, color: Color.Red, radius: 100})
      
      ListItem('true') {
        Text('ListItem')
          .width(this.width_value)
          .height(100)
      }
      .width(this.width_value)
      .height(100)

      ListItem('true')
        .width(this.width_value)
        .height(100)

      Tabs({ barPosition: BarPosition.Start, index: 1, controller: this.controller}) {
        TabContent() {
          Flex() {
            Column() {
              Text('text1')
                .width(this.width_value)
                .height(100)
            }
            .width(this.width_value)
            .height(100)
          }
          .width(this.width_value)
          .height(100)
        }
        .tabBar("TabBar")
        .width(this.width_value)
        .height(100)
        TabContent() {
          Text('text2')
          .width(this.width_value)
          .height(100)
        }
        .tabBar("TabBar 2")
        .width(this.width_value)
        .height(100)
        TabContent()
          .width(this.width_value)
          .height(100)
      }
      .width(this.width_value)
      .height(100)
    }
  }
}

@Component
struct NormalComponent {
  @State width_value: string = "100%"
  build() {
    Column() {
      Text("hello")
        .width(this.width_value)
        .height(100)
    }
  }
}

@Reusable
@Component
struct AnimationTest {
  @State width_value: string = "100%"
  build() {
    Column() {
      Text("hello")
      .height(100)
      .width(this.width_value)
      .animation({duration: 300})
    }
  }
}`

exports.expectResult =
`"use strict";
class HomeComponent extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__state_value = new ObservedPropertySimplePU("100%", this, "state_value");
        this.__value = new ObservedPropertySimplePU(1, this, "value");
        this.setInitiallyProvidedValue(params);
    }
    setInitiallyProvidedValue(params) {
        if (params.state_value !== undefined) {
            this.state_value = params.state_value;
        }
        if (params.value !== undefined) {
            this.value = params.value;
        }
    }
    updateStateVars(params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__state_value.purgeDependencyOnElmtId(rmElmtId);
        this.__value.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__state_value.aboutToBeDeleted();
        this.__value.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    get state_value() {
        return this.__state_value.get();
    }
    set state_value(newValue) {
        this.__state_value.set(newValue);
    }
    get value() {
        return this.__value.get();
    }
    set value(newValue) {
        this.__value.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width(this.state_value);
            Column.height(100);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            __Common__.create();
            __Common__.border({ width: 3, color: Color.Red });
            __Common__.width(this.state_value);
        }, __Common__);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            __Recycle__.create();
        }, __Recycle__);
        {
            this.observeRecycleComponentCreation("child", (elmtId, isInitialRender, recycleNode = null) => {
                ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                if (isInitialRender) {
                    let paramsLambda = () => {
                        return {
                            propvalue: this.value,
                            linkvalue: this.value
                        };
                    };
                    if (recycleNode) {
                        recycleNode.paramsGenerator_ = paramsLambda;
                    }
                    ViewPU.createRecycle(recycleNode ? recycleNode : new child(this, { propvalue: this.value, linkvalue: this.__value }, undefined, elmtId, paramsLambda, { page: "recycle.ets", line: 9 }), recycleNode !== null, "child", () => {
                        if (recycleNode && typeof recycleNode.aboutToReuseInternal === "function") {
                            recycleNode.aboutToReuseInternal();
                        }
                        else {
                            if (recycleNode.aboutToReuse && typeof recycleNode.aboutToReuse === "function") {
                                recycleNode.aboutToReuse({ propvalue: this.value, linkvalue: this.value });
                            }
                            recycleNode.rerender();
                        }
                    });
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {
                        propvalue: this.value
                    });
                }
                ViewStackProcessor.StopGetAccessRecording();
            });
        }
        __Common__.pop();
        __Recycle__.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("aa");
            Text.width(this.state_value);
            Text.height(100);
        }, Text);
        Text.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
class child extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__propvalue = new SynchedPropertySimpleOneWayPU(params.propvalue, this, "propvalue");
        this.__linkvalue = new SynchedPropertySimpleTwoWayPU(params.linkvalue, this, "linkvalue");
        this.__state_value = new ObservedPropertySimplePU(1, this, "state_value");
        this.__width_value = new ObservedPropertySimplePU("100%", this, "width_value");
        this.reguar_value = 50;
        this.controller = new TabsController();
        this.__heightValue = new ObservedPropertySimplePU(100, this, "heightValue");
        this.setInitiallyProvidedValue(params);
    }
    setInitiallyProvidedValue(params) {
        if (params.state_value !== undefined) {
            this.state_value = params.state_value;
        }
        if (params.width_value !== undefined) {
            this.width_value = params.width_value;
        }
        if (params.reguar_value !== undefined) {
            this.reguar_value = params.reguar_value;
        }
        if (params.controller !== undefined) {
            this.controller = params.controller;
        }
        if (params.heightValue !== undefined) {
            this.heightValue = params.heightValue;
        }
    }
    updateStateVars(params) {
        this.__propvalue.reset(params.propvalue);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__propvalue.purgeDependencyOnElmtId(rmElmtId);
        this.__linkvalue.purgeDependencyOnElmtId(rmElmtId);
        this.__state_value.purgeDependencyOnElmtId(rmElmtId);
        this.__width_value.purgeDependencyOnElmtId(rmElmtId);
        this.__heightValue.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__propvalue.aboutToBeDeleted();
        this.__linkvalue.aboutToBeDeleted();
        this.__state_value.aboutToBeDeleted();
        this.__width_value.aboutToBeDeleted();
        this.__heightValue.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    updateRecycleElmtId(oldElmtId, newElmtId) {
        this.__propvalue.updateElmtId(oldElmtId, newElmtId);
        this.__linkvalue.updateElmtId(oldElmtId, newElmtId);
        this.__state_value.updateElmtId(oldElmtId, newElmtId);
        this.__width_value.updateElmtId(oldElmtId, newElmtId);
        this.__heightValue.updateElmtId(oldElmtId, newElmtId);
    }
    get propvalue() {
        return this.__propvalue.get();
    }
    set propvalue(newValue) {
        this.__propvalue.set(newValue);
    }
    get linkvalue() {
        return this.__linkvalue.get();
    }
    set linkvalue(newValue) {
        this.__linkvalue.set(newValue);
    }
    get state_value() {
        return this.__state_value.get();
    }
    set state_value(newValue) {
        this.__state_value.set(newValue);
    }
    get width_value() {
        return this.__width_value.get();
    }
    set width_value(newValue) {
        this.__width_value.set(newValue);
    }
    get heightValue() {
        return this.__heightValue.get();
    }
    set heightValue(newValue) {
        this.__heightValue.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            __Common__.create();
            __Common__.border({ width: 3, color: Color.Red });
            __Common__.height(this.heightValue);
        }, __Common__);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            __Recycle__.create();
        }, __Recycle__);
        {
            this.observeRecycleComponentCreation("AnimationTest", (elmtId, isInitialRender, recycleNode = null) => {
                ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                if (isInitialRender) {
                    let paramsLambda = () => {
                        return {};
                    };
                    if (recycleNode) {
                        recycleNode.paramsGenerator_ = paramsLambda;
                    }
                    ViewPU.createRecycle(recycleNode ? recycleNode : new AnimationTest(this, {}, undefined, elmtId, paramsLambda, { page: "recycle.ets", line: 33 }), recycleNode !== null, "AnimationTest", () => {
                        if (recycleNode && typeof recycleNode.aboutToReuseInternal === "function") {
                            recycleNode.aboutToReuseInternal();
                        }
                        else {
                            if (recycleNode.aboutToReuse && typeof recycleNode.aboutToReuse === "function") {
                                recycleNode.aboutToReuse({});
                            }
                            recycleNode.rerender();
                        }
                    });
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                }
                ViewStackProcessor.StopGetAccessRecording();
            });
        }
        __Common__.pop();
        __Recycle__.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("hello");
            Text.width(this.propvalue);
            Text.fontColor(Color.Red);
            Text.border({ width: this.propvalue, color: Color.Red, radius: 100 });
            if (isInitialRender) {
                Text.fontSize(this.reguar_value);
                Text.height(100);
            }
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithChild();
            Button.border({ width: this.reguar_value, color: Color.Red, radius: 100 });
        }, Button);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("hhhhhhhhhhhhh");
            Text.fontSize(this.state_value);
            if (isInitialRender) {
                Text.width(100);
            }
        }, Text);
        Text.pop();
        Button.pop();
        {
            const itemCreation = (elmtId, isInitialRender) => {
                ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                itemCreation2(elmtId, isInitialRender);
                if (!isInitialRender) {
                    ListItem.pop();
                }
                ViewStackProcessor.StopGetAccessRecording();
            };
            const itemCreation2 = (elmtId, isInitialRender) => {
                ListItem.create(deepRenderFunction, true, 'true');
                ListItem.width(this.width_value);
                if (isInitialRender) {
                    ListItem.height(100);
                }
            };
            const deepRenderFunction = (elmtId, isInitialRender) => {
                itemCreation(elmtId, isInitialRender);
                this.updateFuncByElmtId.set(elmtId, itemCreation);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create('ListItem');
                    Text.width(this.width_value);
                    if (isInitialRender) {
                        Text.height(100);
                    }
                }, Text);
                Text.pop();
                ListItem.pop();
            };
            this.observeComponentCreation2(itemCreation2, ListItem);
            ListItem.pop();
        }
        {
            const itemCreation = (elmtId, isInitialRender) => {
                ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                itemCreation2(elmtId, isInitialRender);
                if (!isInitialRender) {
                    ListItem.pop();
                }
                ViewStackProcessor.StopGetAccessRecording();
            };
            const itemCreation2 = (elmtId, isInitialRender) => {
                ListItem.create(deepRenderFunction, true, 'true');
                ListItem.width(this.width_value);
                if (isInitialRender) {
                    ListItem.height(100);
                }
            };
            const deepRenderFunction = (elmtId, isInitialRender) => {
                itemCreation(elmtId, isInitialRender);
                this.updateFuncByElmtId.set(elmtId, itemCreation);
                ListItem.pop();
            };
            this.observeComponentCreation2(itemCreation2, ListItem);
            ListItem.pop();
        }
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Tabs.create({ barPosition: BarPosition.Start, index: 1, controller: this.controller });
            Tabs.width(this.width_value);
            if (isInitialRender) {
                Tabs.height(100);
            }
        }, Tabs);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Flex.create();
                    Flex.width(this.width_value);
                    if (isInitialRender) {
                        Flex.height(100);
                    }
                }, Flex);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Column.create();
                    Column.width(this.width_value);
                    if (isInitialRender) {
                        Column.height(100);
                    }
                }, Column);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create('text1');
                    Text.width(this.width_value);
                    if (isInitialRender) {
                        Text.height(100);
                    }
                }, Text);
                Text.pop();
                Column.pop();
                Flex.pop();
            });
            TabContent.width(this.width_value);
            if (isInitialRender) {
                TabContent.tabBar("TabBar");
                TabContent.height(100);
            }
        }, TabContent);
        TabContent.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create('text2');
                    Text.width(this.width_value);
                    if (isInitialRender) {
                        Text.height(100);
                    }
                }, Text);
                Text.pop();
            });
            TabContent.width(this.width_value);
            if (isInitialRender) {
                TabContent.tabBar("TabBar 2");
                TabContent.height(100);
            }
        }, TabContent);
        TabContent.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create();
            TabContent.width(this.width_value);
            if (isInitialRender) {
                TabContent.height(100);
            }
        }, TabContent);
        TabContent.pop();
        Tabs.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
class NormalComponent extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
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
    get width_value() {
        return this.__width_value.get();
    }
    set width_value(newValue) {
        this.__width_value.set(newValue);
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("hello");
            Text.width(this.width_value);
            Text.height(100);
        }, Text);
        Text.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
class AnimationTest extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
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
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create("hello");
            Context.animation({ duration: 300 });
            Text.height(100);
            Text.width(this.width_value);
            Context.animation(null);
        }, Text);
        Text.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
ViewStackProcessor.StartGetAccessRecordingFor(ViewStackProcessor.AllocateNewElmetIdForNextComponent());
loadDocument(new HomeComponent(undefined, {}));
ViewStackProcessor.StopGetAccessRecording();
`