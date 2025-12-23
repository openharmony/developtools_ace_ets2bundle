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

import { Entry, Component, Row, AnimatableExtend, Styles, Navigation } from '@ohos.arkui.component';
import { State } from "@ohos.arkui.stateManagement";

// Expected: Top-level functions may only use the '@Builder' decorator. Any other decorator 
// (such as '@AnimatableExtend' or '@Styles'), or multiple decorators on the same function, is not allowed.
// Actual: The function 'toolbarConfiguration' is decorated with '@AnimatableExtend', and 'newStyle' is decorated twice
// with '@Styles', so both functions violate the rule that only '@Builder' can decorate a global function.

const opacity = (target:Object) => {}

@AnimatableExtend(Navigation)
 function toolbarConfiguration(){
    .navBarWidth(100)
 }

@Styles
@Styles
function newStyle(){
   .width(100)
}

@Entry
@Component
struct Index {
@State a:string = '';
@State new_a:string = 'newaa';

 build(){
   Row(){}
  }
 }