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
 StorageProp, StorageLink, Link, Consume, Once, Monitor, IMonitor, StoragePropRef,
  ObjectLink, Observed } from "@ohos.arkui.stateManagement";

import { curves } from '@kit.ArkUI'

// demo-1
@Entry
@Component
struct ScrollExample {
  scroller: Scroller = new Scroller()
  private arr: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

  build() {
    Stack({ alignContent: Alignment.TopStart }) {
      Scroll(this.scroller) {
        Blank().color(Color.Yellow)
        ListItem() {
          Text('' )
            .width('100%')
            .height(100)
            .fontSize(16)
            .textAlign(TextAlign.Center)
            .borderRadius(10)
            .backgroundColor(0xFFFFFF)
        }
      }
      .scrollable(ScrollDirection.Vertical) // 滚动方向纵向
      .scrollBar(BarState.On) // 滚动条常驻显示
      .scrollBarColor(Color.Gray) // 滚动条颜色
      .scrollBarWidth(10) // 滚动条宽度
      .friction(0.6)
      .edgeEffect(EdgeEffect.None)
      .onWillScroll((xOffset: number, yOffset: number, scrollState: ScrollState) => {
        console.info(xOffset + ' ' + yOffset)
      })
      .onScrollEdge((side: Edge) => {
        console.info('To the edge')
      })
      .onScrollStop(() => {
        console.info('Scroll Stop')
      })

      Button('scroll 150')
        .height('5%')
        .onClick(() => { // 点击后下滑指定距离150.0vp
          this.scroller.scrollBy(0, 150)
        })
        .margin({ top: 10, left: 20 })
      Button('scroll 100')
        .height('5%')
        .onClick(() => { // 点击后滑动到指定位置，即下滑100.0vp的距离
          const yOffset: number = this.scroller.currentOffset().yOffset;
          this.scroller.scrollTo({ xOffset: 0, yOffset: yOffset + 100 })
        })
        .margin({ top: 60, left: 20 })
      Button('scroll 100')
        .height('5%')
        .onClick(() => { // 点击后滑动到指定位置，即下滑100.0vp的距离，滑动过程配置有动画
          let curve = curves.interpolatingSpring(10, 1, 228, 30) //创建一个阶梯曲线
          const yOffset: number = this.scroller.currentOffset().yOffset;
          this.scroller.scrollTo({ xOffset: 0, yOffset: yOffset + 100, animation: { duration: 1000, curve: curve } })
        })
        .margin({ top: 110, left: 20 })
      Button('back top')
        .height('5%')
        .onClick(() => { // 点击后回到顶部
          this.scroller.scrollEdge(Edge.Top)
        })
        .margin({ top: 160, left: 20 })
      Button('next page')
        .height('5%')
        .onClick(() => { // 点击后滑到下一页
          this.scroller.scrollPage({ next: true ,animation: true })
        })
        .margin({ top: 210, left: 20 })
    }.width('100%').height('100%').backgroundColor(0xDCDCDC)
  }
}

// demo-2
@Entry
@Component
struct ScrollExampletoolchian09 {
  scroller: Scroller = new Scroller()
  private arr: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

  build() {
    Stack({ alignContent: Alignment.TopStart }) {
      Row(){
       Scroll(){
          Blank().color(Color.Yellow)
        }.width('100%').height('100%')

         ListItem() {
           Text('' )
             .width('100%')
             .height(100)
             .fontSize(16)
             .textAlign(TextAlign.Center)
             .borderRadius(10)
            .backgroundColor(0xFFFFFF)
        }
      }.width('100%').height('100%')
    }.width('100%').height('100%')
    .backgroundColor(Color.Green)
  }
}

// demo-3
@Entry
@Component
struct ScrollExampletoolchian09 {
  scroller: Scroller = new Scroller()
  private arr: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

  build() {
    Stack({ alignContent: Alignment.TopStart }) {
      RowSplit(){
       Scroll(){
          Blank().color(Color.Yellow)
        }.width('100%').height('100%')

         ListItem() {
           Text('' )
             .width('100%')
             .height(100)
             .fontSize(16)
             .textAlign(TextAlign.Center)
             .borderRadius(10)
             .backgroundColor(0xFFFFFF)
         }
      }.width('100%').height('100%')
    }.width('100%').height('100%')
    .backgroundColor(Color.Green)
  }
}