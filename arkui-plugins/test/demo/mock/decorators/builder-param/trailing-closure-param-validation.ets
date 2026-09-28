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

import { Component, Builder, BuilderParam, Column } from "@ohos.arkui.component"

// Invalid: the last @BuilderParam has a required parameter, so the trailing
// closure case must report an error
@Component
struct ChildRequiredParam {
  @Builder
  closeBuilder() {
  }

  @BuilderParam close1: (a: number, b?: number) => void = this.closeBuilder;
  build() {
    Column() {
    }
  }
}

// Valid: the last @BuilderParam has no parameters
@Component
struct ChildNoParam {
  @Builder
  noParamBuilder() {
  }

  @BuilderParam ok1: () => void = this.noParamBuilder;
  build() {
    Column() {
    }
  }
}

// Valid: the last @BuilderParam has only optional parameters
@Component
struct ChildOptionalParam {
  @Builder
  optionalParamBuilder() {
  }

  @BuilderParam ok2: (a?: number) => void = this.optionalParamBuilder;
  build() {
    Column() {
    }
  }
}

// Valid: a required-parameter @BuilderParam that is not the last one is not checked
@Component
struct ChildNonLastParam {
  @Builder
  reqBuilder() {
  }

  @BuilderParam req1: (a: number) => void = this.reqBuilder;
  @Builder
  lastBuilder() {
  }

  @BuilderParam ok3: () => void = this.lastBuilder;
  build() {
    Column() {
    }
  }
}

@Component
struct Parent {
  build() {
    Column() {
      ChildRequiredParam({}) {
      }
      ChildNoParam({}) {
      }
      ChildOptionalParam({}) {
      }
      ChildNonLastParam({}) {
      }
    }
  }
}
