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

import { Entry, Component, Column, Text } from '@ohos.arkui.component';
import { Link, Watch } from "@ohos.arkui.stateManagement";

// Expected: The @Link decorated 'watchedLink' cannot be declared as private.
// Actual: Property is decorated with both @Link and @Watch, but explicitly marked private.

@Entry
@Component
struct MultiDecoratorPrivate {
  @Link @Watch('onLinkChange') private watchedLink: number;

  onLinkChange() {
    console.log('Link Changed');
  }

  build() {
    Column() {
      Text(this.watchedLink.toString())
    }
  }
}