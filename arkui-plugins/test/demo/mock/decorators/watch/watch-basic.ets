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
 
import { Component, Entry, Column } from "@ohos.arkui.component"
import { State, PropRef, StorageLink, StorageProp, Link, Watch, ObjectLink, Observed, Track, Provide, Consume } from "@ohos.arkui.stateManagement"

@Observed
class A {
  propA: string = 'hello'
  @Track trackA: string = 'world'
}

@Entry
@Component
struct MyStateSample {
  @State @Watch('stateOnChange') statevar: string = 'Hello World';
  @PropRef @Watch('propOnChange') propvar: string = 'Hello World';
  @Link @Watch('linkOnChange') linkvar: string;
  @StorageLink('prop1') @Watch('storageLinkOnChange') storagelinkvar: string = 'Hello World';
  @StorageProp('prop2') @Watch('storagePropOnChange') storagepropvar: string = 'Hello World';
  @ObjectLink @Watch('objectLinkOnChange') objectlinkvar: A;
  @Provide @Watch('ProvideOnChange') providevar: string = 'Hello World';
  
  stateOnChange(propName: string) {}
  propOnChange(propName: string) {}
  linkOnChange(propName: string) {}
  storageLinkOnChange(propName: string) {}
  storagePropOnChange(propName: string) {}
  objectLinkOnChange(propName: string) {}
  ProvideOnChange(propName: string) {}

  build() {
    Column() {
      Child()
    }
  }
}

@Component
struct Child {
  @Consume @Watch('ConsumeOnChange') providevar: string;

  ConsumeOnChange(propName: string) {}

  build() {}
}