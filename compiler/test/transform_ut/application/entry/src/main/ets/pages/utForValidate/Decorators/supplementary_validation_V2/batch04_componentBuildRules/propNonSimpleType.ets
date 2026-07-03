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
 * Test: @Prop with non-simple type validation
 * Target error codes: 10905306
 *
 * @Prop decorator only supports string, number, boolean types.
 * Using Object, Array, or custom class types triggers an error.
 */

// Test 1: @Prop with Object type (not a simple type)
@Component
struct PropWithObjectType {
  @Prop data: Object = {};
  build() {
    Column() {
      Text('Object Prop')
    }
  }
}

// Test 2: @Prop with Array type (not a simple type)
@Component
struct PropWithArrayType {
  @Prop items: Array<number> = [1, 2, 3];
  build() {
    Column() {
      Text('Array Prop')
    }
  }
}

// Test 3: @Prop with custom class type (not a simple type)
class MyData {
  value: number = 0;
}
@Component
struct PropWithClassType {
  @Prop data: MyData = new MyData();
  build() {
    Column() {
      Text('Class Prop')
    }
  }
}

// Test 4: @Prop with Map type (not a simple type)
@Component
struct PropWithMapType {
  @Prop dataMap: Map<string, number> = new Map();
  build() {
    Column() {
      Text('Map Prop')
    }
  }
}

// Test 5: @Prop with correct simple types (control case)
@Component
struct PropWithSimpleTypes {
  @Prop strValue: string = 'hello';
  @Prop numValue: number = 42;
  @Prop boolValue: boolean = true;
  build() {
    Column() {
      Text(this.strValue)
      Text(this.numValue.toString())
      Text(this.boolValue.toString())
    }
  }
}

@Entry
@Component
struct TestPropNonSimpleType {
  build() {
    Column() {
      Text('Test Page')
    }
  }
}
