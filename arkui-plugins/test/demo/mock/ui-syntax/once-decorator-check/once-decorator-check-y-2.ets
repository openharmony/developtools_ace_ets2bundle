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

import { Event, Param, Local, Once, Consumer, Provider, ObservedV2, Trace, Require } from "@ohos.arkui.stateManagement"
import { Entry, ComponentV2, Column, Text } from "@ohos.arkui.component"

export const STATE_VARIABLES_V2: string = 'StateVariablesV2'

@Entry
@ComponentV2
struct StateVariablesV2Main {
  son0: Son0 = new Son0();
  son1: Son1 = new Son1();
  son2: Son2 = new Son2();

  local_var_0: string = "";
  local_var_1: string = "";
  local_var_2: string = "";

  @Provider("alias_0") provider_var_0: string = "";
  @Provider("alias_1") provider_var_1: string = "";
  @Provider("alias_2") provider_var_2: string = "";

  @Event event0: ()=>void = ()=>{};
  @Event event1: ()=>void = ()=>{};
  @Event event2: ()=>void = ()=>{};


  build() {
    Column() {
      StateVariablesV2Child({
        param_var_0: this.local_var_0,
        param_var_1: this.local_var_1,
        param_var_2: this.local_var_2,

        once_para_var_0: this.local_var_0,
        once_para_var_1: this.local_var_1,
        once_para_var_2: this.local_var_2,

      })
    }
  }
}

@ComponentV2
struct StateVariablesV2Child {
  @Param param_var_0: string ="";
  @Param param_var_1: string ="";
  @Param param_var_2: string ="";

  @Require @Once @Param once_para_var_0: string;
  @Require @Once @Param once_para_var_1: string;
  @Require @Once @Param once_para_var_2: string;

  @Consumer("alias_0") consumer_var_0: string = "";
  @Consumer("alias_1") consumer_var_1: string = "";
  @Consumer("alias_2") consumer_var_2: string = "";

  build() {
    Column() {
      Text(`Text`)
    }
  }
}


@ObservedV2
class Son0 {
  @Trace age: number = 100;
}

@ObservedV2
class Son1 {
  @Trace age: number = 100;
}

@ObservedV2
class Son2 {
  @Trace age: number = 100;
}