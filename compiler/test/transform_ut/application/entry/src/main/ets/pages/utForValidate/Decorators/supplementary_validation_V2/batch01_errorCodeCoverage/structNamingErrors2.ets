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

// Test struct naming and entry/Preview errors - triggers 10905227, 10905228, 10905231, 10905249, 10905250

// Struct name conflicts with built-in component - 10905227
@Entry
@Component
struct Button {
  @State message: string = 'Hello';

  build() {
    Column() {
      Text(this.message)
    }
  }
}

// Struct name conflicts with built-in attribute - 10905228
@Entry
@Component
struct fontSize {
  @State message: string = 'Hello';

  build() {
    Column() {
      Text(this.message)
    }
  }
}

// Multiple @Entry decorators - 10905231
@Entry
@Entry
@Component
struct MultipleEntry {
  @State message: string = 'Hello';

  build() {
    Column() {
      Text(this.message)
    }
  }
}

// Missing @Entry on configured page - 10905233
@Component
struct MissingEntry {
  @State message: string = 'Hello';

  build() {
    Column() {
      Text(this.message)
    }
  }
}

// @Env in wrong context (CustomDialog) - 10905250
@CustomDialog
struct EnvInCustomDialog {
  @Env breakPoint: WindowSizeLayoutBreakpointInfo = SystemProperties.BREAK_POINT;

  build() {
    Column() {
      Text('Dialog')
    }
  }
}

// @Env in non-component context - 10905250
class EnvInClass {
  @Env breakPoint: WindowSizeLayoutBreakpointInfo = SystemProperties.BREAK_POINT;
}

// reuse attribute in wrong context - 10905249
@Entry
@Component
struct ReuseAttributeError {
  build() {
    Column() {
      ChildWithReuse()
    }
  }
}

@Component
struct ChildWithReuse {
  reuse: string = 'invalid';

  build() {
    Text('Child')
  }
}
