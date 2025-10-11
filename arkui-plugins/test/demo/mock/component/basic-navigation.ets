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
 
import { Component, Navigation, NavPathStack, Column, Button } from "@ohos.arkui.component"

@Component
struct MyStateSample1 {
  pathStack: NavPathStack = new NavPathStack()

  build() {
    Navigation(this.pathStack){
      Column(){
        Button('abc').width(100).height(300)
      }
    }.width(80)
  }
}

@Component
struct MyStateSample2 {
  pathStack: NavPathStack = new NavPathStack()

  build() {
    Navigation(){
      Column(){
        Button('abc')
      }
    }
  }
}