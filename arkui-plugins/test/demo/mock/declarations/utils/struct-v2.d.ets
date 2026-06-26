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

import { CustomDialog, Component, ComponentV2, Entry, BuilderParam, Builder, Column, CustomDialogController } from "@ohos.arkui.component";
import { State, Link, Local, Param, Require, Computed, Monitor } from "@ohos.arkui.stateManagement";

@ComponentV2
declare struct ExportStructV2 {
    @Local someLocal: number;

    @BuilderParam someBuilderParam: () => void;

    @Computed
    get someComputed(): number;

    @Monitor(['someLocal'])
    onSomeLocalChanged(): void;

    @Builder
    build(): void;
}

@ComponentV2
declare struct NonExportStructV2 {
    @Local someLocal: number;

    @BuilderParam someBuilderParam: () => void;

    @Computed
    get someComputed(): number;

    @Monitor(['someLocal'])
    onSomeLocalChanged(): void;

    @Builder
    build(): void;
}

@ComponentV2
struct StructV2WithBody {
    @Local someLocal: number = 1;

    @BuilderParam someBuilderParam: () => void;

    @Computed
    get someComputed(): number {
        return this.someLocal;
    }

    @Monitor(['someLocal'])
    onSomeLocalChanged(): void {}

    build() {
        Column() {}
    }
}

@ComponentV2
struct ExportStructV2WithBody {
    @Local someLocal: number = 1;
    @Param someParam: number = 2;
    @Require @Param someRequiredParam: number;

    @BuilderParam someBuilderParam: () => void;

    @Computed
    get someComputed(): number {
        return this.someLocal;
    }

    @Monitor(['someLocal'])
    onSomeLocalChanged(): void {}

    build(): void {
        Column() {}
    }
}

export { ExportStructV2, ExportStructV2WithBody };