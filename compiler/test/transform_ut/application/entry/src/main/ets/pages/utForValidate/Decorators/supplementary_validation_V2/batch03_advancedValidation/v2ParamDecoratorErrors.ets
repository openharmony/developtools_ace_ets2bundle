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
 * Test: V2 @Param initialization and type errors
 * Error codes: 10905327, 10905362, 10905363
 *
 * Validates V2 component parameter initialization rules:
 * - @Param without default value must use @Require
 * - @BuilderParam must be initialized
 * - V1 decorators cannot be applied to Function-type variables
 */

// Test 1: @Param without default value and without @Require
// 10905327: must also be decorated with '@Require' when no default value
@ComponentV2
struct ParamWithoutDefault {
  @Param value: string;

  build() {
    Column() {
      Text(this.value)
    }
  }
}

// Test 2: Multiple @Param without default values
@ComponentV2
struct MultipleParamsWithoutDefault {
  @Param name: string;
  @Param age: number;

  build() {
    Column() {
      Text(this.name)
    }
  }
}

// Test 3: V1 @State decorator applied to a Function-type variable
// 10905363: V1 decorator cannot be applied to Function-type variable
@ComponentV2
struct V1DecoratorOnFunctionType {
  @State callback: () => void = () => {};

  build() {
    Column() {
      Text('Test')
    }
  }
}

// Test 4: V1 @Prop decorator applied to a Function-type variable
// 10905363
@ComponentV2
struct PropOnFunctionType {
  @Prop handler: (x: number) => void = (x: number) => {};

  build() {
    Column() {
      Text('Test')
    }
  }
}

// Test 5: V1 @Link decorator applied to a Function-type variable
// 10905363
@ComponentV2
struct LinkOnFunctionType {
  @Link callback: () => void;

  build() {
    Column() {
      Text('Test')
    }
  }
}

// Entry point
@Entry
@Component
struct TestV2ParamErrors {
  build() {
    Column() {
      Text('Test Page')
    }
  }
}
