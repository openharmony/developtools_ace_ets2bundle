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
 * WITHOUT WARRANTIES AND CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Test V2 specific errors - triggers 10905327, 10905332, 10905341, 10905342, 10905346, 10905360, 10905369

// @Param without type - 10905327
@ComponentV2
struct ParamWithoutType {
  @Param value = 'test';

  build() {
    Column() {
      Text(this.value)
    }
  }
}

// @Type in @Sendable class - 10905342
@Sendable
@Type
class SendableWithType {
  name: string = 'test';
}

// @Type in @Observed class - 10905341
@Observed
@Type
class ObservedWithType {
  name: string = 'test';
}

// @Type not on member variable - 10905340, 10905345
@Component
struct TypeOnNonMember {
  @Type
  myMethod() {
    return 'test';
  }

  build() {
    Column() {
      Text('Test')
    }
  }
}

// V2 decorator on non-property - 10905346
@ComponentV2
struct V2DecoratorOnNonProperty {
  @Local
  myMethod() {
    return 'test';
  }

  build() {
    Column() {
      Text('Test')
    }
  }
}

// @Extend conflicts with built-in style - 10905360
@Extend(Navigation)
function toolbarConfiguration() {
  .width(100)
}

// @ComponentReuse with wrong parameters - 10905369
@Component
struct ComponentReuseError {
  @ComponentReuse
  aboutToReuse(params: string) {
    console.log(params);
  }

  build() {
    Column() {
      Text('Test')
    }
  }
}
