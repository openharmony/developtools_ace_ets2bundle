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

import { Entry, Component, Text, wrapBuilder } from '@ohos.arkui.component';

// Expected: 'wrapBuilder' must be called with a function decorated using '@Builder'.
// Actual: 'invalidBuilder' is a regular function without the '@Builder' decorator,
// so it is not a valid argument for 'wrapBuilder'.

@Entry
@Component
struct AttributeDemo {
    build() {
    }
}

function invalidBuilder() {
  Text("World")
}

wrapBuilder(invalidBuilder)