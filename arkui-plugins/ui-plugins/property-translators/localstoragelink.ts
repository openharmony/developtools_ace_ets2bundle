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

import { backingField, expectName } from '../../common/arkts-utils';
import { PropertyTranslator } from './base';
import { GetterSetter, InitializerConstructor } from './types';
import { DecoratorNames, generateToRecord } from './utils';

function getLocalStorageLinkValueStr(node: arkts.AstNode): string | undefined {
    if (!arkts.isClassProperty(node) || !node.value) return undefined;
    return arkts.isStringLiteral(node.value) ? node.value.str : undefined;
}

function getLocalStorageLinkAnnotationValue(anno: arkts.AnnotationUsage): string | undefined {
    const isStorageLinkAnnotation: boolean =
        !!anno.expr && arkts.isIdentifier(anno.expr) && anno.expr.name === DecoratorNames.LOCAL_STORAGE_LINK;

    if (isStorageLinkAnnotation && anno.properties.length === 1) {
        return getLocalStorageLinkValueStr(anno.properties.at(0)!);
    }
    return undefined;
}

function getLocalStorageLinkValueInAnnotation(node: arkts.ClassProperty): string | undefined {
    const annotations: readonly arkts.AnnotationUsage[] = node.annotations;

    for (let i = 0; i < annotations.length; i++) {
        const anno: arkts.AnnotationUsage = annotations[i];
        const str: string | undefined = getLocalStorageLinkAnnotationValue(anno);
        if (!!str) {
            return str;
        }
    }

    return undefined;
}

export class LocalStorageLinkTranslator extends PropertyTranslator implements InitializerConstructor, GetterSetter {
    translateMember(): arkts.AstNode[] {
        const originalName: string = expectName(this.property.key);
        const newName: string = backingField(originalName);

        this.cacheTranslatedInitializer(newName, originalName); // TODO: need to release cache after some point...
        return this.translateWithoutInitializer(newName, originalName);
    }

    cacheTranslatedInitializer(newName: string, originalName: string): void {
        const currentStructInfo: arkts.StructInfo = arkts.GlobalInfo.getInfoInstance().getStructInfo(this.structName);
        const initializeStruct: arkts.AstNode = this.generateInitializeStruct(newName, originalName);
        currentStructInfo.initializeBody.push(initializeStruct);

        if (currentStructInfo.isReusable) {
            const toRecord = generateToRecord(newName, originalName);
            currentStructInfo.toRecordBody.push(toRecord);
        }

        arkts.GlobalInfo.getInfoInstance().setStructInfo(this.structName, currentStructInfo);
    }

    generateInitializeStruct(newName: string, originalName: string): arkts.AstNode {
        const localStorageLinkValueStr: string | undefined = getLocalStorageLinkValueInAnnotation(this.property);
        if (!localStorageLinkValueStr) {
            throw new Error('LocalStorageLink required only one value!!'); // TODO: replace this with proper error message.
        }

        const call = arkts.factory.createCallExpression(
            arkts.factory.createIdentifier('StorageLinkState'),
            this.property.typeAnnotation ? [this.property.typeAnnotation] : [],
            [
                arkts.factory.createMemberExpression(
                    arkts.factory.createThisExpression(),
                    arkts.factory.createIdentifier('_entry_local_storage_'),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
                arkts.factory.createStringLiteral(localStorageLinkValueStr),
                this.property.value ?? arkts.factory.createUndefinedLiteral(),
            ]
        );

        return arkts.factory.createAssignmentExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createThisExpression(),
                arkts.factory.createIdentifier(newName),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
            call
        );
    }
}
