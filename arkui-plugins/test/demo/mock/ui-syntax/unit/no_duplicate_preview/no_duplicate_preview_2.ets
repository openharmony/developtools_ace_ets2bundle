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

import { Component, Text, Entry, Preview } from '@ohos.arkui.component';

// Expected: A single ETS page file may contain up to ten '@Preview' annotations; having nine preview components is 
// within the allowed limit. 
// Actual: This file defines nine structs annotated with '@Preview', which does not exceed the maximum limit, 
// so no duplicate-preview violation occurs.

@Entry
@Component
struct Test {
  build() {
  }
}

@Preview
@Component
struct P1 {
  build() {
    Text("P1")
  }
}

@Preview
@Component
struct P2 {
  build() {
    Text("P2")
  }
}

@Preview
@Component
struct P3 {
  build() {
    Text("P3")
  }
}

@Preview
@Component
struct P4 {
  build() {
    Text("P4")
  }
}

@Preview
@Component
struct P5 {
  build() {
    Text("P5")
  }
}

@Preview
@Component
struct P6 {
  build() {
    Text("P6")
  }
}

@Preview
@Component
struct P7 {
  build() {
    Text("P7")
  }
}

@Preview
@Component
struct P8 {
  build() {
    Text("P8")
  }
}

@Preview
@Component
struct P9 {
  build() {
    Text("P9")
  }
}