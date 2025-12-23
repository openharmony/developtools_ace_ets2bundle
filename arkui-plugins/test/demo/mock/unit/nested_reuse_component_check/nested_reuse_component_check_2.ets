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
// Actual: In this example, the '@Component' struct 'V11' uses '@ReusableV2' children ('EV2R' and 'V22R'), 
// the '@ReusableV2' struct 'V22R' contains '@Reusable' children ('EV1R' and 'V11R'), and the '@Reusable' struct 'V11R'
// contains '@ReusableV2' children ('EV2R' and 'V22R'), so all three nesting constraints are violated.

  @Entry
  @Component
  struct V11 {
    build() {
      Column() {
        //SUB_ACE_TOOLCHAIN_COMPONENTREPEATE_RUN_0160
        EV1R()
        EV1()
        EV2()
        //SUB_ACE_TOOLCHAIN_COMPONENTREPEATE_RUN_0130
        EV2R()
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
        //SUB_ACE_TOOLCHAIN_COMPONENTREPEATE_RUN_0140
        EV2R()
        EV1()
        //SUB_ACE_TOOLCHAIN_COMPONENTREPEATE_RUN_0450
        EV2()
        //SUB_ACE_TOOLCHAIN_COMPONENTREPEATE_RUN_0310
        EV2R()
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
        //SUB_ACE_TOOLCHAIN_COMPONENTREPEATE_RUN_0170
        EV1R()
        EV1()
        EV2()
        EV2R()
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
        EV1R()
        EV1()
        EV2()
        //SUB_ACE_TOOLCHAIN_COMPONENTREPEATE_RUN_0270
        EV2R()
        V11()
        V22()
        V11R()
        V22R()
      }
    }
  }

  @Component
  export struct EV1 {
    build() {
      Column() {
      }
    }
  }

  @Reusable
  @Component
  export struct EV1R {
    build() {
      Column() {
      }
    }
  }

  @ComponentV2
  export struct EV2 {
    build() {
      Column() {
      }
    }
  }

  @ReusableV2
  @ComponentV2
  export struct EV2R {
    build() {
      Column() {
      }
    }
  }