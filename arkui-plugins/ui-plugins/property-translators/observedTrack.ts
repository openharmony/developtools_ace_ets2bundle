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
import { annotation, backingField, expectName } from '../../common/arkts-utils';
import { DecoratorNames, StateManagementTypes } from '../../common/predefines';
import { collectStateManagementTypeImport, hasDecorator, hasDecoratorName, removeDecorator } from './utils';
import { ClassScopeInfo } from './types';
import { factory } from './factory';

export class ObservedTrackTranslator {
    protected property: arkts.ClassProperty;
    protected classScopeInfo: ClassScopeInfo;
    private hasImplement: boolean;
    private isTracked: boolean;

    constructor(property: arkts.ClassProperty, classScopeInfo: ClassScopeInfo) {
        this.property = property;
        this.classScopeInfo = classScopeInfo;
        this.hasImplement = expectName(this.property.key).startsWith('<property>');
        this.isTracked = hasDecorator(this.property, DecoratorNames.TRACK);
    }

    translateMember(): arkts.AstNode[] {
        if (!this.isTracked && (this.classScopeInfo.classHasTrack || !this.classScopeInfo.isObserved)) {
            return [this.property];
        }
        const originalName: string = this.hasImplement
            ? this.removeImplementProperty(expectName(this.property.key))
            : expectName(this.property.key);
        const newName: string = backingField(originalName);
        const field = this.createField(originalName, newName);
        this.transformGetterSetter(originalName, newName);
        return [...field];
    }

    createField(originalName: string, newName: string): arkts.ClassProperty[] {
        const backingField = arkts.factory.createClassProperty(
            arkts.factory.createIdentifier(newName),
            this.property.value,
            this.property.typeAnnotation,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE,
            false
        );
        const annotations: arkts.AnnotationUsage[] = [...this.property.annotations];
        if (
            !hasDecoratorName(this.property, DecoratorNames.JSONSTRINGIFYIGNORE) &&
            !hasDecoratorName(this.property, DecoratorNames.JSONRENAME)) {
            annotations.push(
                annotation(DecoratorNames.JSONRENAME).addProperty(
                    arkts.factory.createClassProperty(
                        arkts.factory.createIdentifier('newName'),
                        arkts.factory.createStringLiteral(originalName),
                        undefined,
                        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
                        false
                    )
                )
            );
        }
        backingField.setAnnotations(annotations);
        removeDecorator(backingField, DecoratorNames.TRACK);
        if (!this.isTracked) {
            return [backingField];
        }
        const metaField = this.metaField(originalName);
        metaField.setAnnotations([annotation(DecoratorNames.JSONSTRINGIFYIGNORE)]);
        return [backingField, metaField];
    }

    createGetter(originalName: string, newName: string): arkts.MethodDefinition {
        const conditionalAddRef = arkts.factory.createExpressionStatement(
            arkts.factory.createCallExpression(
                arkts.factory.createMemberExpression(
                    arkts.factory.createThisExpression(),
                    arkts.factory.createIdentifier('conditionalAddRef'),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
                undefined,
                [
                    arkts.factory.createMemberExpression(
                        arkts.factory.createThisExpression(),
                        this.metaIdentifier(originalName),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    ),
                ]
            )
        );
        const returnMember: arkts.ReturnStatement = arkts.factory.createReturnStatement(this.genThisBacking(newName));

        const body = arkts.factory.createBlock([conditionalAddRef, returnMember]);

        const scriptFunction = arkts.factory.createScriptFunction(
            body,
            arkts.FunctionSignature.createFunctionSignature(undefined, [], this.property.typeAnnotation, false),
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_GETTER,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC
        );

        return arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET,
            arkts.factory.createIdentifier(originalName),
            scriptFunction,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
            false
        );
    }

