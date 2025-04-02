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
import { createGetter, createSetter, getStageManagementIdent } from './utils';
import { createOptionalClassProperty } from '../utils';

export abstract class PropertyTranslator {
    constructor(
        protected property: arkts.ClassProperty,
        protected structName: string,
    ) {}

    abstract translateMember(): arkts.AstNode[];

    translateWithoutInitializer(newName: string, originalName: string): arkts.AstNode[] {
        const field = createOptionalClassProperty(
            newName,
            this.property,
            getStageManagementIdent(this.property),
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE,
        );

        const member = arkts.factory.createTSNonNullExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createThisExpression(),
                arkts.factory.createIdentifier(newName),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false,
            ),
        );
        const thisValue: arkts.MemberExpression = arkts.factory.createMemberExpression(
            member,
            arkts.factory.createIdentifier('value'),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false,
        );

        const getter: arkts.MethodDefinition = this.translateGetter(
            originalName,
            this.property.typeAnnotation,
            thisValue,
        );
        const setter: arkts.MethodDefinition = this.translateSetter(
            originalName,
            this.property.typeAnnotation,
            thisValue,
        );
        return [field, getter, setter];
    }

    translateGetter(
        originalName: string,
        typeAnnotation: arkts.TypeNode | undefined,
        returnValue: arkts.MemberExpression,
    ): arkts.MethodDefinition {
        return createGetter(originalName, typeAnnotation, returnValue);
    }

    translateSetter(
        originalName: string,
        typeAnnotation: arkts.TypeNode | undefined,
        left: arkts.MemberExpression,
    ): arkts.MethodDefinition {
        const right: arkts.CallExpression = arkts.factory.createCallExpression(
            arkts.factory.createIdentifier('observableProxy'),
            undefined,
            [arkts.factory.createIdentifier('value')],
        );
        return createSetter(originalName, typeAnnotation, left, right);
    }
}
