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

import { Builder, Text, Color, WrappedBuilder, wrapBuilder, Component, ComponentV2, Row, ForEach } from '@ohos.arkui.component';
import { State, PropRef, Link, Provide, Consume, StorageLink, StoragePropRef, LocalStorageLink, LocalStoragePropRef } from '@ohos.arkui.stateManagement';
import { Local, Param, Provider, Once, Consumer } from '@ohos.arkui.stateManagement';

@Builder
function MyBuilder(value: string, size: number) {}

@Builder
function YourBuilder(value: string, size: number) {}

@ComponentV2
struct Index2 {
  builderRegular: (@Builder (value: string, size: number) => void) = MyBuilder;
  builderRegular2: WrappedBuilder<(@Builder (value: string, size: number) => void)> = wrapBuilder(MyBuilder);
  builderRegular3: WrappedBuilder<(@Builder (value: string, size: number) => void)>[] = [wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)];

  @Local builderLocal: (@Builder (value: string, size: number) => void) = MyBuilder;
  @Local builderLocal2: WrappedBuilder<(@Builder (value: string, size: number) => void)> = wrapBuilder(MyBuilder);
  @Local builderLocal3: WrappedBuilder<(@Builder (value: string, size: number) => void)>[] = [wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)];

  @Param builderParam: (@Builder (value: string, size: number) => void) = MyBuilder;
  @Param builderParam2: WrappedBuilder<(@Builder (value: string, size: number) => void)> = wrapBuilder(MyBuilder);
  @Param builderParam3: WrappedBuilder<(@Builder (value: string, size: number) => void)>[] = [wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)];

  @Once @Param builderOnceParam: (@Builder (value: string, size: number) => void) = MyBuilder;
  @Once @Param builderOnceParam2: WrappedBuilder<(@Builder (value: string, size: number) => void)> = wrapBuilder(MyBuilder);
  @Once @Param builderOnceParam3: WrappedBuilder<(@Builder (value: string, size: number) => void)>[] = [wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)];

  @Provider builderProvider: (@Builder (value: string, size: number) => void) = MyBuilder;
  @Provider builderProvider2: WrappedBuilder<(@Builder (value: string, size: number) => void)> = wrapBuilder(MyBuilder);
  @Provider builderProvider3: WrappedBuilder<(@Builder (value: string, size: number) => void)>[] = [wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)];
  
  @Consumer builderConsumer: (@Builder (value: string, size: number) => void) = MyBuilder;
  @Consumer builderConsumer2: WrappedBuilder<(@Builder (value: string, size: number) => void)> = wrapBuilder(MyBuilder);
  @Consumer builderConsumer3: WrappedBuilder<(@Builder (value: string, size: number) => void)>[] = [wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)];

  build() {
    Row() {
      this.builderRegular('Hello World', 50);
      this.builderRegular2.builder('Hello World', 50);
      ForEach(this.builderRegular3, (item: WrappedBuilder<(@Builder (value: string, size: number) => void)>) => {
        item.builder('Hello World', 50)
      })
      this.builderProvider('Hello World', 50);
      this.builderProvider2.builder('Hello World', 50);
      ForEach(this.builderProvider3, (item: WrappedBuilder<(@Builder (value: string, size: number) => void)>) => {
        item.builder('Hello World', 50)
      })
    }
  }
}

