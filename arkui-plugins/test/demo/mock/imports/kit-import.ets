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

import { Prop, Column, Entry } from "@kit.ArkUI";
import { Text, Component, ClickEvent } from "@ohos.arkui.component";
import { State } from "@ohos.arkui.stateManagement";
import { Button } from "arkui.component.button";
import hilog from "@ohos.hilog";

@Entry
@Component
struct A {
  @State a: string = "str";
  @Prop b: string;

  build() {
    Column() {
      Button("button").onClick((e: ClickEvent) => { })
      Text("text").fontSize(20)
    }
  }
}
