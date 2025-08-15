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

import { ComponentV2 } from "@ohos.arkui.component";
import { Computed, ObservedV2, Trace, Local } from "@ohos.arkui.stateManagement";

@ObservedV2
class Name {
  @Trace static firstName: string = 'Hua';
  @Trace static lastName: string = 'Li';

  @Computed
  static get fullName(): string {
    return Name.firstName + ' ' + Name.lastName;
  }
}

@ComponentV2
struct Parent {
  @Local static localVar1: string = 'stateVar1';
  @Local static localVar2: number = 50;


  @Computed
  static get fullName(): string {
    return Parent.localVar1;
  }

  build() {}
}
