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
 * Test: @Extend and @AnimatableExtend function validation
 * Error codes: 10905108, 10905109
 *
 * Validates rules for style extension functions:
 * - @Extend/@AnimatableExtend should have exactly one parameter
 * - Parameters of certain functions should be @Builder functions
 */

// Test 1: @Extend function with no parameters (should have exactly one)
// 10905108: should have one and only one parameter
@Extend(Text)
function extendNoParam() {
  .fontColor(Color.Red)
}

// Test 2: @Extend function with multiple parameters (should have exactly one)
// 10905108: should have one and only one parameter
@Extend(Text)
function extendMultipleParams(param1: string, param2: number) {
  .fontColor(Color.Red)
}

// Test 3: @AnimatableExtend with no parameters
// 10905108: should have one and only one parameter
@AnimatableExtend
function animatableNoParam() {
  .opacity(1.0)
}

// Test 4: @AnimatableExtend with multiple parameters
// 10905108: should have one and only one parameter
@AnimatableExtend
function animatableMultipleParams(param1: number, param2: string) {
  .opacity(1.0)
}

// Test 5: @Extend function used correctly with one parameter (control case)
@Extend(Text)
function extendCorrectParam(color: ResourceColor) {
  .fontColor(color)
}

// Entry point
@Entry
@Component
struct TestExtendValidation {
  @State textColor: ResourceColor = Color.Black;

  build() {
    Column() {
      Text('Test')
        .extendCorrectParam(this.textColor)
      Text('No Param')
        .extendNoParam()
      Text('Multi Param')
        .extendMultipleParams('red', 1)
    }
  }
}