@Component
struct Index {
  builderRegular: (@Builder (value: string, size: number) => void) = MyBuilder;
  builderRegular2: WrappedBuilder<(@Builder (value: string, size: number) => void)> = wrapBuilder(MyBuilder);
  builderRegular3: WrappedBuilder<(@Builder (value: string, size: number) => void)>[] = [wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)];

  @State builderState: (@Builder (value: string, size: number) => void) = MyBuilder;
  @State builderState2: WrappedBuilder<(@Builder (value: string, size: number) => void)> = wrapBuilder(MyBuilder);
  @State builderState3: WrappedBuilder<(@Builder (value: string, size: number) => void)>[] = [wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)];

  @PropRef builderPropRef: (@Builder (value: string, size: number) => void) = MyBuilder;
  @PropRef builderPropRef2: WrappedBuilder<(@Builder (value: string, size: number) => void)> = wrapBuilder(MyBuilder);
  @PropRef builderPropRef3: WrappedBuilder<(@Builder (value: string, size: number) => void)>[] = [wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)];

  @Link builderLink: (@Builder (value: string, size: number) => void);
  @Link builderLink2: WrappedBuilder<(@Builder (value: string, size: number) => void)>;
  @Link builderLink3: WrappedBuilder<(@Builder (value: string, size: number) => void)>[];

  @Provide builderProvide: (@Builder (value: string, size: number) => void) = MyBuilder;
  @Provide builderProvide2: WrappedBuilder<(@Builder (value: string, size: number) => void)> = wrapBuilder(MyBuilder);
  @Provide builderProvide3: WrappedBuilder<(@Builder (value: string, size: number) => void)>[] = [wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)];

  @Consume builderConsume: (@Builder (value: string, size: number) => void);
  @Consume builderConsume2: WrappedBuilder<(@Builder (value: string, size: number) => void)>;
  @Consume builderConsume3: WrappedBuilder<(@Builder (value: string, size: number) => void)>[];

  @StorageLink('aa') builderStorageLink: (@Builder (value: string, size: number) => void) = MyBuilder;
  @StorageLink('aa') builderStorageLink2: WrappedBuilder<(@Builder (value: string, size: number) => void)> = wrapBuilder(MyBuilder);
  @StorageLink('aa') builderStorageLink3: WrappedBuilder<(@Builder (value: string, size: number) => void)>[] = [wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)];

  @StoragePropRef('aa') builderStoragePropRef: (@Builder (value: string, size: number) => void) = MyBuilder;
  @StoragePropRef('aa') builderStoragePropRef2: WrappedBuilder<(@Builder (value: string, size: number) => void)> = wrapBuilder(MyBuilder);
  @StoragePropRef('aa') builderStoragePropRef3: WrappedBuilder<(@Builder (value: string, size: number) => void)>[] = [wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)];

  @LocalStorageLink('aa') builderLocalStorageLink: (@Builder (value: string, size: number) => void) = MyBuilder;
  @LocalStorageLink('aa') builderLocalStorageLink2: WrappedBuilder<(@Builder (value: string, size: number) => void)> = wrapBuilder(MyBuilder);
  @LocalStorageLink('aa') builderLocalStorageLink3: WrappedBuilder<(@Builder (value: string, size: number) => void)>[] = [wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)];

  @LocalStoragePropRef('aa') builderLocalStoragePropRef: (@Builder (value: string, size: number) => void) = MyBuilder;
  @LocalStoragePropRef('aa') builderLocalStoragePropRef2: WrappedBuilder<(@Builder (value: string, size: number) => void)> = wrapBuilder(MyBuilder);
  @LocalStoragePropRef('aa') builderLocalStoragePropRef3: WrappedBuilder<(@Builder (value: string, size: number) => void)>[] = [wrapBuilder(MyBuilder), wrapBuilder(YourBuilder)];

  build() {
    Row() {
      this.builderRegular('Hello World', 50);
      this.builderRegular2.builder('Hello World', 50);
      ForEach(this.builderRegular3, (item: WrappedBuilder<(@Builder (value: string, size: number) => void)>) => {
        item.builder('Hello World', 50)
      })
      this.builderLocalStorageLink('Hello World', 50);
      this.builderLocalStorageLink2.builder('Hello World', 50);
      ForEach(this.builderLocalStorageLink3, (item: WrappedBuilder<(@Builder (value: string, size: number) => void)>) => {
        item.builder('Hello World', 50)
      })
    }
  }
}