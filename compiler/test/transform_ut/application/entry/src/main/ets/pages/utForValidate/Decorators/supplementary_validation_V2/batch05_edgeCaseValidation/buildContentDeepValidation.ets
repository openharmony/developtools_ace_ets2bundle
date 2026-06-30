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
 * Test: Build method content deep validation
 * Target: Various invalid statements inside build() methods
 */

// Test 1: build() with while loop
@Component
struct BuildWithWhileLoop {
  build() {
    Column() {
      while (false) {
        Text('loop')
      }
    }
  }
}

// Test 2: build() with for loop
@Component
struct BuildWithForLoop {
  build() {
    Column() {
      for (let i = 0; i < 3; i++) {
        Text('iteration')
      }
    }
  }
}

// Test 3: build() with try-catch
@Component
struct BuildWithTryCatch {
  build() {
    Column() {
      try {
        Text('try')
      } catch (e) {
        Text('catch')
      }
    }
  }
}

// Test 4: build() with new expression
@Component
struct BuildWithNewExpression {
  build() {
    Column() {
      new Object()
      Text('after new')
    }
  }
}

// Test 5: build() with correct content (control case)
@Component
struct BuildWithValidContent {
  build() {
    Column() {
      Text('Valid')
      Row() {
        Text('Nested')
      }
    }
  }
}

// Test 6: build() with if-else (valid in ArkTS)
@Component
struct BuildWithIfElse {
  @State flag: boolean = true;

  build() {
    Column() {
      if (this.flag) {
        Text('true branch')
      } else {
        Text('false branch')
      }
    }
  }
}

@Entry
@Component
struct TestBuildContentDeep {
  build() {
    Column() {
      Text('Test Page')
    }
  }
}
