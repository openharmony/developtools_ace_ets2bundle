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

import { Entry, Text, Column, Component, Button, ClickEvent, Row, Scroll, ComponentV2, Builder, BuilderParam } from '@ohos.arkui.component'
import { PropRef, Require } from '@ohos.arkui.stateManagement'
import hilog from '@ohos.hilog'

@Entry
@Component
struct Index {
  build() {
    Row() {
    }
  }
}
@Component
struct Child {
  @Require @BuilderParam private initBuildText: () => void = buildFunction; // Property 'initBuildText' can not be decorated with both Require and private.
  @Require @PropRef private message: string = 'Hello'; // Property 'message' can not be decorated with both Require and private.
  @Require @PropRef private initMessage: string; // Property 'initMessage' can not be decorated with both Require and private.
  build() {
  }
}
@Builder
function buildFunction() {
}