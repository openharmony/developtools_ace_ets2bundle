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

import { Component, Text, Button, Column, ClickEvent } from "@ohos.arkui.component"
import { Prop, State } from "@ohos.arkui.stateManagement"

@Component
struct CountDownComponent {
  @Prop count: number = 0;
  costOfOneAttempt: number = 1;

  build() {
    Column() {
      if (this.count > 0) {
        Text('You have'+ this.count + 'Nuggets left')
      } else {
        Text('Game over!')
      }
      Button('Try again').onClick((e: ClickEvent) => {
        this.count -= this.costOfOneAttempt;
      })
    }
  }
}

@Component
struct ParentComponent {
  @State countDownStartValue: number = 10;

  build() {
    Column() {
      Text('Grant' + this.countDownStartValue + 'nuggets to play.')
      Button('+1 - Nuggets in New Game').onClick((e: ClickEvent) => {
        this.countDownStartValue += 1;
      })
      Button('-1 - Nuggets in New Game').onClick((e: ClickEvent) => {
        this.countDownStartValue -= 1;
      })
      CountDownComponent({ count: this.countDownStartValue, costOfOneAttempt: 2 })
    }
  }
}