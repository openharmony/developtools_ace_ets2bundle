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

import * as arkts from '@koalaui/libarkts';
import { ProjectConfig } from '../common/plugin-context';
import { factory as structFactory } from './struct-translators/factory';
import { factory as builderLambdaFactory } from './builder-lambda-translators/factory';
import { factory as uiFactory } from './ui-factory';
import { factory as entryFactory } from './entry-translators/factory';
import { AbstractVisitor } from '../common/abstract-visitor';
import { annotation, collect, filterDefined, removeAnnotationByName, backingField } from '../common/arkts-utils';
import {
    CustomComponentNames,
    getCustomComponentOptionsName,
    getTypeNameFromTypeParameter,
    getTypeParamsFromClassDecl,
    BuilderLambdaNames,
} from './utils';
import { hasDecorator, DecoratorNames } from './property-translators/utils';
import {
    ScopeInfo,
    isCustomComponentClass,
    isKnownMethodDefinition,
    isEtsGlobalClass,
    isReourceNode,
    isEntryClass,
} from './struct-translators/utils';
import {
    isBuilderLambda,
    isBuilderLambdaMethodDecl,
    isBuilderLambdaFunctionCall,
    builderLambdaMethodDeclType,
    replaceBuilderLambdaDeclMethodName,
    findBuilderLambdaDeclInfo,
    callIsGoodForBuilderLambda,
    builderLambdaFunctionName,
    BuilderLambdaDeclInfo,
    builderLambdaType,
    builderLambdaTypeName,
} from './builder-lambda-translators/utils';
import { isEntryWrapperClass } from './entry-translators/utils';
import { classifyProperty, PropertyTranslator } from './property-translators';
import { createRegisterMethod } from './router';

export class CheckedTransformer extends AbstractVisitor {
    private scopeInfos: ScopeInfo[] = [];
    projectConfig: ProjectConfig | undefined;

    constructor(projectConfig: ProjectConfig | undefined) {
        super();
        this.projectConfig = projectConfig;
    }

    reset(): void {
        super.reset();
        this.scopeInfos = [];
    }

    enter(node: arkts.AstNode): void {
        if (arkts.isClassDeclaration(node) && isCustomComponentClass(node)) {
            this.scopeInfos.push({ name: node.definition!.ident!.name });
        }
        if (arkts.isMethodDefinition(node) && this.scopeInfos.length > 0) {
            const name = node.name.name;
            const scopeInfo = this.scopeInfos.pop()!;
            scopeInfo.hasInitializeStruct ||= name === CustomComponentNames.COMPONENT_INITIALIZE_STRUCT;
            scopeInfo.hasUpdateStruct ||= name === CustomComponentNames.COMPONENT_UPDATE_STRUCT;
            scopeInfo.hasReusableRebind ||= name === CustomComponentNames.REUSABLE_COMPONENT_REBIND_STATE;
            this.scopeInfos.push(scopeInfo);
        }
    }

    exit(node: arkts.AstNode): void {
        if (arkts.isClassDeclaration(node) && isCustomComponentClass(node)) {
            this.scopeInfos.pop();
        }
    }

    visitor(beforeChildren: arkts.AstNode): arkts.AstNode {
        this.enter(beforeChildren);
        if (arkts.isCallExpression(beforeChildren) && isBuilderLambda(beforeChildren, this.isExternal)) {
            const lambda = transformBuilderLambda(beforeChildren, this.isExternal);
            return this.visitEachChild(lambda);
        } else if (arkts.isMethodDefinition(beforeChildren) && isBuilderLambdaMethodDecl(beforeChildren, this.isExternal)) {
            const lambda = transformBuilderLambdaMethodDecl(beforeChildren);
            return this.visitEachChild(lambda);
        }
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
        } else if (arkts.isClassDeclaration(node) && isEntryClass(node)) {
            const newNode = addRegisterRouterMethod(node);
            return newNode;
        } else if (arkts.isETSImportDeclaration(node)) {
            const specifiers = node.specifiers;
            for (const specifier of specifiers) {
                const decl = arkts.getDecl(specifier);
                console.log("print import decl:" + specifier.imported?.name)
                console.log(decl?.dumpJson());
            }
        }
        return node;
    }
}

