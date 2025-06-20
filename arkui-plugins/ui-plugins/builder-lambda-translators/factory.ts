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
import {
    addMemoAnnotation,
    BuilderLambdaNames,
    CustomComponentNames,
    findCanAddMemoFromParamExpression,
    isCustomComponentAnnotation,
    hasMemoAnnotation,
} from '../utils';
import { annotation, backingField, filterDefined, removeAnnotationByName } from '../../common/arkts-utils';
import {
    BuilderLambdaDeclInfo,
    builderLambdaFunctionName,
    builderLambdaMethodDeclType,
    callIsGoodForBuilderLambda,
    collectComponentAttributeImport,
    findBuilderLambdaDecl,
    findBuilderLambdaDeclInfo,
    isBuilderLambda,
    isBuilderLambdaFunctionCall,
    isSafeType,
    replaceBuilderLambdaDeclMethodName,
    getDecalTypeFromValue,
    hasBindableProperty,
    isDoubleDollarCall,
    InstanceCallInfo,
    isStyleChainedCall,
    isStyleWithReceiverCall,
    builderLambdaType,
} from './utils';
import { hasDecorator, isDecoratorIntrinsicAnnotation } from '../property-translators/utils';
import { factory as PropertyFactory } from '../property-translators/factory';
import { ProjectConfig } from '../../common/plugin-context';
import { AnimationNames, BindableDecl, DecoratorIntrinsicNames, StructDecoratorNames, DecoratorNames } from '../../common/predefines';
import { ImportCollector } from '../../common/import-collector';

