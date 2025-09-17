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
import { BuilderLambdaNames, optionsHasField } from '../utils';
import {
    backingField,
    filterDefined,
    isDecoratorAnnotation,
    removeAnnotationByName,
    forEachArgWithParam,
    annotation,
    collect,
} from '../../common/arkts-utils';
import { NodeCacheFactory } from '../../common/node-cache';
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
    checkIsWithInIfConditionScope,
    BuilderLambdaConditionBranchInfo,
    BuilderLambdaChainingCallArgInfo,
    BuilderLambdaStyleBodyInfo,
    getDeclaredSetAttribtueMethodName,
    getTransformedComponentName,
    flatObjectExpressionToEntries,
    OptionsPropertyInfo,
} from './utils';
import { checkIsNameStartWithBackingField, hasDecorator } from '../property-translators/utils';
import { BuilderFactory } from './builder-factory';
import { BindableFactory } from './bindable-factory';
import { factory as TypeFactory } from '../type-translators/factory';
import { factory as UIFactory } from '../ui-factory';
import { factory as MemoCollectFactory } from '../../collectors/memo-collectors/factory';
import {
    AnimationNames,
    ARKUI_BUILDER_SOURCE_NAME,
    ConditionNames,
    DecoratorNames,
    NodeCacheNames,
    StateManagementTypes,
    TypeNames,
} from '../../common/predefines';
import { ImportCollector } from '../../common/import-collector';
import { GenSymGenerator } from '../../common/gensym-generator';
import {
    addMemoAnnotation,
    checkIsMemoFromMemoableInfo,
    collectMemoableInfoInFunctionReturnType,
    collectMemoableInfoInParameter,
    collectScriptFunctionReturnTypeFromInfo,
    findCanAddMemoFromArrowFunction,
} from '../../collectors/memo-collectors/utils';
import { TypeRecord } from '../../collectors/utils/collect-types';
import { StyleInternalsVisitor } from './style-internals-visitor';
import { ConditionBreakCache } from '../condition-scope-translators/cache/conditionBreakCache';
import { ComponentAttributeCache, ComponentRecord } from './cache/componentAttributeCache';
import { checkIsTrailingLambdaInLastParam, isForEach } from '../../collectors/ui-collectors/records';
import { InitialBuilderLambdaBodyCache } from '../memo-collect-cache';

export class factory {
    /**
     * update `@ComponentBuilder` decorated method.
     */
    static updateBuilderLambdaMethodDecl(
        node: arkts.MethodDefinition,
        prefixArgs: arkts.ETSParameterExpression[],
        newAnno: arkts.AnnotationUsage[],
        newName: string | undefined,
        overloads: arkts.MethodDefinition[]
    ): arkts.MethodDefinition {
        const func: arkts.ScriptFunction = node.function;
        const ident: arkts.Identifier = node.id!;
        const name: string = ident.name;
        const isFunctionCall: boolean = name !== BuilderLambdaNames.ORIGIN_METHOD_NAME;
        const newParams: arkts.Expression[] = [...prefixArgs, ...func.params];
        const updateFunc = arkts.factory
            .updateScriptFunction(
                func,
                func.body,
                func.typeParams,
                newParams,
                arkts.factory.createETSPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                false,
                func.flags,
                func.modifiers,
                newName ? arkts.factory.createIdentifier(newName) : func.id,
                newAnno
            );
        const scriptFunc = node.id!.name === BuilderLambdaNames.ORIGIN_METHOD_NAME ? addMemoAnnotation(updateFunc) : updateFunc;
        const updated =  arkts.factory.updateMethodDefinition(
            node,
            node.kind,
            newName ? arkts.factory.createIdentifier(newName) : node.id,
            arkts.factory.createFunctionExpression(
                newName ? arkts.factory.createIdentifier(newName) : func.id?.clone(),
                isFunctionCall ? updateFunc : addMemoAnnotation(updateFunc)
            ),
            node.modifiers,
            false,
            overloads
        );
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(updated.value!);
        return updated;
    }