function addRegisterRouterMethod(
    node: arkts.ClassDeclaration
): arkts.ClassDeclaration {
    const definition: arkts.ClassDefinition = node.definition!;
    const registerMethod = createRegisterMethod()
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
        throw new Error('Non Empty className expected for Component');
    }

    const propertyTranslators: PropertyTranslator[] = filterDefined(
        definition.body.map((it) => classifyProperty(it, className))
    );
    const translatedMembers: arkts.AstNode[] = tranformPropertyMembers(
        className,
        propertyTranslators,
        classOptionsName ?? getCustomComponentOptionsName(className),
        isDecl,
        scope
    );
    const updateMembers: arkts.AstNode[] = definition.body
        .filter((member) => !arkts.isClassProperty(member))
        .map((member: arkts.AstNode) =>
            transformOtherMembersInClass(member, classTypeName, classOptionsName, className, isDecl)
        );

    const updateClassDef: arkts.ClassDefinition = structFactory.updateCustomComponentClass(definition, [
        ...translatedMembers,
        ...updateMembers,
    ]);
    return arkts.factory.updateClassDeclaration(node, updateClassDef);
}

function transformOtherMembersInClass(
    member: arkts.AstNode,
    classTypeName: string | undefined,
    classOptionsName: string | undefined,
    className: string,
    isDecl?: boolean
): arkts.AstNode {
    if (arkts.isMethodDefinition(member) && hasDecorator(member, DecoratorNames.BUILDER)) {
        member.scriptFunction.setAnnotations([annotation('memo')]);
        return member;
    }
    if (
        arkts.isMethodDefinition(member) &&
        isKnownMethodDefinition(member, CustomComponentNames.COMPONENT_CONSTRUCTOR_ORI) &&
        !isDecl
    ) {
        return uiFactory.createConstructorMethod(member);
    }
    if (arkts.isMethodDefinition(member) && isKnownMethodDefinition(member, CustomComponentNames.COMPONENT_BUILD_ORI)) {
        return structFactory.transformBuildMethodWithOriginBuild(
            member,
            classTypeName ?? className,
            classOptionsName ?? getCustomComponentOptionsName(className),
            isDecl
        );
    }
    return member;
}

function tranformPropertyMembers(
    className: string,
    propertyTranslators: PropertyTranslator[],
    optionsTypeName: string,
    isDecl?: boolean,
    scope?: ScopeInfo
): arkts.AstNode[] {
    const propertyMembers = propertyTranslators.map((translator) => translator.translateMember());
    const currentStructInfo: arkts.StructInfo = arkts.GlobalInfo.getInfoInstance().getStructInfo(className);
    const collections = [];
    if (!scope?.hasInitializeStruct) {
        collections.push(structFactory.createInitializeStruct(currentStructInfo, optionsTypeName, isDecl));
    }
    if (!scope?.hasUpdateStruct) {
        collections.push(structFactory.createUpdateStruct(currentStructInfo, optionsTypeName, isDecl));
    }
    if (currentStructInfo.isReusable) {
        collections.push(structFactory.toRecord(optionsTypeName, currentStructInfo.toRecordBody));
    }
    return collect(...collections, ...propertyMembers);
}

function transformBuilderLambdaMethodDecl(node: arkts.MethodDefinition): arkts.AstNode {
    const func: arkts.ScriptFunction = node.scriptFunction;
    const isFunctionCall: boolean = isBuilderLambdaFunctionCall(node);
    const typeNode: arkts.TypeNode | undefined = builderLambdaMethodDeclType(node);
    const styleArg: arkts.ETSParameterExpression = builderLambdaFactory.createStyleArgInBuilderLambdaDecl(
        typeNode,
        isFunctionCall
    );
    return builderLambdaFactory.updateBuilderLambdaMethodDecl(
        node,
        styleArg,
        removeAnnotationByName(func.annotations, BuilderLambdaNames.ANNOTATION_NAME),
        replaceBuilderLambdaDeclMethodName(node.name.name)
    );
}

function transformEtsGlobalClassMembers(node: arkts.ClassDeclaration): arkts.ClassDeclaration {
    if (!node.definition) {
        return node;
    }
    node.definition.body.map((member: arkts.AstNode) => {
        if (arkts.isMethodDefinition(member) && hasDecorator(member, DecoratorNames.BUILDER)) {
            member.scriptFunction.setAnnotations([annotation('memo')]);
        }
        return member;
    });
    return node;
}

