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
 * Test: V2 @Param and @Event combined validation
 * Target: @Param with missing types, @Event on non-Function,
 *         @Require with @BuilderParam patterns
 */

// Test 1: @Param without specifying a type
@ComponentV2
struct ParamWithoutType {
  @Param value = 0;

  build() {
    Column() {
      Text(this.value.toString())
    }
  }
}

// Test 2: @Param with union type (not allowed)
@ComponentV2
struct ParamWithUnion {
  @Param data: string | number = 'test';

  build() {
    Column() {
      Text('Union param')
    }
  }
}

// Test 3: @Require with @BuilderParam
@Builder
function defaultContent() {
  Text('Default')
}

@ComponentV2
struct RequireBuilderParam {
  @Require @BuilderParam content: () => void = defaultContent;

  build() {
    Column() {
      this.content()
    }
  }
}

// Test 4: @Event without Function type
@ComponentV2
struct EventNonFunction {
  @Param count: number = 0;
  @Event onCountChange: string = '';

  build() {
    Column() {
      Text(this.count.toString())
    }
  }
}

// Test 5: @Param and @Event with correct usage (control case)
@ComponentV2
struct ValidParamEvent {
  @Param value: number = 0;
  @Event onValueChange: (n: number) => void = (n: number) => {};

  build() {
    Column() {
      Text(this.value.toString())
    }
  }
}

@Entry
@Component
struct TestParamEventCombined {
  build() {
    Column() {
      Text('Test Page')
    }
  }
}
