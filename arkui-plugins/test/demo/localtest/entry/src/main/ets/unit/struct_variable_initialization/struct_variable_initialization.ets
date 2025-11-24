/*
 * Copyright (C) 2025 Huawei Device Co., Ltd.
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

import { Entry, Component, Row, RowSplit, Column, TextAlign, Button, Text, Stack, Scroll, Scroller, Blank,
 ListItem, Alignment, Color, ScrollDirection, EdgeEffect, Edge, BarState, Grid, GridLayoutOptions, GridItem,
 ReusableV2, ComponentV2, TabContent, Repeat, RepeatItem, ForEach, Tabs, Builder, BuilderParam, ClickEvent,
 Flex } from '@ohos.arkui.component'

import { Prop, State, Local, Event, Provide, Provider, Consumer, Param, LocalStorageProp, LocalStorageLink,
 StorageProp, StorageLink, Link, Consume, Once, Monitor, IMonitor, StoragePropRef, ObjectLink, Observed, ObservedV2,
 Trace } from "@ohos.arkui.stateManagement";

// demo-1
class GreenButtonStatelinktest02 {
  width: number = 0;

  constructor(width: number) {
    this.width = width;
  }
}

@Component
struct GreenButtonlinktest02 {
  @Link greenButtonState: GreenButtonStatelinktest02= new GreenButtonStatelinktest02(180);

  build() {
    Button('Green Button')
      .width(this.greenButtonState.width)
      .height(40)
      .backgroundColor('#64bb5c')
      .fontColor('#FFFFFF，90%')
      .onClick(() => {
        if (this.greenButtonState.width < 700) {
          // 更新class的属性，变化可以被观察到同步回父组件
          this.greenButtonState.width += 60;
        } else {
          // 更新class，变化可以被观察到同步回父组件
          this.greenButtonState = new GreenButtonStatelinktest02(180);
        }
      })
  }
}

@Component
struct YellowButtonlinktest02 {
  @Link yellowButtonState: number;

  build() {
    Button('Yellow Button')
      .width(this.yellowButtonState)
      .height(40)
      .backgroundColor('#f7ce00')
      .fontColor('#FFFFFF，90%')
      .onClick(() => {
        // 子组件的简单类型可以同步回父组件
        this.yellowButtonState += 40.0;
      })
  }
}

@Entry
@Component
struct ShufflingContainerlinktest02 {
  @State greenButtonState: GreenButtonStatelinktest02 = new GreenButtonStatelinktest02(180);
  @State yellowButtonProp: number = 180;

  build() {
    Column() {
      Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center }) {
        // 简单类型从父组件@State向子组件@Link数据同步
        Button('Parent View: Set yellowButton')
          .width(312)
          .height(40)
          .margin(12)
          .fontColor('#FFFFFF，90%')
          .onClick(() => {
            this.yellowButtonProp = (this.yellowButtonProp < 700) ? this.yellowButtonProp + 40 : 100;
          })
        // class类型从父组件@State向子组件@Link数据同步
        Button('Parent View: Set GreenButton')
          .width(312)
          .height(40)
          .margin(12)
          .fontColor('#FFFFFF，90%')
          .onClick(() => {
            this.greenButtonState.width = (this.greenButtonState.width < 700) ? this.greenButtonState.width + 100 : 100;
          })
        // class类型初始化@Link
        GreenButtonlinktest02({ greenButtonState: $greenButtonState }).margin(12)
        // 简单类型初始化@Link
        YellowButtonlinktest02({ yellowButtonState: $yellowButtonProp }).margin(12)
      }
    }
  }
}

// demo-2
@Component
struct TitleComp {
  @Link title: string
  build() {
    Text(this.title)
  }
}
@Entry
@Component
struct LinkComponent{
  // @State value: string = 'hello world'
  value2: string = 'hello world2'
  @Builder
  TitleCompView() {
    //  ERROR: The regular property 'this.value2' cannot be assigned to the @Link property 'title'.
    TitleComp({title: this.value2});
  }
  build() {
    Flex() {
      this.TitleCompView()
    }
  }
}

// demo-3
class GreenButtonState03 {
  width: number = 0;

  constructor(width: number) {
    this.width = width;
  }
}

@Component
struct GreenButton03 {
  @Link greenButtonState: GreenButtonState03=new GreenButtonState03(180);

  build() {
    Button('Green Button')
      .width(this.greenButtonState.width)
      .height(40)
      .backgroundColor('#64bb5c')
      .fontColor('#FFFFFF，90%')
      .onClick(() => {
        if (this.greenButtonState.width < 700) {
          // 更新class的属性，变化可以被观察到同步回父组件
          this.greenButtonState.width += 60;
        } else {
          // 更新class，变化可以被观察到同步回父组件
          this.greenButtonState = new GreenButtonState03(180);
        }
      })
  }
}

@Component
struct YellowButton03 {
  @Link yellowButtonState: number;

  build() {
    Button('Yellow Button')
      .width(this.yellowButtonState)
      .height(40)
      .backgroundColor('#f7ce00')
      .fontColor('#FFFFFF，90%')
      .onClick(() => {
        // 子组件的简单类型可以同步回父组件
        this.yellowButtonState += 40.0;
      })
  }
}

@Entry
@Component
struct ShufflingContainer03 {
  @State greenButtonState: GreenButtonState03 = new GreenButtonState03(180);
  @State yellowButtonProp: number = 180;

  build() {
    Column() {
      Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center }) {
        // 简单类型从父组件@State向子组件@Link数据同步
        Button('Parent View: Set yellowButton')
          .width(312)
          .height(40)
          .margin(12)
          .fontColor('#FFFFFF，90%')
          .onClick(() => {
            this.yellowButtonProp = (this.yellowButtonProp < 700) ? this.yellowButtonProp + 40 : 100;
          })
        // class类型从父组件@State向子组件@Link数据同步
        Button('Parent View: Set GreenButton')
          .width(312)
          .height(40)
          .margin(12)
          .fontColor('#FFFFFF，90%')
          .onClick(() => {
            this.greenButtonState.width = (this.greenButtonState.width < 700) ? this.greenButtonState.width + 100 : 100;
          })
        // class类型初始化@Link
        GreenButton03({ greenButtonState: $greenButtonState }).margin(12)
        // 简单类型初始化@Link
        YellowButton03({ yellowButtonState: $yellowButtonProp }).margin(12)
      }
    }
  }
}

// demo-4
@Observed
class Source {
  public source: number;

  constructor(source: number) {
    this.source = source;
  }
}

@Observed
class Data {
  public data: number;

  constructor(data: number) {
    this.data = data;
  }
}

@Entry
@Component
struct Parent {
  @State count: Source | Data | undefined = new Source(10);

  build() {
    Column() {
      Child({ count: this.count })

      Button('change count property')
        .margin(10)
        .onClick(() => {
          // 判断count的类型，做属性的更新
          if (this.count instanceof Source) {
            this.count.source += 1;
          } else if (this.count instanceof Data) {
            this.count.data += 1;
          } else {
            console.info('count is undefined, cannot change property');
          }
        })

      Button('change count to Source')
        .margin(10)
        .onClick(() => {
          // 赋值为Source的实例
          this.count = new Source(100);
        })

      Button('change count to Data')
        .margin(10)
        .onClick(() => {
          // 赋值为Data的实例
          this.count = new Data(100);
        })

      Button('change count to undefined')
        .margin(10)
        .onClick(() => {
          // 赋值为undefined
          this.count = undefined;
        })
    }.width('100%')
  }
}

@Component
struct Child {
  @ObjectLink count: Source | Data | undefined=undefined;

  build() {
    Column() {
      Text(`count is instanceof ${this.count instanceof Source ? 'Source' :
        this.count instanceof Data ? 'Data' : 'undefined'}`)
        .fontSize(30)
        .margin(10)

      Text(`count's property is  ${this.count instanceof Source ? this.count.source : this.count?.data}`).fontSize(15)

    }.width('100%')
  }
}

// demo-5
@Observed
class ClassAobject03 {
  public a: number;

  constructor(a: number) {
    this.a = a;
  }
}

@Observed
class ClassBobject03 {
  public b: number;

  constructor(b: number) {
    this.b = b;
  }
}

@Entry
@Component
struct Page2object03 {
  @State count: ClassAobject03 | ClassBobject03 | undefined = new ClassAobject03(10)

  build() {
    Column() {
      Childobject03({ count: this.count })

      Button('change count property')
        .onClick(() => {
          // 判断count的类型，做属性的更新
          if (this.count instanceof ClassAobject03) {
            this.count.a += 1
          } else if (this.count instanceof ClassBobject03) {
            this.count.b += 1
          } else {
            console.info('count is undefined, cannot change property')
          }
        })

      Button('change count to ClassA')
        .onClick(() => {
          // 赋值为ClassA的实例
          this.count = new ClassAobject03(100)
        })

      Button('change count to ClassB')
        .onClick(() => {
          // 赋值为ClassA的实例
          this.count = new ClassBobject03(100)
        })

      Button('change count to undefined')
        .onClick(() => {
          // 赋值为undefined
          this.count = undefined
        })
    }.width('100%')
  }
}

@Component
struct Childobject03 {
  @ObjectLink count: ClassAobject03 | ClassBobject03 | undefined=undefined

  build() {
    Column() {
      Text(`count is instanceof ${this.count instanceof ClassAobject03 ? 'ClassA' : this.count instanceof ClassBobject03 ? 'ClassB' : 'undefined'}`)
        .fontSize(30)

      Text(`count's property is  ${this.count instanceof ClassAobject03 ? this.count.a : this.count?.b}`).fontSize(15)

    }.width('100%')
  }
}