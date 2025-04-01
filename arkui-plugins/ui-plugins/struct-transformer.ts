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
import { ProjectConfig } from "../common/plugin-context";
import { 
    classifyProperty, 
    PropertyTranslator 
} from "./property-translators";
import { 
    CustomComponentNames, 
    getCustomComponentOptionsName,
    getTypeNameFromTypeParameter,
    getTypeParamsFromClassDecl,
    Dollars
} from "./utils";
import {
    factory
} from "./ui-factory";
import {
    isEntryWrapperClass
} from "./entry-translators/utils";
import {
    factory as entryFactory
} from "./entry-translators/factory";
import { DecoratorNames, hasDecorator } from "./property-translators/utils";

function isCustomComponentClass(node: arkts.ClassDeclaration): boolean {
    if (!node.definition?.ident?.name) return false;
    const name: string = node.definition.ident.name;
    const structCollection: Set<string> = arkts.GlobalInfo.getInfoInstance().getStructCollection();
    return (
        name === CustomComponentNames.COMPONENT_CLASS_NAME
        || structCollection.has(name)
    );
}

function isKnownMethodDefinition(method: arkts.MethodDefinition, name: string): boolean {
    if (!method || !arkts.isMethodDefinition(method)) return false;

    // For now, we only considered matched method name.
    const isNameMatched: boolean = method.name?.name === name;
    return isNameMatched;
}

function isEtsGlobalClass(node: arkts.ClassDeclaration): boolean {
    if (node.definition?.ident?.name === 'ETSGLOBAL') {
        return true;
    }
    return false;
}

function isReourceNode(node: arkts.CallExpression): boolean {
    if (node.expression.dumpSrc() === Dollars.DOLLAR_RESOURCE || 
        node.expression.dumpSrc() === Dollars.DOLLAR_RAWFILE) {
        return true;
    }
    return false;
}

function transformBuildMethod(
    method: arkts.MethodDefinition,
    typeName: string,
    optionsName: string,
    isDecl?: boolean
): arkts.MethodDefinition {
    const updateKey: arkts.Identifier = arkts.factory.createIdentifier(
        CustomComponentNames.COMPONENT_BUILD
    );

    const scriptFunction: arkts.ScriptFunction = method.scriptFunction;
    const updateScriptFunction = arkts.factory.createScriptFunction(
        scriptFunction.body,
        arkts.FunctionSignature.createFunctionSignature(
            scriptFunction.typeParams,
            [
                factory.createStyleParameter(typeName),
                factory.createContentParameter(),
                factory.createInitializersOptionsParameter(optionsName)
            ],
            arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
            false
        ),
        scriptFunction.flags,
        scriptFunction.modifiers
    ).setAnnotations([annotation("memo")]);

    const modifiers: arkts.Es2pandaModifierFlags = isDecl
        ? arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_ABSTRACT
        : arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
    return arkts.factory.createMethodDefinition(
        arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD,
        updateKey,
        arkts.factory.createFunctionExpression(updateScriptFunction),
        modifiers,
        false
    );
}

