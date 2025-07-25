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

import { Component, Entry, Column, Button, DatePicker, ClickEvent } from "@ohos.arkui.component"
import { Link, State } from "@ohos.arkui.stateManagement"

@Component
struct DateComponent {
  @Link selectedDate: Date;

  build() {
    Column() {
      Button('child increase the year by 1')
      .onClick((e: ClickEvent) => {
        this.selectedDate.setFullYear(this.selectedDate.getFullYear() + 1);
      })
      Button('child update the new date')
        .margin(10)
        .onClick((e: ClickEvent) => {
          this.selectedDate = new Date('2023-09-09');
        })
      DatePicker({
        start: new Date('1970-1-1'),
        end: new Date('2100-1-1'),
        selected: this.selectedDate
      })
    }

  }
}

@Entry
@Component
struct ParentComponent {
  @State parentSelectedDate: Date = new Date('2021-08-08');

  build() {
    Column() {
      Button('parent increase the month by 1')
        .margin(10)
        .onClick((e: ClickEvent) => {
          this.parentSelectedDate.setMonth(this.parentSelectedDate.getMonth() + 1);
        })
      Button('parent update the new date')
        .margin(10)
        .onClick((e: ClickEvent) => {
          this.parentSelectedDate = new Date('2023-07-07');
        })
      DatePicker({
        start: new Date('1970-1-1'),
        end: new Date('2100-1-1'),
        selected: this.parentSelectedDate
      })

      DateComponent({ selectedDate:this.parentSelectedDate })
    }
  }
}