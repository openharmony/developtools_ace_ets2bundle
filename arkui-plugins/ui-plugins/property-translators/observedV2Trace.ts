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
import { DecoratorNames, ObservedNames, StateManagementTypes } from '../../common/predefines';
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
import { ImportCollector } from '../../common/import-collector';
import { logDiagnostic } from '../interop/initstatevar';
import { getHasAnnotationObserved } from '../interop/interop';

export class ObservedV2TraceTranslator extends ObservedPropertyTranslator {
    private hasImplement: boolean;
    private isTraced: boolean;
    private isStatic: boolean;

    constructor(property: arkts.ClassProperty, classScopeInfo: ClassScopeInfo) {
        super(property, classScopeInfo);
        this.hasImplement = expectName(this.property.key).startsWith(ObservedNames.PROPERTY_PREFIX);
        this.isTraced = hasDecorator(this.property, DecoratorNames.TRACE);
        this.checkObservedWhenInterop(property);
        this.isStatic = arkts.hasModifierFlag(this.property, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC);
    }

    checkObservedWhenInterop(property: arkts.ClassProperty): void {
        const isObservedFrom1_1 = getHasAnnotationObserved(property, 'Observed');
        if (isObservedFrom1_1) {
            const errorMessage = `The type of the regular property can not be a class decorated with @Observed when interop`;
            logDiagnostic(errorMessage, property);
        }
    }

    translateMember(): arkts.AstNode[] {
        if (!this.isTraced) {
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
            this.isStatic
                ? arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC
                : arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE,
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
        removeDecorator(backingField, DecoratorNames.TRACE);
        const metaField = this.metaField(originalName);
        metaField.setAnnotations([annotation(DecoratorNames.JSONSTRINGIFYIGNORE)]);
        return [backingField, metaField];
    }

    createGetter(
        originalName: string,
        newName: string,
        methodModifier: arkts.Es2pandaModifierFlags
    ): arkts.MethodDefinition {
        const classIdent: arkts.Identifier = arkts.factory.createIdentifier(this.classScopeInfo.className);
        ImportCollector.getInstance().collectImport(StateManagementTypes.UI_UTILS);
        const observedMember: arkts.Expression = this.isStatic
            ? uiFactory.generateMemberExpression(classIdent.clone(), newName)
            : generateThisBacking(newName);
        const returnMember: arkts.ReturnStatement = arkts.factory.createReturnStatement(
            arkts.factory.createCallExpression(
                uiFactory.generateMemberExpression(
                    arkts.factory.createIdentifier(StateManagementTypes.UI_UTILS),
                    StateManagementTypes.MAKE_OBSERVED
                ),
                undefined,
                [
                    this.property.value
                        ? observedMember
                        : arkts.factory.createTSAsExpression(observedMember, this.propertyType, false),
                ]
            )
        );
        const body = arkts.factory.createBlock([this.createAddRef(originalName, classIdent), returnMember]);
        return uiFactory.createMethodDefinition({
            kind: arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET,
            key: arkts.factory.createIdentifier(originalName),
            function: {
                body: body,
                returnTypeAnnotation: this.propertyType,
                modifiers: methodModifier,
                flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_GETTER,
            },
            modifiers: methodModifier,
        });
    }

    createSetter(
        originalName: string,
        newName: string,
        methodModifier: arkts.Es2pandaModifierFlags
    ): arkts.MethodDefinition {
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
                modifiers: methodModifier,
                flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_SETTER,
            },
            modifiers: methodModifier,
        });
    }

    transformGetterSetter(originalName: string, newName: string): void {
        const methodModifier = this.isStatic
            ? arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC
            : arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
        const newGetter = this.createGetter(originalName, newName, methodModifier);
        const newSetter = this.createSetter(originalName, newName, methodModifier);
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
            this.isStatic
                ? arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC
                : arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE,
            false
        );
    }

    createAddRef(originalName: string, classIdent: arkts.Identifier): arkts.ExpressionStatement {
        const metaName: string = `${StateManagementTypes.META}_${originalName}`;
        const conditionalAddRef = arkts.factory.createExpressionStatement(
            arkts.factory.createCallExpression(generateThisBacking(ObservedNames.CONDITIONAL_ADD_REF), undefined, [
                generateThisBacking(metaName),
            ])
        );
        const metaAddRef = arkts.factory.createExpressionStatement(
            arkts.factory.createCallExpression(
                uiFactory.generateMemberExpression(
                    uiFactory.generateMemberExpression(classIdent.clone(), metaName),
                    ObservedNames.ADD_REF
                ),
                undefined,
                undefined
            )
        );
        return this.isStatic ? metaAddRef : conditionalAddRef;
    }

    setterIfEqualsNewValue(originalName: string, newName: string): arkts.IfStatement {
        const classIdent: arkts.Identifier = arkts.factory.createIdentifier(this.classScopeInfo.className);
        const metaName: string = `${StateManagementTypes.META}_${originalName}`;
        const backingValue: arkts.Expression = generateThisBacking(newName);
        const metaValue: arkts.Expression = generateThisBacking(metaName);
        const staticMetaValue: arkts.Expression = uiFactory.generateMemberExpression(classIdent.clone(), metaName);
        const staticBackingValue: arkts.Expression = uiFactory.generateMemberExpression(classIdent.clone(), newName);
        const setNewValue = arkts.factory.createExpressionStatement(
            arkts.factory.createAssignmentExpression(
                this.isStatic ? staticBackingValue : backingValue,
                arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
                arkts.factory.createIdentifier(ObservedNames.NEW_VALUE)
            )
        );

        const fireChange = arkts.factory.createExpressionStatement(
            arkts.factory.createCallExpression(
                arkts.factory.createMemberExpression(
                    this.isStatic ? staticMetaValue.clone() : metaValue.clone(),
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

        const consequentArr = this.isStatic ? [setNewValue, fireChange] : [setNewValue, fireChange, subscribingWatches];
        return arkts.factory.createIfStatement(
            arkts.factory.createBinaryExpression(
                this.isStatic ? staticBackingValue.clone() : backingValue.clone(),
                arkts.factory.createIdentifier(ObservedNames.NEW_VALUE),
                arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_NOT_STRICT_EQUAL
            ),
            arkts.factory.createBlock(consequentArr)
        );
    }
}
