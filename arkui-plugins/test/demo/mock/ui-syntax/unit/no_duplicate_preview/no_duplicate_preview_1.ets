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

import { Component, Entry, Preview } from '@ohos.arkui.component';

// Expected: A single ETS page file may contain at most ten '@Preview' annotations; any additional preview components 
// beyond the tenth are not allowed.
// Actual: This file declares eleven structs annotated with '@Preview' (P1–P11), so the extra preview component 
// 'P11' exceeds the maximum allowed '@Preview' annotations for a single page.

@Entry
@Component
struct Test {
  build() {
  }
}

@Preview
@Component
struct P1 { build() {} }

@Preview
@Component
struct P2 { build() {} }

@Preview
@Component
struct P3 { build() {} }

@Preview
@Component
struct P4 { build() {} }

@Preview
@Component
struct P5 { build() {} }

@Preview
@Component
struct P6 { build() {} }

@Preview
@Component
struct P7 { build() {} }

@Preview
@Component
struct P8 { build() {} }

@Preview
@Component
struct P9 { build() {} }

@Preview
@Component
struct P10 { build() {} }

@Preview
@Component
struct P11 { build() {} }