export class factory {
    /**
     * update `@ComponentBuilder` decorated method.
     */
    static updateBuilderLambdaMethodDecl(
        node: arkts.MethodDefinition,
        styleArg: arkts.ETSParameterExpression,
        newAnno: arkts.AnnotationUsage[],
        newName: string | undefined,
        externalSourceName?: string
    ): arkts.MethodDefinition {
        const func: arkts.ScriptFunction = node.scriptFunction;
        let newParams: arkts.Expression[] = [styleArg];
        if (func.params.length > 0) {
            newParams.push(...this.updateBuilderParameters(func.params).slice(0, func.params.length - 1));
            newParams.push(func.params.at(func.params.length - 1)!);
        }
        const updateFunc = arkts.factory
            .updateScriptFunction(
                func,
                func.body,
                arkts.FunctionSignature.createFunctionSignature(
                    func.typeParams,
                    newParams,
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
            node.name.name === BuilderLambdaNames.ORIGIN_METHOD_NAME ? addMemoAnnotation(updateFunc) : updateFunc,
            node.modifiers,
            false
        );
    }

    /**
     * update `@Builder` decorated parameter expression.
     */
    static updateBuilderParameters(params: readonly arkts.Expression[]): arkts.Expression[] {
        return params.map((item: arkts.Expression) => {
            if (arkts.isEtsParameterExpression(item) && hasDecorator(item, DecoratorNames.BUILDER)) {
                return addMemoAnnotation(item);
            }
            return item;
        });
    }

    /*
     * transform arguments in style node.
     */
    static getTransformedStyle(call: arkts.CallExpression): arkts.Expression[] {
        const decl = arkts.getDecl(call.expression);
        if (!decl || !arkts.isMethodDefinition(decl)) {
            return [...call.arguments];
        }
        const type: arkts.AstNode | undefined = arkts.isEtsParameterExpression(decl.scriptFunction.params[0])
            ? decl.scriptFunction.params[0].type?.clone()
            : undefined;
        if (
            type &&
            arkts.isTypeNode(type) &&
            hasBindableProperty(type, BindableDecl.BINDABLE) &&
            isDoubleDollarCall(call.arguments[0])
        ) {
            const bindableArg: arkts.Expression = (call.arguments[0] as arkts.CallExpression).arguments[0];
            return [factory.updateBindableStyleArguments(bindableArg), ...call.arguments.slice(1)];
        }
        return [...call.arguments];
    }

    /*
     * transform bundable arguments in style node, e.g. `Radio().checked($$(this.checked))` => `Radio().checked({value: xxx, onChange: xxx})`.
     */
    static updateBindableStyleArguments(bindableArg: arkts.Expression): arkts.Expression {
        const valueType: arkts.TypeNode = getDecalTypeFromValue(bindableArg);
        const objExp: arkts.ObjectExpression = arkts.factory.createObjectExpression(
            arkts.Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION,
            [factory.generateValueProperty(bindableArg), factory.generateOnChangeArrowFunc(bindableArg, valueType)],
            false
        );
        return arkts.factory.createTSAsExpression(objExp, factory.createBindableType(valueType), false);
    }

    /*
     * create style instance call, e.g. `instance.margin(10)`.
     */
    static createStyleLambdaBody(
        lambdaBody: arkts.AstNode,
        callInfo: InstanceCallInfo,
        projectConfig: ProjectConfig | undefined
    ): arkts.CallExpression {
        if (!callInfo.isReceiver) {
            const newArgs: arkts.Expression[] = factory.getTransformedStyle(callInfo.call);
            return arkts.factory.createCallExpression(
                arkts.factory.createMemberExpression(
                    lambdaBody,
                    callInfo.call.expression,
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
                undefined,
                newArgs.map((arg) => {
                    if (arkts.isArrowFunctionExpression(arg)) {
                        return this.processArgArrowFunction(arg, projectConfig);
                    }
                    return arg;
                })
            );
        } else {
            return arkts.factory.createCallExpression(callInfo.call.expression, callInfo.call.typeArguments, [
                lambdaBody,
                ...callInfo.call.arguments.slice(1),
            ]);
        }
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
        typeNode: arkts.TypeNode | undefined,
        moduleName: string
    ): arkts.UndefinedLiteral | arkts.ArrowFunctionExpression {
        if (!lambdaBody) {
            return arkts.factory.createUndefinedLiteral();
        }
        collectComponentAttributeImport(typeNode, moduleName);
        const safeType: arkts.TypeNode | undefined = isSafeType(typeNode) ? typeNode : undefined;

        const styleLambdaParam: arkts.ETSParameterExpression = arkts.factory.createParameterDeclaration(
            arkts.factory.createIdentifier(BuilderLambdaNames.STYLE_ARROW_PARAM_NAME, safeType),
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
        if (findCanAddMemoFromParamExpression(parameter)) {
            addMemoAnnotation(parameter);
        }
        return parameter;
    }

    /**
     * If a builder lambda's argument is an arrow function,
     * then transform any builder lambda in the function body.
     */
    static processArgArrowFunction(
        arg: arkts.ArrowFunctionExpression,
        projectConfig: ProjectConfig | undefined
    ): arkts.ArrowFunctionExpression {
        const func: arkts.ScriptFunction = arg.scriptFunction;
        const updateFunc = arkts.factory.updateScriptFunction(
            func,
            !!func.body && arkts.isBlockStatement(func.body)
                ? arkts.factory.updateBlock(
                      func.body,
                      func.body.statements.map((st) => this.updateContentBodyInBuilderLambda(st, projectConfig))
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
        const properties = (expr.properties as arkts.Property[]).map((p) => factory.updatePropertiesInOptions(p));
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

    static updatePropertiesInOptions(prop: arkts.Property): arkts.Property {
        let decl: arkts.AstNode | undefined;
        if (!prop.key || !prop.value || !(decl = arkts.getDecl(prop.key)) || !arkts.isMethodDefinition(decl)) {
            return prop;
        }
        const returnType: arkts.TypeNode | undefined = decl.scriptFunction.returnTypeAnnotation;
        const isBindable: boolean = !!returnType && hasBindableProperty(returnType, BindableDecl.BINDABLE);
        const isLinkIntrinsic: boolean = decl.scriptFunction.annotations.some((anno) =>
            isDecoratorIntrinsicAnnotation(anno, DecoratorIntrinsicNames.LINK)
        );
        if (isBindable && isDoubleDollarCall(prop.value)) {
            return factory.updateBindableProperty(prop);
        } else if (
            isLinkIntrinsic &&
            arkts.isIdentifier(prop.key) &&
            arkts.isMemberExpression(prop.value) &&
            arkts.isThisExpression(prop.value.object) &&
            arkts.isIdentifier(prop.value.property)
        ) {
            return arkts.Property.updateProperty(
                prop,
                arkts.factory.createIdentifier(backingField(prop.key.name)),
                factory.updateBackingMember(prop.value, prop.value.property.name)
            );
        }
        return prop;
    }

    /**
     * create or update arguments in a builder lambda call.
     * If the corresponding argument is not provided, fill-in an `undefined` to it.
     */
    static createOrUpdateArgInBuilderLambda(
        arg: arkts.Expression | undefined,
        projectConfig: ProjectConfig | undefined,
        typeName?: string,
        fallback?: arkts.AstNode
    ): arkts.AstNode | undefined {
        if (!arg) {
            return fallback;
        }
        if (arkts.isArrowFunctionExpression(arg)) {
            return this.processArgArrowFunction(arg, projectConfig);
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
        declInfo: BuilderLambdaDeclInfo,
        projectConfig: ProjectConfig | undefined
    ): (arkts.AstNode | undefined)[] {
        const { isFunctionCall, params, returnType, moduleName } = declInfo;
        const type: arkts.Identifier | undefined = builderLambdaType(leaf);
        let isReusable: boolean | undefined;
        let reuseId: arkts.StringLiteral | undefined;
        if (!isFunctionCall && !!type) {
            const customComponentDecl = arkts.getDecl(type);
            isReusable =
                !!customComponentDecl &&
                arkts.isClassDefinition(customComponentDecl) &&
                customComponentDecl.annotations.some((anno) =>
                    isCustomComponentAnnotation(anno, StructDecoratorNames.RESUABLE)
                );
            reuseId = isReusable ? arkts.factory.createStringLiteral(type.name) : undefined;
        }
        const args: (arkts.AstNode | undefined)[] = [
            this.createStyleArgInBuilderLambda(lambdaBody, returnType, moduleName),
        ];
        let index = 0;
        while (index < params.length) {
            if (isReusable && index === params.length - 1) {
                args.push(this.createOrUpdateArgInBuilderLambda(undefined, undefined, undefined, reuseId));
                args.push(
                    this.createOrUpdateArgInBuilderLambda(
                        leaf.arguments.at(index),
                        projectConfig,
                        type?.name,
                        arkts.factory.createUndefinedLiteral()
                    )
                );
            } else {
                args.push(this.createOrUpdateArgInBuilderLambda(leaf.arguments.at(index), projectConfig, type?.name));
            }
            index++;
        }
        return filterDefined(args);
    }

    /**
     *  update if-else in trailing lambda contents in a builder lambda call.
     */
    static updateIfElseContentBodyInBuilderLambda(
        statement: arkts.AstNode,
        projectConfig: ProjectConfig | undefined
    ): arkts.AstNode {
        if (arkts.isIfStatement(statement)) {
            const alternate = !!statement.alternate
                ? this.updateIfElseContentBodyInBuilderLambda(statement.alternate, projectConfig)
                : statement.alternate;
            const consequence = this.updateIfElseContentBodyInBuilderLambda(statement.consequent, projectConfig);
            return arkts.factory.updateIfStatement(statement, statement.test, consequence!, alternate);
        }
        if (arkts.isBlockStatement(statement)) {
            return arkts.factory.updateBlock(
                statement,
                statement.statements.map((st) => this.updateContentBodyInBuilderLambda(st, projectConfig))
            );
        }
        return statement;
    }

    /**
     * update trailing lambda contents in a builder lambda call.
     */
    static updateContentBodyInBuilderLambda(
        statement: arkts.Statement,
        projectConfig: ProjectConfig | undefined
    ): arkts.Statement {
        if (
            arkts.isExpressionStatement(statement) &&
            arkts.isCallExpression(statement.expression) &&
            isBuilderLambda(statement.expression)
        ) {
            return arkts.factory.updateExpressionStatement(
                statement,
                this.transformBuilderLambda(statement.expression, projectConfig)
            );
        }
        if (arkts.isIfStatement(statement)) {
            return this.updateIfElseContentBodyInBuilderLambda(statement, projectConfig);
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
    static transformBuilderLambdaMethodDecl(
        node: arkts.MethodDefinition,
        externalSourceName?: string
    ): arkts.MethodDefinition {
        const func: arkts.ScriptFunction = node.scriptFunction;
        const isFunctionCall: boolean = isBuilderLambdaFunctionCall(node);
        const typeNode: arkts.TypeNode | undefined = builderLambdaMethodDeclType(node);
        const newOverloads: arkts.MethodDefinition[] = node.overloads.map((method) =>
            factory.transformBuilderLambdaMethodDecl(method)
        );

        return this.updateBuilderLambdaMethodDecl(
            node,
            this.createStyleArgInBuilderLambdaDecl(typeNode, isFunctionCall),
            removeAnnotationByName(func.annotations, BuilderLambdaNames.ANNOTATION_NAME),
            replaceBuilderLambdaDeclMethodName(node.name.name),
            externalSourceName
        ).setOverloads(newOverloads);
    }

    /**
     * transform `.animation(...)` to `.animationStart(...) and .animationStop(...)`
     */
    static updateAnimation(instanceCalls: InstanceCallInfo[]): void {
        let lastAniIdx = 0;
        let curIdx = 0;

        while (curIdx < instanceCalls.length) {
            if (instanceCalls[curIdx].isReceiver) {
                curIdx++;
                continue;
            }
            const property: arkts.Identifier = instanceCalls[curIdx].call.expression as arkts.Identifier;
            if (property.name === AnimationNames.ANIMATION) {
                const aniStart: arkts.CallExpression = arkts.factory.createCallExpression(
                    arkts.factory.createIdentifier(AnimationNames.ANIMATION_START),
                    undefined,
                    instanceCalls[curIdx].call.arguments
                );
                const aniStop: arkts.CallExpression = arkts.factory.createCallExpression(
                    arkts.factory.createIdentifier(AnimationNames.ANIMATION_STOP),
                    undefined,
                    instanceCalls[curIdx].call.arguments.map((arg) => arg.clone())
                );
                instanceCalls.splice(lastAniIdx, 0, { isReceiver: false, call: aniStart });
                instanceCalls[curIdx + 1] = { isReceiver: false, call: aniStop };
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
    static transformBuilderLambda(node: arkts.CallExpression, projectConfig: ProjectConfig | undefined): arkts.AstNode {
        let instanceCalls: InstanceCallInfo[] = [];
        let leaf: arkts.CallExpression = node;

        while (isStyleChainedCall(leaf) || isStyleWithReceiverCall(leaf)) {
            if (isStyleChainedCall(leaf)) {
                instanceCalls.push({
                    isReceiver: false,
                    call: arkts.factory.createCallExpression(
                        (leaf.expression as arkts.MemberExpression).property,
                        leaf.typeArguments,
                        leaf.arguments
                    ),
                });
                leaf = (leaf.expression as arkts.MemberExpression).object as arkts.CallExpression;
            }

            if (isStyleWithReceiverCall(leaf)) {
                instanceCalls.push({
                    isReceiver: true,
                    call: arkts.factory.createCallExpression(leaf.expression, leaf.typeArguments, leaf.arguments),
                });
                leaf = leaf.arguments[0] as arkts.CallExpression;
            }
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
            instanceCalls.forEach((callInfo) => {
                lambdaBody = this.createStyleLambdaBody(lambdaBody!, callInfo, projectConfig);
            });
        }

        const args: (arkts.AstNode | undefined)[] = this.generateArgsInBuilderLambda(
            leaf,
            lambdaBody!,
            declInfo,
            projectConfig
        );
        return arkts.factory.updateCallExpression(node, replace, leaf.typeArguments, filterDefined(args));
    }

    /*
     * update bindableProperty, e.g. `text: $$(this.text)` => `text: { value: xxx , onChange: xxx }`.
     */
    static updateBindableProperty(prop: arkts.Property, type?: arkts.TypeNode): arkts.Property {
        let res: arkts.Property[] = [];
        let valueType: arkts.TypeNode;
        if (
            prop.value &&
            arkts.isCallExpression(prop.value) &&
            prop.value.arguments &&
            prop.value.arguments.length === 1
        ) {
            let bindableArg = prop.value.arguments[0];
            valueType = getDecalTypeFromValue(bindableArg);
            res.push(
                factory.generateValueProperty(bindableArg),
                factory.generateOnChangeArrowFunc(bindableArg, valueType)
            );
        } else {
            return prop;
        }
        const asObjProp: arkts.TSAsExpression = arkts.factory.createTSAsExpression(
            arkts.ObjectExpression.createObjectExpression(
                arkts.Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION,
                res,
                false
            ),
            factory.createBindableType(valueType),
            false
        );
        return arkts.factory.updateProperty(prop, prop.key, asObjProp);
    }

    /*
     * generate `value: <bindableArg>` in object.
     */
    static generateValueProperty(bindableArg: arkts.Expression): arkts.Property {
        return arkts.factory.createProperty(arkts.factory.createIdentifier('value'), bindableArg.clone());
    }

    /*
     * generate `onChange: (value) => <bindableArg> = value` in object.
     */
    static generateOnChangeArrowFunc(bindableArg: arkts.Expression, valueType: arkts.TypeNode): arkts.Property {
        return arkts.factory.createProperty(
            arkts.factory.createIdentifier('onChange'),
            PropertyFactory.createArrowFunctionWithParamsAndBody(
                undefined,
                [
                    arkts.factory.createParameterDeclaration(
                        arkts.factory.createIdentifier('value', valueType.clone()),
                        undefined
                    ),
                ],
                undefined,
                false,
                [
                    arkts.factory.createExpressionStatement(
                        arkts.factory.createAssignmentExpression(
                            bindableArg.clone(),
                            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
                            arkts.factory.createIdentifier('value')
                        )
                    ),
                ]
            )
        );
    }

    /*
     * generate `Bindable<valueType>`.
     */
    static createBindableType(valueType: arkts.TypeNode): arkts.ETSTypeReference {
        const transformedKey = BindableDecl.BINDABLE;
        ImportCollector.getInstance().collectImport(transformedKey);
        return arkts.factory.createTypeReference(
            arkts.factory.createTypeReferencePart(
                arkts.factory.createIdentifier(transformedKey),
                arkts.factory.createTSTypeParameterInstantiation([valueType.clone()])
            )
        );
    }
}
