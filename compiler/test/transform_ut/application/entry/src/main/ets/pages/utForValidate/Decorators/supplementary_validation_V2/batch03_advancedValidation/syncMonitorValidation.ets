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
 * Test: @SyncMonitor validation errors
 * Error codes: 10905365, 10905366, 10905367
 *
 * Validates @SyncMonitor decorator usage rules:
 * - Only constant expressions as parameters (no variables)
 * - Cannot observe non-existent or non-state variables
 * - Wildcard .* pattern must be at the end of the string
 */

// Test 1: @SyncMonitor with variable parameter (not constant)
// 10905365: Only constant expressions are supported as parameters
@ComponentV2
struct SyncMonitorVariableParam {
  @Local count: number = 0;
  @Local observed: number = 0;

  @SyncMonitor(this.observed)
  onObservedChange() {
    console.log('changed');
  }

  build() {
    Column() {
      Text(this.count.toString())
    }
  }
}

// Test 2: @SyncMonitor observing non-existent variable
// 10905366: cannot observe non-existent variables
@ComponentV2
struct SyncMonitorNonExistent {
  @Local count: number = 0;

  @SyncMonitor('nonExistentVar')
  onNonExistentChange() {
    console.log('changed');
  }

  build() {
    Column() {
      Text(this.count.toString())
    }
  }
}

// Test 3: @SyncMonitor wildcard .* not at end of pattern
// 10905367: .* pattern must be placed at the end of the string
@ComponentV2
struct SyncMonitorWildcardPosition {
  @Local countValue: number = 0;

  @SyncMonitor('.*count')
  onWildcardChange() {
    console.log('changed');
  }

  build() {
    Column() {
      Text(this.countValue.toString())
    }
  }
}

// Test 4: @SyncMonitor with multiple patterns, wildcard not at end
@ComponentV2
struct SyncMonitorMultiWildcard {
  @Local dataValue: number = 0;
  @Local otherValue: number = 0;

  @SyncMonitor('data.*.value')
  onMultiWildcardChange() {
    console.log('changed');
  }

  build() {
    Column() {
      Text(this.dataValue.toString())
    }
  }
}

// Entry point
@Entry
@Component
struct TestSyncMonitorValidation {
  build() {
    Column() {
      Text('Test Page')
    }
  }
}
