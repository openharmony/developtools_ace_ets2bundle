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

import { generateToRecord, generateThisBacking, isCustomDialogController } from './utils';
import { InterfacePropertyTranslator, InterfacePropertyTypes, PropertyTranslator } from './base';
import { expectName } from '../../common/arkts-utils';
import { factory } from './factory';
import { PropertyCache } from './cache/propertyCache';
import { factory as UIFactory } from '../ui-factory';
import {
    CustomComponentNames,
    optionsHasField,
    hasNullOrUndefinedType,
    isClassPropertyOptional,
    hasNullType,
} from '../utils';

export class RegularPropertyTranslator extends PropertyTranslator {
    translateMember(): arkts.AstNode[] {
        if (
            (this.property.modifiers & arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_READONLY) ===
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_READONLY
        ) {
            // readonly
            return [this.property];
        }

        const name: string = expectName(this.property.key);
        this.cacheTranslatedInitializer(name);
        var modifiers;
        var value;
        if (this.propertyCanBeNullish(this.property)) {
            modifiers = this.property.modifiers;
            if (!!this.propertyType && hasNullType(this.propertyType)) {
                value = arkts.factory.createNullLiteral();
            }
        } else {
            modifiers = this.property.modifiers | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DEFINITE;
        }
        return [
            arkts.factory.createClassProperty(
                this.property.key,
                value,
                this.propertyType,
                modifiers,
                this.property.isComputed
            ),
        ];
    }

    propertyCanBeNullish(property: arkts.ClassProperty): boolean {
        if (isClassPropertyOptional(property)) {
            return true;
        }
        if (!!property.typeAnnotation && hasNullOrUndefinedType(property.typeAnnotation)) {
            return true;
        }
        return false;
    }

    cacheTranslatedInitializer(name: string): void {
        const value = this.property.value ?? arkts.factory.createUndefinedLiteral();
        const thisValue: arkts.Expression = generateThisBacking(name, false, false);
        let initializeStruct: arkts.AstNode = this.generateInitializeStruct(name, value);
        if (
            !!this.propertyType &&
            !!this.structInfo.annotations.customdialog &&
            isCustomDialogController(this.propertyType)
        ) {
            initializeStruct = this.generateControllerInit(name, thisValue, initializeStruct);
        }
        PropertyCache.getInstance().collectInitializeStruct(this.structInfo.name, [initializeStruct]);
        if (!!this.structInfo.annotations?.reusable) {
            const toRecord = generateToRecord(name, name);
            PropertyCache.getInstance().collectToRecord(this.structInfo.name, [toRecord]);
        }
    }

    generateInitializeStruct(name: string, value: arkts.Expression): arkts.AstNode {
        const binaryItem = arkts.factory.createBinaryExpression(
            factory.createBlockStatementForOptionalExpression(
                arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_INITIALIZERS_NAME),
                name
            ),
            this.hasValue(value)
                ? value
                : arkts.factory.createMemberExpression(
                      arkts.factory.createThisExpression(),
                      arkts.factory.createIdentifier(name),
                      arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                      this.property.isComputed,
                      false
                  ),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_NULLISH_COALESCING
        );
        const assign: arkts.AssignmentExpression = arkts.factory.createAssignmentExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createThisExpression(),
                arkts.factory.createIdentifier(name),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                this.property.isComputed,
                false
            ),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
            binaryItem
        );
        return arkts.factory.createExpressionStatement(assign);
    }

    hasValue(value: arkts.Expression): boolean {
        return !!value && !arkts.isUndefinedLiteral(value);
    }

    generateControllerInit(originalName: string, thisValue: arkts.Expression, value: arkts.AstNode): arkts.AstNode {
        return arkts.factory.createIfStatement(
            factory.createBlockStatementForOptionalExpression(
                arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_INITIALIZERS_NAME),
                optionsHasField(originalName)
            ),
            arkts.factory.createBlock([
                arkts.factory.createAssignmentExpression(
                    thisValue,
                    arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
                    arkts.factory.createTSAsExpression(
                        UIFactory.generateMemberExpression(
                            arkts.factory.createTSNonNullExpression(
                                arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_INITIALIZERS_NAME)
                            ),
                            originalName
                        ),
                        this.propertyType,
                        false
                    )
                ),
            ]),
            arkts.factory.createBlock([
                arkts.factory.createIfStatement(
                    arkts.factory.createUnaryExpression(
                        thisValue,
                        arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_EXCLAMATION_MARK
                    ),
                    arkts.factory.createAssignmentExpression(
                        thisValue,
                        arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
                        value
                    )
                ),
            ])
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