function transformResource(
    resourceNode: arkts.CallExpression,
    projectConfig: ProjectConfig | undefined
): arkts.CallExpression {
    const newArgs: arkts.AstNode[] = [
        arkts.factory.create1StringLiteral(projectConfig?.bundleName ? projectConfig.bundleName : ''),
        arkts.factory.create1StringLiteral(projectConfig?.moduleName ? projectConfig.moduleName : ''),
        ...resourceNode.arguments,
    ];
    return structFactory.generateTransformedResource(resourceNode, newArgs);
}

function transformBuilderLambda(node: arkts.CallExpression, isExternal?: boolean): arkts.AstNode {
    let instanceCalls: arkts.CallExpression[] = [];
    let leaf: arkts.CallExpression = node;

    while (
        true &&
        arkts.isMemberExpression(leaf.expression) &&
        arkts.isIdentifier(leaf.expression.property) &&
        arkts.isCallExpression(leaf.expression.object)
    ) {
        instanceCalls.push(arkts.factory.createCallExpression(leaf.expression.property, undefined, leaf.arguments));
        leaf = leaf.expression.object;
    }

    const replace: arkts.Identifier | arkts.MemberExpression | undefined = builderLambdaReplace(leaf);
    const declInfo: BuilderLambdaDeclInfo | undefined = findBuilderLambdaDeclInfo(leaf);
    if (!replace || !declInfo) {
        return node;
    }
    let lambdaBody: arkts.Identifier | arkts.CallExpression | undefined;
    if (instanceCalls.length > 0) {
        instanceCalls = instanceCalls.reverse();
        lambdaBody = arkts.factory.createIdentifier(BuilderLambdaNames.STYLE_ARROW_PARAM_NAME);
        instanceCalls.forEach((call) => {
            if (!arkts.isIdentifier(call.expression)) {
                throw new Error('call expression should be identifier');
            }
            lambdaBody = builderLambdaFactory.createStyleLambdaBody(lambdaBody!, call);
        });
    }
    const args: (arkts.AstNode | undefined)[] = generateArgsInBuilderLambda(leaf, lambdaBody!, declInfo, isExternal);
    return arkts.factory.updateCallExpression(node, replace, undefined, filterDefined(args));
}

function builderLambdaReplace(leaf: arkts.CallExpression): arkts.Identifier | arkts.MemberExpression | undefined {
    if (!callIsGoodForBuilderLambda(leaf)) {
        return undefined;
    }
    const node = leaf.expression;
    const funcName = builderLambdaFunctionName(leaf);
    if (!funcName) {
        return undefined;
    }
    if (arkts.isIdentifier(node)) {
        return arkts.factory.createIdentifier(funcName);
    }
    if (arkts.isMemberExpression(node)) {
        return arkts.factory.createMemberExpression(
            node.object,
            arkts.factory.createIdentifier(funcName),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            node.computed,
            node.optional
        );
    }
    return undefined;
}

function generateArgsInBuilderLambda(
    leaf: arkts.CallExpression,
    lambdaBody: arkts.Identifier | arkts.CallExpression,
    declInfo: BuilderLambdaDeclInfo,
    isExternal?: boolean
): (arkts.AstNode | undefined)[] {
    const { params } = declInfo;
    const typeNode: arkts.TypeNode | undefined = builderLambdaType(leaf);
    const typeName: string | undefined = builderLambdaTypeName(leaf);
    const args: (arkts.AstNode | undefined)[] = [
        builderLambdaFactory.createStyleArgInBuilderLambda(lambdaBody, typeNode),
    ];
    let index = 0;
    while (index < params.length) {
        const isReusable: boolean = typeName
            ? arkts.GlobalInfo.getInfoInstance().getStructInfo(typeName).isReusable
            : false;
        if (isReusable && index === params.length - 1) {
            const reuseId = arkts.factory.createStringLiteral(typeName!);
            args.push(createOrUpdateArgInBuilderLambda(leaf.arguments.at(index), isExternal, typeName, reuseId));
        } else {
            args.push(createOrUpdateArgInBuilderLambda(leaf.arguments.at(index), isExternal, typeName));
        }
        index++;
    }
    return args;
}

