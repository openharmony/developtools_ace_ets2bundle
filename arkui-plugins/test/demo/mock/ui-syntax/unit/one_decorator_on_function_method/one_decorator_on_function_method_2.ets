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

import { Builder, Styles, AnimatableExtend, Entry, Component } from '@ohos.arkui.component';

// Expected: A top-level (global) function may only use the '@Builder' decorator. If a function is decorated with any 
// other decorator — or with a combination like '@Builder' + another decorator it violates the rule and should 
// trigger an error.
// Actual: The functions 'builder1', 'builder2', and 'builder3' all use decorators other than '@Builder' 
// (such as '@Styles' or '@AnimatableExtend' without a '=t' parameter). Since top-level functions must be decorated
// exclusively with '@Builder', each of these functions is considered invalid according to the rule.

@Builder
function validBuilder() {}

@Styles
function invalid1() {}

@Builder
@Styles
function invalid2() {}

@AnimatableExtend('Text')
function invalid3() {}

@AnimatableExtend('Text')
function validAnimatable() {}

@Entry
@Component
struct Test {
  build() {
  }
}
