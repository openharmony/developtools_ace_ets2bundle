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
    findPropertyAccessModifierFlags
} from './utils';
import { ClassScopeInfo } from '../struct-translators/utils';
import { factory } from './factory';
import { factory as uiFactory } from '../ui-factory';

export function createAddRef(
    this: IObservedTrackTranslator,
    originalName: string,
    classIdent: arkts.Identifier
): arkts.ExpressionStatement {
    if (this.isStatic) {
        return arkts.factory.createExpressionStatement(
            arkts.factory.createCallExpression(
                uiFactory.generateMemberExpression(
                    uiFactory.generateMemberExpression(
                        classIdent.clone(),
                        metaIdentifier.bind(this)(originalName).name
                    ),
                    ObservedNames.ADD_REF
                ),
                [],
                undefined,
                false,
                false
            )
        );
    }
    return arkts.factory.createExpressionStatement(
        arkts.factory.createCallExpression(generateThisBacking(ObservedNames.CONDITIONAL_ADD_REF), [
            metaMember.bind(this)(originalName, classIdent),
        ], undefined, false, false)
    );
}

export function metaMember(
    this: IObservedTrackTranslator,
    originalName: string,
    classIdent: arkts.Identifier
): arkts.Expression {
    return this.isStatic
        ? uiFactory.generateMemberExpression(classIdent, metaIdentifier.bind(this)(originalName).name)
        : arkts.factory.createMemberExpression(
            arkts.factory.createThisExpression(),
            metaIdentifier.bind(this)(originalName),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        );
}

export function getterBodyWithObservedTrackProperty(
    this: IObservedTrackTranslator,
    originalName: string,
    newName: string
): arkts.BlockStatement {
    const classIdent: arkts.Identifier = arkts.factory.createIdentifier(this.className);
    const backingMember: arkts.Expression = this.isStatic
            ? uiFactory.generateMemberExpression(classIdent.clone(), newName)
            : generateThisBacking(newName);
    const returnMember: arkts.ReturnStatement = arkts.factory.createReturnStatement(
        !this.property || this.property.value
            ? backingMember
            : arkts.factory.createTSAsExpression(backingMember, this.propertyType, false)
    );
    return arkts.factory.createBlockStatement([createAddRef.bind(this)(originalName, classIdent), returnMember]);
}

function getterWithObservedTrackProperty(
    this: IObservedTrackTranslator,
    originalName: string,
    newName: string
): arkts.MethodDefinition {
    let methodModifier = this.isStatic
        ? arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC
        : arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
    let body: arkts.BlockStatement | undefined;
    if (!this.isDecl) {
        body = getterBodyWithObservedTrackProperty.bind(this)(originalName, newName);
    } else {
        methodModifier |= arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE;
    }
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
        isComputed: false
    });
}

function setterWithObservedTrackProperty(
    this: IObservedTrackTranslator,
    originalName: string,
    newName: string
): arkts.MethodDefinition {
    let methodModifier = this.isStatic
        ? arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC
        : arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
    let body: arkts.BlockStatement | undefined;
    if (!this.isDecl) {
        const ifEqualsNewValue: arkts.IfStatement = setterIfEqualsNewValueWithObservedTrackProperty.bind(this)(
            originalName,
            newName
        );
        body = arkts.factory.createBlockStatement([ifEqualsNewValue]);
    } else {
        methodModifier |= arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE;
    }
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
        isComputed: false
    });
}

export function metaIdentifier(this: IObservedTrackTranslator, originalName: string): arkts.Identifier {
    return (this.isTracked || this.isStatic)
        ? arkts.factory.createIdentifier(`${StateManagementTypes.META}_${originalName}`)
        : arkts.factory.createIdentifier(StateManagementTypes.META);
}

