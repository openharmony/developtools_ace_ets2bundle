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
 * WITHOUT WARRANTIES OR CONDITIONS of ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Test: @Styles decorator usage restrictions
 * Target: @Styles function parameter and placement rules
 */

// Test 1: @Styles function with arguments (not allowed)
@Styles
function stylesWithArgs(param: string) {
  .backgroundColor(Color.Red)
}

// Test 2: @Styles function with return type annotation
@Styles
function stylesWithReturn(): void {
  .backgroundColor(Color.Red)
}

// Test 3: @Styles function with multiple arguments
@Styles
function stylesMultipleArgs(a: number, b: string, c: boolean) {
  .width('100%')
  .height(50)
}

// Test 4: @Styles on a method inside struct (correct usage)
@Component
struct StylesOnMethod {
  @Styles
  myStyles() {
    .backgroundColor(Color.Blue)
    .borderRadius(8)
  }

  build() {
    Column() {
      Text('Styled')
    }
    .myStyles()
  }
}

// Test 5: @Styles function without arguments (correct usage)
@Styles
function globalStyles() {
  .backgroundColor(Color.Green)
  .padding(10)
}

// Test 6: @Styles function with no arguments used in build
@Styles
function noArgStyles() {
  .backgroundColor(Color.Yellow)
}

@Entry
@Component
struct TestStylesRestrictions {
  build() {
    Column() {
      Text('Test Page')
      Text('Styled Text')
        .globalStyles()
        .noArgStyles()
    }
  }
}
