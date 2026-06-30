/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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

/**
 * Test: @Reusable and @ReusableV2 decorator conflicts
 * Error codes: 10905229, 10905241, 10905242
 *
 * Validates rules for component reuse decorators:
 * - @Reusable and @ReusableV2 cannot be used simultaneously
 * - @ReusableV2 only works with @ComponentV2
 * - @ComponentV2 cannot combine with @Component, @Reusable, @CustomDialog
 */

// Test 1: @ReusableV2 used on a @Component (V1) struct
// 10905242: '@ReusableV2' is only applicable to custom components decorated by '@ComponentV2'
@ReusableV2
@Component
struct ReusableV2OnV1Component {
  @State count: number = 0;

  build() {
    Column() {
      Text(this.count.toString())
    }
  }
}

// Test 2: @ComponentV2 combined with @Component simultaneously
// 10905229: cannot be decorated with '@ComponentV2' and '@Component' at the same time
@ComponentV2
@Component
struct DualComponentDecorator {
  @Local message: string = 'conflict';

  build() {
    Column() {
      Text(this.message)
    }
  }
}

// Test 3: @Reusable and @ReusableV2 on same struct
// 10905241: The '@Reusable' and '@ReusableV2' decorators cannot be applied simultaneously
@Reusable
@ReusableV2
@ComponentV2
struct DualReusableDecorator {
  @Local count: number = 0;

  build() {
    Column() {
      Text(this.count.toString())
    }
  }
}

// Test 4: @ComponentV2 combined with @CustomDialog
// 10905229: cannot be decorated with '@ComponentV2' and '@CustomDialog'
@ComponentV2
@CustomDialog
struct ComponentV2WithCustomDialog {
  @Local title: string = 'dialog';

  build() {
    Column() {
      Text(this.title)
    }
  }
}

// Entry point
@Entry
@Component
struct TestReusableConflicts {
  build() {
    Column() {
      Text('Test Page')
    }
  }
}
