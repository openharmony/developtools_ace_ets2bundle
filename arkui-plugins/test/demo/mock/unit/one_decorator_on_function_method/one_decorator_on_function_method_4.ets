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

import { Extend, Navigation, Entry, Component } from '@ohos.arkui.component';

// Expected: A top-level function may only use the '@Builder' decorator. Any other decorator applied to a global 
// function is invalid. 
// Actual: The function 'toolbarConfiguration' is decorated with '@Extend' instead of '@Builder', so it violates the
// rule that only '@Builder' may decorate a top-level function.

@Entry
@Component
struct Test {
  build() {
  }
}

@Extend(Navigation)
function toolbarConfiguration(){
  .width(100)
}