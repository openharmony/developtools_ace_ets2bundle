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

import { memo } from "@ohos.arkui.stateManagement.runtime";
import { ComponentBuilder, CommonMethod  } from "@ohos.arkui.component.common";
import { Length, ResourceColor  } from "@ohos.arkui.component.units";

@Retention({policy: "SOURCE"})
export declare @interface Component {};

@Retention({policy: "SOURCE"})
export declare @interface Entry { routeName: string };

@Retention({policy: "SOURCE"})
export declare @interface Reusable {};

export declare abstract class CustomComponent<T extends CustomComponent<T, T_Options>, T_Options> implements
    CommonMethod {

    @memo
    @ComponentBuilder
    static $_instantiate<S extends CustomComponent<S, S_Options>, S_Options>(
        factory: () => S,
        initializers?: S_Options,
        @memo
        content?: () => void
    ): S;

    // Life cycle for custom component
    aboutToAppear(): void;
    aboutToDisappear(): void;
    aboutToReuse(): void;
    aboutToRecycle(): void;

    @memo
    build(): void;

    // Implementation of common method
    @memo
    width(w: Length): this;
    @memo
    height(h: Length): this;
    @memo
    backgroundColor(color: ResourceColor): this;
}