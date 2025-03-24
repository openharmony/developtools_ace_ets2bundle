/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

import { Text, Component } from "@ohos.arkui.component"
import { State, Prop } from "@ohos.arkui.stateManagement.common"
import { memo } from "@ohos.arkui.StateManagement.runtime"  // 临时加，需要使用UI Plugin添加
import { MutableState, observableProxy, stateOf, propState } from "@ohos.arkui.stateManagement.runtime"

class Person {  
  public name: string  
  constructor(name: string) {  
    this.name = name  
  }  
}  
class Model {  
  public value: string;  
  public name: Person;  
  constructor(value: string, person: Person) {  
    this.value = value;  
    this.name = person;  
  }  
}

@Component
struct MyStateSample {
    @Prop pro1: number = 0.0;
    @Prop pro2: string = "str";
    @Prop pro3: Date = new Date('2021-08-08');
    @Prop pro4: null = null;
    @Prop pro5: undefined = undefined;
    @Prop pro6: object = {};
    @Prop pro7: Model = new Model('Hello', new Person('World'));

    build() {
        Text("Hello World")
    }
}


