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
 StorageProp, StorageLink, Link, Consume, Once, Monitor, IMonitor, StoragePropRef } from "@ohos.arkui.stateManagement";

// demo-1
@ComponentV2
@Component
struct hunyong {
  @Param name: string = 'hello, child'
  @Event name_event: () => void

  build() {
    Column() {
      Text(`Child: ${this.name}`)
    }
  }
}

@Entry
@ComponentV2
struct hunyongpar {
  @Local name: string = 'hello, parent'

  build() {
    Column() {
      Text(`Parent: ${this.name}`)
      hunyong()
    }
  }
}