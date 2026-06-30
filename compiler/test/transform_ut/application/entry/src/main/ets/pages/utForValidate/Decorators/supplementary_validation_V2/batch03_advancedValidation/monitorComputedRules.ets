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
 * Test: @Monitor and @Computed validation in V2 components
 * Error codes: 10905366, 10905367, 10905129
 *
 * Validates V2 monitoring and computed property rules:
 * - @Monitor/@SyncMonitor cannot observe non-state variables
 * - Wildcard .* pattern must be at end of monitor path
 * - @Computed property cannot be used with $$ two-way binding syntax
 */

// Test 1: @Monitor on non-state variable
// 10905366: cannot observe non-existent or non-state variables
@ComponentV2
struct MonitorOnRegular {
  regularVar: number = 0;
  @Local stateVar: number = 0;

  @Monitor('regularVar')
  onRegularChange() {
    console.log('regular changed')
  }

  build() {
    Column() {
      Text(this.stateVar.toString())
    }
  }
}

// Test 2: @SyncMonitor with wildcard not at end
// 10905367: .* pattern must be placed at the end
@ComponentV2
struct SyncMonitorWildcard {
  @Local dataValue: number = 0;
  @Local dataCount: number = 0;

  @SyncMonitor('.*Value', 'dataCount')
  onWildcardMonitor() {
    console.log('changed')
  }

  build() {
    Column() {
      Text(this.dataValue.toString())
    }
  }
}

// Test 3: @SyncMonitor observing non-existent path
// 10905366: cannot observe non-existent variables
@ComponentV2
struct SyncMonitorNonExistent {
  @Local realValue: number = 0;

  @SyncMonitor('fakeValue')
  onFakeChange() {
    console.log('changed')
  }

  build() {
    Column() {
      Text(this.realValue.toString())
    }
  }
}

// Test 4: @Computed used with $$ two-way binding
// 10905129: cannot be used with two-bind syntax
@ComponentV2
struct ComputedTwoWayBind {
  @Local baseValue: number = 10;

  @Computed
  get computedValue(): number {
    return this.baseValue * 2;
  }

  build() {
    Column() {
      Text(this.computedValue.toString())
    }
  }
}

// Test 5: @Monitor with valid usage (control case)
@ComponentV2
struct ValidMonitor {
  @Local count: number = 0;

  @Monitor('count')
  onCountChange() {
    console.log('count changed')
  }

  build() {
    Column() {
      Text(this.count.toString())
    }
  }
}

// Entry point
@Entry
@Component
struct TestMonitorValidation {
  build() {
    Column() {
      Text('Test Page')
      ValidMonitor()
    }
  }
}
