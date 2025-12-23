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

import { Entry, Component, Column, ComponentV2, Reusable, ReusableV2 } from '@ohos.arkui.component';

// Expected: A custom component decorated with '@Component' must not contain child components decorated with 
// '@ReusableV2', components decorated with '@Reusable' must not contain '@ReusableV2' children, and '@ReusableV2'
// components must not contain any '@Reusable' children.
// Actual: In this example, the '@Component' struct 'V11' uses '@ReusableV2' children (such as 'V2R' and 'V22R'), 
// the '@ReusableV2' struct 'V22R' contains '@Reusable' children (like 'V1R' and 'V11R'), and the '@Reusable' struct
// 'V11R' contains '@ReusableV2' children (such as 'V2R' and 'V22R'), so all nested reuse constraints are violated.

import { V1C, V1R, V2C, V2R } from  './exportComponents'
@ReusableV2
@ComponentV2
export struct V2R {
  build() {}
}

@Entry
@Component
struct V11 {
  build() {
    Column() {
      V1R()
      V1C()
      V2C()
      V2R()
      V11()
      V22()
      V11R()
      V22R()
    }
  }
}

@ComponentV2
struct V22 {
  build() {
    Column() {
      V1R()
      V1C()
      V2C()
      V2R()
      V11()
      V22()
      V11R()
      V22R()
    }
  }
}

@ReusableV2
@ComponentV2
struct V22R {
  build() {
    Column() {
      V1R()
      V1C()
      V2C()
      V2R()
      V11()
      V22()
      V11R()
      V22R()
    }
  }
}


@Reusable
@Component
struct V11R {
  build() {
    Column() {
      V1R()
      V1C()
      V2C()
      V2R()
      V11()
      V22()
      V11R()
      V22R()
    }
  }
}