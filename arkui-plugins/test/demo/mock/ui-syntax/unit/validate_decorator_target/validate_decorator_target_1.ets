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

import { Entry, Component, ReusableV2, Reusable, ComponentV2, Preview, CustomDialog } from '@ohos.arkui.component';

// Expected: The '@ReusableV2' decorator can only be applied to 'struct' types.
// Actual: '@ReusableV2' is applied to a 'class' or 'function' (Info, InfoReusable, InfoComponent, ...),
// which is invalid and causes a plugin error.

@Entry
@Component
struct ValidateDecoratorDemo {
  build(){
  }
}

@ReusableV2
class Info {}

@Reusable
class InfoReusable {}

@Component
class InfoComponent {}

@ComponentV2
class InfoComponentV2 {}

@Preview
class InfoPreview {}

@CustomDialog
class InfoCustomDialog {}