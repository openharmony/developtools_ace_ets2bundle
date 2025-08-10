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
import {
    backingField,
    filterDefined,
    isDecoratorAnnotation,
    removeAnnotationByName,
    forEachArgWithParam,
    annotation,
} from '../../common/arkts-utils';
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
    isDoubleDollarCall,
    InstanceCallInfo,
    isStyleChainedCall,
    isStyleWithReceiverCall,
    builderLambdaType,
    BuilderLambdaSecondLastArgInfo,
    buildSecondLastArgInfo,
    checkShouldBreakFromStatement,
    checkIsWithInIfConditionScope,
    BuilderLambdaConditionBranchInfo,
    BuilderLambdaChainingCallArgInfo,
    getArgumentType,
    BuilderLambdaStyleBodyInfo,
    getDeclaredSetAttribtueMethodName,
    checkIsTrailingLambdaInLastParam,
    ComponentAttributeCache,
    ComponentRecord,
    getTransformedComponentName,
} from './utils';
import { hasDecorator, isDecoratorIntrinsicAnnotation } from '../property-translators/utils';
import { factory as PropertyFactory } from '../property-translators/factory';
import { factory as TypeFactory } from '../type-translators/factory';
import { factory as UIFactory } from '../ui-factory';
import { factory as MemoCollectFactory } from '../../collectors/memo-collectors/factory';
import {
    AnimationNames,
    ARKUI_BUILDER_SOURCE_NAME,
    BindableDecl,
    ConditionNames,
    DecoratorIntrinsicNames,
    DecoratorNames,
} from '../../common/predefines';
import { ImportCollector } from '../../common/import-collector';
import {
    addMemoAnnotation,
    checkIsMemoFromMemoableInfo,
    collectMemoableInfoInParameter,
} from '../../collectors/memo-collectors/utils';
import { TypeRecord } from '../../collectors/utils/collect-types';
import { BuilderFactory } from './builder-factory';
import { StyleInternalsVisitor } from './style-internals-visitor';

