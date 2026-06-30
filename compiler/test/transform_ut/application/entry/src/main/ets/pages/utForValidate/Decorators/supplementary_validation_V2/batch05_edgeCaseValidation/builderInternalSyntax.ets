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
 * Test: @Builder function internal syntax restrictions
 * Target: build-time syntax validation in @Builder functions
 *
 * @Builder functions can only contain UI component syntax.
 * Variable declarations, assignments, and return statements are restricted.
 */

// Test 1: @Builder with variable declaration inside
@Builder
function builderWithVarDecl() {
  let temp: string = 'hello';
  Text(temp)
}

// Test 2: @Builder with return statement
@Builder
function builderWithReturn() {
  Text('before return')
  return;
}

// Test 3: @Builder with assignment statement
@Builder
function builderWithAssignment() {
  Column() {
    Text('test')
  }
  console.log('side effect in builder');
}

// Test 4: @Builder with correct usage (control case)
@Builder
function validBuilder() {
  Column() {
    Text('Valid builder content')
  }
}

// Test 5: @LocalBuilder with invalid content
@ComponentV2
struct LocalBuilderInvalid {
  @LocalBuilder
  invalidLocalBuilder() {
    let x: number = 10;
    Text(x.toString())
  }

  build() {
    Column() {
      this.invalidLocalBuilder()
    }
  }
}

// Test 6: @LocalBuilder with correct usage
@ComponentV2
struct LocalBuilderValid {
  @LocalBuilder
  validLocalBuilder() {
    Text('Valid local builder')
  }

  build() {
    Column() {
      this.validLocalBuilder()
    }
  }
}

@Entry
@Component
struct TestBuilderSyntax {
  build() {
    Column() {
      Text('Test Page')
    }
  }
}
