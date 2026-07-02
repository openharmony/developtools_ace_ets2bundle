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

import { Resource, WrappedBuilder, Builder } from "@ohos.arkui.component";

declare const EXPORT_RESOURCE: Resource;

declare const EXPORT_RAWFILE: Resource;

declare const EXPORT_WRAPPED_BUILDER: WrappedBuilder<@Builder (value: string, size: number) => void>;

export { EXPORT_RESOURCE, EXPORT_RAWFILE, EXPORT_WRAPPED_BUILDER };