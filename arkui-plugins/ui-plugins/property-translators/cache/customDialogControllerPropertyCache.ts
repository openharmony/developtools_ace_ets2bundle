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
import { CustomDialogNames } from '../../../common/predefines';
import { expectNameInTypeReference } from '../../../common/arkts-utils';
import { isDeclFromArkUI } from '../../../collectors/ui-collectors/utils';

export interface CustomDialogControllerPropertyInfo {
    propertyName: string;
    controllerTypeName: string;
}

function findCustomDialogControllerTypeName(
    node: arkts.TypeNode | undefined,
    ignoreDecl: boolean = false
): string | undefined {
    if (!node) {
        return undefined;
    }
    if (arkts.isETSUnionType(node)) {
        for (const typeNode of node.types) {
            const controllerName = findCustomDialogControllerTypeName(typeNode, ignoreDecl);
            if (!!controllerName) {
                return controllerName;
            }
        }
        return undefined;
    }
    if (arkts.isETSTypeReference(node)) {
        const nameNode = expectNameInTypeReference(node);
        if (!nameNode) {
            return undefined;
        }
        const decl = arkts.getPeerIdentifierDecl(nameNode.peer);
        if (!decl || !arkts.isClassDefinition(decl)) {
            return undefined;
        }
        if (!ignoreDecl && !isDeclFromArkUI(decl)) {
            return undefined;
        }
        if (nameNode.name === CustomDialogNames.CUSTOM_DIALOG_CONTROLLER) {
            return nameNode.name;
        }
        return undefined;
    }
    return undefined;
}

function collectInfoFromProperty(
    node: arkts.ClassProperty,
    typeNode: arkts.TypeNode | undefined,
    ignoreDecl: boolean = false
): CustomDialogControllerPropertyInfo | undefined {
    const key = node.key;
    if (!key || !arkts.isIdentifier(key) || !typeNode) {
        return undefined;
    }
    const controllerTypeName = findCustomDialogControllerTypeName(typeNode, ignoreDecl);
    if (!controllerTypeName) {
        return undefined;
    }
    return { propertyName: key.name, controllerTypeName };
}

export class CustomDialogControllerPropertyCache {
    private _cache: Map<string, CustomDialogControllerPropertyInfo>;
    private static instance: CustomDialogControllerPropertyCache;

    private constructor() {
        this._cache = new Map<string, CustomDialogControllerPropertyInfo>();
    }

    static getInstance(): CustomDialogControllerPropertyCache {
        if (!this.instance) {
            this.instance = new CustomDialogControllerPropertyCache();
        }
        return this.instance;
    }

    reset(): void {
        this._cache.clear();
    }

    getInfo(className: string): CustomDialogControllerPropertyInfo | undefined {
        return this._cache.get(className);
    }

    collect(
        property: arkts.ClassProperty,
        propertyType: arkts.TypeNode | undefined,
        className: string,
        ignoreDecl: boolean = false
    ): void {
        const info = collectInfoFromProperty(property, propertyType, ignoreDecl);
        if (!!info) {
            this._cache.set(className, info);
        }
    }
}
