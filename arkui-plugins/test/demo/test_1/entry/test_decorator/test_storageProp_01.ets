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
import { State, Prop, StorageProp } from "@ohos.arkui.stateManagement.common"
import { memo } from "@ohos.arkui.StateManagement.runtime"  // 临时加，需要使用UI Plugin添加
import { MutableState, observableProxy, stateOf, propState, AppStorageLinkState } from "@ohos.arkui.stateManagement.runtime"
import { AppStorage } from "@ohos.arkui.stateManagement.storage"

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

AppStorage.setOrCreate('PropA1', 47);

@Component
struct MyStateSample {
    @StorageProp('PropA1') appPro1: number = 0.0;
    @StorageProp('PropA2') appPro2: string = "str";
    @StorageProp('PropA3') appPro3: Date = new Date('2021-08-08');
    @StorageProp('PropA4') appPro4: null = null;
    @StorageProp('PropA5') appPro5: undefined = undefined;
    @StorageProp('PropA6') appPro6: object = {};
    @StorageProp('PropA7') appPro7: Model = new Model('Hello', new Person('World'));

    build() {
        Text("Hello World")
    }
}


@Component
struct Parent {
    @State state1: number = 5.8;
    @State state2: string = "str99999999999";
    @State state3: Model = new Model('Hello', new Person('World999999999999'));
    @StorageProp('PropA6') appPro6: object = {};
    build() {
        MyStateSample({appPro1: this.state1, appPro2: this.state2, appPro7: this.state3} as __Options_MyStateSample)
    }
}