export class factory {
    /**
     * update `@ComponentBuilder` decorated method.
     */
    static updateBuilderLambdaMethodDecl(
        node: arkts.MethodDefinition,
        prefixArgs: arkts.ETSParameterExpression[],
        newAnno: arkts.AnnotationUsage[],
        newName: string | undefined
    ): arkts.MethodDefinition {
        const func: arkts.ScriptFunction = node.scriptFunction;
        const isFunctionCall: boolean = node.name.name !== BuilderLambdaNames.ORIGIN_METHOD_NAME;
        const newParams: arkts.Expression[] = [...prefixArgs, ...func.params];
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
            isFunctionCall ? updateFunc : addMemoAnnotation(updateFunc),
            node.modifiers,
            false
        );
    }

    /*
     * transform arguments in style node.
     */
    static getTransformedStyle(call: arkts.CallExpression): BuilderLambdaChainingCallArgInfo[] {
        const decl = arkts.getDecl(call.expression);
        if (!decl || !arkts.isMethodDefinition(decl)) {
            return call.arguments.map((arg) => ({ arg }));
        }
        const argInfo: BuilderLambdaChainingCallArgInfo[] = [];
        const args = call.arguments;
        const params = decl.scriptFunction.params;
        const isTrailingCall = call.isTrailingCall;
        forEachArgWithParam(
            args,
            params,
            (arg, param, index) => {
                const _param = param as arkts.ETSParameterExpression;
                let isDoubleDollar: boolean = false;
                if (index === 0 && !!arg) {
                    isDoubleDollar = isDoubleDollarCall(arg);
                }
                if (isDoubleDollar && !!arg) {
                    const bindableArg: arkts.Expression = (arg as arkts.CallExpression).arguments[0];
                    argInfo.push({ arg: factory.updateBindableStyleArguments(bindableArg) });
                } else if (!!arg) {
                    argInfo.push({ arg, hasBuilder: hasDecorator(_param, DecoratorNames.BUILDER) });
                }
            },
            { isTrailingCall }
        );
        return argInfo;
    }

    /*
     * transform bundable arguments in style node, e.g. `Radio().checked($$(this.checked))` => `Radio().checked({value: xxx, onChange: xxx})`.
     */
    static updateBindableStyleArguments(bindableArg: arkts.Expression): arkts.Expression {
        const valueType: arkts.TypeNode = getArgumentType(bindableArg);
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
    static createStyleLambdaBody(lambdaBody: arkts.AstNode, callInfo: InstanceCallInfo): arkts.CallExpression {
        if (!callInfo.isReceiver) {
            const argInfos: BuilderLambdaChainingCallArgInfo[] = factory.getTransformedStyle(callInfo.call);
            return arkts.factory.createCallExpression(
                arkts.factory.createMemberExpression(
                    lambdaBody,
                    callInfo.call.expression,
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
                undefined,
                argInfos.map((info) => {
                    if (arkts.isArrowFunctionExpression(info.arg)) {
                        return this.processArgArrowFunction(info.arg, info.hasBuilder);
                    }
                    return info.arg;
                })
            );
        } else {
            return arkts.factory.createCallExpression(callInfo.call.expression, callInfo.call.typeArguments, [
                lambdaBody,
                ...callInfo.call.arguments.slice(1),
            ]);
        }
    }

    /**
     * add `instance.<set method name>()` call as the initial style argument body for components.
     * The initial style argument body is `undefined` for custom components.
     */
    static createInitLambdaBody(declInfo: BuilderLambdaDeclInfo): BuilderLambdaStyleBodyInfo {
        const { name, isFunctionCall, hasReceiver } = declInfo;
        const lambdaBodyInfo: BuilderLambdaStyleBodyInfo = { lambdaBody: undefined, initCallPtr: undefined };
        if (!isFunctionCall) {
            return lambdaBodyInfo;
        }
        let lambdaBody: arkts.Identifier | arkts.CallExpression = arkts.factory.createIdentifier(
            BuilderLambdaNames.STYLE_ARROW_PARAM_NAME
        );
        arkts.NodeCache.getInstance().collect(lambdaBody);
        const methodName = arkts.factory.createIdentifier(getDeclaredSetAttribtueMethodName(name));
        if (!hasReceiver) {
            lambdaBodyInfo.lambdaBody = arkts.factory.createCallExpression(
                arkts.factory.createMemberExpression(
                    lambdaBody,
                    methodName,
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
                undefined,
                []
            );
        } else {
            lambdaBodyInfo.lambdaBody = arkts.factory.createCallExpression(methodName, undefined, [lambdaBody]);
        }
        lambdaBodyInfo.initCallPtr = lambdaBodyInfo.lambdaBody.peer;
        return lambdaBodyInfo;
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

        const returnStatement = arkts.factory.createReturnStatement();
        arkts.NodeCache.getInstance().collect(returnStatement);
        const body: arkts.BlockStatement = arkts.factory.createBlock([
            arkts.factory.createExpressionStatement(lambdaBody),
            returnStatement,
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

        return addMemoAnnotation(arkts.factory.createArrowFunction(func));
    }

    /**
     * create style argument in builder lambda declaration.
     */
    static createStyleArgInBuilderLambdaDecl(
        typeNode: arkts.TypeNode | undefined,
        isFunctionCall?: boolean
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
        addMemoAnnotation(funcType);

        let parameter: arkts.ETSParameterExpression;
        const optionalFuncType = arkts.factory.createUnionType([funcType, arkts.factory.createETSUndefinedType()]);
        parameter = arkts.factory.createParameterDeclaration(
            arkts.factory.createIdentifier(BuilderLambdaNames.STYLE_PARAM_NAME, optionalFuncType),
            undefined
        );
        arkts.NodeCache.getInstance().collect(parameter);
        return parameter;
    }

    /**
     * create content argument in builder lambda declaration.
     */
    static createContentArgInBuilderLambdaDecl(): arkts.ETSParameterExpression {
        const funcType = arkts.factory.createFunctionType(
            arkts.FunctionSignature.createFunctionSignature(
                undefined,
                [],
                arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                false
            ),
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW
        );
        addMemoAnnotation(funcType);

        const parameter: arkts.ETSParameterExpression = arkts.factory
            .createParameterDeclaration(
                arkts.factory.createIdentifier(BuilderLambdaNames.CONTENT_PARAM_NAME, funcType),
                undefined
            )
            .setOptional(true);
        arkts.NodeCache.getInstance().collect(parameter);
        return parameter;
    }

    /**
     * If a builder lambda's argument is an arrow function,
     * then transform any builder lambda in the function body.
     */
    static processArgArrowFunction(
        arg: arkts.ArrowFunctionExpression,
        hasBuilder?: boolean
    ): arkts.ArrowFunctionExpression {
        const func: arkts.ScriptFunction = arg.scriptFunction;
        const updateFunc = arkts.factory.updateScriptFunction(
            func,
            !!func.body && arkts.isBlockStatement(func.body)
                ? arkts.factory.updateBlock(
                      func.body,
                      func.body.statements.map((st) => this.updateContentBodyInBuilderLambda(st, hasBuilder))
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
    static processOptionsArg<T extends arkts.TSAsExpression | arkts.ObjectExpression>(arg: T): T {
        let expr: arkts.ObjectExpression | undefined;
        if (arkts.isTSAsExpression(arg) && !!arg.expr && arkts.isObjectExpression(arg.expr)) {
            expr = arg.expr;
        } else if (arkts.isObjectExpression(arg)) {
            expr = arg;
        }
        if (!expr) {
            return arg;
        }
        const properties = (expr.properties as arkts.Property[]).map((p) => {
            let property = p;
            MemoCollectFactory.findAndCollectMemoableProperty(p, (currNode: arkts.Property) => {
                property = BuilderFactory.rewriteBuilderProperty(currNode);
                return property;
            });
            return factory.updatePropertiesInOptions(property);
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

    static updatePropertiesInOptions(prop: arkts.Property): arkts.Property {
        let decl: arkts.AstNode | undefined;
        if (!prop.key || !prop.value || !(decl = arkts.getDecl(prop.key)) || !arkts.isMethodDefinition(decl)) {
            return prop;
        }
        let isBuilderParam: boolean = false;
        let isLinkIntrinsic: boolean = false;
        decl.scriptFunction.annotations.forEach((anno) => {
            isBuilderParam ||= isDecoratorAnnotation(anno, DecoratorNames.BUILDER_PARAM);
            isLinkIntrinsic ||= isDecoratorIntrinsicAnnotation(anno, DecoratorIntrinsicNames.LINK);
        });

        if (isDoubleDollarCall(prop.value)) {
            return factory.updateBindableProperty(prop);
        } else if (isBuilderParam && arkts.isArrowFunctionExpression(prop.value)) {
            addMemoAnnotation(prop.value);
            return prop;
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
        fallback: arkts.AstNode | undefined,
        arg: arkts.Expression | undefined,
        canAddMemo?: boolean
    ): arkts.AstNode | undefined {
        if (!arg) {
            return fallback;
        }
        if (arkts.isArrowFunctionExpression(arg)) {
            const newNode = this.processArgArrowFunction(arg, canAddMemo);
            if (canAddMemo) {
                addMemoAnnotation(newNode);
            }
            return newNode;
        }
        // this is too optimistic to check if this is an options argument...
        if (arkts.isTSAsExpression(arg) || arkts.isObjectExpression(arg)) {
            return this.processOptionsArg(arg);
        }
        return arg;
    }

    static createSecondLastArgInBuilderLambda(argInfo: BuilderLambdaSecondLastArgInfo): arkts.AstNode | undefined {
        if (!!argInfo.isReusable && !!argInfo.reuseId) {
            const reuseIdNode = arkts.factory.createStringLiteral(argInfo.reuseId);
            return this.createOrUpdateArgInBuilderLambda(reuseIdNode, undefined, undefined);
        } else if (!argInfo.isFunctionCall) {
            return this.createOrUpdateArgInBuilderLambda(arkts.factory.createUndefinedLiteral(), undefined, undefined);
        }
        return undefined;
    }

    /**
     * transform arguments in a builder lambda call.
     */
    static generateArgsInBuilderLambda(
        leaf: arkts.CallExpression,
        lambdaBodyInfo: BuilderLambdaStyleBodyInfo,
        declInfo: BuilderLambdaDeclInfo
    ): (arkts.AstNode | undefined)[] {
        const { isFunctionCall, params, returnType, moduleName, isFromCommonMethod } = declInfo;
        const type: arkts.Identifier | undefined = builderLambdaType(leaf);
        const args: (arkts.AstNode | undefined)[] = [];
        const modifiedArgs: (arkts.AstNode | undefined)[] = [];
        const secondLastArgInfo = buildSecondLastArgInfo(type, isFunctionCall);
        const isTrailingCall = leaf.isTrailingCall;
        const typeArguments = leaf.typeArguments;
        const hasLastTrailingLambda = checkIsTrailingLambdaInLastParam(params);
        forEachArgWithParam(
            leaf.arguments,
            params,
            (arg, param, index) => {
                let modifiedArg: arkts.AstNode | undefined;
                if (index === params.length - 2 && !arg) {
                    modifiedArg = this.createSecondLastArgInBuilderLambda(secondLastArgInfo);
                }
                if (!modifiedArg) {
                    const memoableInfo = collectMemoableInfoInParameter(param);
                    const canAddMemo = checkIsMemoFromMemoableInfo(memoableInfo, false);
                    const fallback = arkts.factory.createUndefinedLiteral();
                    modifiedArg = this.createOrUpdateArgInBuilderLambda(fallback, arg, canAddMemo);
                }
                const shouldInsertToArgs = !isFunctionCall || (index === params.length - 1 && hasLastTrailingLambda);
                if (shouldInsertToArgs) {
                    args.push(modifiedArg);
                } else {
                    modifiedArgs.push(modifiedArg);
                }
            },
            { isTrailingCall }
        );
        const lambdaBody = this.addOptionsArgsToLambdaBodyInStyleArg(
            lambdaBodyInfo,
            modifiedArgs,
            typeArguments,
            isFromCommonMethod
        );
        const typeNode = !isFunctionCall && !!type ? UIFactory.createTypeReferenceFromString(type.name) : returnType;
        const styleArg = this.createStyleArgInBuilderLambda(lambdaBody, typeNode, moduleName);
        args.unshift(styleArg);
        return args;
    }

    /**
     * add options arguments to set methods in style argument body.
     */
    static addOptionsArgsToLambdaBodyInStyleArg(
        lambdaBodyInfo: BuilderLambdaStyleBodyInfo,
        args: (arkts.AstNode | undefined)[],
        typeArguments: readonly arkts.TypeNode[] | undefined,
        shouldApplyAttribute: boolean = true
    ): arkts.CallExpression | arkts.Identifier | undefined {
        const { lambdaBody, initCallPtr } = lambdaBodyInfo;
        if (!lambdaBody) {
            return undefined;
        }
        if (!initCallPtr || arkts.isIdentifier(lambdaBody)) {
            return this.addApplyAttributesFinishToLambdaBodyEnd(lambdaBody, shouldApplyAttribute);
        }
        const styleInternalsVisitor = new StyleInternalsVisitor();
        const newLambdaBody = styleInternalsVisitor
            .registerInitCall(initCallPtr)
            .registerInitCallArgs(filterDefined(args))
            .registerInitCallTypeArguments(typeArguments)
            .visitor(lambdaBody) as arkts.CallExpression | arkts.Identifier;
        return this.addApplyAttributesFinishToLambdaBodyEnd(newLambdaBody, shouldApplyAttribute);
    }

    /**
     * add `.applyAttributesFinish()` at the end of style argument body.
     */
    static addApplyAttributesFinishToLambdaBodyEnd(
        lambdaBody: arkts.CallExpression | arkts.Identifier,
        shouldApplyAttribute: boolean = true
    ): arkts.CallExpression | arkts.Identifier {
        if (!shouldApplyAttribute) {
            return lambdaBody;
        }
        return arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                lambdaBody,
                arkts.factory.createIdentifier(BuilderLambdaNames.APPLY_ATTRIBUTES_FINISH_METHOD),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            []
        );
    }

    /**
     * update if-else in a builder lambda call's arguments.
     */
    static updateIfElseContentBodyInBuilderLambda(
        statement: arkts.AstNode,
        shouldWrap?: boolean,
        stopAtBuilderLambda?: boolean
    ): arkts.AstNode {
        if (arkts.isIfStatement(statement)) {
            const alternate = !!statement.alternate
                ? this.updateIfElseContentBodyInBuilderLambda(statement.alternate, shouldWrap, stopAtBuilderLambda)
                : statement.alternate;
            const consequence = this.updateIfElseContentBodyInBuilderLambda(
                statement.consequent,
                shouldWrap,
                stopAtBuilderLambda
            );
            const newStatement = arkts.factory.updateIfStatement(statement, statement.test, consequence!, alternate);
            return !shouldWrap || checkIsWithInIfConditionScope(statement)
                ? newStatement
                : this.wrapConditionToBlock([newStatement], ConditionNames.CONDITION_SCOPE);
        }
        if (arkts.isBlockStatement(statement)) {
            let { statements, breakIndex } = this.updateConditionBranchInScope(
                statement.statements,
                shouldWrap,
                stopAtBuilderLambda
            );
            if (!!shouldWrap && checkIsWithInIfConditionScope(statement)) {
                const beforeBreak = this.wrapConditionToBlock(
                    breakIndex > 0 ? statements.slice(0, breakIndex) : statements,
                    ConditionNames.CONDITION_BRANCH
                );
                const afterBreak = breakIndex > 0 ? statements.slice(breakIndex) : [];
                statements = [beforeBreak, ...afterBreak];
            }
            return arkts.factory.updateBlock(statement, statements);
        }
        return statement;
    }

    /**
     * update switch-case in a builder lambda call's arguments.
     */
    static updateSwitchCaseContentBodyInBuilderLambda<T extends arkts.SwitchStatement | arkts.SwitchCaseStatement>(
        statement: T,
        shouldWrap?: boolean,
        stopAtBuilderLambda?: boolean
    ): T {
        if (arkts.isSwitchStatement(statement)) {
            const cases = statement.cases.map((c) =>
                this.updateSwitchCaseContentBodyInBuilderLambda(c, shouldWrap, stopAtBuilderLambda)
            );
            const newStatement = arkts.factory.updateSwitchStatement(statement, statement.discriminant, cases);
            return (!shouldWrap
                ? newStatement
                : this.wrapConditionToBlock([newStatement], ConditionNames.CONDITION_SCOPE)) as arkts.AstNode as T;
        }
        if (arkts.isSwitchCaseStatement(statement)) {
            let { statements, breakIndex } = this.updateConditionBranchInScope(
                statement.consequent,
                shouldWrap,
                stopAtBuilderLambda
            );
            if (shouldWrap) {
                const beforeBreak = this.wrapConditionToBlock(
                    breakIndex > 0 ? statements.slice(0, breakIndex) : statements,
                    ConditionNames.CONDITION_BRANCH
                );
                const afterBreak = breakIndex > 0 ? statements.slice(breakIndex) : [];
                statements = [beforeBreak, ...afterBreak];
            }
            return arkts.factory.updateSwitchCaseStatement(statement, statement.test, statements) as T;
        }
        return statement;
    }

    /**
     * update ConditionBranch in an if-else or swith-case body.
     * @internal
     */
    static updateConditionBranchInScope(
        statements: readonly arkts.Statement[],
        shouldWrap?: boolean,
        stopAtBuilderLambda?: boolean
    ): BuilderLambdaConditionBranchInfo {
        let breakIndex = statements.length;
        const newStatements = statements.map((st, index) => {
            if (checkShouldBreakFromStatement(st)) {
                breakIndex = index;
            }
            return this.updateContentBodyInBuilderLambda(st, shouldWrap, stopAtBuilderLambda);
        });
        return { statements: newStatements, breakIndex };
    }

    /**
     * wrap `ConditionScope` or `ConditionBranch` builder function to the block statements.
     */
    static wrapConditionToBlock(statements: readonly arkts.AstNode[], condition: ConditionNames): arkts.AstNode {
        const contentArg = arkts.factory.createArrowFunction(
            UIFactory.createScriptFunction({
                body: arkts.factory.createBlock(statements),
                flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            })
        );
        addMemoAnnotation(contentArg);
        const newCall = arkts.factory.createCallExpression(arkts.factory.createIdentifier(condition), undefined, [
            contentArg,
        ]);
        arkts.NodeCache.getInstance().collect(newCall);
        ImportCollector.getInstance().collectSource(condition, ARKUI_BUILDER_SOURCE_NAME);
        ImportCollector.getInstance().collectImport(condition);
        return arkts.factory.createExpressionStatement(newCall);
    }

    /**
     * update trailing lambda contents in a builder lambda call.
     */
    static updateContentBodyInBuilderLambda(
        statement: arkts.Statement,
        hasBuilder?: boolean,
        stopAtBuilderLambda?: boolean
    ): arkts.Statement {
        if (
            arkts.isExpressionStatement(statement) &&
            arkts.isCallExpression(statement.expression) &&
            isBuilderLambda(statement.expression)
        ) {
            if (!!stopAtBuilderLambda) {
                return statement;
            }
            return arkts.factory.updateExpressionStatement(
                statement,
                this.transformBuilderLambda(statement.expression)
            );
        }
        if (arkts.isIfStatement(statement)) {
            return this.updateIfElseContentBodyInBuilderLambda(statement, hasBuilder, stopAtBuilderLambda);
        }
        if (arkts.isSwitchStatement(statement)) {
            return this.updateSwitchCaseContentBodyInBuilderLambda(statement, hasBuilder, stopAtBuilderLambda);
        }
        if (arkts.isBlockStatement(statement)) {
            const newStatements = statement.statements.map((st) =>
                this.updateContentBodyInBuilderLambda(st, hasBuilder, stopAtBuilderLambda)
            );
            return arkts.factory.updateBlock(statement, newStatements);
        }
        return statement;
    }

    /**
     * replace function call's name to the corresponding transformed name.
     */
    static builderLambdaReplace(
        leaf: arkts.CallExpression,
        declInfo: BuilderLambdaDeclInfo | undefined
    ): arkts.Identifier | arkts.MemberExpression | undefined {
        if (!callIsGoodForBuilderLambda(leaf) || !declInfo) {
            return undefined;
        }
        const node = leaf.expression;
        const funcName = builderLambdaFunctionName(leaf);
        if (!funcName) {
            return undefined;
        }
        if (arkts.isIdentifier(node)) {
            const { moduleName } = declInfo;
            ImportCollector.getInstance().collectSource(funcName, moduleName);
            ImportCollector.getInstance().collectImport(funcName);
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
        const nameNode: arkts.Identifier | undefined = node.name;
        const func: arkts.ScriptFunction = node.scriptFunction;
        const isFunctionCall: boolean = isBuilderLambdaFunctionCall(nameNode);
        if (isFunctionCall) {
            ComponentAttributeCache.getInstance().collect(node);
        }
        const typeNode: arkts.TypeNode | undefined = builderLambdaMethodDeclType(node);
        const newOverloads: arkts.MethodDefinition[] = node.overloads.map((method) =>
            factory.transformBuilderLambdaMethodDecl(method)
        );
        const newNode = this.updateBuilderLambdaMethodDecl(
            node,
            [this.createStyleArgInBuilderLambdaDecl(typeNode, isFunctionCall)],
            removeAnnotationByName(func.annotations, BuilderLambdaNames.ANNOTATION_NAME),
            replaceBuilderLambdaDeclMethodName(nameNode.name)
        ).setOverloads(newOverloads);
        arkts.NodeCache.getInstance().collect(newNode);
        return newNode;
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
    static transformBuilderLambda(node: arkts.CallExpression): arkts.AstNode {
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
        const declInfo: BuilderLambdaDeclInfo | undefined = findBuilderLambdaDeclInfo(decl);
        const replace: arkts.Identifier | arkts.MemberExpression | undefined = this.builderLambdaReplace(
            leaf,
            declInfo
        );
        if (!replace || !declInfo) {
            return node;
        }
        const lambdaBodyInfo = factory.createInitLambdaBody(declInfo);
        let lambdaBody: arkts.Identifier | arkts.CallExpression | undefined = lambdaBodyInfo.lambdaBody;
        if (instanceCalls.length > 0) {
            instanceCalls = instanceCalls.reverse();
            this.updateAnimation(instanceCalls);
            instanceCalls.forEach((callInfo) => {
                lambdaBody = this.createStyleLambdaBody(lambdaBody!, callInfo);
            });
        }
        lambdaBodyInfo.lambdaBody = lambdaBody;
        const args: (arkts.AstNode | undefined)[] = this.generateArgsInBuilderLambda(leaf, lambdaBodyInfo, declInfo);
        const newNode = arkts.factory.updateCallExpression(node, replace, leaf.typeArguments, filterDefined(args));
        arkts.NodeCache.getInstance().collect(newNode);
        return newNode;
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
            valueType = getArgumentType(bindableArg);
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

    /**
     * create a `@Builder` function with `@Builder` trailing lambda parameter.
     */
    static createBuilderWithTrailingLambdaDecl(
        name: string,
        returnTypeAnnotation: arkts.TypeNode
    ): arkts.MethodDefinition {
        const key = arkts.factory.createIdentifier(name);
        const modifiers =
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC |
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE |
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_EXPORT;
        const param = arkts.factory.createParameterDeclaration(
            arkts.factory.createIdentifier(
                BuilderLambdaNames.CONTENT_PARAM_NAME,
                arkts.factory.createFunctionType(
                    arkts.factory.createFunctionSignature(
                        undefined,
                        [],
                        arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                        false
                    ),
                    arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW
                )
            ),
            undefined
        );
        param.annotations = [annotation(DecoratorNames.BUILDER)];
        arkts.NodeCache.getInstance().collect(param);
        const method = UIFactory.createMethodDefinition({
            key,
            kind: arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_NONE,
            function: {
                key,
                params: [param],
                returnTypeAnnotation,
                flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_NONE,
                modifiers,
                annotations: [annotation(DecoratorNames.BUILDER)],
            },
            modifiers,
        });
        arkts.NodeCache.getInstance().collect(method);
        return method;
    }

    /**
     * add following declared methods at header file:
     * - `@Builder function ConditionScope(@Builder content: () => void): void;`
     * - `@Builder function ConditionBranch(@Builder content: () => void): void;`
     */
    static addConditionBuilderDecls(): arkts.MethodDefinition[] {
        const conditionScope = this.createBuilderWithTrailingLambdaDecl(
            ConditionNames.CONDITION_SCOPE,
            arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID)
        );
        const conditionBranch = this.createBuilderWithTrailingLambdaDecl(
            ConditionNames.CONDITION_BRANCH,
            arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID)
        );
        return [conditionScope, conditionBranch];
    }

    /**
     * add declared set methods in `@ComponentBuilder` Attribute interface
     */
    static addDeclaredSetMethodsInAttributeInterface(node: arkts.TSInterfaceDeclaration): arkts.TSInterfaceDeclaration {
        if (!node.body) {
            return node;
        }
        const records = ComponentAttributeCache.getInstance().getAllComponentRecords();
        if (records.length === 0) {
            return node;
        }
        let rootMethod = factory.createDeclaredSetMethodFromRecord(records.at(0)!);
        const overloads: arkts.MethodDefinition[] = [];
        for (let i = 0; i < records.length - 1; i++) {
            const newMethod = factory.createDeclaredSetMethodFromRecord(records.at(i + 1)!);
            overloads.push(newMethod);
        }
        rootMethod.setOverloads(overloads);
        return arkts.factory.updateInterfaceDeclaration(
            node,
            node.extends,
            node.id,
            node.typeParams,
            arkts.factory.updateInterfaceBody(node.body, [...node.body.body, rootMethod]),
            node.isStatic,
            node.isFromExternal
        );
    }

    /**
     * generate declared set method from `ComponentRecord`
     */
    static createDeclaredSetMethodFromRecord(record: ComponentRecord): arkts.MethodDefinition {
        const name = getDeclaredSetAttribtueMethodName(record.name);
        const hasReceiver = !!record.hasReceiver;
        const params = record.attributeRecords.map((record) => TypeFactory.createParameterFromRecord(record));
        const typeParams = record.typeParams?.map((p) => TypeFactory.createTypeParameterFromRecord(p));

        const key = arkts.factory.createIdentifier(name);
        const kind = arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD;
        const modifiers = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE;
        const funcTypeParams = typeParams
            ? arkts.factory.createTypeParameterDeclaration(typeParams, typeParams.length)
            : undefined;
        const returnTypeAnnotation = arkts.factory.createTSThisType();
        const flags = arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD;

        return UIFactory.createMethodDefinition({
            key,
            kind,
            function: {
                key,
                flags,
                params,
                typeParams: funcTypeParams,
                returnTypeAnnotation,
                modifiers,
                hasReceiver,
            },
            modifiers,
        });
    }

    /**
     * generate `applyAttributesFinish(): void;` in `CommonMethod` interface
     */
    static createDeclaredApplyAttributesFinish(): arkts.MethodDefinition {
        const key = arkts.factory.createIdentifier(BuilderLambdaNames.APPLY_ATTRIBUTES_FINISH_METHOD);
        const kind = arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD;
        const modifiers = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE;
        const returnTypeAnnotation = arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID);
        const flags = arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD;
        return UIFactory.createMethodDefinition({
            key,
            kind,
            function: {
                key,
                flags,
                returnTypeAnnotation,
                modifiers,
            },
            modifiers,
        });
    }

    /**
     * generate `@ComponentBuilder` component Impl function in ETSGLOBAL class
     */
    static createDeclaredComponentFunctionFromRecord(
        record: ComponentRecord,
        attributeName: string,
        attributeTypeParams?: TypeRecord[]
    ): arkts.MethodDefinition {
        const newName: string = getTransformedComponentName(record.name);
        const key: arkts.Identifier = arkts.factory.createIdentifier(newName);
        const kind = arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD;
        const modifiers =
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE |
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC |
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_EXPORT;
        const returnTypeAnnotation = arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID);
        const flags = arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD;
        const params = factory.createDeclaredComponentFunctionParameters(
            attributeName,
            attributeTypeParams,
            record.hasLastTrailingLambda
        );
        const typeParamItems = record.typeParams?.map((p) => TypeFactory.createTypeParameterFromRecord(p));
        const typeParams = !!typeParamItems
            ? arkts.factory.createTypeParameterDeclaration(typeParamItems, typeParamItems.length)
            : undefined;
        const newMethod = UIFactory.createMethodDefinition({
            key,
            kind,
            function: {
                key,
                flags,
                params,
                typeParams,
                returnTypeAnnotation,
                modifiers,
            },
            modifiers,
        });
        addMemoAnnotation(newMethod.scriptFunction);
        arkts.NodeCache.getInstance().collect(newMethod);
        return newMethod;
    }

    /**
     * generate parameters in `@ComponentBuilder` component Impl function
     */
    static createDeclaredComponentFunctionParameters(
        attributeName: string,
        attributeTypeParams?: TypeRecord[],
        hasLastTrailingLambda?: boolean
    ): arkts.ETSParameterExpression[] {
        const params: arkts.ETSParameterExpression[] = [];

        const typeParamItems = attributeTypeParams?.map((p) => TypeFactory.createTypeNodeFromRecord(p));
        const typeParams = !!typeParamItems
            ? arkts.factory.createTSTypeParameterInstantiation(typeParamItems)
            : undefined;
        const typeNode: arkts.TypeNode = UIFactory.createTypeReferenceFromString(attributeName, typeParams);
        const styleArg: arkts.ETSParameterExpression = this.createStyleArgInBuilderLambdaDecl(typeNode, true);
        params.push(styleArg);

        if (!!hasLastTrailingLambda) {
            const contentArg: arkts.ETSParameterExpression = this.createContentArgInBuilderLambdaDecl();
            params.push(contentArg);
        }

        return params;
    }
}
