/*
 * Copyright (C) 2026 Huawei Device Co., Ltd.
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
import { 
  Text, 
  Column, 
  ComponentV2, 
  Entry, 
  Button, 
  ClickEvent 
} from "@ohos.arkui.component"
import { 
  State, 
  Link, 
  PropRef, 
  Monitor, 
  ObservedV2, 
  Trace, 
  Local,
  Computed,
  ObservedArray,
  ObservedMap,
  ObservedSet
} from "@ohos.arkui.stateManagement"

@ObservedV2
export class Monitor0290Class {
  @Trace
  private _name: string

  public set name(value: string) {
    this._name = value
  }

  public get name(): string {
    return this._name
  }

  @Trace
  private _age: number

  public set age(value: number) {
    this._age = value
  }

  public get age(): number {
    return this._age
  }

  constructor(name: string, age: number) {
    this._name = name
    this._age = age
  }

}

@Entry
@ComponentV2
struct Monitor0290 {
  @Local arr1: number[] = [1, 2, 3]
  @Local change1: string = 'hello'

  @Local arr2: number[][] = [[1,1,1],[2,2,2],[3,3,3]]
  @Local change2: string = 'hello'

  @Local arr3: Monitor0290Class[] = [new Monitor0290Class('A', 1)]
  @Local change3: string = 'hello'

  @Local arr4: Array<Monitor0290Class> = new Array<Monitor0290Class> ()
  @Local change4: string = 'hello'

  @Monitor(['arr1.0'])
  test1() {}

  @Monitor(['arr2.0.0'])
  test2() {}

  @Monitor(['arr3.0.name'])
  test3() {}

  @Monitor(['arr4.length'])
  test4() {}

  build() {}
}