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
import { LocalStoragePropRef } from "@ohos.arkui.stateManagement"

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
  @LocalStoragePropRef('Prop1') arrayB: number[] = [1,2,3];
  @LocalStoragePropRef('Prop2') objectB: Object = {};
  @LocalStoragePropRef('Prop3') dateB: Date = new Date('2021-09-09');
  @LocalStoragePropRef('Prop4') setB: Set<number> = new Set<number>();
  @LocalStoragePropRef('Prop5') mapB: Map<number, string> = new Map<number, string>();
  @LocalStoragePropRef('Prop7') classB: Person = new Person("Kevin");
  @LocalStoragePropRef('Prop8') enumB: Status = Status.NotFound;

  build() {}
}