    createSetter(originalName: string, newName: string): arkts.MethodDefinition {
        const ifEqualsNewValue: arkts.IfStatement = this.setterIfEqualsNewValue(originalName, newName);
        const body = arkts.factory.createBlock([ifEqualsNewValue]);
        const param = arkts.factory.createParameterDeclaration(
            arkts.factory.createIdentifier('newValue', this.property.typeAnnotation),
            undefined
        );

        const scriptFunction = arkts.factory.createScriptFunction(
            body,
            arkts.FunctionSignature.createFunctionSignature(undefined, [param], undefined, false),
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_SETTER,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC
        );

        return arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET,
            arkts.factory.createIdentifier(originalName),
            scriptFunction,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
            false
        );
    }

    genThisBacking(newName: string): arkts.MemberExpression {
        return arkts.factory.createMemberExpression(
            arkts.factory.createThisExpression(),
            arkts.factory.createIdentifier(newName),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        );
    }

    metaIdentifier(originalName: string): arkts.Identifier {
        return this.isTracked
            ? arkts.factory.createIdentifier(`${StateManagementTypes.META}_${originalName}`)
            : arkts.factory.createIdentifier(StateManagementTypes.META);
    }

    removeImplementProperty(originalName: string): string {
        const prefix = '<property>';
        return originalName.substring(prefix.length);
    }

    transformGetterSetter(originalName: string, newName: string): void {
        const newGetter = this.createGetter(originalName, newName);
        const newSetter = this.createSetter(originalName, newName);
        if (this.hasImplement) {
            {
                const idx: number = this.classScopeInfo.getters.findIndex(
                    (getter) => getter.name.name === originalName
                );
                const originGetter: arkts.MethodDefinition = this.classScopeInfo.getters[idx];
                const originSetter: arkts.MethodDefinition = originGetter.overloads[0];
                const updateGetter: arkts.MethodDefinition = arkts.factory.updateMethodDefinition(
                    originGetter,
                    originGetter.kind,
                    newGetter.name,
                    newGetter.scriptFunction.addFlag(arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD),
                    originGetter.modifiers,
                    false
                );
                arkts.factory.updateMethodDefinition(
                    originSetter,
                    originSetter.kind,
                    newSetter.name,
                    newSetter.scriptFunction
                        .addFlag(arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_OVERLOAD)
                        .addFlag(arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD),
                    originSetter.modifiers,
                    false
                );
                this.classScopeInfo.getters[idx] = updateGetter;
            }
        } else {
            this.classScopeInfo.getters.push(...[newGetter, newSetter]);
        }
    }

    metaField(originalName: string): arkts.ClassProperty {
        collectStateManagementTypeImport(StateManagementTypes.MUTABLE_STATE_META);
        return arkts.factory.createClassProperty(
            arkts.factory.createIdentifier(`${StateManagementTypes.META}_${originalName}`),
            factory.generateStateMgmtFactoryCall(StateManagementTypes.MAKE_MUTABLESTATE_META, undefined, [], false),
            arkts.factory.createTypeReference(
                arkts.factory.createTypeReferencePart(
                    arkts.factory.createIdentifier(StateManagementTypes.MUTABLE_STATE_META)
                )
            ),
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE,
            false
        );
    }

    setterIfEqualsNewValue(originalName: string, newName: string): arkts.IfStatement {
        const backingValue = this.genThisBacking(newName);

        const setNewValue = arkts.factory.createExpressionStatement(
            arkts.factory.createAssignmentExpression(
                backingValue,
                arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
                arkts.factory.createIdentifier('newValue')
            )
        );

        const fireChange = arkts.factory.createExpressionStatement(
            arkts.factory.createCallExpression(
                arkts.factory.createMemberExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createThisExpression(),
                        this.metaIdentifier(originalName),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    ),
                    arkts.factory.createIdentifier('fireChange'),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
                undefined,
                undefined
            )
        );

        const subscribingWatches = arkts.factory.createExpressionStatement(
            arkts.factory.createCallExpression(
                arkts.factory.createMemberExpression(
                    arkts.factory.createThisExpression(),
                    arkts.factory.createIdentifier('executeOnSubscribingWatches'),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
                undefined,
                [arkts.factory.createStringLiteral(originalName)]
            )
        );

        return arkts.factory.createIfStatement(
            arkts.factory.createBinaryExpression(
                backingValue,
                arkts.factory.createIdentifier('newValue'),
                arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_NOT_STRICT_EQUAL
            ),
            arkts.factory.createBlock([setNewValue, fireChange, subscribingWatches])
        );
    }
}
