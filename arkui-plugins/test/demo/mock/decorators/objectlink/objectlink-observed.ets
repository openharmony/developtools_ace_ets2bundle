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

import { Component, Entry, Column, Button, ClickEvent } from "@ohos.arkui.component"
import { State, ObjectLink, Observed } from "@ohos.arkui.stateManagement"

@Observed
class DateClass {
  constructor(args: number | string) {}

  setDate(date: number): void {}

  getDate(): number {
    return 0;
  }
}

@Observed
class NewDate {
  public data: DateClass = new DateClass(11);

  constructor(data: DateClass) {
    this.data = data;
  }
}

@Component
struct Child {
  label: string = 'date';
  @ObjectLink data: DateClass;

  build() {
    Column() {
      Button(`child increase the day by 1`)
        .onClick((e: ClickEvent) => {
          this.data.setDate(this.data.getDate() + 1);
        })
    }
  }
}

@Entry
@Component
struct Parent {
  @State newData: NewDate = new NewDate(new DateClass('2023-1-1'));

  build() {
    Column() {
      Child({ label: 'date', data: this.newData.data })

      Button(`parent update the new date`)
        .onClick((e: ClickEvent) => {
          this.newData.data = new DateClass('2023-07-07');
        })
      Button(`ViewB: this.newData = new NewDate(new DateClass('2023-08-20'))`)
        .onClick((e: ClickEvent) => {
          this.newData = new NewDate(new DateClass('2023-08-20'));
        })
    }
  }
}