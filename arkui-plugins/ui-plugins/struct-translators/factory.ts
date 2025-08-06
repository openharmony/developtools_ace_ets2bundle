/*
 * Copyright (C) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as arkts from '@koalaui/libarkts';
import { BuilderLambdaNames, CustomComponentNames, Dollars } from '../utils';
import { factory as uiFactory } from '../ui-factory';
import { annotation } from '../../common/arkts-utils';

export class factory {
    /*
     * create `constructor() {}`.
     */
    static createConstructorMethod(member: arkts.MethodDefinition): arkts.MethodDefinition {
        return arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_CONSTRUCTOR,
            member.name,
            member.scriptFunction,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_CONSTRUCTOR,
            false
        );
    }

    /*
     * create _build method.
     */
    static transformBuildMethodWithOriginBuild(
        method: arkts.MethodDefinition,
        typeName: string,
        optionsName: string,
        isDecl?: boolean
    ): arkts.MethodDefinition {
        const updateKey: arkts.Identifier = arkts.factory.createIdentifier(CustomComponentNames.COMPONENT_BUILD);

        const scriptFunction: arkts.ScriptFunction = method.scriptFunction;
        const updateScriptFunction = arkts.factory
            .createScriptFunction(
                scriptFunction.body,
                arkts.FunctionSignature.createFunctionSignature(
                    scriptFunction.typeParams,
                    [
                        uiFactory.createStyleParameter(typeName),
                        uiFactory.createContentParameter(),
                        uiFactory.createInitializersOptionsParameter(optionsName),
                    ],
                    arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                    false
                ),
                scriptFunction.flags,
                scriptFunction.modifiers
            )
            .setAnnotations([annotation('memo')]);

        const modifiers: arkts.Es2pandaModifierFlags = isDecl
            ? arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_ABSTRACT
            : arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
        return arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            updateKey,
            updateScriptFunction,
            modifiers,
            false
        );
    }

    /*
     * generate _r(<newArgs>) or _rawfile(<newArgs>).
     */
    static generateTransformedResource(
        resourceNode: arkts.CallExpression,
        newArgs: arkts.AstNode[]
    ): arkts.CallExpression {
        const transformedKey: string =
            resourceNode.expression.dumpSrc() === Dollars.DOLLAR_RESOURCE ? '_r' : '_rawfile';
        return arkts.factory.updateCallExpression(
            resourceNode,
            arkts.factory.createIdentifier(transformedKey),
            resourceNode.typeArguments,
            newArgs
        );
    }

    /*
     * create __initializeStruct method.
     */
    static createInitializeStruct(
        structInfo: arkts.StructInfo,
        optionsTypeName: string,
        isDecl?: boolean
    ): arkts.MethodDefinition {
        const updateKey: arkts.Identifier = arkts.factory.createIdentifier(
            CustomComponentNames.COMPONENT_INITIALIZE_STRUCT
        );

        let body: arkts.BlockStatement | undefined;
        let modifiers: arkts.Es2pandaModifierFlags = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_ABSTRACT;
        if (!isDecl) {
            body = arkts.factory.createBlock(structInfo.initializeBody);
            modifiers = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
        }
        const scriptFunction: arkts.ScriptFunction = arkts.factory
            .createScriptFunction(
                body,
                arkts.FunctionSignature.createFunctionSignature(
                    undefined,
                    [uiFactory.createInitializersOptionsParameter(optionsTypeName), uiFactory.createContentParameter()],
                    arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                    false
                ),
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
                modifiers
            )
            .setIdent(updateKey);

        return arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            updateKey,
            scriptFunction,
            modifiers,
            false
        );
    }

    /*
     * create __updateStruct method.
     */
    static createUpdateStruct(
        structInfo: arkts.StructInfo,
        optionsTypeName: string,
        isDecl?: boolean
    ): arkts.MethodDefinition {
        const updateKey: arkts.Identifier = arkts.factory.createIdentifier(
            CustomComponentNames.COMPONENT_UPDATE_STRUCT
        );

        let body: arkts.BlockStatement | undefined;
        let modifiers: arkts.Es2pandaModifierFlags = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_ABSTRACT;
        if (!isDecl) {
            body = arkts.factory.createBlock(structInfo.updateBody);
            modifiers = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
        }

        const scriptFunction: arkts.ScriptFunction = arkts.factory
            .createScriptFunction(
                body,
                arkts.FunctionSignature.createFunctionSignature(
                    undefined,
                    [uiFactory.createInitializersOptionsParameter(optionsTypeName)],
                    arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                    false
                ),
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
                modifiers
            )
            .setIdent(updateKey);

        return arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            updateKey,
            scriptFunction,
            modifiers,
            false
        );
    }

    /*
     * create __toRecord method when the component is decorated with @Reusable.
     */
    static toRecord(optionsTypeName: string, toRecordBody: arkts.Property[]): arkts.MethodDefinition {
        const paramsCasted = factory.generateParamsCasted(optionsTypeName);
        const returnRecord = arkts.factory.createReturnStatement(
            arkts.ObjectExpression.createObjectExpression(
                arkts.Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION,
                toRecordBody,
                false
            )
        );
        const body: arkts.BlockStatement = arkts.factory.createBlock([paramsCasted, returnRecord]);

        const params = arkts.ETSParameterExpression.create(
            arkts.factory.createIdentifier('params', factory.generateTypeReferenceWithTypeName('Object')),
            undefined
        );

        const toRecordScriptFunction = arkts.factory.createScriptFunction(
            body,
            arkts.FunctionSignature.createFunctionSignature(undefined, [params], factory.generateTypeRecord(), false),
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC
        );

        return arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_CONSTRUCTOR,
            arkts.factory.createIdentifier('__toRecord'),
            toRecordScriptFunction,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_OVERRIDE,
            false
        );
    }

    /*
     * generate `const paramsCasted = (params as <optionsTypeName>)`.
     */
    static generateParamsCasted(optionsTypeName: string): arkts.VariableDeclaration {
        return arkts.factory.createVariableDeclaration(
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_CONST,
            [
                arkts.factory.createVariableDeclarator(
                    arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_CONST,
                    arkts.factory.createIdentifier('paramsCasted'),
                    arkts.TSAsExpression.createTSAsExpression(
                        arkts.factory.createIdentifier('params'),
                        factory.generateTypeReferenceWithTypeName(optionsTypeName),
                        false
                    )
                ),
            ]
        );
    }

    /*
     * generate Record<string, Object> type.
     */
    static generateTypeRecord(): arkts.ETSTypeReference {
        return arkts.factory.createTypeReference(
            arkts.factory.createTypeReferencePart(
                arkts.factory.createIdentifier('Record'),
                arkts.factory.createTSTypeParameterInstantiation([
                    factory.generateTypeReferenceWithTypeName('string'),
                    factory.generateTypeReferenceWithTypeName('Object'),
                ])
            )
        );
    }

    /*
     * create type reference with type name, e.g. number.
     */
    static generateTypeReferenceWithTypeName(typeName: string): arkts.ETSTypeReference {
        return arkts.factory.createTypeReference(
            arkts.factory.createTypeReferencePart(arkts.factory.createIdentifier(typeName))
        );
    }

    /*
     * create type reference with type name, e.g. number.
     */
    static updateCustomComponentClass(
        definition: arkts.ClassDefinition,
        members: arkts.AstNode[]
    ): arkts.ClassDefinition {
        return arkts.factory.updateClassDefinition(
            definition,
            definition.ident,
            definition.typeParams,
            definition.superTypeParams,
            definition.implements,
            undefined,
            definition.super,
            members,
            definition.modifiers,
            arkts.classDefinitionFlags(definition)
        );
    }

    /*
     * add headers for animation in CommonMethod
     */
    static modifyExternalComponentCommon(node: arkts.TSInterfaceDeclaration): arkts.AstNode {
        const animationStart = factory.createAnimationMethod(BuilderLambdaNames.ANIMATION_START);
        const animationStop = factory.createAnimationMethod(BuilderLambdaNames.ANIMATION_STOP);
        const updatedBody = arkts.factory.updateInterfaceBody(node.body!, [
            animationStart,
            animationStop,
            ...node.body!.body,
        ]);
        return arkts.factory.updateInterfaceDeclaration(
            node,
            node.extends,
            node.id,
            node.typeParams,
            updatedBody,
            node.isStatic,
            node.isFromExternal
        );
    }

    /*
     * generate animationStart(...) and animationStop(...)
     */
    static createAnimationMethod(key: string): arkts.MethodDefinition {
        const aniparams: arkts.Expression[] = [
            arkts.factory.createParameterDeclaration(
                arkts.factory.createIdentifier(
                    'value',
                    arkts.factory.createUnionType(
                        [
                            arkts.factory.createTypeReference(
                                arkts.factory.createTypeReferencePart(arkts.factory.createIdentifier('AnimateParam'))
                            ),
                            arkts.factory.createETSUndefinedType()
                        ]
                    )
                ),
                undefined
            ),
        ];
        const aniFuncExpr = arkts.factory.createScriptFunction(
            undefined,
            arkts.factory.createFunctionSignature(undefined, aniparams, arkts.TSThisType.createTSThisType(), false),
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC
        );
        return arkts.factory.createMethodDefinition(
            arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
            arkts.factory.createIdentifier(key),
            aniFuncExpr,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
            false
        );
    }

    /*
     * generate XComponent(..., packageInfo: string, ...)
     */
    static modifyXcomponent(node: arkts.ScriptFunction): arkts.ScriptFunction {
        const info = arkts.factory.createParameterDeclaration(
            arkts.factory.createIdentifier(
                'packageInfo',
                arkts.factory.createTypeReference(
                    arkts.factory.createTypeReferencePart(
                        arkts.factory.createIdentifier('string')
                    )
                )
            ),
            undefined
        );
        return arkts.factory.updateScriptFunction(
            node,
            node.body,
            arkts.factory.createFunctionSignature(
                node.typeParams,
                [...node.params.slice(0, 2), info, ...node.params.slice(2)],
                node.returnTypeAnnotation,
                false
            ),
            node.flags,
            node.modifiers
        );
    }

    /*
     * transform ExternalSource headers
     */
    static transformExternalSource(externalSourceName: string, node: arkts.AstNode): arkts.AstNode {
        if (
            externalSourceName === 'arkui.component.common' &&
            arkts.isTSInterfaceDeclaration(node) &&
            !!node.id &&
            node.id.name === 'CommonMethod'
        ) {
            return factory.modifyExternalComponentCommon(node);
        } else if (
            externalSourceName === 'arkui.component.xcomponent' &&
            arkts.isScriptFunction(node) &&
            !!node.id &&
            node.id.name === 'XComponent'
        ) {
            return factory.modifyXcomponent(node);
        }
        return node;
    }
}
