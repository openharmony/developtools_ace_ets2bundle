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
import { AbstractVisitor } from '../../common/abstract-visitor';
import { BuilderLambdaNames } from '../utils';
import { filterDefined, removeAnnotationByName, backingField } from '../../common/arkts-utils';
import { DecoratorNames } from '../property-translators/utils';
import {
    BuilderLambdaDeclInfo,
    isBuilderLambda,
    builderLambdaFunctionName,
    findBuilderLambdaDeclInfo,
    isBuilderLambdaMethodDecl,
    replaceBuilderLambdaDeclMethodName,
    isBuilderLambdaFunctionCall,
    callIsGoodForBuilderLambda,
    builderLambdaTypeName,
    builderLambdaMethodDeclType,
    builderLambdaType,
} from './utils';
import { factory } from './factory';

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
                factory.updateBackingMember(prop.value, prop.value.property.name)
            );
        }
    }
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

function generateArgsInBuilderLambda(
    leaf: arkts.CallExpression,
    lambdaBody: arkts.Identifier | arkts.CallExpression,
    declInfo: BuilderLambdaDeclInfo,
    isExternal?: boolean
): (arkts.AstNode | undefined)[] {
    const { params } = declInfo;
    const typeNode: arkts.TypeNode | undefined = builderLambdaType(leaf);
    const typeName: string | undefined = builderLambdaTypeName(leaf);
    const args: (arkts.AstNode | undefined)[] = [factory.createStyleArgInBuilderLambda(lambdaBody, typeNode)];
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
            lambdaBody = factory.createStyleLambdaBody(lambdaBody!, call);
        });
    }
    const args: (arkts.AstNode | undefined)[] = generateArgsInBuilderLambda(leaf, lambdaBody!, declInfo, isExternal);
    return arkts.factory.updateCallExpression(node, replace, undefined, filterDefined(args));
}

function transformBuilderLambdaMethodDecl(node: arkts.MethodDefinition): arkts.AstNode {
    const func: arkts.ScriptFunction = node.scriptFunction;
    const isFunctionCall: boolean = isBuilderLambdaFunctionCall(node);
    const typeNode: arkts.TypeNode | undefined = builderLambdaMethodDeclType(node);
    const styleArg: arkts.ETSParameterExpression = factory.createStyleArgInBuilderLambdaDecl(typeNode, isFunctionCall);
    return factory.updateBuilderLambdaMethodDecl(
        node,
        styleArg,
        removeAnnotationByName(func.annotations, BuilderLambdaNames.ANNOTATION_NAME),
        replaceBuilderLambdaDeclMethodName(node.name.name)
    );
}

export class BuilderLambdaTransformer extends AbstractVisitor {
    visitEachChild(node: arkts.AstNode): arkts.AstNode {
        if (arkts.isCallExpression(node) && isBuilderLambda(node, this.isExternal)) {
            return node;
        }
        if (arkts.isMethodDefinition(node) && isBuilderLambdaMethodDecl(node, this.isExternal)) {
            return node;
        }

        return super.visitEachChild(node);
    }

    visitor(beforeChildren: arkts.AstNode): arkts.AstNode {
        const node = this.visitEachChild(beforeChildren);

        if (arkts.isCallExpression(node) && isBuilderLambda(node, this.isExternal)) {
            const lambda = transformBuilderLambda(node, this.isExternal);
            return lambda;
        }
        if (arkts.isMethodDefinition(node) && isBuilderLambdaMethodDecl(node, this.isExternal)) {
            const lambda = transformBuilderLambdaMethodDecl(node);
            return lambda;
        }

        return node;
    }
}
