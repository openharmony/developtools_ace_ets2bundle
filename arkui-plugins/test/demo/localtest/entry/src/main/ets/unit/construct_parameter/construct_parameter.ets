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
 StorageProp, StorageLink, Link, Consume, Once, Monitor, IMonitor, StoragePropRef, ObjectLink, Observed
 } from "@ohos.arkui.stateManagement";

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
@Component
struct TitleComp {
   title: string=''
  build() {
    Text(this.title)
    // Text(this.title1)
  }
}
@Component
struct TitleComp1 {
  title1: string=''
  build() {
    Text(this.title1)
  }
}
@Entry
@Component
struct LinkComponent{
  @Provide value: string = 'hello world'
  @Consume value2: string
  @Builder
  TitleCompView() {
    //  ERROR: The regular property 'this.value2' cannot be assigned to the @Link property 'title'.
    TitleComp({title: this.value2});
    TitleComp1({title1: this.value});
  }
  build() {
    Flex() {
      this.TitleCompView()
    }
  }
}

// demo-3
@Component
struct TitleComp {
 title: string=''
  build() {
    Text(this.title)
  }
}

@Entry
@Component
struct LinkComponent{
  @LocalStorageLink('local_storage_link_value')  value: string = 'hello world'
 @StoragePropRef('local_storage_prop_value') value2: string = 'hello world2'
  @Builder
  TitleCompView() {
    //  ERROR: The regular property 'this.value2' cannot be assigned to the @Link property 'title'.
    TitleComp({title: this.value2});
    //  正确写法
    // TitleComp({title: this.value});
  }
  build() {
    Flex() {
      this.TitleCompView()
    }
  }
}