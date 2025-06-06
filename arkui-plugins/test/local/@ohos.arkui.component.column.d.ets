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

import { memo } from '../stateManagement/runtime';
import { ComponentBuilder, CommonMethod, PointLightStyle } from './common';
import { HorizontalAlign, FlexAlign } from './enums';

export declare interface ColumnOptions {
    space?: string | number;
}

export declare interface ColumnAttribute extends CommonMethod {
    @memo
    alignItems(value: HorizontalAlign): this;
    @memo
    justifyContent(value: FlexAlign): this;
    @memo
    pointLight(value: PointLightStyle): this;
    @memo
    reverse(isReversed?: boolean): this;
}

@memo
@ComponentBuilder
export declare function Column (
    options?: ColumnOptions,
    @memo
    content?: () => void
): ColumnAttribute;