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
 * Test case: V1/V2 incompatibility
 * Purpose: Verify V1 and V2 decorators cannot be mixed
 * Error codes: 10905338, 10905339
 * 
 * Background:
 * - ArkTS V1 uses @Component with @State, @Prop, @Link, etc.
 * - ArkTS V2 uses @ComponentV2 with @Local, @Param, @Event, etc.
 * - V1 decorators cannot be used in V2 components and vice versa
 */

// ============================================
// Test Case 1: V1 component using V2 decorator
// Expected Error: 10905338
// ============================================

@Component
struct V1ComponentWithV2Decorator {
  // Error: Using @Local in @Component - 10905338
  @Local count: number = 0
  @Param v2Param: string = 'test'

  build() {
    Column() {
      Text("Count: " + this.count)
        .fontSize(20)
      Text(this.v2Param)
        .fontSize(16)
    }
  }
}

// ============================================
// Test Case 2: V2 component using V1 decorator
// Expected Error: 10905339
// ============================================

@ComponentV2
struct V2ComponentWithV1Decorator {
  // Error: Using @State in @ComponentV2 - 10905339
  @State message: string = 'Hello'
  @Prop v1Prop: string = 'prop'

  build() {
    Column() {
      Text(this.message)
        .fontSize(18)
      Text(this.v1Prop)
        .fontSize(16)
    }
  }
}

// ============================================
// Test Case 3: Correct V1 component
// ============================================

@Component
struct CorrectV1Component {
  @State v1State: string = 'V1 State'
  @Prop v1Prop: string = 'V1 Prop'

  build() {
    Column() {
      Text(this.v1State)
        .fontSize(16)
        .fontColor(Color.Green)
      Text(this.v1Prop)
        .fontSize(14)
        .fontColor(Color.Blue)
    }
  }
}

// ============================================
// Test Case 4: Correct V2 component
// ============================================

@ComponentV2
struct CorrectV2Component {
  @Local v2Local: string = 'V2 Local'
  @Param v2Param: string = 'V2 Param'

  build() {
    Column() {
      Text(this.v2Local)
        .fontSize(16)
        .fontColor(Color.Green)
      Text(this.v2Param)
        .fontSize(14)
        .fontColor(Color.Blue)
    }
  }
}

// ============================================
// Entry point
// ============================================

@Entry
@Component
struct TestV1V2Incompatibility {
  @State testTitle: string = 'V1/V2 Incompatibility Test'

  build() {
    Column() {
      Text(this.testTitle)
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .margin(20)
      
      // Error information
      Column() {
        Text('Testing: 10905338, 10905339')
          .fontSize(18)
          .fontColor(Color.Red)
        
        Text('V1/V2 decorator incompatibility')
          .fontSize(14)
          .margin(5)
      }
      .width('90%')
      .padding(15)
      .backgroundColor('#FFEBEE')
      .margin(10)
      
      // V1 Decorators section
      Column() {
        Text('V1 Decorators (@Component):')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
        
        Text('@State, @Prop, @Link, @Provide, @Consume')
          .fontSize(12)
          .fontColor(Color.Gray)
      }
      .width('90%')
      .padding(10)
      .backgroundColor('#E3F2FD')
      .margin(5)
      
      // V2 Decorators section
      Column() {
        Text('V2 Decorators (@ComponentV2):')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
        
        Text('@Local, @Param, @Event, @Provider, @Consumer')
          .fontSize(12)
          .fontColor(Color.Gray)
      }
      .width('90%')
      .padding(10)
      .backgroundColor('#E8F5E9')
      .margin(5)
      
      // Rule
      Column() {
        Text('Rule: Cannot mix V1 and V2 decorators')
          .fontSize(14)
          .fontWeight(FontWeight.Bold)
          .fontColor(Color.Red)
      }
      .margin(10)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}
