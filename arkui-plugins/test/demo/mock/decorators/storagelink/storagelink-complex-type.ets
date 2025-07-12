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
 
import { Component, Entry } from "@ohos.arkui.component"
import { StorageLink } from "@ohos.arkui.stateManagement"

class Person{
  name: string = ''
  constructor(name: string){}
}

enum Status {
  Success = 200,
  NotFound = 404,
  ServerError = 500
}

@Entry
@Component
struct MyStateSample {
  @StorageLink('Prop1') arrayA: number[] = [1,2,3];
  @StorageLink('Prop2') objectA: Object = {};
  @StorageLink('Prop3') dateA: Date = new Date('2021-08-08');
  @StorageLink('Prop4') setA: Set<number> = new Set<number>();
  @StorageLink('Prop5') mapA: Map<number, string> = new Map<number, string>();
  @StorageLink('Prop7') classA: Person = new Person("John");
  @StorageLink('Prop8') enumA: Status = Status.NotFound;

  build() {}
}