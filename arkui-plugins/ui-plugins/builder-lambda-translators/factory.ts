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
import { BuilderLambdaNames } from '../utils';
import { annotation, backingField, filterDefined, removeAnnotationByName } from '../../common/arkts-utils';
import {
    BuilderLambdaDeclInfo,
    builderLambdaFunctionName,
    builderLambdaMethodDeclType,
    builderLambdaTypeName,
    callIsGoodForBuilderLambda,
    findBuilderLambdaDecl,
    findBuilderLambdaDeclInfo,
    isBuilderLambda,
    isBuilderLambdaFunctionCall,
    replaceBuilderLambdaDeclMethodName,
} from './utils';
import { DecoratorNames } from '../property-translators/utils';

export class factory {
    /*
     * update @ComponentBuilder decorated method.
     */
    static updateBuilderLambdaMethodDecl(
        node: arkts.MethodDefinition,
        styleArg: arkts.ETSParameterExpression,
        newAnno: arkts.AnnotationUsage[],
        newName: string | undefined
    ): arkts.MethodDefinition {
        const func: arkts.ScriptFunction = node.scriptFunction;
        const updateFunc = arkts.factory
            .updateScriptFunction(
                func,
                func.body,
                arkts.FunctionSignature.createFunctionSignature(
                    func.typeParams,
                    [styleArg, ...func.params],
                    arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                    false
                ),
                func.flags,
                func.modifiers
            )
            .setAnnotations(newAnno);

        return arkts.factory.updateMethodDefinition(
            node,
            node.kind,
            arkts.factory.updateIdentifier(node.name, newName ?? node.name.name),
            arkts.factory.createFunctionExpression(updateFunc),
            node.modifiers,
            false // TODO: how do I get it?
        );
    }

