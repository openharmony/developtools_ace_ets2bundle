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
 @ComponentV2
 struct CompAonce {
   @Local @Once Localonce: string = ''; // 错误用法，@Once不能与@Local一起使用
   @Event @Once Eventonce: string = ''; // 错误用法，@Once不能与@Local一起使用

   build() {
     Column() {
       Text(`Localonce: ${this.Localonce}`)
       Text(`Eventonce: ${this.Eventonce}`)
     }
   }
 }
 @Entry
 @ComponentV2
 struct CompBonce {
   @Local message: string = "Hello World";
   build() {
     Column() {
       Text(`Parent message: ${this.message}`)
       Button("change message")
         .onClick(() => {
           this.message = "Hello Tomorrow";
         })
       CompAonce({
         Eventonce:this.message
       })
     }
   }
 }

 // demo-2
 class testcase{
   @Once cc:string=''
   @Param @Once dd:string='' ;
 }
 @Entry
 @ComponentV2
 struct TestComponent9 {

   build() {}

 }
