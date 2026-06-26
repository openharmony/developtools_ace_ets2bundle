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

import { Builder } from "@ohos.arkui.component";

@Builder type nonExportBuilderType = () => void;

type nonExportBuilderType2 = @Builder () => void;

export @Builder type exportBuilderType = () => void;

export type exportBuilderType2 = @Builder () => void;

interface IBuilderInArgs {
    mockBuilderMethod1(builderType: nonExportBuilderType): void;
    mockBuilderMethod2(builderType: nonExportBuilderType2): void;
    mockBuilderMethod3(builderType: exportBuilderType): void;
    mockBuilderMethod4(builderType: exportBuilderType2): void;
}

export { IBuilderInArgs };