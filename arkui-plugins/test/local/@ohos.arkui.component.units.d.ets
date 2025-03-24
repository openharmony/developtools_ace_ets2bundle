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

import { Resource } from "@ohos.arkui.external.resource"
import { Color } from "@ohos.arkui.component.enums";

export type PX = string;
export type VP = string | number;
export type FP = string;
export type LPX = string;
export type Percentage = string;

export type Dimension = PX | VP | FP | LPX | Percentage | Resource;

export type Length = string | number | Resource;

export type ResourceColor = Color | number | string | Resource;