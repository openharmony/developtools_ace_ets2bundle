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

import * as arkts from '@koalaui/libarkts';
import * as path from 'path';
import { isAnnotation } from '../../common/arkts-utils';
import { StructDecoratorNames, EntryParamNames, EntryWrapperNames, ARKUI_NAVIGATION_SOURCE_NAME, NavigationNames, ARKUI_NAV_DESTINATION_SOURCE_NAME } from '../../common/predefines';

export function isEntryWrapperClass(node: arkts.AstNode): node is arkts.ClassDeclaration {
    if (!arkts.isClassDeclaration(node)) return false;
    const className = node?.definition?.ident?.name;
    if (!className) return false;
    return className === EntryWrapperNames.WRAPPER_CLASS_NAME;
}

/**
 * get annotation's properties in `@Entry()`: storage, useSharedStorage, routeName.
 *
 * @param node class definition node
 */
export function getEntryRouteParam(node: arkts.ClassDefinition): arkts.ClassProperty | undefined {
    const annotation = node.annotations.find((anno) => isAnnotation(anno, StructDecoratorNames.ENTRY));
    let routeName: arkts.ClassProperty | undefined = undefined;
    if (!annotation || !annotation.properties) {
        return routeName;
    }
    for (const prop of annotation.properties) {
        if (arkts.isClassProperty(prop) && prop.key && arkts.isIdentifier(prop.key)) {
            const name = prop.key.name;
            if (name === EntryParamNames.ENTRY_ROUTE_NAME) {
                routeName = prop;
            }
        }
    }
    return routeName;
}

/**
 * Computes and formats a relative path by removing `.ets` extension and normalizing path separators to `/`.
 */
export function getRelativePagePath(from: string, to: string): string {
    return path
        .relative(from, to)
        .replace(/\\/g, '/')
        .replace(/\.ets$/, '');
}

/**
 * Find if interface `NavigationModuleInfo` or `NavDestinationModuleInfo` is declared in statements
 */
export function findNavigationModuleInfo(
    statements: readonly arkts.AstNode[], 
    externalSourceName: string
): boolean {
    for (const statement of statements) {
        if (!arkts.isTSInterfaceDeclaration(statement)) {
            continue;
        }
        const interfaceName: string | undefined = statement.id?.name;
        if (externalSourceName === ARKUI_NAVIGATION_SOURCE_NAME && interfaceName === NavigationNames.NAVIGATION_MODULE_INFO) {
            return true;
        }
        if (externalSourceName === ARKUI_NAV_DESTINATION_SOURCE_NAME && interfaceName === NavigationNames.NAV_DESTINATION_MODULE_INFO) {
            return true;
        }
    }
    return false;
}