    /**
     * transform arguments in style node.
     */
    static getTransformedStyle(call: arkts.CallExpression): BuilderLambdaChainingCallArgInfo[] {
        const decl = arkts.getDecl(call.callee!);
        if (!decl || !arkts.isMethodDefinition(decl)) {
            return call.arguments.map((arg) => ({ arg }));
        }
        const argInfo: BuilderLambdaChainingCallArgInfo[] = [];
        const args = call.arguments;
        const params = decl.function!.params;
        const isTrailingCall = call.isTrailingCall;
        forEachArgWithParam(
            args,
            params,
            (arg, param, index) => {
                const _param = param as arkts.ETSParameterExpression;
                if (index === 0 && !!arg && isDoubleDollarCall(arg)) {
                    argInfo.push({ arg: BindableFactory.updateBindableStyleArguments(arg) });
                } else if (!!arg) {
                    argInfo.push({ arg, hasBuilder: hasDecorator(_param, DecoratorNames.BUILDER) });
                }
            },
            { isTrailingCall }
        );
        return argInfo;
    }

    /**
     * create style instance call, e.g. `instance.margin(10)`.
     */
    static createStyleLambdaBody(lambdaBody: arkts.Expression, callInfo: InstanceCallInfo): arkts.CallExpression {
        if (!callInfo.isReceiver) {
            const argInfos: BuilderLambdaChainingCallArgInfo[] = factory.getTransformedStyle(callInfo.call);
            return arkts.factory.createCallExpression(
                arkts.factory.createMemberExpression(
                    lambdaBody,
                    callInfo.call.callee,
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
                argInfos.map((info) => {
                    if (arkts.isArrowFunctionExpression(info.arg)) {
                        return this.processArgArrowFunction(info.arg, info.hasBuilder);
                    }
                    return info.arg;
                }),
                undefined,
                false,
                false
            );
        } else {
            return arkts.factory.createCallExpression(callInfo.call.callee, [
                lambdaBody,
                ...callInfo.call.arguments.slice(1),
            ], callInfo.call.typeParams, false, false);
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
        InitialBuilderLambdaBodyCache.getInstance().collect({ node: lambdaBody });
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
                [],
                undefined,
                false,
                false
            );
        } else {
            lambdaBodyInfo.lambdaBody = arkts.factory.createCallExpression(methodName, [lambdaBody], undefined, false, false);
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

        const styleLambdaParam: arkts.ETSParameterExpression = arkts.factory.createETSParameterExpression(
            arkts.factory.createIdentifier(BuilderLambdaNames.STYLE_ARROW_PARAM_NAME, safeType),
            false,
            undefined
        );

        const returnStatement = arkts.factory.createReturnStatement();
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(returnStatement);
        const body: arkts.BlockStatement = arkts.factory.createBlockStatement([
            arkts.factory.createExpressionStatement(lambdaBody),
            returnStatement,
        ]);

        const func = arkts.factory.createScriptFunction(
            body,
            undefined,
            [styleLambdaParam],
            arkts.factory.createETSPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
            false,
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
            undefined,
            undefined
        );

        return addMemoAnnotation(arkts.factory.createArrowFunctionExpression(func));
    }

    /**
     * create style argument in builder lambda declaration.
     */
    static createStyleArgInBuilderLambdaDecl(
        typeNode: arkts.TypeNode | undefined,
        isFunctionCall?: boolean
    ): arkts.ETSParameterExpression {
        const styleLambdaParam: arkts.ETSParameterExpression = arkts.factory.createETSParameterExpression(
            arkts.factory.createIdentifier(BuilderLambdaNames.STYLE_ARROW_PARAM_NAME, typeNode),
            false,
            undefined
        );
        const funcType = arkts.factory.createETSFunctionType(
            undefined,
            [styleLambdaParam],
            arkts.factory.createETSPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
            false,
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW
        );
        addMemoAnnotation(funcType);

        let parameter: arkts.ETSParameterExpression;
        const optionalFuncType = arkts.factory.createETSUnionType([funcType, arkts.factory.createETSUndefinedType()]);
        parameter = arkts.factory.createETSParameterExpression(
            arkts.factory.createIdentifier(BuilderLambdaNames.STYLE_PARAM_NAME, optionalFuncType),
            false,
            undefined
        );
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(parameter);
        return parameter;
    }

    /**
     * create content argument in builder lambda declaration.
     */
    static createContentArgInBuilderLambdaDecl(): arkts.ETSParameterExpression {
        const funcType = arkts.factory.createETSFunctionType(
            undefined,
            [],
            arkts.factory.createETSPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
            false,
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW
        );
        addMemoAnnotation(funcType);

        const parameter: arkts.ETSParameterExpression = arkts.factory
            .createETSParameterExpression(
                arkts.factory.createIdentifier(BuilderLambdaNames.CONTENT_PARAM_NAME, funcType),
                true,
                undefined
            );
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(parameter);
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
        const func: arkts.ScriptFunction = arg.function!;
        const updateFunc = arkts.factory.updateScriptFunction(
            func,
            !!func.body && arkts.isBlockStatement(func.body)
                ? arkts.factory.updateBlockStatement(
                      func.body,
                      func.body.statements.map((st) => this.updateContentBodyInBuilderLambda(st, hasBuilder))
                  )
                : undefined,
            func.typeParams,
            func.params,
            func.returnTypeAnnotation,
            false,
            func.flags,
            func.modifierFlags,
            func.id,
            func.annotations
        );
        return arkts.factory.updateArrowFunctionExpression(arg, updateFunc, arg.annotations);
    }

    /**
     * transform options argument in a builder lambda call.
     */
    static processOptionsArg<T extends arkts.TSAsExpression | arkts.ObjectExpression>(
        arg: T,
        declInfo?: BuilderLambdaDeclInfo
    ): T {
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
            return factory.updatePropertiesInOptions(property, declInfo);
        });
        const updatedExpr: arkts.ObjectExpression = arkts.ObjectExpression.updateObjectExpression(
            expr,
            arkts.Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION,
            collect(...properties),
            false
        );
        if (arkts.isTSAsExpression(arg)) {
            return arkts.TSAsExpression.updateTSAsExpression(arg, updatedExpr, arg.typeAnnotation, arg.isConst) as T;
        }
        return updatedExpr as T;
    }

    static updatePropertiesInOptions(prop: arkts.Property, declInfo?: BuilderLambdaDeclInfo): arkts.Property[] {
        const key: arkts.AstNode | undefined = prop.key;
        const value: arkts.Expression | undefined = prop.value;
        if (!key || !arkts.isIdentifier(key) || !value) {
            return [prop];
        }
        const propertyDecl: arkts.AstNode | undefined = arkts.getPeerPropertyDecl(prop.peer);
        if (!propertyDecl || !arkts.isMethodDefinition(propertyDecl)) {
            return [prop];
        }
        const isNotBacking: boolean = !checkIsNameStartWithBackingField(propertyDecl.id);
        let isBuilderParam: boolean = false;
        let isLink: boolean = false;
        propertyDecl.function.annotations.forEach((anno) => {
            isBuilderParam ||= isDecoratorAnnotation(anno, DecoratorNames.BUILDER_PARAM);
            isLink ||= isDecoratorAnnotation(anno, DecoratorNames.LINK);
        });
        return factory.updateSpecificProperties(prop, key, value, { isBuilderParam, isLink, isNotBacking }, declInfo);
    }

    static updateSpecificProperties(
        prop: arkts.Property,
        key: arkts.Identifier,
        value: arkts.Expression,
        propertyInfo: OptionsPropertyInfo,
        declInfo?: BuilderLambdaDeclInfo
    ): arkts.Property[] {
        const keyName: string = key.name;
        let newProperty: arkts.Property = prop;
        if (isDoubleDollarCall(value)) {
            newProperty = BindableFactory.updateBindableProperty(prop, value);
        } else if (propertyInfo.isBuilderParam && arkts.isArrowFunctionExpression(value)) {
            addMemoAnnotation(value);
            newProperty = prop;
        } else if (
            propertyInfo.isLink &&
            propertyInfo.isNotBacking &&
            arkts.isMemberExpression(value) &&
            arkts.isThisExpression(value.object) &&
            arkts.isIdentifier(value.property)
        ) {
            newProperty = arkts.factory.updateProperty(
                prop,
                arkts.Es2pandaPropertyKind.PROPERTY_KIND_INIT,
                arkts.factory.createIdentifier(backingField(keyName)),
                factory.updateBackingMember(value, value.property.name),
                false,
                false
            );
        }
        return declInfo?.isFunctionCall
            ? [newProperty]
            : [
                  newProperty,
                  arkts.factory.createProperty(
                      arkts.Es2pandaPropertyKind.PROPERTY_KIND_INIT,
                      arkts.factory.createIdentifier(optionsHasField(keyName)),
                      arkts.factory.createBooleanLiteral(true),
                      false,
                      false
                  ),
              ];
    }

    /**
     * create or update arguments in a builder lambda call.
     * If the corresponding argument is not provided, fill-in an `undefined` to it.
     */
    static createOrUpdateArgInBuilderLambda(
        fallback: arkts.Expression | undefined,
        arg: arkts.Expression | undefined,
        param: arkts.Expression,
        declInfo?: BuilderLambdaDeclInfo
    ): arkts.Expression | undefined {
        if (!arg) {
            return fallback;
        }
        if (arkts.isArrowFunctionExpression(arg)) {
            const memoableInfo = collectMemoableInfoInParameter(param);
            const canAddMemo = findCanAddMemoFromArrowFunction(arg) || checkIsMemoFromMemoableInfo(memoableInfo, false);
            const newNode = this.processArgArrowFunction(arg, canAddMemo);
            if (canAddMemo) {
                addMemoAnnotation(newNode);
            }
            return newNode;
        }
        // this is too optimistic to check if this is an options argument...
        if (arkts.isTSAsExpression(arg) || arkts.isObjectExpression(arg)) {
            return this.processOptionsArg(arg, declInfo);
        }
        return arg;
    }

    static createSecondLastArgInBuilderLambda(argInfo: BuilderLambdaSecondLastArgInfo): arkts.Expression | undefined {
        if (!!argInfo.isReusable && !!argInfo.reuseId) {
            const reuseIdNode = arkts.factory.createStringLiteral(argInfo.reuseId);
            return reuseIdNode;
        } else if (!argInfo.isFunctionCall) {
            return arkts.factory.createUndefinedLiteral();
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
    ): (arkts.Expression | undefined)[] {
        const { isFunctionCall, params, returnType, moduleName, isFromCommonMethod } = declInfo;
        const type: arkts.Identifier | undefined = builderLambdaType(leaf);
        const args: (arkts.Expression | undefined)[] = [];
        const modifiedArgs: (arkts.Expression | undefined)[] = [];
        const secondLastArgInfo = buildSecondLastArgInfo(type, isFunctionCall);
        const isTrailingCall = leaf.isTrailingCall;
        const typeArguments = leaf.typeParams?.params;
        const hasLastTrailingLambda = checkIsTrailingLambdaInLastParam(params);
        forEachArgWithParam(
            leaf.arguments,
            params,
            (arg, param, index) => {
                let modifiedArg: arkts.Expression | undefined;
                if (index === params.length - 2 && !arg) {
                    modifiedArg = this.createSecondLastArgInBuilderLambda(secondLastArgInfo);
                }
                if (!modifiedArg) {
                    const fallback = arkts.factory.createUndefinedLiteral();
                    const updatedArg = this.createOrUpdateArgInBuilderLambda(fallback, arg, param, declInfo);
                    modifiedArg = factory.processModifiedArg(updatedArg, index, leaf.arguments, moduleName, type?.name);
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
     * process `@ComponentBuilder` call arguments for some specific transformation.
     */
    static processModifiedArg(
        modifiedArg: arkts.Expression | undefined,
        index: number | undefined,
        args: readonly arkts.Expression[],
        moduleName: string,
        name: string | undefined
    ): arkts.Expression | undefined {
        if (index === 0 && isForEach(name, moduleName) && !!modifiedArg) {
            const newFunc = UIFactory.createScriptFunction({
                body: arkts.factory.createBlockStatement([arkts.factory.createReturnStatement(modifiedArg)]),
                flags:
                    arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW |
                    arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_HAS_RETURN,
                modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            });
            const returnMemoableInfo = collectMemoableInfoInFunctionReturnType(newFunc);
            collectScriptFunctionReturnTypeFromInfo(newFunc, returnMemoableInfo);
            return arkts.factory.createArrowFunctionExpression(newFunc);
        }
        return modifiedArg;
    }

    /**
     * get return type from the second parameter of `ForEach` component.
     */
    static getReturnTypeFromArrowParameter(args: readonly arkts.Expression[]): arkts.TypeNode | undefined {
        if (
            args.length <= 1 ||
            !arkts.isArrowFunctionExpression(args[1]) ||
            args[1].function.params.length <= 0
        ) {
            return undefined;
        }
        const argTypeParam: arkts.Expression = args[1].function.params[0];
        if (!arkts.isETSParameterExpression(argTypeParam)) {
            return undefined;
        }
        const type: arkts.AstNode | undefined = argTypeParam.typeAnnotation;
        if (type && arkts.isTypeNode(type)) {
            return UIFactory.createComplexTypeFromStringAndTypeParameter(TypeNames.ARRAY, [type.clone()]);
        }
        return undefined;
    }

    /**
     * get return type from the TsType of value.
     * @deprecated
     */
    static getReturnTypeFromTsType(node: arkts.AstNode): arkts.TypeNode | undefined {
        if (arkts.isCallExpression(node)) {
            return undefined;
        }
        const type = arkts.createTypeNodeFromTsType(node);
        if (!type || !arkts.isTypeNode(type)) {
            return undefined;
        }
        return type.clone();
    }

    /**
     * add options arguments to set methods in style argument body.
     */
    static addOptionsArgsToLambdaBodyInStyleArg(
        lambdaBodyInfo: BuilderLambdaStyleBodyInfo,
        args: (arkts.Expression | undefined)[],
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
            [],
            undefined,
            false,
            false
        );
    }

    /**
     * update if-else in a builder lambda call's arguments.
     */
    static updateIfElseContentBodyInBuilderLambda(
        statement: arkts.Statement,
        shouldWrap?: boolean,
        stopAtBuilderLambda?: boolean
    ): arkts.Statement {
        if (arkts.isIfStatement(statement)) {
            const alternate = !!statement.alternate
                ? this.updateIfElseContentBodyInBuilderLambda(statement.alternate, shouldWrap, stopAtBuilderLambda)
                : statement.alternate;
            const consequence = !!statement.consequent
                ? this.updateIfElseContentBodyInBuilderLambda(statement.consequent, shouldWrap, stopAtBuilderLambda)
                : undefined;
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
            return arkts.factory.updateBlockStatement(statement, statements);
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
            let { statements, breakIndex } = this.updateConditionBranchInScope(statement.consequent, shouldWrap);
            if (shouldWrap && breakIndex > 0) {
                const hasBreak = breakIndex !== statements.length;
                const beforeBreak = this.wrapConditionToBlock(
                    statements.slice(0, breakIndex),
                    ConditionNames.CONDITION_BRANCH
                );
                const afterBreak = statements.slice(hasBreak ? breakIndex + 1 : breakIndex);
                const breakStatement = this.createBreakBetweenConditionStatements();
                statements = [beforeBreak, ...breakStatement, ...afterBreak];
            }
            ConditionBreakCache.getInstance().reset();
            return arkts.factory.updateSwitchCaseStatement(statement, statement.test, statements) as T;
        }
        return statement;
    }

    static createBreakBetweenConditionStatements(): arkts.Statement[] {
        const cache = ConditionBreakCache.getInstance();
        if (cache.shouldBreak) {
            return [arkts.factory.createBreakStatement()];
        }
        if (cache.shouldReturn) {
            return [arkts.factory.createReturnStatement()];
        }
        return [];
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
            if (ConditionBreakCache.getInstance().collect(st)) {
                breakIndex = index;
            }
            return this.updateContentBodyInBuilderLambda(st, shouldWrap, stopAtBuilderLambda);
        });
        return { statements: newStatements, breakIndex };
    }

    /**
     * wrap `ConditionScope` or `ConditionBranch` builder function to the block statements.
     */
    static wrapConditionToBlock(statements: readonly arkts.Statement[], condition: ConditionNames): arkts.Statement {
        const contentArg = arkts.factory.createArrowFunctionExpression(
            UIFactory.createScriptFunction({
                body: arkts.factory.createBlockStatement(statements),
                flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            })
        );
        addMemoAnnotation(contentArg);
        const newCall = arkts.factory.createCallExpression(arkts.factory.createIdentifier(condition), [
            contentArg,
        ], undefined, false, false);
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(newCall);
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
            return arkts.factory.updateBlockStatement(statement, newStatements);
        }
        if (arkts.isBreakStatement(statement) && statement.parent && arkts.isBlockStatement(statement.parent)) {
            ConditionBreakCache.getInstance().collectBreak();
            return arkts.factory.createReturnStatement();
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
        const node = leaf.callee;
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
                node.isComputed,
                node.isOptional
            );
        }
        return undefined;
    }

    /**
     * transform `@ComponentBuilder` in declared methods.
     */
    static transformBuilderLambdaMethodDecl(node: arkts.MethodDefinition): arkts.MethodDefinition {
        const nameNode: arkts.Identifier | undefined = node.id;
        const func: arkts.ScriptFunction = node.function!;
        const isFunctionCall: boolean = isBuilderLambdaFunctionCall(nameNode);
        if (isFunctionCall) {
            ComponentAttributeCache.getInstance().collect(node);
        }
        const typeNode: arkts.TypeNode | undefined = builderLambdaMethodDeclType(node);
        const newNode = this.updateBuilderLambdaMethodDecl(
            node,
            [this.createStyleArgInBuilderLambdaDecl(typeNode, isFunctionCall)],
            removeAnnotationByName(func.annotations, BuilderLambdaNames.ANNOTATION_NAME),
            replaceBuilderLambdaDeclMethodName(nameNode?.name),
            []
        );
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(newNode);
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
            const property: arkts.Identifier = instanceCalls[curIdx].call.callee as arkts.Identifier;
            if (property.name === AnimationNames.ANIMATION) {
                const aniStart: arkts.CallExpression = arkts.factory.createCallExpression(
                    arkts.factory.createIdentifier(AnimationNames.ANIMATION_START),
                    instanceCalls[curIdx].call.arguments,
                    undefined,
                    false,
                    false
                );
                const aniStop: arkts.CallExpression = arkts.factory.createCallExpression(
                    arkts.factory.createIdentifier(AnimationNames.ANIMATION_STOP),
                    instanceCalls[curIdx].call.arguments.map((arg) => arg.clone()),
                    undefined,
                    false,
                    false
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
    static transformBuilderLambda(node: arkts.CallExpression): arkts.Expression {
        let instanceCalls: InstanceCallInfo[] = [];
        let leaf: arkts.CallExpression = node;
        while (isStyleChainedCall(leaf) || isStyleWithReceiverCall(leaf)) {
            if (isStyleChainedCall(leaf)) {
                instanceCalls.push({
                    isReceiver: false,
                    call: arkts.factory.createCallExpression(
                        (leaf.callee as arkts.MemberExpression).property,
                        leaf.arguments,
                        leaf.typeParams,
                        leaf.isOptional,
                        leaf.hasTrailingComma
                    ),
                });
                leaf = (leaf.callee as arkts.MemberExpression).object as arkts.CallExpression;
            }
            if (isStyleWithReceiverCall(leaf)) {
                instanceCalls.push({
                    isReceiver: true,
                    call: arkts.factory.createCallExpression(leaf.callee, leaf.arguments, leaf.typeParams, leaf.isOptional, leaf.hasTrailingComma),
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
        const args: (arkts.Expression | undefined)[] = this.generateArgsInBuilderLambda(leaf, lambdaBodyInfo, declInfo);
        const newNode = arkts.factory.updateCallExpression(node, replace, filterDefined(args), leaf.typeParams, node.isOptional, node.hasTrailingComma, node.trailingBlock);
        InitialBuilderLambdaBodyCache.getInstance().updateAll().reset();
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(newNode);
        return newNode;
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
        const param = arkts.factory.createETSParameterExpression(
            arkts.factory.createIdentifier(
                BuilderLambdaNames.CONTENT_PARAM_NAME,
                arkts.factory.createETSFunctionType(
                    undefined,
                    [],
                    arkts.factory.createETSPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID),
                    false,
                    arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW
                )
            ),
            false,
            undefined,
            [annotation(DecoratorNames.BUILDER)]
        );
        const method = UIFactory.createMethodDefinition({
            key: key.clone(),
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
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(param);
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(method);
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
            arkts.factory.createETSPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID)
        );
        const conditionBranch = this.createBuilderWithTrailingLambdaDecl(
            ConditionNames.CONDITION_BRANCH,
            arkts.factory.createETSPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID)
        );
        return [conditionScope, conditionBranch];
    }

    /**
     * add declared set methods in `@ComponentBuilder` Attribute interface
     */
    static addDeclaredSetMethodsInAttributeInterface(
        node: arkts.TSInterfaceDeclaration,
        componentName: string
    ): arkts.TSInterfaceDeclaration {
        if (!node.body) {
            return node;
        }
        const records = ComponentAttributeCache.getInstance().getComponentRecord(componentName);
        if (!records || records.length === 0) {
            return node;
        }
        const overloads = records.map((r) => factory.createDeclaredSetMethodFromRecord(r));
        return arkts.factory.updateInterfaceDeclaration(
            node,
            node.extends,
            node.id,
            node.typeParams,
            arkts.factory.updateInterfaceBody(node.body, [...node.body.body, ...overloads]),
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
        const params = record.paramRecords.map((record) => TypeFactory.createParameterFromRecord(record));
        const typeParams = record.typeParameters?.map((p) => TypeFactory.createTypeParameterFromRecord(p));

        const key = arkts.factory.createIdentifier(name);
        const kind = arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_METHOD;
        const modifiers = arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_DECLARE;
        const funcTypeParams = typeParams
            ? arkts.factory.createTSTypeParameterDeclaration(typeParams, typeParams.length)
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
        const returnTypeAnnotation = arkts.factory.createETSPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID);
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
     * create all `@ComponentBuilder` component Impl functions for each unique component name.
     */
    static createAllUniqueDeclaredComponentFunctions(componentNames: string[]): arkts.MethodDefinition[] {
        const componentAttributeCache = ComponentAttributeCache.getInstance();
        const methods: arkts.MethodDefinition[] = [];
        componentNames.forEach((name: string) => {
            const record = componentAttributeCache.getComponentRecord(name)?.at(0);
            const hasLastTrailingLambda = componentAttributeCache.getHasLastTrailingLambda(name);
            const attributeName = componentAttributeCache.getAttributeName(name);
            const attributeTypeParams = componentAttributeCache.getAttributeTypeParams(name);
            if (!record || !attributeName) {
                return;
            }
            const componentImplMethod = factory.createDeclaredComponentFunctionFromRecord(
                record,
                hasLastTrailingLambda,
                attributeName,
                attributeTypeParams
            );
            methods.push(componentImplMethod);
        });
        return methods;
    }

    /**
     * generate `@ComponentBuilder` component Impl function
     */
    static createDeclaredComponentFunctionFromRecord(
        record: ComponentRecord,
        hasLastTrailingLambda: boolean,
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
        const returnTypeAnnotation = arkts.factory.createETSPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID);
        const flags = arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD;
        const params = factory.createDeclaredComponentFunctionParameters(
            attributeName,
            attributeTypeParams,
            hasLastTrailingLambda
        );
        const typeParamItems = record.typeParameters?.map((p) => TypeFactory.createTypeParameterFromRecord(p));
        const typeParams = !!typeParamItems
            ? arkts.factory.createTSTypeParameterDeclaration(typeParamItems, typeParamItems.length)
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
        addMemoAnnotation(newMethod.function);
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(newMethod);
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

    /**
     * create `makeBuilderParameterProxy` function call to replace the ONLY argument in `@Builder` function call.
     */
    static createBuilderParameterProxyCall(
        node: arkts.ObjectExpression,
        typeRef: arkts.TypeNode,
        isFromClass: boolean
    ): arkts.CallExpression {
        const entries = flatObjectExpressionToEntries(node);
        const objectArg = isFromClass
            ? arkts.factory.createObjectExpression([])
            : node;
        const newMapArg = this.createInitMapArgInBuilderParameterProxyCall(entries);
        const updateArg = this.createUpdateArgInBuilderParameterProxyCall(typeRef, entries, isFromClass);
        ImportCollector.getInstance().collectSource(
            StateManagementTypes.MAKE_BUILDER_PARAM_PROXY,
            ARKUI_BUILDER_SOURCE_NAME
        );
        ImportCollector.getInstance().collectImport(StateManagementTypes.MAKE_BUILDER_PARAM_PROXY);
        return arkts.factory.createCallExpression(
            arkts.factory.createIdentifier(StateManagementTypes.MAKE_BUILDER_PARAM_PROXY),
            [objectArg, newMapArg, updateArg],
            arkts.factory.createTSTypeParameterInstantiation([typeRef]),
            false,
            false
        );
    }

    /**
     * create type reference as the type argument in `makeBuilderParameterProxy` function call.
     */
    static createTypeRefInBuilderParameterProxyCall(
        node: arkts.ObjectExpression | arkts.TSAsExpression,
        decl: arkts.TSInterfaceDeclaration | arkts.ClassDefinition
    ): arkts.TypeNode {
        if (arkts.isTSAsExpression(node)) {
            return node.typeAnnotation!;
        }
        let nameNode: arkts.Identifier;
        if (arkts.isTSInterfaceDeclaration(decl)) {
            nameNode = decl.id!;
        } else {
            nameNode = decl.ident!;
        }
        return UIFactory.createTypeReferenceFromString(nameNode.name);
    }

    /**
     * create `new Map<string, () => Any>([...])` as the second argument in `makeBuilderParameterProxy` function call.
     */
    static createInitMapArgInBuilderParameterProxyCall(
        entries: [arkts.Identifier, arkts.Expression | undefined][]
    ): arkts.ETSNewClassInstanceExpression {
        const newMapName = arkts.factory.createETSTypeReference(
            arkts.factory.createETSTypeReferencePart(
                arkts.factory.createIdentifier(TypeNames.MAP),
                arkts.factory.createTSTypeParameterInstantiation([
                    UIFactory.createTypeReferenceFromString(TypeNames.STRING),
                    arkts.factory.createETSFunctionType(
                        undefined,
                        [],
                        UIFactory.createTypeReferenceFromString(TypeNames.ANY),
                        false,
                        arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW
                    ),
                ])
            )
        );
        let newMapArgs: arkts.Expression[] = [];
        if (entries.length > 0) {
            newMapArgs.push(
                arkts.factory.createArrayExpression(
                    entries.map(([k, v]) => {
                        const name = k.name;
                        const key = arkts.factory.createStringLiteral(name);
                        const value = this.prepareBuilderParameterPropertyValue(v);
                        const arrowFunc = arkts.factory.createArrowFunctionExpression(
                            UIFactory.createScriptFunction({
                                body: arkts.factory.createBlockStatement([arkts.factory.createReturnStatement(value)]),
                                returnTypeAnnotation: UIFactory.createTypeReferenceFromString(TypeNames.ANY),
                                flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                            })
                        );
                        return arkts.factory.createArrayExpression([key, arrowFunc]);
                    })
                )
            );
        }
        return arkts.factory.createETSNewClassInstanceExpression(newMapName, newMapArgs);
    }

    /**
     * create update arrow function as the third argument in `makeBuilderParameterProxy` function call.
     */
    static createUpdateArgInBuilderParameterProxyCall(
        typeRef: arkts.TypeNode,
        entries: [arkts.Identifier, arkts.Expression | undefined][],
        isFromClass: boolean
    ): arkts.ArrowFunctionExpression {
        const genSymName: string = GenSymGenerator.getInstance().id();
        const param = arkts.factory.createETSParameterExpression(
            arkts.factory.createIdentifier(genSymName, typeRef),
            false,
            undefined
        );
        const statements = isFromClass
            ? entries.map(([k, v]) => {
                  const left = arkts.factory.createMemberExpression(
                      arkts.factory.createIdentifier(genSymName),
                      k,
                      arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_GETTER,
                      false,
                      false
                  );
                  const right = this.prepareBuilderParameterPropertyValue(v);
                  return arkts.factory.createExpressionStatement(
                      arkts.factory.createAssignmentExpression(
                          left,
                          right,
                          arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION
                      )
                  );
              })
            : [];
        const body = arkts.factory.createBlockStatement(statements);
        const flags = arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW;
        return arkts.factory.createArrowFunctionExpression(UIFactory.createScriptFunction({ params: [param], body, flags }));
    }

    /**
     * Wrap correct type and value to each property in `@Builder` function ONLY parameter.
     */
    static prepareBuilderParameterPropertyValue(value: arkts.Expression | undefined): arkts.Expression {
        if (!value) {
            return arkts.factory.createUndefinedLiteral();
        }
        if (arkts.isObjectExpression(value)) {
            const type = UIFactory.findObjectType(value) ?? UIFactory.createTypeReferenceFromString(TypeNames.ANY);
            return arkts.factory.createTSAsExpression(value.clone(), type, false);
        }
        return value.clone();
    }
}
