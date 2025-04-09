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

import {
    generateToRecord,
    createGetter,
    createSetter2,
    generateGetOrSetCall,
    generateThisBacking,
    judgeIfAddWatchFunc,
} from './utils';
import { PropertyTranslator } from './base';
import { GetterSetter, InitializerConstructor } from './types';
import { backingField, expectName } from '../../common/arkts-utils';
import { createOptionalClassProperty } from '../utils';
import { factory } from './factory';

export class PropTranslator extends PropertyTranslator implements InitializerConstructor, GetterSetter {
    translateMember(): arkts.AstNode[] {
        const originalName: string = expectName(this.property.key);
        const newName: string = backingField(originalName);

        this.cacheTranslatedInitializer(newName, originalName); // TODO: need to release cache after some point...
        return this.translateWithoutInitializer(newName, originalName);
    }

    cacheTranslatedInitializer(newName: string, originalName: string): void {
        const currentStructInfo: arkts.StructInfo = arkts.GlobalInfo.getInfoInstance().getStructInfo(this.structName);
        const mutableThis: arkts.Expression = generateThisBacking(newName);
        const initializeStruct: arkts.AstNode = this.generateInitializeStruct(newName, originalName);
        const updateStruct: arkts.AstNode = this.generateUpdateStruct(mutableThis, originalName);
        currentStructInfo.initializeBody.push(initializeStruct);
        currentStructInfo.updateBody.push(updateStruct);
        if (currentStructInfo.isReusable) {
            const toRecord = generateToRecord(newName, originalName);
            currentStructInfo.toRecordBody.push(toRecord);
        }
        arkts.GlobalInfo.getInfoInstance().setStructInfo(this.structName, currentStructInfo);
    }

    translateWithoutInitializer(newName: string, originalName: string): arkts.AstNode[] {
        const field: arkts.ClassProperty = createOptionalClassProperty(
            newName,
            this.property,
            'PropDecoratedVariable',
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE
        );
        const thisValue: arkts.Expression = generateThisBacking(newName, false, true);
        const thisGet: arkts.CallExpression = generateGetOrSetCall(thisValue, 'get');
        const thisSet: arkts.ExpressionStatement = arkts.factory.createExpressionStatement(
            generateGetOrSetCall(thisValue, 'set')
        );
        const getter: arkts.MethodDefinition = this.translateGetter(
            originalName,
            this.property.typeAnnotation,
            thisGet
        );
        const setter: arkts.MethodDefinition = this.translateSetter(
            originalName,
            this.property.typeAnnotation,
            thisSet
        );

        return [field, getter, setter];
    }

    translateGetter(
        originalName: string,
        typeAnnotation: arkts.TypeNode | undefined,
        returnValue: arkts.Expression
    ): arkts.MethodDefinition {
        return createGetter(originalName, typeAnnotation, returnValue);
    }

    translateSetter(
        originalName: string,
        typeAnnotation: arkts.TypeNode | undefined,
        statement: arkts.AstNode
    ): arkts.MethodDefinition {
        return createSetter2(originalName, typeAnnotation, statement);
    }

    generateInitializeStruct(newName: string, originalName: string): arkts.AstNode {
        const binaryItem = arkts.factory.createBinaryExpression(
            factory.createBlockStatementForOptionalExpression(
                arkts.factory.createIdentifier('initializers'),
                originalName
            ),
            this.property.value ?? arkts.factory.createIdentifier('undefined'),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_NULLISH_COALESCING
        );
        const nonNullItem = arkts.factory.createTSNonNullExpression(
            factory.createNonNullOrOptionalMemberExpression('initializers', originalName, false, true)
        );
        const args: arkts.Expression[] = [
            arkts.factory.create1StringLiteral(originalName),
            this.property.value ? binaryItem : nonNullItem,
        ];
        judgeIfAddWatchFunc(args, this.property);
        const right = arkts.factory.createETSNewClassInstanceExpression(
            arkts.factory.createTypeReference(
                arkts.factory.createTypeReferencePart(
                    arkts.factory.createIdentifier('PropDecoratedVariable'),
                    arkts.factory.createTSTypeParameterInstantiation(
                        this.property.typeAnnotation ? [this.property.typeAnnotation] : []
                    )
                )
            ),
            args
        );
        const assign: arkts.AssignmentExpression = arkts.factory.createAssignmentExpression(
            generateThisBacking(newName),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
            right
        );
        return arkts.factory.createExpressionStatement(assign);
    }

    generateUpdateStruct(mutableThis: arkts.Expression, originalName: string): arkts.AstNode {
        const binaryItem = arkts.factory.createBinaryExpression(
            factory.createBlockStatementForOptionalExpression(
                arkts.factory.createIdentifier('initializers'),
                originalName
            ),
            arkts.factory.createUndefinedLiteral(),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_NOT_STRICT_EQUAL
        );
        const member: arkts.MemberExpression = arkts.factory.createMemberExpression(
            arkts.factory.createTSNonNullExpression(mutableThis),
            arkts.factory.createIdentifier('update'),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        );
        const nonNullItem = arkts.factory.createTSNonNullExpression(
            factory.createNonNullOrOptionalMemberExpression('initializers', originalName, false, true)
        );
        return arkts.factory.createIfStatement(
            binaryItem,
            arkts.factory.createBlock([
                arkts.factory.createExpressionStatement(
                    arkts.factory.createCallExpression(member, undefined, [nonNullItem])
                ),
            ])
        );
    }
}
