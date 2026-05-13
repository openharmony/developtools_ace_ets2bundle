/*
 * Copyright (C) 2026 Huawei Device Co., Ltd.
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

import { Text, Column, Component, Entry, Button, ClickEvent, ExtendableStack, StackOptions, Length, LayoutPolicy, Alignment } from "@ohos.arkui.component"

class MyStack extends ExtendableStack {
  setStackOptions(options: StackOptions): this {
    super.setStackOptions(options);
    return this;
  }

  override width(value: Length | LayoutPolicy | undefined): this {
    super.width(value);
    return this;
  }

  height(value: Length): this {
    super.height(value);
    return this;
  }

  newAttribute(value: int): this {
    return this;
  }
}

@Entry
@Component
struct MyStateSample {
  build() {
    MyStack({ alignContent: Alignment.Bottom }) {
      Text("Hello World")
    }
    .height('50%')
    .width('100%')
    .newAttribute(5)
  }
}
