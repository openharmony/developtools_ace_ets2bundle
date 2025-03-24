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

import { memo, __memo_context_type, __memo_id_type } from "@ohos.arkui.stateManagement.runtime"
import { Dimension, Length, ResourceColor } from "@ohos.arkui.component.units";
// import { IlluminatedType } from "./enums";

@Retention({policy: "SOURCE"})
export @interface BuilderLambda {
    value: string
}

@Retention({policy: "SOURCE"})
export declare @interface ComponentBuilder {};

@Retention({policy: "SOURCE"})
export declare @interface BuilderParam {};

@Retention({policy: "SOURCE"})
export declare @interface Builder {};

export declare interface LightSource {
    positionX: Dimension;
    positionY: Dimension;
    positionZ: Dimension;
    intensity: number;
    color?: ResourceColor;
}

export declare interface PointLightStyle {
    lightSource?: LightSource;
    // illuminated?: IlluminatedType;
    bloom?: number;
}

export declare interface CommonMethod {
    @memo
    width(w: Length): this;
    @memo
    height(h: Length): this;
    @memo
    backgroundColor(color: ResourceColor): this;
}