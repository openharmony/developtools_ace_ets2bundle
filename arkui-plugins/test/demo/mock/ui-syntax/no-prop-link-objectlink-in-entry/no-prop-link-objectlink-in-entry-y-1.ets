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

import { Entry, Component, Row, Column, Text } from '@ohos.arkui.component'
import { Link, ObjectLink, Observed } from '@ohos.arkui.stateManagement'
@interface PropRef{}

// use @PropRef in non-entry component
@Component
struct Greeting1{
  @PropRef varA: string = 'xxx'
  build() {
  }
}

// use @Link in non-entry component
@Component
struct Greeting2{
  @Link varB: number
  build() {
  }
}

// use @ObjectLink in non-entry component
@Component
struct Greeting3{
  @ObjectLink varC: ClassA
  build() {
  }
}
@Observed class ClassA {
}

// use @PropRef/@Link/@ObjectLink in non-entry component
@Component
struct Greeting4{
  @PropRef varA: string = 'xxx'
  @Link varB: number
  @ObjectLink varC: ClassA
  build() {
  }
}

@Entry
@Component
struct Index{
  build() {
  }
}