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

import { Component, ComponentV2, BuilderParam } from "@ohos.arkui.component"
import { State, Require, Prop, Provide, Param } from "@ohos.arkui.stateManagement"

@Component
struct MyStateSample {
  hello: string = 'hello';
  @State state1: boolean = false;
  @Require select100: string;
  @Require @State select0: number;
  @Require @State select3: number | null;
  @Require @State select4: undefined;
  @Require @Prop select1: string;
  @Require @Provide({ alias: '15' }) select2: string[];
  @Require @Provide({ alias: 't' }) select6: string[] | undefined | string;
  @Require @BuilderParam builder: () => void;

  build() {}
}

@ComponentV2
struct V2222 {
  @Require @Param select1: string;

  build() {}
}