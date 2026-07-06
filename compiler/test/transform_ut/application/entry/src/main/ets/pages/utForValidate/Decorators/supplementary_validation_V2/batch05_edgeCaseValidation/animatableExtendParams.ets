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
 * Test: @AnimatableExtend function parameter validation
 * Target: @AnimatableExtend parameter restrictions
 *
 * @AnimatableExtend functions should have exactly one parameter.
 * Testing various parameter configurations.
 */

// Test 1: @AnimatableExtend with no parameters
@AnimatableExtend
function animatableNoParam() {
  .fontSize(20)
}

// Test 2: @AnimatableExtend with two parameters
@AnimatableExtend
function animatableTwoParams(param1: number, param2: string) {
  .fontSize(param1)
}

// Test 3: @AnimatableExtend with correct single parameter
@AnimatableExtend
function animatableCorrectParam(value: number) {
  .opacity(value)
}

// Test 4: @AnimatableExtend with object parameter
@AnimatableExtend
function animatableObjectParam(config: Object) {
  .opacity(1)
}

// Test 5: @Extend with no parameters (should have one)
@Extend(Text)
function extendNoArguments() {
  .fontColor(Color.Red)
}

// Test 6: @Extend with correct single parameter
@Extend(Text)
function extendCorrectArg(color: ResourceColor) {
  .fontColor(color)
}

@Entry
@Component
struct TestAnimatableExtend {
  @State animValue: number = 1;
  @State textColor: ResourceColor = Color.Black;

  build() {
    Column() {
      Text('Test')
        .animatableCorrectParam(this.animValue)
        .extendCorrectArg(this.textColor)
    }
  }
}
