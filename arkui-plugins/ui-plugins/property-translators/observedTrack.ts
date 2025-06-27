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
import {
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
import { logDiagnostic } from '../interop/initstatevar';
import { getHasAnnotationObserved } from '../interop/interop';

export function getterBodyWithObservedTrackProperty(
    this: IObservedTrackTranslator,
    originalName: string,
    newName: string
): arkts.BlockStatement {
    const conditionalAddRef = arkts.factory.createExpressionStatement(
        arkts.factory.createCallExpression(generateThisBacking(ObservedNames.CONDITIONAL_ADD_REF), undefined, [
            arkts.factory.createMemberExpression(
                arkts.factory.createThisExpression(),
                metaIdentifier.bind(this)(originalName),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
        ])
    );
    const backingMember: arkts.Expression = generateThisBacking(newName);
    const returnMember: arkts.ReturnStatement = arkts.factory.createReturnStatement(
        !this.property || this.property.value
            ? backingMember
            : arkts.factory.createTSAsExpression(backingMember, this.propertyType, false)
    );
    return arkts.factory.createBlock([conditionalAddRef, returnMember]);
}

function getterWithObservedTrackProperty(
    this: IObservedTrackTranslator,
    originalName: string,
    newName: string
): arkts.MethodDefinition {
    const body = getterBodyWithObservedTrackProperty.bind(this)(originalName, newName);
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

function setterWithObservedTrackProperty(
    this: IObservedTrackTranslator,
    originalName: string,
    newName: string
): arkts.MethodDefinition {
    const ifEqualsNewValue: arkts.IfStatement = setterIfEqualsNewValueWithObservedTrackProperty.bind(this)(
        originalName,
        newName
    );
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

export function metaIdentifier(this: IObservedTrackTranslator, originalName: string): arkts.Identifier {
    return this.isTracked
        ? arkts.factory.createIdentifier(`${StateManagementTypes.META}_${originalName}`)
        : arkts.factory.createIdentifier(StateManagementTypes.META);
}

export function setterIfEqualsNewValueWithObservedTrackProperty(
    this: IObservedTrackTranslator,
    originalName: string,
    newName: string
): arkts.IfStatement {
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
                    metaIdentifier.bind(this)(originalName),
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

function checkObservedV2WhenInterop(property: arkts.ClassProperty): void {
    const isObservedFrom1_1 = getHasAnnotationObserved(property, 'ObservedV2');
    if (isObservedFrom1_1) {
        const errorMessage = `The type of the regular property can not be a class decorated with @ObservedV2 when interop`;
        logDiagnostic(errorMessage, property);
    }
}

export interface IObservedTrackTranslator extends IBaseObservedPropertyTranslator {
    traceDecorator: DecoratorNames.TRACK;
    isTracked?: boolean;
    isStatic?: boolean;
}

export class ObservedTrackTranslator extends ObservedPropertyTranslator implements IObservedTrackTranslator {
    traceDecorator: DecoratorNames.TRACK = DecoratorNames.TRACK;
    isTracked?: boolean;
    isStatic: boolean = false; // @Observed does not support static property.
    propertyModifier: arkts.Es2pandaModifierFlags = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE;
    protected hasBackingField: boolean = true;
    protected hasMetaField: boolean = false;
    protected hasGetterSetter: boolean = true;

    constructor(options: ObservedPropertyTranslatorOptions) {
        super(options);
        this.isTracked = hasDecorator(this.property, this.traceDecorator);
        this.hasMetaField = this.isTracked; // meta field is generated only if property is @Track
        checkObservedV2WhenInterop(this.property);
    }

    translateMember(): arkts.AstNode[] {
        if (!this.isTracked && (this.classScopeInfo.classHasTrack || !this.classScopeInfo.isObserved)) {
            return [this.property];
        }
        return super.translateMember();
    }

    metaField(originalName: string, newName: string): arkts.ClassProperty {
        const field = super.metaField.bind(this)(originalName, newName);
        field.setAnnotations([
            annotation(DecoratorNames.JSONSTRINGIFYIGNORE),
            annotation(DecoratorNames.JSONPARSEIGNORE),
        ]);
        return field;
    }

    getter(originalName: string, newName: string): arkts.MethodDefinition {
        return getterWithObservedTrackProperty.bind(this)(originalName, newName);
    }

    setter(originalName: string, newName: string): arkts.MethodDefinition {
        return setterWithObservedTrackProperty.bind(this)(originalName, newName);
    }
}

export class ObservedTrackCachedTranslator
    extends ObservedPropertyCachedTranslator
    implements IObservedTrackTranslator
{
    traceDecorator: DecoratorNames.TRACK = DecoratorNames.TRACK;
    isTracked?: boolean;
    isStatic: boolean = false; // @Observed does not support static property.
    propertyModifier: arkts.Es2pandaModifierFlags = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE;
    protected hasBackingField: boolean = true;
    protected hasMetaField: boolean = false;
    protected hasGetterSetter: boolean = true;

    constructor(options: ObservedPropertyCachedTranslatorOptions) {
        super(options);
        this.isTracked = !!this.propertyInfo.annotationInfo?.hasTrack;
        this.hasMetaField = this.isTracked; // meta field is generated only if property is @Track
        checkObservedV2WhenInterop(this.property);
    }

    metaField(originalName: string, newName: string): arkts.ClassProperty {
        const field = super.metaField.bind(this)(originalName, newName);
        field.setAnnotations([
            annotation(DecoratorNames.JSONSTRINGIFYIGNORE),
            annotation(DecoratorNames.JSONPARSEIGNORE),
        ]);
        return field;
    }

    getter(originalName: string, newName: string): arkts.MethodDefinition {
        return getterWithObservedTrackProperty.bind(this)(originalName, newName);
    }

    setter(originalName: string, newName: string): arkts.MethodDefinition {
        return setterWithObservedTrackProperty.bind(this)(originalName, newName);
    }
}
