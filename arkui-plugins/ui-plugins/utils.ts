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

import * as arkts from "@koalaui/libarkts"

export function createCustomComponentInitializerOptions(className: string): arkts.Identifier {
    return arkts.factory.createIdentifier(
        'initializers',
        arkts.factory.createTypeReferenceFromId(
            createInitializerOptions(className)
        )
    )
}

// TODO: currently, we forcely assume initializerOptions is named in pattern __Options_xxx
export function createInitializerOptions(className: string): arkts.Identifier {
    return arkts.factory.createIdentifier(`__Options_${className}`);
}

// TODO: currently, we forcely assume initializerOptions is named in pattern __Options_xxx
export function getCustomComponentNameFromInitializerOptions(name: string): string | undefined {
    const prefix: string = '__Options_';
    if (name.startsWith(prefix)) {
        return name.substring(prefix.length);
    }
}