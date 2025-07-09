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
import { factory } from './factory';
import { isAnnotation } from '../../common/arkts-utils';
import { StructDecoratorNames, EntryParamNames, EntryWrapperNames } from '../../common/predefines';

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
 * get annotation's properties in `@Entry()`: storage, useSharedStorage, routeName.
 *
 * @param node class definition node
 */
export function getEntryParams(node: arkts.ClassDefinition): Record<EntryParamNames, arkts.ClassProperty | undefined> {
    const annotation = node.annotations.find((anno) => isAnnotation(anno, StructDecoratorNames.ENTRY));
    const result = {
        storage: undefined,
        useSharedStorage: undefined,
        routeName: undefined,
    } as Record<EntryParamNames, arkts.ClassProperty | undefined>;
    if (!annotation || !annotation.properties) {
        return result;
    }
    for (const prop of annotation.properties) {
        if (arkts.isClassProperty(prop) && prop.key && arkts.isIdentifier(prop.key)) {
            const name = prop.key.name as EntryParamNames;
            if (name in result) {
                result[name] = prop;
            }
        }
    }
    return result;
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