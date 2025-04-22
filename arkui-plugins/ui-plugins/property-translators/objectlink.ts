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
    createGetter,
    DecoratorNames,
    generateGetOrSetCall,
    generateThisBacking,
    generateToRecord,
    hasDecorator,
    judgeIfAddWatchFunc,
} from './utils';
import { PropertyTranslator } from './base';
import { GetterSetter, InitializerConstructor } from './types';
import { backingField, expectName } from '../../common/arkts-utils';
import { factory } from './factory';
import { createOptionalClassProperty } from '../utils';

export class ObjectLinkTranslator extends PropertyTranslator implements InitializerConstructor, GetterSetter {
    translateMember(): arkts.AstNode[] {
        const originalName: string = expectName(this.property.key);
        const newName: string = backingField(originalName);
        if (!this.ifObservedDecoratedClass()) {
            throw new Error('@ObjectLink decorated property only accepts @Observed decorated class instance'); // TODO: replace this with proper error message.
        }

        this.cacheTranslatedInitializer(newName, originalName); // TODO: need to release cache after some point...
        return this.translateWithoutInitializer(newName, originalName);
    }

    cacheTranslatedInitializer(newName: string, originalName: string): void {
        const currentStructInfo: arkts.StructInfo = arkts.GlobalInfo.getInfoInstance().getStructInfo(this.structName);
        const initializeStruct: arkts.AstNode = this.generateInitializeStruct(newName, originalName);
        const updateStruct: arkts.AstNode = this.generateUpdateStruct(newName, originalName);
        currentStructInfo.initializeBody.push(initializeStruct);
        currentStructInfo.updateBody.push(updateStruct);

        if (currentStructInfo.isReusable) {
            const toRecord = generateToRecord(newName, originalName);
            currentStructInfo.toRecordBody.push(toRecord);
        }

        arkts.GlobalInfo.getInfoInstance().setStructInfo(this.structName, currentStructInfo);
    }

    generateInitializeStruct(newName: string, originalName: string): arkts.AstNode {
        const initializers = arkts.factory.createTSNonNullExpression(
            factory.createBlockStatementForOptionalExpression(
                arkts.factory.createIdentifier('initializers'),
                originalName
            )
        );

        const args: arkts.Expression[] = [arkts.factory.create1StringLiteral(originalName), initializers];
        judgeIfAddWatchFunc(args, this.property);

        const newClass = arkts.factory.createETSNewClassInstanceExpression(
            arkts.factory.createTypeReference(
                arkts.factory.createTypeReferencePart(
                    arkts.factory.createIdentifier('ObjectLinkDecoratedVariable'),
                    arkts.factory.createTSTypeParameterInstantiation(
                        this.property.typeAnnotation ? [this.property.typeAnnotation] : []
                    )
                )
            ),
            args
        );

        return arkts.factory.createAssignmentExpression(
            generateThisBacking(newName),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
            newClass
        );
    }

    generateUpdateStruct(newName: string, originalName: string): arkts.AstNode {
        const binaryItem = arkts.factory.createBinaryExpression(
            factory.createBlockStatementForOptionalExpression(
                arkts.factory.createIdentifier('initializers'),
                originalName
            ),
            arkts.factory.createUndefinedLiteral(),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_NOT_STRICT_EQUAL
        );
        const member: arkts.MemberExpression = arkts.factory.createMemberExpression(
            generateThisBacking(newName, false, true),
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

    translateWithoutInitializer(newName: string, originalName: string): arkts.AstNode[] {
        const field: arkts.ClassProperty = createOptionalClassProperty(
            newName,
            this.property,
            'ObjectLinkDecoratedVariable',
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE
        );
        const thisValue: arkts.Expression = generateThisBacking(newName, false, true);
        const thisGet: arkts.CallExpression = generateGetOrSetCall(thisValue, 'get');
        const getter: arkts.MethodDefinition = this.translateGetter(
            originalName,
            this.property.typeAnnotation,
            thisGet
        );
        return [field, getter];
    }

    translateGetter(
        originalName: string,
        typeAnnotation: arkts.TypeNode | undefined,
        returnValue: arkts.Expression
    ): arkts.MethodDefinition {
        return createGetter(originalName, typeAnnotation, returnValue);
    }

    ifObservedDecoratedClass(): boolean {
        if (this.property.typeAnnotation && arkts.isETSTypeReference(this.property.typeAnnotation)) {
            const decl = arkts.getDecl(this.property.typeAnnotation.part?.name!);
            if (arkts.isClassDefinition(decl!) && hasDecorator(decl, DecoratorNames.OBSERVED)) {
                return true;
            }
        }
        return false;
    }
}
