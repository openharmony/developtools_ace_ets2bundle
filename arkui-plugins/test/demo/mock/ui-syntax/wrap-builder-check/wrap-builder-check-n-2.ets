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

import { Entry, Component, Column, WrappedBuilder, wrapBuilder, Builder, Text, Stack, BuilderParam } from '@ohos.arkui.component'

type MyBuilderFuncType = @Builder (value: string, size: number) => void;

interface FormItemBuilderInterface {
  buildView(): WrappedBuilder<MyBuilderFuncType>;
}

class DesktopForm implements FormItemBuilderInterface {
  public buildView(): WrappedBuilder<MyBuilderFuncType> {
    // The wrapBuilder's parameter should be @Builder function.
    return wrapBuilder(buildFormItem);
  }
}

function buildFormItem(value: string, size: number) {
  Text(value).fontSize(size)
}

@Entry
@Component
struct AppFormItemView {
  @BuilderParam buildInterface?: FormItemBuilderInterface;

  build() {
    Column() {
      Stack() {

      }
    }
  }
}