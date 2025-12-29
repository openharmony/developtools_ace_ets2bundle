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

// Expected: The private properties 'title' and 'count' of 'Demo' must not be initialized externally.
// Actual: The 'Parent2' component attempts to initialize these private properties via the constructor, 
// triggering a violation of this private parameter validation rule.

@Component
struct Demo {
  private title: string = "default";
  private count: number = 0;

  build() {
    Column() {
      Text(this.title)
      Text(`${this.count}`)
    }
  }
}

@Entry
@Component
struct Parent2 {
  build() {
    Column() {
      Demo({
        title: "new title",
        count: 100
      })
    }
  }
}