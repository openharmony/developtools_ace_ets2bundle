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
 
import {
  Entry,
  Text,
  Column,
  Component,
  Row
} from '@ohos.arkui.component';
import { Link, State } from '@ohos.arkui.stateManagement';

const ITEMS_ON_SCREEN = 8;

@Entry
@Component
struct IDataSourcePrefetchingMethods {
  @State loadedCount: string = "0"

  build() {
    Column() {
      PictureItemComponent({ loadedCount: this.loadedCount })
        .height(`${50 / ITEMS_ON_SCREEN}%`)
        .finishRender()
    }
    .height('100%')
    .width('100%')
  }
}

@Component
struct PictureItemComponent {
  @Link loadedCount: string;

  finishRender(): void {}

  build() {
    Row() {
      Text(this.loadedCount)
        .width('60%')
    }
  }
}
