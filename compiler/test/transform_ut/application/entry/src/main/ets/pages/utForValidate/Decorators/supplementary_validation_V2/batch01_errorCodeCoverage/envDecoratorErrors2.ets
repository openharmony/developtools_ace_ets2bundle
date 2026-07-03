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

// Test @Env decorator errors - triggers 10905251, 10905304, 10905121

// @Env with wrong type in V1 - 10905251 + 10905304 (default value)
@Component
struct EnvWrongType {
  @Env invalidEnv: string = 'test';

  build() {
    Column() {
      Text('Test')
    }
  }
}

// @Env with wrong type in V2 (no default value to avoid 10905362 conflict)
@ComponentV2
struct EnvWrongTypeV2 {
  @Param dummy: string = '';
  @Env invalidEnv: number;

  build() {
    Column() {
      Text('Test')
    }
  }
}

// @Env initialization in V1 with decorated variable - 10905121 + 10905304
@Component
struct EnvInitV1Error {
  @State @Env invalidInit: WindowSizeLayoutBreakpointInfo = SystemProperties.BREAKPOINT;

  build() {
    Column() {
      Text('Test')
    }
  }
}

// @Env initialization in V2 with wrong decorator - 10905121
@ComponentV2
struct EnvInitV2Error {
  @Param dummy: string = '';
  @Local @Env invalidInit: WindowSizeLayoutBreakpointInfo;

  build() {
    Column() {
      Text('Test')
    }
  }
}

// @Env with invalid parameter in V1 - 10905304
@Component
struct EnvInvalidParam {
  @Env breakPoint: WindowSizeLayoutBreakpointInfo = SystemProperties.COLOR_MODE;

  build() {
    Column() {
      Text('Test')
    }
  }
}
