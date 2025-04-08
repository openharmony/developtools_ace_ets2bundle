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
import {
    DecoratorNames,
    generateToRecord,
    createGetter,
    createSetter2,
    generateThisBacking,
    generateGetOrSetCall,
    judgeIfAddWatchFunc
} from './utils';
import { createOptionalClassProperty } from '../utils';

function getStoragePropValueStr(node: arkts.AstNode): string | undefined {
    if (!arkts.isClassProperty(node) || !node.value) return undefined;

    return arkts.isStringLiteral(node.value) ? node.value.str : undefined;
}

function getStoragePropAnnotationValue(anno: arkts.AnnotationUsage): string | undefined {
    const isStoragePropAnnotation: boolean =
        !!anno.expr && arkts.isIdentifier(anno.expr) && anno.expr.name === DecoratorNames.STORAGE_PROP;

    if (isStoragePropAnnotation && anno.properties.length === 1) {
        return getStoragePropValueStr(anno.properties.at(0)!);
    }
    return undefined;
}

function getStoragePropValueInAnnotation(node: arkts.ClassProperty): string | undefined {
    const annotations: readonly arkts.AnnotationUsage[] = node.annotations;

    for (let i = 0; i < annotations.length; i++) {
        const anno: arkts.AnnotationUsage = annotations[i];
        const str: string | undefined = getStoragePropAnnotationValue(anno);
        if (!!str) {
            return str;
        }
    }
    return undefined;
}

export class StoragePropTranslator extends PropertyTranslator implements InitializerConstructor, GetterSetter {
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
        const storagePropValueStr: string | undefined = getStoragePropValueInAnnotation(this.property);
        if (!storagePropValueStr) {
            throw new Error('StorageProp required only one value!!'); // TODO: replace this with proper error message.
        }

        const args: arkts.Expression[] = [
            arkts.factory.createStringLiteral(storagePropValueStr),
            arkts.factory.create1StringLiteral(originalName),
            this.property.value ?? arkts.factory.createIdentifier('undefined'),
        ];
        judgeIfAddWatchFunc(args, this.property);

        const newClass = arkts.factory.createETSNewClassInstanceExpression(
            arkts.factory.createTypeReference(
                arkts.factory.createTypeReferencePart(
                    arkts.factory.createIdentifier('StoragePropDecoratedVariable'),
                    arkts.factory.createTSTypeParameterInstantiation(
                        this.property.typeAnnotation ? [this.property.typeAnnotation] : [],
                    ),
                ),
            ),
            args
        );

        return arkts.factory.createAssignmentExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createThisExpression(),
                arkts.factory.createIdentifier(newName),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false,
            ),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
            newClass,
        );
    }

    translateWithoutInitializer(newName: string, originalName: string): arkts.AstNode[] {
        const field = createOptionalClassProperty(
            newName,
            this.property,
            'StoragePropDecoratedVariable',
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE,
        );
        const thisValue: arkts.Expression = generateThisBacking(newName, false, true);
        const thisGet: arkts.CallExpression = generateGetOrSetCall(thisValue, 'get');
        const thisSet: arkts.ExpressionStatement = arkts.factory.createExpressionStatement(
            generateGetOrSetCall(thisValue, 'set'),
        );
        const getter: arkts.MethodDefinition = this.translateGetter(
            originalName,
            this.property.typeAnnotation,
            thisGet,
        );
        const setter: arkts.MethodDefinition = this.translateSetter(
            originalName,
            this.property.typeAnnotation,
            thisSet,
        );
        return [field, getter, setter];
    }

    translateGetter(
        originalName: string,
        typeAnnotation: arkts.TypeNode | undefined,
        returnValue: arkts.Expression,
    ): arkts.MethodDefinition {
        return createGetter(originalName, typeAnnotation, returnValue);
    }

    translateSetter(
        originalName: string,
        typeAnnotation: arkts.TypeNode | undefined,
        statement: arkts.AstNode,
    ): arkts.MethodDefinition {
        return createSetter2(originalName, typeAnnotation, statement);
    }
}
