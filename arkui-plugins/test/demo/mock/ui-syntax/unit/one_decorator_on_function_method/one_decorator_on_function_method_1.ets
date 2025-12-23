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

import { Entry, Component, Column, Builder } from '@ohos.arkui.component';

// Expected: Top-level (global) functions may only be decorated with the '@Builder' annotation. Any other decorator on 
// a global function, or any combination like '@Builder' plus another decorator, is not allowed.
// Actual: The global function 'xx' is decorated with '@LocalBuilder' instead of '@Builder', so it violates the rule 
// that only '@Builder' may be used as a decorator on a top-level function.

@LocalBuilder function xx() {}

@Entry
@Component
struct HomeComponent {
  @LocalBuilder static bb() {}
  @Builder @LocalBuilder dd() {}
  build() {
    Column() {
      xx();
    }
    .height(500)
  }
}

class Apa {
  @LocalBuilder xx() {}
}

