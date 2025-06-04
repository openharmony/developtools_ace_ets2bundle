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
import { factory } from './factory';
import { isAnnotation } from '../../common/arkts-utils';
import { StructDecoratorNames } from '../../common/predefines';

export enum EntryWrapperNames {
    ENTRY_FUNC = 'entry',
    WRAPPER_CLASS_NAME = '__EntryWrapper',
    ENTRY_STORAGE_ANNOTATION_KEY = 'storage',
    ENTRY_STORAGE_LOCAL_STORAGE_PROPERTY_NAME = '_entry_local_storage_',
    ENTRY_POINT_CLASS_NAME = 'EntryPoint',
}

/**
 * @deprecated
 */
export class EntryHandler {
    private entryDefClassName: Set<string>;

    private static instance: EntryHandler;

    private constructor() {
        this.entryDefClassName = new Set<string>();
    }

    public static getInstance(): EntryHandler {
        if (!this.instance) {
            this.instance = new EntryHandler();
        }
        return this.instance;
    }

    public rememberEntryFunction(classname: string): void {
        this.entryDefClassName.add(classname);
    }

    public createEntryWrapper(): arkts.ClassDeclaration[] {
        let result: arkts.ClassDeclaration[] = [];
        this.entryDefClassName.forEach((classname) => {
            result.push(factory.generateEntryWrapper(classname));
        });
        return result;
    }
}

export function isEntryWrapperClass(node: arkts.AstNode): node is arkts.ClassDeclaration {
    if (!arkts.isClassDeclaration(node)) return false;
    const className = node?.definition?.ident?.name;
    if (!className) return false;
    return className === EntryWrapperNames.WRAPPER_CLASS_NAME;
}

/**
 * find `{storage: "<name>"}` in `@Entry({storage: "<name>"})` (i.e. annotation's properties).
 *
 * @param node class definition node
 */
export function findEntryWithStorageInClassAnnotations(node: arkts.ClassDefinition): arkts.ClassProperty | undefined {
    const annotation = node.annotations.find((anno) => {
        if (!isAnnotation(anno, StructDecoratorNames.ENTRY)) return false;
        const property = anno.properties?.at(0);
        if (!property || !arkts.isClassProperty(property)) return false;
        if (!property.key || !arkts.isIdentifier(property.key)) return false;
        if (!property.value || !arkts.isStringLiteral(property.value)) return false;
        return property.key.name === EntryWrapperNames.ENTRY_STORAGE_ANNOTATION_KEY;
    });
    return annotation?.properties?.at(0) as arkts.ClassProperty | undefined;
}
