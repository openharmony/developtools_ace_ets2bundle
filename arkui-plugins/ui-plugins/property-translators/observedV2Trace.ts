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
import {
    BaseObservedPropertyTranslator,
    IBaseObservedPropertyTranslator,
    ObservedPropertyCachedTranslator,
    ObservedPropertyCachedTranslatorOptions,
    ObservedPropertyTranslator,
    ObservedPropertyTranslatorOptions,
} from './base';
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

export function getterBodyWithObservedV2TraceProperty(
    this: IObservedV2TraceTranslator,
    originalName: string,
    newName: string
): arkts.BlockStatement {
    const classIdent: arkts.Identifier = arkts.factory.createIdentifier(this.className);
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
            [
                !this.property || this.property.value
                    ? observedMember
                    : arkts.factory.createTSAsExpression(observedMember, this.propertyType, false),
            ],
            undefined,
            false,
            false
        )
    );
    return arkts.factory.createBlockStatement([createAddRef.bind(this)(originalName, classIdent), returnMember]);
}

function getterWithObservedV2TraceProperty(
    this: IObservedV2TraceTranslator,
    originalName: string,
    newName: string
): arkts.MethodDefinition {
    const methodModifier = this.isStatic
        ? arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC
        : arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
    const body = getterBodyWithObservedV2TraceProperty.bind(this)(originalName, newName);
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

function setterWithObservedV2TraceProperty(
    this: IObservedV2TraceTranslator,
    originalName: string,
    newName: string
): arkts.MethodDefinition {
    const methodModifier = this.isStatic
        ? arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC
        : arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
    const ifEqualsNewValue: arkts.IfStatement = setterIfEqualsNewValueWithObservedV2TraceProperty.bind(this)(
        originalName,
        newName
    );
    const body = arkts.factory.createBlockStatement([ifEqualsNewValue]);
    const param = arkts.factory.createETSParameterExpression(
        arkts.factory.createIdentifier(ObservedNames.NEW_VALUE, this.propertyType),
        false,
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

function createAddRef(
    this: IObservedV2TraceTranslator,
    originalName: string,
    classIdent: arkts.Identifier
): arkts.ExpressionStatement {
    const metaName: string = `${StateManagementTypes.META}_${originalName}`;
    const conditionalAddRef = arkts.factory.createExpressionStatement(
        arkts.factory.createCallExpression(generateThisBacking(ObservedNames.CONDITIONAL_ADD_REF), [
                generateThisBacking(metaName),
            ],
            undefined,
            false,
            false
        )
    );
    const metaAddRef = arkts.factory.createExpressionStatement(
        arkts.factory.createCallExpression(
            uiFactory.generateMemberExpression(
                uiFactory.generateMemberExpression(classIdent.clone(), metaName),
                ObservedNames.ADD_REF
            ),
            [],
            undefined,
            false,
            false
        )
    );
    return this.isStatic ? metaAddRef : conditionalAddRef;
}

export function setterIfEqualsNewValueWithObservedV2TraceProperty(
    this: IObservedV2TraceTranslator,
    originalName: string,
    newName: string
): arkts.IfStatement {
    const classIdent: arkts.Identifier = arkts.factory.createIdentifier(this.className);
    const metaName: string = `${StateManagementTypes.META}_${originalName}`;
    const backingValue: arkts.Expression = generateThisBacking(newName);
    const metaValue: arkts.Expression = generateThisBacking(metaName);
    const staticMetaValue: arkts.Expression = uiFactory.generateMemberExpression(classIdent.clone(), metaName);
    const staticBackingValue: arkts.Expression = uiFactory.generateMemberExpression(classIdent.clone(), newName);
    const setNewValue = arkts.factory.createExpressionStatement(
        arkts.factory.createAssignmentExpression(
            this.isStatic ? staticBackingValue : backingValue,
            arkts.factory.createIdentifier(ObservedNames.NEW_VALUE),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION
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
            [],
            undefined,
            false,
            false
        )
    );

    const subscribingWatches = arkts.factory.createExpressionStatement(
        arkts.factory.createCallExpression(generateThisBacking(ObservedNames.EXECUATE_WATCHES), [
                arkts.factory.createStringLiteral(originalName),
            ],
            undefined,
            false,
            false
        )
    );

    const consequentArr = this.isStatic ? [setNewValue, fireChange] : [setNewValue, fireChange, subscribingWatches];
    return arkts.factory.createIfStatement(
        arkts.factory.createBinaryExpression(
            this.isStatic ? staticBackingValue.clone() : backingValue.clone(),
            arkts.factory.createIdentifier(ObservedNames.NEW_VALUE),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_NOT_STRICT_EQUAL
        ),
        arkts.factory.createBlockStatement(consequentArr)
    );
}

function checkObservedWhenInterop(property: arkts.ClassProperty): void {
    const isObservedFrom1_1 = getHasAnnotationObserved(property, 'Observed');
    if (isObservedFrom1_1) {
        const errorMessage = `The type of the regular property can not be a class decorated with @Observed when interop`;
        logDiagnostic(errorMessage, property);
    }
}

export interface IObservedV2TraceTranslator extends IBaseObservedPropertyTranslator {
    className: string;
    traceDecorator: DecoratorNames.TRACE;
    isTraced?: boolean;
    isStatic?: boolean;
}

export class ObservedV2TraceTranslator extends ObservedPropertyTranslator implements IObservedV2TraceTranslator {
    traceDecorator: DecoratorNames.TRACE = DecoratorNames.TRACE;
    className: string;
    isTraced?: boolean;
    isStatic?: boolean;
    propertyModifier: arkts.Es2pandaModifierFlags = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE;
    protected hasBackingField: boolean = true;
    protected hasMetaField: boolean = true;
    protected hasGetterSetter: boolean = true;

    constructor(options: ObservedPropertyTranslatorOptions) {
        super(options);
        this.className = this.classScopeInfo.className;
        this.hasImplement = expectName(this.property.key).startsWith(ObservedNames.PROPERTY_PREFIX);
        this.isTraced = hasDecorator(this.property, this.traceDecorator);
        this.isStatic = arkts.hasModifierFlag(this.property, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC);
        if (this.isStatic) {
            this.propertyModifier = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC;
        }
        checkObservedWhenInterop(this.property);
    }

    translateMember(): arkts.AstNode[] {
        if (!this.isTraced) {
            return [this.property];
        }
        return super.translateMember();
    }

    metaField(originalName: string, newName: string): arkts.ClassProperty {
        const field = super.metaField(originalName, newName);
        field.setAnnotations([
            annotation(DecoratorNames.JSONSTRINGIFYIGNORE),
            annotation(DecoratorNames.JSONPARSEIGNORE),
        ]);
        return field;
    }

    getter(originalName: string, newName: string): arkts.MethodDefinition {
        return getterWithObservedV2TraceProperty.bind(this)(originalName, newName);
    }

    setter(originalName: string, newName: string): arkts.MethodDefinition {
        return setterWithObservedV2TraceProperty.bind(this)(originalName, newName);
    }
}

export class ObservedV2TraceCachedTranslator
    extends ObservedPropertyCachedTranslator
    implements IObservedV2TraceTranslator
{
    traceDecorator: DecoratorNames.TRACE = DecoratorNames.TRACE;
    className: string;
    isTraced?: boolean;
    isStatic?: boolean;
    propertyModifier: arkts.Es2pandaModifierFlags = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE;
    protected hasBackingField: boolean = true;
    protected hasMetaField: boolean = true;
    protected hasGetterSetter: boolean = true;

    constructor(options: ObservedPropertyCachedTranslatorOptions) {
        super(options);
        this.className = this.propertyInfo.classInfo?.name!;
        this.hasImplement = !!this.propertyInfo.name?.startsWith(ObservedNames.PROPERTY_PREFIX);
        this.isTraced = !!this.propertyInfo.annotationInfo?.hasTrace;
        this.isStatic = arkts.hasModifierFlag(this.property, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC);
        if (this.isStatic) {
            this.propertyModifier = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC;
        }
        checkObservedWhenInterop(this.property);
    }

    translateMember(): arkts.AstNode[] {
        if (!this.isTraced) {
            return [this.property];
        }
        return super.translateMember();
    }

    metaField(originalName: string, newName: string): arkts.ClassProperty {
        const field = super.metaField(originalName, newName);
        field.setAnnotations([
            annotation(DecoratorNames.JSONSTRINGIFYIGNORE),
            annotation(DecoratorNames.JSONPARSEIGNORE),
        ]);
        return field;
    }

    getter(originalName: string, newName: string): arkts.MethodDefinition {
        return getterWithObservedV2TraceProperty.bind(this)(originalName, newName);
    }

    setter(originalName: string, newName: string): arkts.MethodDefinition {
        return setterWithObservedV2TraceProperty.bind(this)(originalName, newName);
    }
}
