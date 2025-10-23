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
import { DecoratorNames, StateManagementTypes, ObservedNames } from '../../common/predefines';
import { ObservedPropertyTranslator } from './base';
import {
    collectStateManagementTypeImport,
    generateThisBacking,
    hasDecorator,
    hasDecoratorName,
    removeDecorator,
    removeImplementProperty,
} from './utils';
import { ClassScopeInfo } from '../struct-translators/utils';
import { factory } from './factory';
import { factory as uiFactory } from '../ui-factory';
import { logDiagnostic } from '../interop/initstatevar';
import { getHasAnnotationObserved } from '../interop/interop';

export class ObservedTrackTranslator extends ObservedPropertyTranslator {
    private hasImplement: boolean;
    private isTracked: boolean;

    constructor(property: arkts.ClassProperty, classScopeInfo: ClassScopeInfo) {
        super(property, classScopeInfo);
        this.hasImplement = expectName(this.property.key).startsWith(ObservedNames.PROPERTY_PREFIX);
        this.isTracked = hasDecorator(this.property, DecoratorNames.TRACK);
        this.checkObservedV2WhenInterop(property);
    }

    checkObservedV2WhenInterop(property: arkts.ClassProperty): void {
        const isObservedFrom1_1 = getHasAnnotationObserved(property, 'ObservedV2');
        if (isObservedFrom1_1) {
            const errorMessage = `The type of the regular property can not be a class decorated with @ObservedV2 when interop`;
            logDiagnostic(errorMessage, property);
        }
    }

    translateMember(): arkts.AstNode[] {
        if (!this.isTracked && (this.classScopeInfo.classHasTrack || !this.classScopeInfo.isObserved)) {
            return [this.property];
        }
        const originalName: string = this.hasImplement
            ? removeImplementProperty(expectName(this.property.key))
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
            this.propertyType,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE,
            false
        );
        if (!this.property.value) {
            backingField.modifiers |= arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_OPTIONAL;
        }
        const annotations: arkts.AnnotationUsage[] = [...this.property.annotations];
        if (
            !hasDecoratorName(this.property, DecoratorNames.JSONSTRINGIFYIGNORE) &&
            !hasDecoratorName(this.property, DecoratorNames.JSONRENAME)
        ) {
            annotations.push(
                annotation(DecoratorNames.JSONRENAME).addProperty(
                    arkts.factory.createClassProperty(
                        arkts.factory.createIdentifier(ObservedNames.NEW_NAME),
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
        backingField.range = this.property.range;
        return [backingField, metaField];
    }

    createGetter(originalName: string, newName: string): arkts.MethodDefinition {
        const conditionalAddRef = arkts.factory.createExpressionStatement(
            arkts.factory.createCallExpression(generateThisBacking(ObservedNames.CONDITIONAL_ADD_REF), undefined, [
                arkts.factory.createMemberExpression(
                    arkts.factory.createThisExpression(),
                    this.metaIdentifier(originalName),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
            ])
        );
        const backingMember: arkts.Expression = generateThisBacking(newName);
        const returnMember: arkts.ReturnStatement = arkts.factory.createReturnStatement(
            this.property.value
                ? backingMember
                : arkts.factory.createTSAsExpression(backingMember, this.propertyType, false)
        );
        const body = arkts.factory.createBlock([conditionalAddRef, returnMember]);
        return uiFactory.createMethodDefinition({
            kind: arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET,
            key: arkts.factory.createIdentifier(originalName),
            function: {
                body: body,
                returnTypeAnnotation: this.propertyType,
                modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
                flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_GETTER,
            },
            modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
        });
    }

    createSetter(originalName: string, newName: string): arkts.MethodDefinition {
        const ifEqualsNewValue: arkts.IfStatement = this.setterIfEqualsNewValue(originalName, newName);
        const body = arkts.factory.createBlock([ifEqualsNewValue]);
        const param = arkts.factory.createParameterDeclaration(
            arkts.factory.createIdentifier(ObservedNames.NEW_VALUE, this.propertyType),
            undefined
        );

        return uiFactory.createMethodDefinition({
            kind: arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET,
            key: arkts.factory.createIdentifier(originalName),
            function: {
                body: body,
                params: [param],
                modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
                flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_SETTER,
            },
            modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
        });
    }

    metaIdentifier(originalName: string): arkts.Identifier {
        return this.isTracked
            ? arkts.factory.createIdentifier(`${StateManagementTypes.META}_${originalName}`)
            : arkts.factory.createIdentifier(StateManagementTypes.META);
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
            uiFactory.createTypeReferenceFromString(StateManagementTypes.MUTABLE_STATE_META),
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE,
            false
        );
    }

    setterIfEqualsNewValue(originalName: string, newName: string): arkts.IfStatement {
        const backingValue = generateThisBacking(newName);

        const setNewValue = arkts.factory.createExpressionStatement(
            arkts.factory.createAssignmentExpression(
                backingValue,
                arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
                arkts.factory.createIdentifier(ObservedNames.NEW_VALUE)
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
                    arkts.factory.createIdentifier(ObservedNames.FIRE_CHANGE),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
                undefined,
                undefined
            )
        );

        const subscribingWatches = arkts.factory.createExpressionStatement(
            arkts.factory.createCallExpression(generateThisBacking(ObservedNames.EXECUATE_WATCHES), undefined, [
                arkts.factory.createStringLiteral(originalName),
            ])
        );

        return arkts.factory.createIfStatement(
            arkts.factory.createBinaryExpression(
                backingValue,
                arkts.factory.createIdentifier(ObservedNames.NEW_VALUE),
                arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_NOT_STRICT_EQUAL
            ),
            arkts.factory.createBlock([setNewValue, fireChange, subscribingWatches])
        );
    }
}
