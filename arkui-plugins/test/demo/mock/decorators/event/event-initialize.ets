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

import { ComponentV2, Column, Text } from "@ohos.arkui.component"
import { Event, Param, Local } from "@ohos.arkui.stateManagement"

@ComponentV2
struct Child {
  @Param index: number = 0;
  @Event changeIndex: (val: number) => void;
  @Event testEvent: (val: number) => number;
  @Event testEvent2: (val: number) => number = (val: number) => { return val };

  build() {
    Column() {
      Text(`Child index: ${this.index}`)
        .onClick((e) => {
          this.changeIndex(20);
          console.log(`after changeIndex ${this.index}`);
        })
    }
  }
}

@ComponentV2
struct Index {
  @Local index: number = 0;

  build() {
      Column() {
        Child({
          index: this.index,
          changeIndex: (val: number) => {
            this.index = val;
          console.log(`in changeIndex ${this.index}`);
          }
        })
      }
  }
}