    /*
     * create style instance call, e.g. `instance.margin(10)`.
     */
    static createStyleLambdaBody(lambdaBody: arkts.AstNode, call: arkts.CallExpression): arkts.CallExpression {
        return arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                lambdaBody,
                call.expression,
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            call.arguments.map((arg) => {
                if (arkts.isArrowFunctionExpression(arg)) {
                    return this.processArgArrowFunction(arg);
                }
                return arg;
            })
        );
    }

    /*
     * update parameter passing, e.g. `<val.object>: __backing_<originName>`.
     */
    static updateBackingMember(val: arkts.MemberExpression, originName: string): arkts.MemberExpression {
        return arkts.factory.updateMemberExpression(
            val,
            val.object,
            arkts.factory.createIdentifier(backingField(originName)),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        );
    }

    /*
     * create style arguments in builder lambda.
     */
    static createStyleArgInBuilderLambda(
        lambdaBody: arkts.Expression | undefined,
        typeNode: arkts.TypeNode | undefined
    ): arkts.UndefinedLiteral | arkts.ArrowFunctionExpression {
        if (!lambdaBody) {
            return arkts.factory.createUndefinedLiteral();
        }

        const styleLambdaParam: arkts.ETSParameterExpression = arkts.factory.createParameterDeclaration(
            arkts.factory.createIdentifier(BuilderLambdaNames.STYLE_ARROW_PARAM_NAME, typeNode),
            undefined
        );

        const body: arkts.BlockStatement = arkts.factory.createBlock([
            arkts.factory.createExpressionStatement(lambdaBody),
            arkts.factory.createReturnStatement(),
        ]);

        const func = arkts.factory.createScriptFunction(
            body,
            arkts.FunctionSignature.createFunctionSignature(
                undefined,
                [styleLambdaParam],
                arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                false
            ),
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC
        );

        return arkts.factory.createArrowFunction(func);
    }

    /*
     * create style arguments in builder lambda declaration.
     */
    static createStyleArgInBuilderLambdaDecl(
        typeNode: arkts.TypeNode | undefined,
        isFunctionCall: boolean
    ): arkts.ETSParameterExpression {
        const styleLambdaParam: arkts.ETSParameterExpression = arkts.factory.createParameterDeclaration(
            arkts.factory.createIdentifier(BuilderLambdaNames.STYLE_ARROW_PARAM_NAME, typeNode),
            undefined
        );
        const funcType = arkts.factory.createFunctionType(
            arkts.FunctionSignature.createFunctionSignature(
                undefined,
                [styleLambdaParam],
                arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                false
            ),
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW
        );

        let parameter: arkts.ETSParameterExpression;
        if (isFunctionCall) {
            parameter = arkts.factory
                .createParameterDeclaration(
                    arkts.factory.createIdentifier(BuilderLambdaNames.STYLE_PARAM_NAME, funcType),
                    undefined
                )
                .setOptional(true);
        } else {
            const optionalFuncType = arkts.factory.createUnionType([funcType, arkts.factory.createETSUndefinedType()]);
            parameter = arkts.factory.createParameterDeclaration(
                arkts.factory.createIdentifier(BuilderLambdaNames.STYLE_PARAM_NAME, optionalFuncType),
                undefined
            );
        }
        parameter.annotations = [annotation('memo')];
        return parameter;
    }

    /**
     * If a builder lambda's argument is an arrow function,
     * then transform any builder lambda in the function body.
     */
    static processArgArrowFunction(arg: arkts.ArrowFunctionExpression): arkts.ArrowFunctionExpression {
        const func: arkts.ScriptFunction = arg.scriptFunction;
        const updateFunc = arkts.factory.updateScriptFunction(
            func,
            !!func.body && arkts.isBlockStatement(func.body)
                ? arkts.factory.updateBlock(
                      func.body,
                      func.body.statements.map((st) => this.updateContentBodyInBuilderLambda(st))
                  )
                : undefined,
            arkts.FunctionSignature.createFunctionSignature(
                func.typeParams,
                func.params,
                func.returnTypeAnnotation,
                false
            ),
            func.flags,
            func.modifiers
        );
        return arkts.factory.updateArrowFunction(arg, updateFunc);
    }

    /**
     * transform options argument in a builder lambda call.
     */
    static processOptionsArg<T extends arkts.TSAsExpression | arkts.ObjectExpression>(arg: T, typeName: string): T {
        let expr: arkts.ObjectExpression | undefined;
        if (arkts.isTSAsExpression(arg) && !!arg.expr && arkts.isObjectExpression(arg.expr)) {
            expr = arg.expr;
        } else if (arkts.isObjectExpression(arg)) {
            expr = arg;
        }

        if (!expr) {
            return arg;
        }

        const currentStructInfo: arkts.StructInfo = arkts.GlobalInfo.getInfoInstance().getStructInfo(typeName!);
        const properties = expr.properties as arkts.Property[];
        properties.forEach((prop, index) => {
            this.updateParameterPassingInLinkedProperties(prop, index, currentStructInfo, properties);
        });
        const updatedExpr: arkts.ObjectExpression = arkts.ObjectExpression.updateObjectExpression(
            expr,
            arkts.Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION,
            properties,
            false
        );
        if (arkts.isTSAsExpression(arg)) {
            return arkts.TSAsExpression.updateTSAsExpression(arg, updatedExpr, arg.typeAnnotation, arg.isConst) as T;
        }
        return updatedExpr as T;
    }

    /**
     * update any `@Link` parameter passing to the custom-component child.
     */
    static updateParameterPassingInLinkedProperties(
        prop: arkts.Property,
        index: number,
        currentStructInfo: arkts.StructInfo,
        properties: arkts.Property[]
    ): void {
        if (
            !!prop.key &&
            !!prop.value &&
            arkts.isIdentifier(prop.key) &&
            arkts.isMemberExpression(prop.value) &&
            arkts.isThisExpression(prop.value.object) &&
            arkts.isIdentifier(prop.value.property)
        ) {
            const structVariableMetadata = currentStructInfo.metadata[prop.key.name];
            if (
                structVariableMetadata &&
                structVariableMetadata.properties.length &&
                structVariableMetadata.properties.includes(DecoratorNames.LINK)
            ) {
                properties[index] = arkts.Property.updateProperty(
                    prop,
                    arkts.factory.createIdentifier(backingField(prop.key.name)),
                    this.updateBackingMember(prop.value, prop.value.property.name)
                );
            }
        }
    }

    /**
     * create or update arguments in a builder lambda call.
     * If the corresponding argument is not provided, fill-in an `undefined` to it.
     */
    static createOrUpdateArgInBuilderLambda(
        arg: arkts.Expression | undefined,
        typeName?: string,
        fallback?: arkts.AstNode
    ): arkts.AstNode {
        if (!arg) {
            return fallback ?? arkts.factory.createUndefinedLiteral();
        }
        if (arkts.isArrowFunctionExpression(arg)) {
            return this.processArgArrowFunction(arg);
        }
        // this is too optimistic to check if this is an options argument...
        if (arkts.isTSAsExpression(arg) || arkts.isObjectExpression(arg)) {
            return this.processOptionsArg(arg, typeName!);
        }
        return arg;
    }

    /**
     * transform arguments in a builder lambda call.
     */
    static generateArgsInBuilderLambda(
        leaf: arkts.CallExpression,
        lambdaBody: arkts.Identifier | arkts.CallExpression,
        declInfo: BuilderLambdaDeclInfo
    ): (arkts.AstNode | undefined)[] {
        const { params, returnType } = declInfo;
        const typeName: string | undefined = builderLambdaTypeName(leaf);
        const args: (arkts.AstNode | undefined)[] = [this.createStyleArgInBuilderLambda(lambdaBody, returnType)];
        let index = 0;
        while (index < params.length) {
            const isReusable: boolean = typeName
                ? arkts.GlobalInfo.getInfoInstance().getStructInfo(typeName).isReusable
                : false;
            if (isReusable && index === params.length - 1) {
                const reuseId = arkts.factory.createStringLiteral(typeName!);
                args.push(this.createOrUpdateArgInBuilderLambda(leaf.arguments.at(index), typeName, reuseId));
            } else {
                args.push(this.createOrUpdateArgInBuilderLambda(leaf.arguments.at(index), typeName));
            }
            index++;
        }
        return args;
    }

    /**
     *  update if-else in trailing lambda contents in a builder lambda call.
     */
    static updateIfElseContentBodyInBuilderLambda(statement: arkts.AstNode): arkts.AstNode {
        if (arkts.isIfStatement(statement)) {
            const alternate = !!statement.alternate
                ? this.updateIfElseContentBodyInBuilderLambda(statement.alternate)
                : statement.alternate;
            const consequence = this.updateIfElseContentBodyInBuilderLambda(statement.consequent);
            return arkts.factory.updateIfStatement(statement, statement.test, consequence!, alternate);
        }
        if (arkts.isBlockStatement(statement)) {
            return arkts.factory.updateBlock(
                statement,
                statement.statements.map((st) => this.updateContentBodyInBuilderLambda(st))
            );
        }
        return statement;
    }

    /**
     * update trailing lambda contents in a builder lambda call.
     */
    static updateContentBodyInBuilderLambda(statement: arkts.Statement): arkts.Statement {
        if (
            arkts.isExpressionStatement(statement) &&
            arkts.isCallExpression(statement.expression) &&
            isBuilderLambda(statement.expression)
        ) {
            return arkts.factory.updateExpressionStatement(
                statement,
                this.transformBuilderLambda(statement.expression)
            );
        }
        if (arkts.isIfStatement(statement)) {
            return this.updateIfElseContentBodyInBuilderLambda(statement);
        }

        return statement;
    }

    /**
     * replace function call's name to the corresponding transformed name.
     */
    static builderLambdaReplace(leaf: arkts.CallExpression): arkts.Identifier | arkts.MemberExpression | undefined {
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

    /**
     * transform `@ComponentBuilder` in declared methods.
     */
    static transformBuilderLambdaMethodDecl(node: arkts.MethodDefinition): arkts.MethodDefinition {
        const func: arkts.ScriptFunction = node.scriptFunction;
        const isFunctionCall: boolean = isBuilderLambdaFunctionCall(node);
        const typeNode: arkts.TypeNode | undefined = builderLambdaMethodDeclType(node);
        const styleArg: arkts.ETSParameterExpression = this.createStyleArgInBuilderLambdaDecl(typeNode, isFunctionCall);
        const newOverloads: arkts.MethodDefinition[] = node.overloads.map((method) =>
            factory.transformBuilderLambdaMethodDecl(method)
        );

        return this.updateBuilderLambdaMethodDecl(
            node,
            styleArg,
            removeAnnotationByName(func.annotations, BuilderLambdaNames.ANNOTATION_NAME),
            replaceBuilderLambdaDeclMethodName(node.name.name)
        ).setOverloads(newOverloads);
    }

    /**
     * transform `.animation(...)` to `.animationStart(...) and .animationStop(...)`
     */
    static updateAnimation(instanceCalls: arkts.CallExpression[]): void {
        let lastAniIdx = 0;
        let curIdx = 0;

        while (curIdx < instanceCalls.length) {
            const property: arkts.Identifier = instanceCalls[curIdx].expression as arkts.Identifier;
            if (property.name === BuilderLambdaNames.ANIMATION_NAME) {
                const aniStart: arkts.CallExpression = arkts.factory.createCallExpression(
                    arkts.factory.createIdentifier(BuilderLambdaNames.ANIMATION_START),
                    undefined,
                    instanceCalls[curIdx].arguments
                );
                const aniStop: arkts.CallExpression = arkts.factory.createCallExpression(
                    arkts.factory.createIdentifier(BuilderLambdaNames.ANIMATION_STOP),
                    undefined,
                    instanceCalls[curIdx].arguments.map((arg)=>arg.clone())
                );
                instanceCalls.splice(lastAniIdx, 0, aniStart);
                instanceCalls[curIdx + 1] = aniStop;
                curIdx += 2;
                lastAniIdx = curIdx;
            } else {
                curIdx++;
            }
        }
    }

    /**
     * transform `@ComponentBuilder` in non-declared calls.
     */
    static transformBuilderLambda(node: arkts.CallExpression): arkts.AstNode {
        let instanceCalls: arkts.CallExpression[] = [];
        let leaf: arkts.CallExpression = node;

        while (
            arkts.isMemberExpression(leaf.expression) &&
            arkts.isIdentifier(leaf.expression.property) &&
            arkts.isCallExpression(leaf.expression.object)
        ) {
            instanceCalls.push(arkts.factory.createCallExpression(leaf.expression.property, undefined, leaf.arguments));
            leaf = leaf.expression.object;
        }

        const decl: arkts.AstNode | undefined = findBuilderLambdaDecl(leaf);
        if (!decl) {
            return node;
        }

        const replace: arkts.Identifier | arkts.MemberExpression | undefined = this.builderLambdaReplace(leaf);
        const declInfo: BuilderLambdaDeclInfo | undefined = findBuilderLambdaDeclInfo(decl);
        if (!replace || !declInfo) {
            return node;
        }

        let lambdaBody: arkts.Identifier | arkts.CallExpression | undefined;
        if (instanceCalls.length > 0) {
            instanceCalls = instanceCalls.reverse();
            this.updateAnimation(instanceCalls);
            lambdaBody = arkts.factory.createIdentifier(BuilderLambdaNames.STYLE_ARROW_PARAM_NAME);
            instanceCalls.forEach((call) => {
                lambdaBody = this.createStyleLambdaBody(lambdaBody!, call);
            });
        }

        const args: (arkts.AstNode | undefined)[] = this.generateArgsInBuilderLambda(leaf, lambdaBody!, declInfo);
        return arkts.factory.updateCallExpression(node, replace, undefined, filterDefined(args));
    }
}
