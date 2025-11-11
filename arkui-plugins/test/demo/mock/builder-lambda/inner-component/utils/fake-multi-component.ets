/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

import { memo } from 'arkui.stateManagement.runtime';
import { ComponentBuilder } from 'arkui.component.builder';

interface FakeOptions {
    str?: string;
}

interface FakeComponentAAttribute {

}

interface FakeComponentBAttribute {

}

interface FakeComponentCAttribute {
    
}

@memo
@ComponentBuilder
export declare function FakeComponentA(
    str: string,
    @memo
    content_?: () => void,
): FakeComponentAAttribute;

@memo
@ComponentBuilder
export declare function FakeComponentB(
    options?: FakeOptions, 
    @memo
    content_?: () => void,
): FakeComponentBAttribute;

@memo
@ComponentBuilder
export declare function FakeComponentC(
    @memo
    content_?: () => void,
): FakeComponentCAttribute;