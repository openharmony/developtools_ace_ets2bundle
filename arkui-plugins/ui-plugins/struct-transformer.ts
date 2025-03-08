/*
 * Copyright (c) 2022-2025 Huawei Device Co., Ltd.
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

import * as arkts from "@koalaui/libarkts"
import { AbstractVisitor } from "../common/abstract-visitor";
import { 
    annotation, 
    collect, 
    filterDefined 
} from "../common/arkts-utils";
import { 
    classifyProperty, 
    PropertyTranslator 
} from "./property-translators";
import { 
    createCustomComponentInitializerOptions, 
    createInitializerOptions, 
    getCustomComponentNameFromInitializerOptions 
} from "./utils";

function isCustomComponentClass(node: arkts.ClassDeclaration): boolean {
    const structCollection: Set<string> = arkts.GlobalInfo.getInfoInstance().getStructCollection();
    if (node.definition?.ident?.name && structCollection.has(node.definition.ident.name)) {
        return true;
    }
    return false;
}

function isKnownMethodDefinition(method: arkts.MethodDefinition, name: string): boolean {
    if (!method || !arkts.isMethodDefinition(method)) return false;

    // For now, we only considered matched method name.
    const isNameMatched: boolean = method.name?.name === name;
    return isNameMatched;
}

function createStyleArgInBuildMethod(className: string): arkts.ETSParameterExpression {
    const styleLambdaParams: arkts.ETSParameterExpression = arkts.factory.createParameterDeclaration(
        arkts.factory.createIdentifier(
            'instance',
            arkts.factory.createTypeReferencePart(
                arkts.factory.createIdentifier(className)
            )
        ),
        undefined
    );

    const styleLambda: arkts.ETSFunctionType = arkts.factory.createFunctionType(
        arkts.FunctionSignature.createFunctionSignature(
            undefined,
            [
                styleLambdaParams
            ],
            arkts.factory.createTypeReference(
                arkts.factory.createTypeReferencePart(
                    arkts.factory.createIdentifier(className)
                )
            ),
            false
        ),
        arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW
    );

    const optionalStyleLambda: arkts.ETSUnionType = arkts.factory.createUnionType([
        styleLambda,
        arkts.factory.createETSUndefinedType()
    ]);

    const styleParam: arkts.Identifier = arkts.factory.createIdentifier(
        'style',
        optionalStyleLambda
    );

    const param = arkts.factory.createParameterDeclaration(styleParam, undefined);
    param.annotations = [annotation("memo")];

    return param;
}

function createContentArgInBuildMethod(): arkts.ETSParameterExpression {
    const contentLambda: arkts.ETSFunctionType = arkts.factory.createFunctionType(
        arkts.FunctionSignature.createFunctionSignature(
            undefined,
            [],
            arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
            false
        ),
        arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW
    );

    const optionalContentLambda: arkts.ETSUnionType = arkts.factory.createUnionType([
        contentLambda,
        arkts.factory.createETSUndefinedType()
    ]);

    const contentParam: arkts.Identifier = arkts.factory.createIdentifier(
        'content',
        optionalContentLambda
    );

    const param = arkts.factory.createParameterDeclaration(contentParam, undefined);
    param.annotations = [annotation("memo")];

    return param;
}

function createInitializerArgInBuildMethod(className: string): arkts.ETSParameterExpression {
    return arkts.factory.createParameterDeclaration(
        createCustomComponentInitializerOptions(className).setOptional(true),
        undefined
    );
}

function prepareArgsInBuildMethod(className: string): arkts.ETSParameterExpression[] {
    return [
        createStyleArgInBuildMethod(className),
        createContentArgInBuildMethod(),
        createInitializerArgInBuildMethod(className)
    ];
}

function transformBuildMethod(
    method: arkts.MethodDefinition,
    className: string
): arkts.MethodDefinition {
    const updateKey: arkts.Identifier = arkts.factory.createIdentifier(
        '_build'
    );

    const scriptFunction: arkts.ScriptFunction = method.scriptFunction;

    const params: arkts.ETSParameterExpression[] = prepareArgsInBuildMethod(className);

    const updateScriptFunction = arkts.factory.createScriptFunction(
        scriptFunction.body,
        scriptFunction.scriptFunctionFlags,
        scriptFunction.modifiers,
        false,
        updateKey,
        params,
        scriptFunction.typeParamsDecl,
        scriptFunction.returnTypeAnnotation
    );

    updateScriptFunction.annotations = [annotation("memo")];

    return arkts.factory.createMethodDefinition(
        arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
        updateKey,
        arkts.factory.createFunctionExpression(updateScriptFunction),
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PROTECTED,
        false
    );
}

function tranformPropertyMembers(className: string, propertyTranslators: PropertyTranslator[]): arkts.AstNode[] {
    const propertyMembers = propertyTranslators.map(translator =>
        translator.translateMember()
    );
    const currentStructInfo: arkts.StructInfo = arkts.GlobalInfo.getInfoInstance().getStructInfo(className);
    const bodyArr: arkts.AstNode[] = currentStructInfo.initializeBody;
    const body: arkts.BlockStatement = arkts.factory.createBlock(bodyArr);
    const paramInitializers: arkts.ETSParameterExpression = arkts.factory.createParameterDeclaration(
        createCustomComponentInitializerOptions(className).setOptional(true),
        undefined
    )

    const paramContent: arkts.ETSParameterExpression = arkts.factory.createParameterDeclaration(
        arkts.factory.createIdentifier(
            'content',
            arkts.factory.createFunctionType(
                arkts.FunctionSignature.createFunctionSignature(
                    undefined,
                    [],
                    arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                    false
                ),
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW
            )
        ).setOptional(true),
        undefined
    )
    paramContent.annotations = [annotation("memo")];

    const scriptFunction: arkts.ScriptFunction = arkts.factory.createScriptFunction(
        body,
        arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_GETTER,
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC,
        false,
        undefined,
        [
            paramInitializers,
            paramContent
        ],
        undefined,
        arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID)
    )
    
    const initializeStruct: arkts.MethodDefinition = arkts.factory.createMethodDefinition(
        arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_CONSTRUCTOR,
        arkts.factory.createIdentifier('__initializeStruct'),
        arkts.factory.createFunctionExpression(scriptFunction),
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
        false
    );

    const updateBodyArr: arkts.AstNode[] = currentStructInfo.updateBody;

    const updateBody: arkts.BlockStatement = arkts.factory.createBlock(updateBodyArr);
    
    const param: arkts.ETSParameterExpression = arkts.factory.createParameterDeclaration(
        arkts.factory.createIdentifier(
            'initializers',
            arkts.factory.createUnionType([
                createInitializerOptions(className),
                arkts.factory.createETSUndefinedType()
            ])
        ),
        undefined
    )
    
    const updateStructScriptFunction: arkts.ScriptFunction = arkts.factory.createScriptFunction(
        updateBody,
        arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_GETTER,
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC,
        false,
        undefined,
        [param],
        undefined,
        arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
    )

    scriptFunction.annotations = [annotation("memo")];

    const updateStruct: arkts.MethodDefinition = arkts.factory.createMethodDefinition(
        arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_CONSTRUCTOR,
        arkts.factory.createIdentifier('__updateStruct'),
        arkts.factory.createFunctionExpression(updateStructScriptFunction),
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
        false
    );

    return collect(initializeStruct, updateStruct, ...propertyMembers);
}

function isCustomComponentInterface(node: arkts.TSInterfaceDeclaration): boolean {
    const structCollection: Set<string> = arkts.GlobalInfo.getInfoInstance().getStructCollection();

    if (node.id && node.id.name) {
        const customComponentName: string | undefined = getCustomComponentNameFromInitializerOptions(node.id.name);
        return !!customComponentName && structCollection.has(customComponentName);
    }
    return false;
}

function addVariableInInterface(interfaceNode: arkts.TSInterfaceDeclaration): arkts.TSInterfaceDeclaration {
    let interfaceName: string | undefined;
    if (interfaceNode.id && interfaceNode.id.name) {
        interfaceName = getCustomComponentNameFromInitializerOptions(interfaceNode.id.name);
    }

    if (!interfaceName) {
        throw new Error("Should get initializerOptions");
    }

    const currentStructInfo: arkts.StructInfo = arkts.GlobalInfo.getInfoInstance().getStructInfo(interfaceName);
    const paramters: arkts.AstNode[] = [];
    currentStructInfo.stateVariables.forEach((propertyItem) => {
        paramters.push(propertyItem.originNode)
        paramters.push(propertyItem.translatedNode)
    });
    const body: arkts.TSInterfaceBody = arkts.factory.createInterfaceBody([arkts.factory.createBlock(paramters)]);
    const newInterface: arkts.TSInterfaceDeclaration = arkts.factory.updateInterfaceDeclaration(
        interfaceNode,
        interfaceNode.extends,
        interfaceNode.id,
        interfaceNode.typeParams,
        body,
        interfaceNode.isStatic,
        // TODO: how do I get it?
        true
    );
    return newInterface;
}

function tranformClassMembers(node: arkts.ClassDeclaration): arkts.ClassDeclaration {
    if (!node.definition) {
        return node;
    }

    const definition: arkts.ClassDefinition = node.definition;
    const className: string | undefined = node.definition.ident?.name;
    if (!className) {
        throw "Non Empty className expected for Component"
    }

    const propertyTranslators: PropertyTranslator[] = filterDefined(
        definition.body.map(it => classifyProperty(it, className))
    );

    const translatedMembers: arkts.AstNode[] = tranformPropertyMembers(className, propertyTranslators);

    const updateMembers: arkts.AstNode[] = definition.body
        .filter((member)=>!arkts.isClassProperty(member))
        .map((member: arkts.AstNode) => {
            if (arkts.isMethodDefinition(member) && isKnownMethodDefinition(member, "constructor")) {
                return arkts.factory.createMethodDefinition(
                    arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_CONSTRUCTOR,
                    member.name,
                    arkts.factory.createFunctionExpression(member.scriptFunction),
                    arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_CONSTRUCTOR,
                    false
                );
            }
            if (arkts.isMethodDefinition(member) && isKnownMethodDefinition(member, "build")) {
                const stub = transformBuildMethod(member, className);
                return stub;
            }

            return member;
        }
    );

    const updateClassDef: arkts.ClassDefinition = arkts.factory.updateClassDefinition(
        definition,
        definition.ident,
        definition.typeParams,
        definition.superTypeParams,
        definition.implements,
        undefined,
        definition.super,
        [...translatedMembers, ...updateMembers],
        definition.modifiers,
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE
    );

    return arkts.factory.updateClassDeclaration(node, updateClassDef);
}

export class StructTransformer extends AbstractVisitor {
    visitor(beforeChildren: arkts.AstNode): arkts.AstNode {
        const node = this.visitEachChild(beforeChildren);
        if (arkts.isClassDeclaration(node) && isCustomComponentClass(node)) {
            return tranformClassMembers(node);
        } else if (arkts.isTSInterfaceDeclaration(node) && isCustomComponentInterface(node)) {
            return addVariableInInterface(node);
        }
        return node;
    }
}