export function setterIfEqualsNewValueWithObservedTrackProperty(
    this: IObservedTrackTranslator,
    originalName: string,
    newName: string
): arkts.IfStatement {
    const classIdent: arkts.Identifier = arkts.factory.createIdentifier(this.className);
     const backingMember: arkts.Expression = this.isStatic
            ? uiFactory.generateMemberExpression(classIdent.clone(), newName)
            : generateThisBacking(newName);
    const setNewValue = arkts.factory.createExpressionStatement(
        arkts.factory.createAssignmentExpression(
            backingMember,
            arkts.factory.createIdentifier(ObservedNames.NEW_VALUE),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION
        )
    );
    const fireChange = arkts.factory.createExpressionStatement(
        arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                metaMember.bind(this)(originalName, classIdent),
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
    const consequentArr = this.isStatic
            ? [setNewValue, fireChange]
            : [setNewValue, fireChange, subscribingWatches];
    return arkts.factory.createIfStatement(
        arkts.factory.createBinaryExpression(
            backingMember,
            arkts.factory.createIdentifier(ObservedNames.NEW_VALUE),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_NOT_STRICT_EQUAL
        ),
        arkts.factory.createBlockStatement(consequentArr)
    );
}

export interface IObservedTrackTranslator extends IBaseObservedPropertyTranslator {
    className: string;
    traceDecorator: DecoratorNames.TRACK;
    isTracked?: boolean;
    isStatic?: boolean;
    isDecl?: boolean;
}

/**
 * @deprecated
 */
export class ObservedTrackTranslator extends ObservedPropertyTranslator implements IObservedTrackTranslator {
    className: string;
    traceDecorator: DecoratorNames.TRACK = DecoratorNames.TRACK;
    isTracked?: boolean;
    isStatic: boolean;
    isDecl: boolean;
    propertyModifier: arkts.Es2pandaModifierFlags = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE;
    protected hasBackingField: boolean = true;
    protected hasMetaField: boolean = false;
    protected hasGetterSetter: boolean = true;
    protected hasBackingFieldRange: boolean = true;

    constructor(options: ObservedPropertyTranslatorOptions) {
        super(options);
        this.isStatic = arkts.hasModifierFlag(this.property, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC);
        this.isDecl = arkts.hasModifierFlag(this.property, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE);
        this.isTracked = hasDecorator(this.property, this.traceDecorator);
        this.className = this.classScopeInfo.className;
        this.hasMetaField = this.isTracked; // meta field is generated only if property is @Track
        if (this.isDecl) {
            this.propertyModifier |= arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE;
        }
    }

    translateMember(): arkts.AstNode[] {
        if (this.isStatic) {
            return [this.property];
        }
        if (!this.isTracked && (this.classScopeInfo.classHasTrack || !this.classScopeInfo.isObserved)) {
            return [this.property];
        }
        return super.translateMember();
    }

    backingField(originalName: string, newName: string): arkts.ClassProperty {
        if (this.isStatic) {
            return this.property;
        }
        return super.backingField(originalName, newName);
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
    className: string;
    traceDecorator: DecoratorNames.TRACK = DecoratorNames.TRACK;
    isTracked?: boolean;
    isStatic: boolean = false; // @Observed does not support static property.
    isDecl: boolean = false;
    propertyModifier: arkts.Es2pandaModifierFlags = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE;
    protected hasBackingField: boolean = true;
    protected hasMetaField: boolean = false;
    protected hasGetterSetter: boolean = true;
    protected hasBackingFieldRange: boolean = true;

    constructor(options: ObservedPropertyCachedTranslatorOptions) {
        super(options);
        if (!!this.propertyInfo.modifiers) {
            this.isStatic = (this.propertyInfo.modifiers & arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC) === arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC;
            this.isDecl = (this.propertyInfo.modifiers & arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE) === arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE;
        }
        this.isTracked = !!this.propertyInfo.annotationInfo?.hasTrack;
        this.className = this.propertyInfo.classInfo?.name!;
        this.hasMetaField = this.isTracked; // meta field is generated only if property is @Track
        if (this.isDecl) {
            this.propertyModifier |= arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE;
        }
    }

    translateMember(): arkts.AstNode[] {
        if (this.isStatic) { // static property is not supported in @Observed
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
