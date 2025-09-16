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

class Person{
  name: string = ''
  constructor(name: string){}
}

enum Status {
  Success = 200,
  NotFound = 404,
  ServerError = 500
}

@Component
struct MyStateSample {
  @StoragePropRef('Prop1') arrayB: number[] = [1,2,3];
  @StoragePropRef('Prop2') objectB: Object = {};
  @StoragePropRef('Prop3') dateB: Date = new Date('2021-09-09');
  @StoragePropRef('Prop4') setB: Set<number> = new Set<number>();
  @StoragePropRef('Prop5') mapB: Map<number, string> = new Map<number, string>();
  @StoragePropRef('Prop7') classB: Person = new Person("Kevin");
  @StoragePropRef('Prop8') enumB: Status = Status.NotFound;

  build() {}
}