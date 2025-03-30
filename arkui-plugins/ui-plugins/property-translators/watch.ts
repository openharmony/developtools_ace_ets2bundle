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
import { InitializerConstructor } from './types';
import { DecoratorNames } from './utils';

export class WatchTranslator extends PropertyTranslator implements InitializerConstructor {
    constructor(
        protected property: arkts.ClassProperty,
        protected structName: string,
        protected translator?: PropertyTranslator,
    ) {
        super(property, structName);
    }

    translateMember(): arkts.AstNode[] {
        const allNodes = this.translator?.translateMember();

        if (!allNodes) {
            // ONLY @WATCH, THROW ERROR
            throw new Error('@Watch decorator must be used with other statemanagement decorators');
        }

        const originalName: string = expectName(this.property.key);
        const newName: string = backingField(originalName);
        this.cacheTranslatedInitializer(newName, originalName);

        return allNodes;
    }

    cacheTranslatedInitializer(newName: string, originalName: string): void {
        const currentStructInfo: arkts.StructInfo = arkts.GlobalInfo.getInfoInstance().getStructInfo(this.structName);
        const updateStruct: arkts.AstNode = this.generateUpdateStruct(newName, originalName);
        currentStructInfo.updateBody.push(updateStruct);
    }

    translateWithoutInitializer(newName: string, originalName: string): arkts.AstNode[] {
        throw new Error('Method not implemented.');
    }

    generateUpdateStruct(newName: string, originalName: string): arkts.AstNode {
        const first = arkts.factory.createMemberExpression(
            arkts.factory.createThisExpression(),
            this.property.key!,
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false,
        );
        const body = arkts.factory.createBlock([
            arkts.factory.createReturnStatement(
                arkts.factory.createCallExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createThisExpression(),
                        arkts.factory.createIdentifier(getWatchValueInAnnotation(this.property)!),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false,
                    ),
                    undefined,
                    [arkts.factory.createStringLiteral(originalName)],
                ),
            ),
        ]);

        const params = [
            arkts.factory.createParameterDeclaration(
                arkts.factory.createIdentifier('_', this.property.typeAnnotation),
                undefined,
            ),
        ];

        const second = arkts.factory.createArrowFunction(
            arkts.factory.createScriptFunction(
                body,
                arkts.FunctionSignature.createFunctionSignature(undefined, params, undefined, false),
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
            ),
        );

        return arkts.factory.createExpressionStatement(
            arkts.factory.createCallExpression(arkts.factory.createIdentifier('OnChange'), undefined, [first, second]),
        );
    }
}

function getWatchValueStr(node: arkts.AstNode): string | undefined {
    if (!arkts.isClassProperty(node) || !node.value) return undefined;
    return arkts.isStringLiteral(node.value) ? node.value.str : undefined;
}

function getWatchAnnotationValue(anno: arkts.AnnotationUsage): string | undefined {
    const isWatchAnnotation: boolean =
        !!anno.expr && arkts.isIdentifier(anno.expr) && anno.expr.name === DecoratorNames.WATCH;

    if (isWatchAnnotation && anno.properties.length === 1) {
        return getWatchValueStr(anno.properties.at(0)!);
    }
    return undefined;
}

function getWatchValueInAnnotation(node: arkts.ClassProperty): string | undefined {
    const annotations: readonly arkts.AnnotationUsage[] = node.annotations;

    for (let i = 0; i < annotations.length; i++) {
        const anno: arkts.AnnotationUsage = annotations[i];
        const str: string | undefined = getWatchAnnotationValue(anno);
        if (!!str) {
            return str;
        }
    }

    return undefined;
}
