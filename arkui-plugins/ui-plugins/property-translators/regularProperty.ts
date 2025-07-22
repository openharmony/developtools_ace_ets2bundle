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
    generateToRecord,
    generateThisBacking,
    createSetter2,
    PropertyCache,
    isCustomDialogController,
} from './utils';
import { InterfacePropertyTranslator, InterfacePropertyTypes, PropertyTranslator } from './base';
import { GetterSetter, InitializerConstructor } from './types';
import { backingField, expectName } from '../../common/arkts-utils';
import { factory } from './factory';
import { CustomComponentNames } from '../utils';

export class RegularPropertyTranslator extends PropertyTranslator implements InitializerConstructor, GetterSetter {
    translateMember(): arkts.AstNode[] {
        const originalName: string = expectName(this.property.key);
        const newName: string = backingField(originalName);
        this.cacheTranslatedInitializer(newName, originalName);
        return this.translateWithoutInitializer(newName, originalName);
    }

    cacheTranslatedInitializer(newName: string, originalName: string): void {
        const value = this.property.value ?? arkts.factory.createUndefinedLiteral();
        let initializeStruct: arkts.AstNode = this.generateInitializeStruct(newName, originalName, value);
        if (
            !!this.property.typeAnnotation &&
            !!this.structInfo.annotations.customdialog &&
            isCustomDialogController(this.property.typeAnnotation)
        ) {
            initializeStruct = this.generateControllerInit(originalName, initializeStruct);
        }
        PropertyCache.getInstance().collectInitializeStruct(this.structInfo.name, [initializeStruct]);
        if (!!this.structInfo.annotations?.reusable) {
            const toRecord = generateToRecord(newName, originalName);
            PropertyCache.getInstance().collectToRecord(this.structInfo.name, [toRecord]);
        }
    }

    translateWithoutInitializer(newName: string, originalName: string): arkts.AstNode[] {
        const field: arkts.ClassProperty = factory.createOptionalClassProperty(
            newName,
            this.property,
            undefined,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE
        );
        const thisValue: arkts.Expression = generateThisBacking(newName, false, false);
        const thisSet: arkts.ExpressionStatement = arkts.factory.createExpressionStatement(
            arkts.factory.createAssignmentExpression(
                thisValue,
                arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
                arkts.factory.createIdentifier('value')
            )
        );
        const getter: arkts.MethodDefinition = this.translateGetter(
            originalName,
            this.property.typeAnnotation,
            arkts.factory.createTSAsExpression(thisValue, this.property.typeAnnotation, false)
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

    generateInitializeStruct(newName: string, originalName: string, value: arkts.Expression): arkts.AstNode {
        const binaryItem = arkts.factory.createBinaryExpression(
            factory.createBlockStatementForOptionalExpression(
                arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_INITIALIZERS_NAME),
                originalName
            ),
            value ?? arkts.factory.createUndefinedLiteral(),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_NULLISH_COALESCING
        );
        const assign: arkts.AssignmentExpression = arkts.factory.createAssignmentExpression(
            generateThisBacking(newName),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
            binaryItem
        );
        return arkts.factory.createExpressionStatement(assign);
    }

    generateControllerInit(originalName: string, initializeStruct: arkts.AstNode): arkts.AstNode {
        return arkts.factory.createIfStatement(
            factory.createBlockStatementForOptionalExpression(
                arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_INITIALIZERS_NAME),
                originalName
            ),
            arkts.factory.createBlock([initializeStruct])
        );
    }
}

export class RegularInterfaceTranslator<T extends InterfacePropertyTypes> extends InterfacePropertyTranslator<T> {
    translateProperty(): T {
        return this.property;
    }

    static canBeTranslated(node: arkts.AstNode): node is InterfacePropertyTypes {
        return true;
    }
}
