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
 StorageProp, StorageLink, Link, Consume, Once, Monitor, IMonitor, StoragePropRef 
 ObjectLink, Observed} from "@ohos.arkui.stateManagement";

// demo-1
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

// demo-2
@Observed
class Aobject01{
name :string='12'
}
@Component
struct TitleCompobject01 {
  @ObjectLink title: Aobject01
  build() {
    Text(this.title)
  }
}
@Entry
@Component
struct LinkComponentobject01{
  value: Aobject01 = new Aobject01;
  @Builder
  TitleCompView() {
    TitleCompobject01({title: this.value});
  }
  build() {
    Flex() {
      this.TitleCompView()
    }
  }
}