function createInitializeStruct(
    structInfo: arkts.StructInfo, 
    optionsTypeName: string,
    isDecl?: boolean
) {
    const updateKey: arkts.Identifier = arkts.factory.createIdentifier(
        CustomComponentNames.COMPONENT_INITIALIZE_STRUCT
    );

    let body: arkts.BlockStatement | undefined;
    let modifiers: arkts.Es2pandaModifierFlags = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_ABSTRACT;
    if (!isDecl) {
        body = arkts.factory.createBlock(structInfo.initializeBody);
        modifiers = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
    }
    const scriptFunction: arkts.ScriptFunction = arkts.factory.createScriptFunction(
        body,
        arkts.FunctionSignature.createFunctionSignature(
            undefined,
            [
                factory.createInitializersOptionsParameter(optionsTypeName),
                factory.createContentParameter()
            ],
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
        arkts.factory.createFunctionExpression(scriptFunction),
        modifiers,
        false
    );
}

function createUpdateStruct(
    structInfo: arkts.StructInfo, 
    optionsTypeName: string,
    isDecl?: boolean
) {
    const updateKey: arkts.Identifier = arkts.factory.createIdentifier(
        CustomComponentNames.COMPONENT_UPDATE_STRUCT
    );

    let body: arkts.BlockStatement | undefined;
    let modifiers: arkts.Es2pandaModifierFlags = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_ABSTRACT;
    if (!isDecl) {
        body = arkts.factory.createBlock(structInfo.updateBody);
        modifiers = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC;
    }

    const scriptFunction: arkts.ScriptFunction = arkts.factory.createScriptFunction(
        body,
        arkts.FunctionSignature.createFunctionSignature(
            undefined,
            [
                factory.createInitializersOptionsParameter(optionsTypeName)
            ],
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
        arkts.factory.createFunctionExpression(scriptFunction),
        modifiers,
        false
    );
}

function toRecord(optionsTypeName: string, toRecordBody: arkts.Property[]){
    // const paramsCasted = params as ChildOptions
    const paramsCasted = arkts.factory.createVariableDeclaration(
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_CONST,
        [arkts.factory.createVariableDeclarator(
            arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_CONST,
            arkts.factory.createIdentifier("paramsCasted"),
            arkts.TSAsExpression.createTSAsExpression(
                arkts.factory.createIdentifier("params"),
                arkts.factory.createTypeReference(
                    arkts.factory.createTypeReferencePart(
                        arkts.factory.createIdentifier(optionsTypeName)
                    )
                ),
                false
            )
        )]
    )

    const returnRecord = arkts.factory.createReturnStatement(
        arkts.ObjectExpression.createObjectExpression(
            arkts.Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION,
            toRecordBody,
            false
        )
    )

    const body: arkts.BlockStatement = arkts.factory.createBlock([paramsCasted, returnRecord]);

    const params = arkts.ETSParameterExpression.create(
        arkts.factory.createIdentifier(
            "params",
            arkts.factory.createTypeReference(
                arkts.factory.createTypeReferencePart(
                    arkts.factory.createIdentifier("Object")
                )
            )
        ),
        undefined
    )

    const typeRecord = arkts.factory.createTypeReference(
        arkts.factory.createTypeReferencePart(
            arkts.factory.createIdentifier("Record"),
            arkts.factory.createTSTypeParameterInstantiation(
                [
                    arkts.factory.createTypeReference(
                        arkts.factory.createTypeReferencePart(
                            arkts.factory.createIdentifier("string"),
                        )
                    ),
                    arkts.factory.createTypeReference(
                        arkts.factory.createTypeReferencePart(
                            arkts.factory.createIdentifier("Object")
                        )
                    )
                ]
            )
        )
    )

    const toRecordScriptFunction = arkts.factory.createScriptFunction(
        body,
        arkts.FunctionSignature.createFunctionSignature(
            undefined,
            [ params ],
            typeRecord,
            false
        ),
        arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD,
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC 
    )

    return arkts.factory.createMethodDefinition(
        arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_CONSTRUCTOR,
        arkts.factory.createIdentifier('__toRecord'),
        arkts.factory.createFunctionExpression(toRecordScriptFunction),
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_OVERRIDE,
        false
    );
}

function tranformPropertyMembers(
    className: string, 
    propertyTranslators: PropertyTranslator[],
    optionsTypeName: string,
    isDecl?: boolean,
    scope?: ScopeInfo
): arkts.AstNode[] {
    const propertyMembers = propertyTranslators.map(translator =>
        translator.translateMember()
    );
    const currentStructInfo: arkts.StructInfo = arkts.GlobalInfo
        .getInfoInstance()
        .getStructInfo(className);
    const collections = [];
    if (!scope?.hasInitializeStruct) {
        collections.push(createInitializeStruct(currentStructInfo, optionsTypeName, isDecl))
    }
    if (!scope?.hasUpdateStruct) {
        collections.push(createUpdateStruct(currentStructInfo, optionsTypeName, isDecl))
    }
    if(currentStructInfo.isReusable){
        collections.push(toRecord(optionsTypeName, currentStructInfo.toRecordBody))
    }
    return collect(...collections, ...propertyMembers);
}

function transformEtsGlobalClassMembers(node: arkts.ClassDeclaration): arkts.ClassDeclaration {
    if (!node.definition) {
        return node;
    }
    node.definition.body.map((member: arkts.AstNode) => {
        if (arkts.isMethodDefinition(member) && hasDecorator(member, DecoratorNames.BUILDER)) {
            member.scriptFunction.setAnnotations([annotation("memo")]);
        }
        return member;
    });
    return node;
}

function tranformClassMembers(
    node: arkts.ClassDeclaration, 
    isDecl?: boolean,
    scope?: ScopeInfo
): arkts.ClassDeclaration {
    if (!node.definition) {
        return node;
    }

    let classTypeName: string | undefined;
    let classOptionsName: string | undefined;
    if (isDecl) {
        const [classType, classOptions] = getTypeParamsFromClassDecl(node);
        classTypeName = getTypeNameFromTypeParameter(classType);
        classOptionsName = getTypeNameFromTypeParameter(classOptions);
    }

    const definition: arkts.ClassDefinition = node.definition;
    const className: string | undefined = node.definition.ident?.name;
    if (!className) {
        throw new Error("Non Empty className expected for Component")
    }

    const propertyTranslators: PropertyTranslator[] = filterDefined(
        definition.body.map(it => classifyProperty(it, className))
    );

    const translatedMembers: arkts.AstNode[] = tranformPropertyMembers(
        className, 
        propertyTranslators,
        classOptionsName ?? getCustomComponentOptionsName(className),
        isDecl,
        scope
    );

    const updateMembers: arkts.AstNode[] = definition.body
        .filter((member)=>!arkts.isClassProperty(member))
        .map((member: arkts.AstNode) => {
            if (arkts.isMethodDefinition(member) && hasDecorator(member, DecoratorNames.BUILDER)) {
                member.scriptFunction.setAnnotations([annotation("memo")]);
                return member;
            }
            if (
                arkts.isMethodDefinition(member) 
                && isKnownMethodDefinition(member, CustomComponentNames.COMPONENT_CONSTRUCTOR_ORI)
                && !isDecl
            ) {
                return arkts.factory.createMethodDefinition(
                    arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_CONSTRUCTOR,
                    member.name,
                    arkts.factory.createFunctionExpression(member.scriptFunction),
                    arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_CONSTRUCTOR,
                    false
                );
            }
            if (
                arkts.isMethodDefinition(member) 
                && isKnownMethodDefinition(member, CustomComponentNames.COMPONENT_BUILD_ORI)
            ) {
                const buildMethod = transformBuildMethod(
                    member, 
                    classTypeName ?? className,
                    classOptionsName ?? getCustomComponentOptionsName(className),
                    isDecl
                );
                return buildMethod;
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
        arkts.classDefinitionFlags(definition)
    );

    return arkts.factory.updateClassDeclaration(node, updateClassDef);
}

function transformResource(resourceNode: arkts.CallExpression, projectConfig: ProjectConfig | undefined): arkts.CallExpression {
    const newArgs: arkts.AstNode[] = [
        arkts.factory.create1StringLiteral(projectConfig?.bundleName ? projectConfig.bundleName : ""),
        arkts.factory.create1StringLiteral(projectConfig?.moduleName ? projectConfig.moduleName : ""),
        ...resourceNode.arguments
    ];
    const transformedKey: string = 
        resourceNode.expression.dumpSrc() === Dollars.DOLLAR_RESOURCE ? '_r' : '_rawfile';
    return arkts.factory.updateCallExpression(
        resourceNode,
        arkts.factory.createIdentifier(transformedKey),
        resourceNode.typeArguments,
        newArgs
    );
}

type ScopeInfo = {
    name: string,
    hasInitializeStruct?: boolean,
    hasUpdateStruct?: boolean,
    hasReusableRebind?: boolean
}

export class StructTransformer extends AbstractVisitor {
    private scopeInfos: ScopeInfo[] = [];
    projectConfig: ProjectConfig | undefined;

    constructor(projectConfig: ProjectConfig | undefined) {
        super()
        this.projectConfig = projectConfig;
    }

    reset(): void {
        super.reset();
        this.scopeInfos = [];
    }

    enter(node: arkts.AstNode) {
        if (arkts.isClassDeclaration(node) && isCustomComponentClass(node)) {
            this.scopeInfos.push({ name: node.definition!.ident!.name });
        }
        if (arkts.isMethodDefinition(node) && this.scopeInfos.length > 0) {
            const name = node.name.name;
            const scopeInfo = this.scopeInfos.pop()!;
            scopeInfo.hasInitializeStruct ||= (name === CustomComponentNames.COMPONENT_INITIALIZE_STRUCT);
            scopeInfo.hasUpdateStruct ||= (name === CustomComponentNames.COMPONENT_UPDATE_STRUCT);
            scopeInfo.hasReusableRebind ||= (name === CustomComponentNames.REUSABLE_COMPONENT_REBIND_STATE);
            this.scopeInfos.push(scopeInfo);
        }
    }

    exit(node: arkts.AstNode) {
        if (arkts.isClassDeclaration(node) && isCustomComponentClass(node)) {
            this.scopeInfos.pop();
        }
    }

    visitor(beforeChildren: arkts.AstNode): arkts.AstNode {
        this.enter(beforeChildren);
        const node = this.visitEachChild(beforeChildren);
        if (arkts.isClassDeclaration(node) && isCustomComponentClass(node)) {
            let scope: ScopeInfo | undefined;
            if (this.scopeInfos.length > 0) {
                scope = this.scopeInfos[this.scopeInfos.length - 1];
            }
            const newClass: arkts.ClassDeclaration = tranformClassMembers(
                node,
                arkts.hasModifierFlag(node, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE),
                scope
            );
            this.exit(beforeChildren);
            return newClass;
        } else if (isEntryWrapperClass(node)) {
            entryFactory.addMemoToEntryWrapperClassMethods(node);
            return node;
        } else if (arkts.isClassDeclaration(node) && isEtsGlobalClass(node)) {
            return transformEtsGlobalClassMembers(node);
        } else if (arkts.isCallExpression(node) && isReourceNode(node)) {
            return transformResource(node, this.projectConfig);
        }
        return node;
    }
}

