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
 * Test: State management initialization edge cases
 * Target: @State, @StorageLink, @StorageProp initialization rules
 */

// Test 1: @State with CustomDialogController type (not allowed)
@Component
struct StateWithDialogController {
  @State controller: CustomDialogController = new CustomDialogController({ builder: undefined });

  build() {
    Column() {
      Text('Has controller')
    }
  }
}

// Test 2: @StorageLink without proper initialization
@Component
struct StorageLinkNoDefault {
  @StorageLink('storageKey') dataValue: string;

  build() {
    Column() {
      Text(this.dataValue)
    }
  }
}

// Test 3: @StorageProp without default value
@Component
struct StoragePropNoDefault {
  @StorageProp('propKey') propValue: number;

  build() {
    Column() {
      Text(this.propValue.toString())
    }
  }
}

// Test 4: @LocalStorageLink without default
@Component
struct LocalStorageLinkNoDefault {
  @LocalStorageLink('localKey') localValue: string;

  build() {
    Column() {
      Text(this.localValue)
    }
  }
}

// Test 5: @State with correct initialization (control case)
@Component
struct StateWithCorrectInit {
  @State count: number = 0;
  @State message: string = 'hello';

  build() {
    Column() {
      Text(this.message)
      Text(this.count.toString())
    }
  }
}

@Entry
@Component
struct TestStateInitEdgeCases {
  build() {
    Column() {
      Text('Test Page')
    }
  }
}
