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

// Test @Observed inheritance conflicts - triggers 10905224, 10905225, 10905226

@Observed
class ObservedClass1 {
  name: string = 'test1';
}

@ObservedV2
class ObservedV2Class1 {
  @Trace name: string = 'test1';
}

// Error: @Observed class cannot inherit from @ObservedV2 - 10905224
@Observed
class ObservedChild1 extends ObservedV2Class1 {
  age: number = 20;
}

// Error: @ObservedV2 class cannot inherit from @Observed - 10905225
@ObservedV2
class ObservedV2Child1 extends ObservedClass1 {
  @Trace age: number = 20;
}

// Error: Class cannot be decorated by @Observed and @ObservedV2 - 10905226
@Observed
@ObservedV2
class ObservedBothDecorators {
  name: string = 'test';
}

@ComponentV2
struct TestObservedInheritance {
  @Local child1: ObservedChild1 = new ObservedChild1();
  @Local child2: ObservedV2Child1 = new ObservedV2Child1();
  @Local both: ObservedBothDecorators = new ObservedBothDecorators();

  build() {
    Column() {
      Text('Test')
    }
  }
}
