/*
 * Copyright (C) 2025 Huawei Device Co., Ltd.
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

import { Entry, Component, Column } from '@ohos.arkui.component';
import { BuilderParam } from "@ohos.arkui.stateManagement";

// Expected: A '@BuilderParam' field must be initialized by a '@Builder' function or a '@Builder' method
// (such as 'this.someBuilder' or 'StructName.someBuilder'), not by arbitrary methods.
// Actual: In 'UpdateBuilderParamWithMemberExpressions', the '@BuilderParam' properties 'header' and 'footer'
// are initialized with non-builder methods ('notABuilder' and 'staticNotBuilder'), so they violate this rule.

@Component
struct UpdateBuilderParamWithMemberExpressions {
  @BuilderParam header: () => void = this.notABuilder;
  @BuilderParam footer: () => void = UpdateBuilderParamWithMemberExpressions.staticNotBuilder;

  build() {
    Column() {
      this.header();
      this.footer();
    }
  }

  static staticNotBuilder() {
    Column() {}
  }

  notABuilder() {
    Column() {}
  }
}

@Entry
@Component
struct UpdateBuilderParamWithMemberExpressionsParent {
  build() {
    Column() {
      UpdateBuilderParamWithMemberExpressions()
    }
  }
}
