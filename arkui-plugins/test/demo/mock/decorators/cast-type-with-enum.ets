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

import { Component, ComponentV2 } from "@ohos.arkui.component";
import { State, PropRef, Link, Provide, Consume, StorageLink, StoragePropRef, LocalStorageLink, LocalStoragePropRef } from '@ohos.arkui.stateManagement';
import { Local, Param, Provider, Once, Consumer, Require } from '@ohos.arkui.stateManagement';
import { AEnumStr, AEnumNum } from './utils/enums';


@Component
struct ComponentV1Struct {
    @State stateVar1: AEnumStr = AEnumStr.A;
    @State stateVar2: string = AEnumStr.B;
    @State stateVar3: AEnumNum = AEnumNum.C;
    @State stateVar4: number = AEnumNum.D;

    @Consume consumeVar1: AEnumStr = AEnumStr.A;
    @Consume consumeVar2: string = AEnumStr.B;
    @Consume consumeVar3: AEnumNum = AEnumNum.C;
    @Consume consumeVar4: number = AEnumNum.D;

    regularVar1: AEnumStr = AEnumStr.A;
    regularVar2: string = AEnumStr.B;
    regularVar3: AEnumNum = AEnumNum.C;
    regularVar4: number = AEnumNum.D;

    @Require requireVar1: AEnumStr;
    @Require requireVar2: string;
    @Require requireVar3: AEnumNum;
    @Require requireVar4: number;

    build(): void {}
}

@ComponentV2
struct ComponentV2Struct {
    @Require @Param requireVar1: AEnumStr;
    @Require @Param requireVar2: string;
    @Require @Param requireVar3: AEnumNum;
    @Require @Param requireVar4: number;

    @Param paramVar1: AEnumStr = AEnumStr.A;
    @Param paramVar2: string = AEnumStr.B;
    @Param paramVar3: AEnumNum = AEnumNum.C;
    @Param paramVar4: number = AEnumNum.D;

    @Local localVar1: AEnumStr = AEnumStr.A;
    @Local localVar2: string = AEnumStr.B;
    @Local localVar3: AEnumNum = AEnumNum.C;
    @Local localVar4: number = AEnumNum.D;
    
    build(): void {}
}