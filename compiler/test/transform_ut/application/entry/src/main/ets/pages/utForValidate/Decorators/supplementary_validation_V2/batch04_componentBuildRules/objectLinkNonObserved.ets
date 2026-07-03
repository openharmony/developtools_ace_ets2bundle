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
 * Test: @ObjectLink with non-@Observed class type
 * Target error codes: 10905307
 *
 * @ObjectLink requires the type to be a class decorated with @Observed.
 * Using a plain class without @Observed triggers an error.
 */

// Test 1: @ObjectLink with plain class (no @Observed)
class PlainData {
  value: number = 0;
  name: string = 'test';
}

@Component
struct ObjectLinkWithPlainClass {
  @ObjectLink data: PlainData;
  build() {
    Column() {
      Text(this.data.name)
    }
  }
}

// Test 2: @ObjectLink with another non-observed class
class UserInfo {
  id: number = 0;
  email: string = '';
}

@Component
struct ObjectLinkWithUserInfo {
  @ObjectLink userInfo: UserInfo;
  build() {
    Column() {
      Text(this.userInfo.email)
    }
  }
}

// Test 3: @ObjectLink with correct @Observed class (control case)
@Observed
class ObservedData {
  count: number = 0;
  label: string = 'observed';
}

@Component
struct ObjectLinkWithObserved {
  @ObjectLink observedData: ObservedData;
  build() {
    Column() {
      Text(this.observedData.label)
    }
  }
}

// Test 4: @ObjectLink with Date type (not an observed class)
@Component
struct ObjectLinkWithDate {
  @ObjectLink dateValue: Date;
  build() {
    Column() {
      Text('Date ObjectLink')
    }
  }
}

@Entry
@Component
struct TestObjectLinkNonObserved {
  build() {
    Column() {
      Text('Test Page')
    }
  }
}
