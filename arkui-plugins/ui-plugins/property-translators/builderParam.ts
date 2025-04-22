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
    createSetter,
    generateThisBackingValue,
    generateThisBacking,
    getValueInAnnotation,
    DecoratorNames,
} from './utils';
import { PropertyTranslator } from './base';
import { GetterSetter, InitializerConstructor } from './types';
import { backingField, expectName } from '../../common/arkts-utils';
import { createOptionalClassProperty } from '../utils';
import { factory } from './factory';

export class BuilderParamTranslator extends PropertyTranslator implements InitializerConstructor, GetterSetter {
    translateMember(): arkts.AstNode[] {
        const originalName: string = expectName(this.property.key);
        const newName: string = backingField(originalName);
        this.cacheTranslatedInitializer(newName, originalName); // TODO: need to release cache after some point...
        return this.translateWithoutInitializer(newName, originalName);
    }

    cacheTranslatedInitializer(newName: string, originalName: string): void {
        const currentStructInfo: arkts.StructInfo = arkts.GlobalInfo.getInfoInstance().getStructInfo(this.structName);
        const mutableThis: arkts.Expression = generateThisBacking(newName);
        const initializeStruct: arkts.AstNode = this.generateInitializeStruct(mutableThis, originalName);
        currentStructInfo.initializeBody.push(initializeStruct);
        arkts.GlobalInfo.getInfoInstance().setStructInfo(this.structName, currentStructInfo);
    }

    translateWithoutInitializer(newName: string, originalName: string): arkts.AstNode[] {
        const field: arkts.ClassProperty = createOptionalClassProperty(newName, this.property, '',
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE, true);
        const thisGetValue: arkts.Expression = generateThisBacking(newName, false, true);
        const thisSetValue: arkts.Expression = generateThisBacking(newName, false, false);
        const getter: arkts.MethodDefinition = this.translateGetter(
            originalName,
            this.property.typeAnnotation,
            thisGetValue
        );
        const setter: arkts.MethodDefinition = this.translateSetter(
            originalName,
            this.property.typeAnnotation,
            thisSetValue
        );

        return [field, getter, setter];
    }

    translateGetter(
        originalName: string,
        typeAnnotation: arkts.TypeNode | undefined,
        returnValue: arkts.Expression
    ): arkts.MethodDefinition {
        return createGetter(originalName, typeAnnotation, returnValue, true);
    }

    translateSetter(
        originalName: string,
        typeAnnotation: arkts.TypeNode | undefined,
        left: arkts.Expression
    ): arkts.MethodDefinition {
        const right: arkts.Identifier = arkts.factory.createIdentifier('value');
        return createSetter(originalName, typeAnnotation, left, right, true);
    }

    generateInitializeStruct(mutableThis: arkts.Expression, originalName: string): arkts.AstNode {
        return arkts.factory.createAssignmentExpression(
            mutableThis,
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
            arkts.factory.createBinaryExpression(
                factory.createBlockStatementForOptionalExpression(
                    arkts.factory.createIdentifier('initializers'),
                    originalName
                ),
                this.property.value ?? arkts.factory.createUndefinedLiteral(),
                arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_NULLISH_COALESCING
            )
        );
    }
}
