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
@Entry
@Component
struct Page1struct02 {
  @Builder
  buildTest() {}

  build() {
    Column() {
      Childstruct02({
        state_value: "hh",
        prop_value: "hh",
        provide_value: "hh",
        builder_value: this.buildTest,
        regular_value: "hh"
      })
    }
    .width('100%')
  }
}

@Component
struct Childstruct02 {
  @State private state_value: string = "hello"
  @Prop private prop_value: string = "hello"
  @Provide private provide_value: string = "hello"
  @BuilderParam private builder_value: () => void = this.buildTest;
  private regular_value: string = "hello"

  @Builder
  buildTest() {}

  build() {}
}
@Entry
@Component
struct AccessRestrictions {
  @Builder buildTest() {
    Text("Parent builder")
  }
  build() {
    Column() {
      ComponentsChild({state_value: "Hello", prop_value: "Hello", provide_value: "Hello", builder_value: this.buildTest, regular_value: "Hello"})
    }
    .width('100%')
  }
}

@Component
struct ComponentsChild {
  @State private state_value: string = "Hello";
  @Prop private prop_value: string = "Hello";
  @Provide private provide_value: string = "Hello";
  @BuilderParam private builder_value: () => void = this.buildTest;
  private regular_value: string = "Hello";
  @Builder buildTest() {
    Text("Child builder")
  }
  build() {
    Column() {
      Text("Hello")
        .fontSize(50)
        .fontWeight(FontWeight.Bold)
    }
  }
}
