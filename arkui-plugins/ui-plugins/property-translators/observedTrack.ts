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
import {
    collectStateManagementTypeImport,
    collectStateManagementTypeSource,
    DecoratorNames,
    hasDecorator,
    StateManagementTypes,
} from './utils';
import { ClassScopeInfo } from './types';

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
        let properyIsClass = false;

        if (this.property.typeAnnotation && arkts.isETSTypeReference(this.property.typeAnnotation)) {
            const decl = arkts.getDecl(this.property.typeAnnotation.part?.name!);
            if (arkts.isClassDefinition(decl!)) {
                properyIsClass = true;
            }
        }
        const field = this.createField(originalName, newName, properyIsClass);

        this.transformGetterSetter(originalName, newName, properyIsClass);

        return [...field];
    }

    createField(originalName: string, newName: string, properyIsClass: boolean): arkts.ClassProperty[] {
        const backingField = properyIsClass
            ? this.propertyIsClassField(newName)
            : arkts.factory.createClassProperty(
                  arkts.factory.createIdentifier(newName),
                  this.property.value,
                  this.property.typeAnnotation,
                  arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE,
                  false
              );
        if (!this.isTracked) {
            return [backingField];
        }
        const metaField = this.metaField(originalName);
        return [backingField, metaField];
    }

    createGetter(originalName: string, newName: string, properyIsClass: boolean): arkts.MethodDefinition {
        const ifRefDepth: arkts.IfStatement = this.getterIfRefDepth(originalName);
        const returnMember: arkts.ReturnStatement = this.getterReturnMember(properyIsClass, newName);
        const body = arkts.factory.createBlock([
            ifRefDepth,
            ...(properyIsClass ? [this.getterSetObservationDepth(newName)] : []),
            returnMember,
        ]);

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

    createSetter(originalName: string, newName: string, properyIsClass: boolean): arkts.MethodDefinition {
        const ifEqualsNewValue: arkts.IfStatement = this.setterIfEqualsNewValue(properyIsClass, originalName, newName);
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

    genThisBackingValue(newName: string): arkts.MemberExpression {
        return arkts.factory.createMemberExpression(
            this.genThisBacking(newName),
            arkts.factory.createIdentifier('value'),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        );
    }

    metaIdentifier(originalName: string): arkts.Identifier {
        return this.isTracked
            ? arkts.factory.createIdentifier(`__meta_${originalName}`)
            : arkts.factory.createIdentifier('__meta');
    }

    removeImplementProperty(originalName: string): string {
        const prefix = '<property>';
        return originalName.substring(prefix.length);
    }

    transformGetterSetter(originalName: string, newName: string, properyIsClass: boolean): void {
        const newGetter = this.createGetter(originalName, newName, properyIsClass);
        const newSetter = this.createSetter(originalName, newName, properyIsClass);
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

    propertyIsClassField(newName: string): arkts.ClassProperty {
        collectStateManagementTypeSource(StateManagementTypes.BACKING_VALUE);
        collectStateManagementTypeImport(StateManagementTypes.BACKING_VALUE);
        return arkts.factory.createClassProperty(
            arkts.factory.createIdentifier(newName),
            this.property.value
                ? arkts.factory.createETSNewClassInstanceExpression(
                      arkts.factory.createTypeReference(
                          arkts.factory.createTypeReferencePart(
                              arkts.factory.createIdentifier(StateManagementTypes.BACKING_VALUE),
                              arkts.factory.createTSTypeParameterInstantiation(
                                  this.property.typeAnnotation ? [this.property.typeAnnotation] : []
                              )
                          )
                      ),
                      [this.property.value]
                  )
                : undefined,
            arkts.factory.createTypeReference(
                arkts.factory.createTypeReferencePart(
                    arkts.factory.createIdentifier(StateManagementTypes.BACKING_VALUE),
                    arkts.factory.createTSTypeParameterInstantiation(
                        this.property.typeAnnotation ? [this.property.typeAnnotation] : []
                    )
                )
            ),
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE,
            false
        );
    }

    metaField(originalName: string): arkts.ClassProperty {
        collectStateManagementTypeSource(StateManagementTypes.MUTABLE_STATE_META);
        collectStateManagementTypeImport(StateManagementTypes.MUTABLE_STATE_META);
        return arkts.factory.createClassProperty(
            arkts.factory.createIdentifier(`__meta_${originalName}`),
            arkts.factory.createETSNewClassInstanceExpression(
                arkts.factory.createTypeReference(
                    arkts.factory.createTypeReferencePart(
                        arkts.factory.createIdentifier(StateManagementTypes.MUTABLE_STATE_META)
                    )
                ),
                [arkts.factory.createStringLiteral('@Track')]
            ),
            arkts.factory.createTypeReference(
                arkts.factory.createTypeReferencePart(
                    arkts.factory.createIdentifier(StateManagementTypes.MUTABLE_STATE_META)
                )
            ),
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE,
            false
        );
    }

    getterIfRefDepth(originalName: string): arkts.IfStatement {
        return arkts.factory.createIfStatement(
            arkts.factory.createBinaryExpression(
                arkts.factory.createMemberExpression(
                    arkts.factory.createThisExpression(),
                    arkts.factory.createIdentifier('_permissibleAddRefDepth'),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
                arkts.factory.createNumericLiteral(0),
                arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_GREATER_THAN
            ),
            arkts.factory.createBlock([
                arkts.factory.createExpressionStatement(
                    arkts.factory.createCallExpression(
                        arkts.factory.createMemberExpression(
                            arkts.factory.createMemberExpression(
                                arkts.factory.createThisExpression(),
                                this.metaIdentifier(originalName),
                                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                                false,
                                false
                            ),
                            arkts.factory.createIdentifier('addRef'),
                            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                            false,
                            false
                        ),
                        undefined,
                        undefined,
                        false,
                        false
                    )
                ),
            ])
        );
    }

    getterSetObservationDepth(newName: string): arkts.ExpressionStatement {
        collectStateManagementTypeSource(StateManagementTypes.SET_OBSERVATION_DEPTH);
        collectStateManagementTypeImport(StateManagementTypes.SET_OBSERVATION_DEPTH);
        return arkts.factory.createExpressionStatement(
            arkts.factory.createCallExpression(
                arkts.factory.createIdentifier(StateManagementTypes.SET_OBSERVATION_DEPTH),
                undefined,
                [
                    this.genThisBackingValue(newName),
                    arkts.factory.createBinaryExpression(
                        arkts.factory.createMemberExpression(
                            arkts.factory.createThisExpression(),
                            arkts.factory.createIdentifier('_permissibleAddRefDepth'),
                            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                            false,
                            false
                        ),
                        arkts.factory.createNumericLiteral(1),
                        arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_MINUS
                    ),
                ]
            )
        );
    }

    getterReturnMember(properyIsClass: boolean, newName: string): arkts.ReturnStatement {
        return arkts.factory.createReturnStatement(
            properyIsClass ? this.genThisBackingValue(newName) : this.genThisBacking(newName)
        );
    }

    setterIfEqualsNewValue(properyIsClass: boolean, originalName: string, newName: string): arkts.IfStatement {
        const backingValue = properyIsClass ? this.genThisBackingValue(newName) : this.genThisBacking(newName);

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
