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

import { Text, Column, Component, $$, Toggle, ToggleType } from "@ohos.arkui.component"
import { State } from "@ohos.arkui.stateManagement"

const c: boolean[] = [true, false, true];

class BooleanClass {
  isOn: boolean = true;
}

@Component
struct MyStateSample {
  @State boo: boolean[] = [true, false, true];
  @State booClass: BooleanClass = new BooleanClass();

  build() {
    Column() {
        Toggle({ type: ToggleType.Checkbox, isOn: $$(this.boo[0]) })
        Toggle({ type: ToggleType.Checkbox, isOn: $$(this.booClass.isOn) })
        Toggle({ type: ToggleType.Checkbox, isOn: $$(c[1]) })
    }
  }
}