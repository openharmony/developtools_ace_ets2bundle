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
 * Test: V2 lifecycle decorator methods with input parameters
 * Target error codes: 10905371
 *
 * Lifecycle decorators like @ComponentAppear, @ComponentDisappear, etc.
 * cannot have input parameters on their decorated methods.
 */

// Test 1: @ComponentAppear with parameter
@ComponentV2
struct AppearWithParam {
  @Local count: number = 0;

  @ComponentAppear
  onAppear(param: string) {
    console.log('appeared with ' + param);
  }

  build() {
    Column() {
      Text(this.count.toString())
    }
  }
}

// Test 2: @ComponentDisappear with parameter
@ComponentV2
struct DisappearWithParam {
  @Local count: number = 0;

  @ComponentDisappear
  onDisappear(param: number) {
    console.log('disappeared with ' + param);
  }

  build() {
    Column() {
      Text(this.count.toString())
    }
  }
}

// Test 3: @ComponentInit with parameter
@ComponentV2
struct InitWithParam {
  @Local value: number = 0;

  @ComponentInit
  onInit(x: number) {
    this.value = x;
  }

  build() {
    Column() {
      Text(this.value.toString())
    }
  }
}

// Test 4: @ComponentBuilt with parameter
@ComponentV2
struct BuiltWithParam {
  @Local value: number = 0;

  @ComponentBuilt
  onBuilt(info: string) {
    console.log('built: ' + info);
  }

  build() {
    Column() {
      Text(this.value.toString())
    }
  }
}

// Test 5: @ComponentAppear without parameter (control case)
@ComponentV2
struct ValidAppear {
  @Local count: number = 0;

  @ComponentAppear
  onAppear() {
    console.log('appeared');
  }

  build() {
    Column() {
      Text(this.count.toString())
    }
  }
}

@Entry
@Component
struct TestLifecycleParams {
  build() {
    Column() {
      Text('Test Page')
    }
  }
}
