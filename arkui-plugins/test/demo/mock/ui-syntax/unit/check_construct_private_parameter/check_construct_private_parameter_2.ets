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

import { Component, Column, Button, Text, ClickEvent } from '@ohos.arkui.component';
import { State, PropRef } from "@ohos.arkui.stateManagement";

// Expected: Private property 'CostOfOneAttempt' in 'CtComponent' cannot be initialized externally.
// Actual: 'PageComponent' initializes private 'CostOfOneAttempt' via constructor, violating the private property rule.

@Component
struct CtComponent {
  @PropRef name: string;
  @PropRef canPlay: boolean;
  @PropRef count: number;

  private CostOfOneAttempt: number = 1;

  build() {
    Column() {
      if (this.canPlay) {
        if (this.count > 0) {
          Text(this.name + ' have ' + this.count + ' Nuggets left');
        } else {
          Text('Sorry, ' + this.name + '. Game over!');
        }

        Button(this.name) {
          Text('Try again');
        }
        .onClick((e: ClickEvent) => {
          this.count -= this.CostOfOneAttempt;
        });

      } else {
        Text(this.name + ', sorry. You do not play this game');
      }
    }
  }
}

@Component
struct PageComponent {
  @State countDownStartValue: number = 10;
  @State name: string = 'hello world';

  build() {
    Column() {
      Text('Grant ' + this.countDownStartValue + ' nuggets to play')
      Button(this.name) {
        Text('+1 - Nuggets in New Game')
      }.onClick((e: ClickEvent) => {
        this.countDownStartValue += 1;
      });

      Button(this.name) {
        Text('-1 - Nuggets in New Game')
      }.onClick((e: ClickEvent) => {
        this.countDownStartValue -= 1;
      });
      CtComponent({
        name: 'xiaoming',
        canPlay: true,
        count: this.countDownStartValue,
        CostOfOneAttempt: 2
      });
    }
  }
}