function createOrUpdateArgInBuilderLambda(
    arg: arkts.Expression | undefined,
    isExternal?: boolean,
    typeName?: string,
    fallback?: arkts.AstNode
): arkts.AstNode {
    if (!arg) {
        return fallback ?? arkts.factory.createUndefinedLiteral();
    }
    if (arkts.isArrowFunctionExpression(arg)) {
        return processArgArrowFunction(arg, isExternal);
    }
    if (arkts.isTSAsExpression(arg)) {
        return processArgTSAsExpression(arg, typeName!);
    }
    return arg;
}

function processArgArrowFunction(
    arg: arkts.ArrowFunctionExpression,
    isExternal?: boolean
): arkts.ArrowFunctionExpression {
    const func: arkts.ScriptFunction = arg.scriptFunction;
    const updateFunc = arkts.factory.updateScriptFunction(
        func,
        !!func.body && arkts.isBlockStatement(func.body)
            ? arkts.factory.updateBlock(
                  func.body,
                  func.body.statements.map((st) => updateContentBodyInBuilderLambda(st, isExternal))
              )
            : undefined,
        arkts.FunctionSignature.createFunctionSignature(func.typeParams, func.params, func.returnTypeAnnotation, false),
        func.flags,
        func.modifiers
    );
    return arkts.factory.updateArrowFunction(arg, updateFunc);
}

function processArgTSAsExpression(arg: arkts.TSAsExpression, typeName: string): arkts.TSAsExpression {
    if (!arg.expr || !arkts.isObjectExpression(arg.expr)) {
        return arg;
    }
    const currentStructInfo: arkts.StructInfo = arkts.GlobalInfo.getInfoInstance().getStructInfo(typeName!);
    const properties = arg.expr.properties as arkts.Property[];
    properties.forEach((prop, index) => {
        updateParameterPassing(prop, index, currentStructInfo, properties);
    });
    const updatedExpr: arkts.ObjectExpression = arkts.ObjectExpression.updateObjectExpression(
        arg.expr,
        arkts.Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION,
        properties,
        false
    );
    return arkts.TSAsExpression.updateTSAsExpression(arg, updatedExpr, arg.typeAnnotation, arg.isConst);
}

function updateContentBodyInBuilderLambda(statement: arkts.Statement, isExternal?: boolean): arkts.Statement {
    if (
        arkts.isExpressionStatement(statement) &&
        arkts.isCallExpression(statement.expression) &&
        isBuilderLambda(statement.expression, isExternal)
    ) {
        return arkts.factory.updateExpressionStatement(statement, transformBuilderLambda(statement.expression));
    }
    // TODO: very time-consuming...
    if (arkts.isIfStatement(statement)) {
        return updateIfElseContentBodyInBuilderLambda(statement, isExternal);
    }

    return statement;
}

function updateParameterPassing(
    prop: arkts.Property,
    index: number,
    currentStructInfo: arkts.StructInfo,
    properties: arkts.Property[]
): void {
    if (
        prop.key &&
        prop.value &&
        arkts.isIdentifier(prop.key) &&
        arkts.isMemberExpression(prop.value) &&
        arkts.isThisExpression(prop.value.object) &&
        arkts.isIdentifier(prop.value.property)
    ) {
        const structVariableMetadata = currentStructInfo.metadata[prop.key.name];
        if (structVariableMetadata.properties.includes(DecoratorNames.LINK)) {
            properties[index] = arkts.Property.updateProperty(
                prop,
                arkts.factory.createIdentifier(backingField(prop.key.name)),
                builderLambdaFactory.updateBackingMember(prop.value, prop.value.property.name)
            );
        }
    }
}

// TODO: very time-consuming...
function updateIfElseContentBodyInBuilderLambda(statement: arkts.AstNode, isExternal?: boolean): arkts.AstNode {
    if (arkts.isIfStatement(statement)) {
        const alternate = !!statement.alternate
            ? updateIfElseContentBodyInBuilderLambda(statement.alternate, isExternal)
            : statement.alternate;
        const consequence = updateIfElseContentBodyInBuilderLambda(statement.consequent, isExternal);
        return arkts.factory.updateIfStatement(statement, statement.test, consequence!, alternate);
    }
    if (arkts.isBlockStatement(statement)) {
        return arkts.factory.updateBlock(
            statement,
            statement.statements.map((st) => updateContentBodyInBuilderLambda(st, isExternal))
        );
    }
    return statement;
}
