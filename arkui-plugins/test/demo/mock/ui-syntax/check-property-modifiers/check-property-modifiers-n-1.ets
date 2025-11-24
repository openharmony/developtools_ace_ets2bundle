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

import { Entry, Component, Column, Text, Row, FontWeight } from '@ohos.arkui.component'
import { State, StorageLink, LocalStorageLink, Link, ObjectLink, Observed, StoragePropRef } from '@ohos.arkui.stateManagement'

@Observed
export class Foo {}

@Component
struct Index {
  @State message: string = 'Hello World';

  // Property 'storageLink' can not be decorated with both @StorageLink and public.
  @StorageLink('name') public storageLink: string = 'name';
  // Property 'storageProp' can not be decorated with both @StoragePropRef and public.
  @StoragePropRef('name') public storageProp: string = 'name';
  // Property 'localStorageLink' can not be decorated with both @LocalStorageLink and public.
  @LocalStorageLink('name') public localStorageLink: string = 'name';
  // Property 'localStorageProp' can not be decorated with both @StoragePropRef and public.
  @StoragePropRef('name') public localStorageProp: string = 'name';

  // Property 'link' can not be decorated with both @Link and private.
  @Link private link: string;
  // Property 'objLink' can not be decorated with both @ObjectLink and private.
  @ObjectLink private objLink: Foo;

  // The member attributes of a struct can not be protected.
  protected regular: string = 'regular';
  // The member attributes of a struct can not be protected.
  @State protected state: string = 'state'

  build() {
    Row() {
      Column() {
        Text(this.message)
          .fontSize(50)
          .fontWeight(FontWeight.Bold)
      }
      .width('100%')
    }
    .height('100%')
  }
}

@Entry
@Component
struct A {
  build() {
  }
}