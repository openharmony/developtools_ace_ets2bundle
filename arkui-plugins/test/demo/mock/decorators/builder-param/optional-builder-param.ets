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

import { Component, Entry, Builder, BuilderParam, Column, Text, Row } from "@kit.ArkUI"

@Builder
function showTextBuilder() {
  Text('Hello World')
}

@Component
struct Child {
  @BuilderParam customBuilderParam2?: () => void;
  @BuilderParam customBuilderParam1: () => void = showTextBuilder;

  build() {
    Row() {
      if (this.customBuilderParam2) {
        (this.customBuilderParam2 as () => void)()
      }
      this.customBuilderParam1()
    }
  }
}

@Component
struct Parent {
  @Builder componentBuilder() {
    Text('Parent builder')
  }

  build() {
    Column() {
      Child()
    }
  }
}