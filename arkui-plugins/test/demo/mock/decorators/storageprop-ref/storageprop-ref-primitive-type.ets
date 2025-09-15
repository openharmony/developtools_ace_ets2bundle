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

import { Component } from "@ohos.arkui.component"  // TextAttribute should be insert by ui-plugins
import { StoragePropRef } from "@ohos.arkui.stateManagement"

@Component
struct MyStateSample {
  @StoragePropRef('Prop1') numB: number = 43;
  @StoragePropRef('Prop2') stringB: string = 'BB';
  @StoragePropRef('Prop3') booleanB: boolean = false;
  @StoragePropRef('Prop4') undefinedB: undefined = undefined;
  @StoragePropRef('Prop5') nullB: null = null;

  build() {}
}