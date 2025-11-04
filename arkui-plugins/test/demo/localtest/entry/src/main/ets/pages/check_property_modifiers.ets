/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Entry, Component, Column, Text } from '@ohos.arkui.component'
import { Consume, State, Provide, StoragePropRef, StorageLink, LocalStoragePropRef, LocalStorageLink } from "@ohos.arkui.stateManagement";

//#1
@Entry
@Component
struct Child1struct03 {
    @StoragePropRef("a") public local_prop_value: string = "hello";
    @LocalStorageLink("b") public local_link_value: string = "hello";
    @StorageLink("c") public storage_link_value: string = "hello";
    @LocalStoragePropRef("a") public consume_value: string;

    build() {}
}
//#2
@Entry
@Component
struct testOne {
    @Consume public consumeOne: string = 'consumeOne';
    @State public stateOne: string = 'stateOne';
    @Provide public provideOne: string = 'provideOne';
    @StoragePropRef('storageOne') public storagePropOne: string = 'storagePropOne';
    @StorageLink('storageOne') public storageLinkOne: string = 'storageLinkOne';
    @LocalStoragePropRef('storageTwo') public localStoragePropOne: string = 'localStoragePropOne';
    @LocalStorageLink('storageTwo') public localStorageLinkOne: string = 'localStorageLinkOne';

    build() {
        Column() {
            Text(this.consumeOne);
        }
    }
}
//#3
@Entry
@Component
struct testOne {
    @Consume consumeOne: string = 'consumeOne';
    @State public stateOne: string = 'stateOne';
    @Provide public provideOne: string = 'provideOne';
    @StoragePropRef('storageOne') storagePropOne: string = 'storagePropOne';
    @StorageLink('storageOne') storageLinkOne: string = 'storageLinkOne';

    build() {
        Column() {
            Text(this.consumeOne);
        }
    }
}
//#4
@Entry
@Component
struct testOne {
    @Consume public consumeOne: string = 'consumeOne';
    @State public stateOne: string = 'stateOne';
    @Provide public provideOne: string = 'provideOne';
    @LocalStoragePropRef('storageTwo') public localStoragePropOne: string = 'localStoragePropOne';
    @LocalStorageLink('storageTwo') public localStorageLinkOne: string = 'localStorageLinkOne';

    build() {
        Column() {
            Text(this.consumeOne);
        }
    }
}
