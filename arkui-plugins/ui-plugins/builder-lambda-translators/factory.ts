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
import path from 'path';
import { BuilderLambdaNames, optionsHasField, inferTypeFromValue, CustomComponentNames } from '../utils';
import {
    backingField,
    filterDefined,
    isDecoratorAnnotation,
    removeAnnotationByName,
    forEachArgWithParam,
    annotation,
    collect,
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
    BuilderLambdaChainingCallArgInfo,
    getArgumentType,
    OptionsPropertyInfo,
    flatObjectExpressionToEntries,
    BuilderLambdaStyleBodyInfo,
    getDeclaredSetAttribtueMethodName,
    checkIsTrailingLambdaInLastParam,
    getTransformedComponentName,
    isNavigationOrNavDestination,
    getIsUserCreateStack,
    isForEach,
    findReuseId,
    getStructCalleeInfoFromCallee,
} from './utils';
import { hasDecorator, isDecoratorIntrinsicAnnotation } from '../property-translators/utils';
import { BuilderFactory } from './builder-factory';
import { factory as MemoCollectFactory } from '../../collectors/memo-collectors/factory';
import { factory as PropertyFactory } from '../property-translators/factory';
import { BindableFactory } from './bindable-factory';
import { factory as TypeFactory } from '../type-translators/factory';
import { factory as UIFactory } from '../ui-factory';
import {
    AnimationNames,
    ARKUI_BUILDER_SOURCE_NAME,
    DecoratorIntrinsicNames,
    DecoratorNames,
    InnerComponentNames,
    ModuleType,
    NavigationNames,
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
import { ComponentAttributeCache, ComponentRecord } from './cache/componentAttributeCache';
import { MetaDataCollector } from '../../common/metadata-collector';

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
        const ident: arkts.Identifier = node.name;
        const name: string = ident.name;
        const isFunctionCall: boolean = name !== BuilderLambdaNames.ORIGIN_METHOD_NAME;
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
            arkts.factory.updateIdentifier(ident, newName ?? name),
            isFunctionCall ? updateFunc : addMemoAnnotation(updateFunc),
            node.modifiers,
            false
        );
    }

    /**
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
                if (index === 0 && !!arg && isDoubleDollarCall(arg)) {
                    argInfo.push({ arg: BindableFactory.updateBindableStyleArguments(arg) });
                } else if (!!arg) {
                    argInfo.push({ arg });
                }
            },
            { isTrailingCall }
        );
        return argInfo;
    }

    /**
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
                        return this.processArgArrowFunction(info.arg);
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
     */
    static createComponentInitLambdaBody(
        lambdaBody: arkts.Identifier,
        name: string,
        hasReceiver?: boolean
    ): arkts.CallExpression {
        const methodName = arkts.factory.createIdentifier(getDeclaredSetAttribtueMethodName(name));
        if (!hasReceiver) {
            return arkts.factory.createCallExpression(
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
        }
        return arkts.factory.createCallExpression(methodName, undefined, [lambdaBody]);
    }

    /**
     * create initialized lambda body
     */
    static createInitLambdaBody(
        leaf: arkts.CallExpression,
        declInfo: BuilderLambdaDeclInfo
    ): BuilderLambdaStyleBodyInfo {
        const { name, isFunctionCall, hasReceiver } = declInfo;
        const lambdaBodyInfo: BuilderLambdaStyleBodyInfo = {
            lambdaBody: undefined,
            initCallPtr: undefined,
            reuseId: undefined,
            defaultReuseId: undefined,
            structEntryStroage: undefined,
        };
        const structInfo = !isFunctionCall ? getStructCalleeInfoFromCallee(leaf.expression) : {};
        if (!!structInfo?.isFromCustomDialog) {
            return lambdaBodyInfo;
        }
        if (!!structInfo?.isFromReuse && !!structInfo?.structName) {
            lambdaBodyInfo.defaultReuseId = arkts.factory.createStringLiteral(structInfo.structName);
        }
        if (!!structInfo?.isFromReuseV2 && !!structInfo?.structName) {
            lambdaBodyInfo.defaultReuseId = arkts.factory.createArrowFunction(
                UIFactory.createScriptFunction({
                    body: arkts.factory.createBlock([arkts.factory.createReturnStatement(arkts.factory.createStringLiteral(structInfo.structName))]),
                    flags:
                        arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW |
                        arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_HAS_RETURN,
                    modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
                })
            )
        }
        if (!!structInfo?.structEntryStroage && arkts.isStringLiteral(structInfo.structEntryStroage)) {
            lambdaBodyInfo.structEntryStroage = structInfo.structEntryStroage.str;
        }
        const lambdaBody = arkts.factory.createIdentifier(BuilderLambdaNames.STYLE_ARROW_PARAM_NAME);
        arkts.NodeCache.getInstance().collect(lambdaBody);
        if (isFunctionCall) {
            lambdaBodyInfo.lambdaBody = this.createComponentInitLambdaBody(lambdaBody, name, hasReceiver);
        } else {
            lambdaBodyInfo.lambdaBody = lambdaBody;
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

    /**
     * create `@memo (instance: <typeNode>): void => { <lambdaBody>; return; }`
     */
    static createStyleLambdaArgument(
        lambdaBody: arkts.Expression,
        typeNode: arkts.TypeNode | undefined
    ): arkts.ArrowFunctionExpression {
        const styleLambdaParam: arkts.ETSParameterExpression = arkts.factory.createParameterDeclaration(
            arkts.factory.createIdentifier(BuilderLambdaNames.STYLE_ARROW_PARAM_NAME, typeNode),
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
     * create style arguments in builder lambda for components.
     */
    static createComponentStyleArgInBuilderLambda(
        lambdaBody: arkts.Expression | undefined,
        typeNode: arkts.TypeNode | undefined,
        moduleName: string
    ): arkts.UndefinedLiteral | arkts.ArrowFunctionExpression {
        if (!lambdaBody) {
            return arkts.factory.createUndefinedLiteral();
        }
        collectComponentAttributeImport(typeNode, moduleName);
        const safeType: arkts.TypeNode | undefined = isSafeType(typeNode) ? typeNode : undefined;
        return this.createStyleLambdaArgument(lambdaBody, safeType);
    }

    /**
     * create style argument in builder lambda declaration.
     */
    static createStyleArgInBuilderLambdaDecl(
        typeNode: arkts.TypeNode | undefined,
        hasMemoSkip?: boolean
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
        const parameter = arkts.factory.createParameterDeclaration(
            arkts.factory.createIdentifier(BuilderLambdaNames.STYLE_PARAM_NAME, funcType),
            undefined
        );
        arkts.NodeCache.getInstance().collect(parameter, { hasMemoSkip });
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
        arg: arkts.ArrowFunctionExpression
    ): arkts.ArrowFunctionExpression {
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
        const propertyDecl: arkts.AstNode | undefined = arkts.getDecl(key);
        if (!propertyDecl || !arkts.isMethodDefinition(propertyDecl)) {
            return [prop];
        }
        let isBuilderParam: boolean = false;
        let isLinkIntrinsic: boolean = false;
        propertyDecl.scriptFunction.annotations.forEach((anno) => {
            isBuilderParam ||= isDecoratorAnnotation(anno, DecoratorNames.BUILDER_PARAM);
            isLinkIntrinsic ||= isDecoratorIntrinsicAnnotation(anno, DecoratorIntrinsicNames.LINK);
        });
        return factory.updateSpecificProperties(prop, key, value, { isBuilderParam, isLinkIntrinsic }, declInfo);
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
        let oriProperty: arkts.Property | undefined = undefined;
        if (isDoubleDollarCall(value)) {
            newProperty = BindableFactory.updateBindableProperty(prop, value);
        } else if (propertyInfo.isBuilderParam && arkts.isArrowFunctionExpression(value)) {
            addMemoAnnotation(value);
            newProperty = prop;
        } else if (
            propertyInfo.isLinkIntrinsic &&
            arkts.isMemberExpression(value) &&
            arkts.isThisExpression(value.object) &&
            arkts.isIdentifier(value.property)
        ) {
            oriProperty = prop;
            newProperty = arkts.factory.updateProperty(
                prop,
                arkts.factory.createIdentifier(backingField(keyName)),
                factory.updateBackingMember(value, value.property.name)
            );
        }
        if (declInfo?.isFunctionCall) {
            return [newProperty];
        }
        const propertyCollections: arkts.Property[] = [];
        if (!!oriProperty) {
            propertyCollections.push(oriProperty);
        }
        propertyCollections.push(newProperty);
        propertyCollections.push(
            arkts.factory.createProperty(
                arkts.factory.createIdentifier(optionsHasField(keyName)),
                arkts.factory.createBooleanLiteral(true)
            )
        )
        return propertyCollections;
    }

    /**
     * create or update arguments in a builder lambda call.
     * If the corresponding argument is not provided, fill-in an `undefined` to it.
     */
    static createOrUpdateArgInBuilderLambda(
        fallback: arkts.AstNode,
        arg: arkts.Expression | undefined,
        param: arkts.Expression,
        declInfo?: BuilderLambdaDeclInfo
    ): arkts.AstNode {
        if (!arg) {
            return fallback;
        }
        if (arkts.isArrowFunctionExpression(arg)) {
            const memoableInfo = collectMemoableInfoInParameter(param);
            const canAddMemo = findCanAddMemoFromArrowFunction(arg) || checkIsMemoFromMemoableInfo(memoableInfo, false);
            const newNode = this.processArgArrowFunction(arg);
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

    /**
     * rewrite argument to a lambda that returns the argument.
     */
    static rewriteArgumentToLambda(arg: arkts.Expression): arkts.ArrowFunctionExpression {
        const newFunc = UIFactory.createScriptFunction({
            body: arkts.factory.createBlock([arkts.factory.createReturnStatement(arg)]),
            flags:
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW |
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_HAS_RETURN,
            modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        });
        const returnMemoableInfo = collectMemoableInfoInFunctionReturnType(newFunc);
        collectScriptFunctionReturnTypeFromInfo(newFunc, returnMemoableInfo);
        return arkts.factory.createArrowFunction(newFunc);
    }

    /**
     * transform arguments in a builder lambda call for custom components.
     */
    static generateCustomComponentArgsInBuilderLambda(
        leaf: arkts.CallExpression,
        lambdaBodyInfo: BuilderLambdaStyleBodyInfo,
        declInfo: BuilderLambdaDeclInfo
    ): (arkts.AstNode | undefined)[] {
        const { params, returnType } = declInfo;
        const { lambdaBody, reuseId, defaultReuseId, structEntryStroage } = lambdaBodyInfo;
        const args: Array<arkts.AstNode | undefined> = [];
        const isTrailingCall = leaf.isTrailingCall;
        forEachArgWithParam(
            leaf.arguments,
            params,
            (arg, param, index) => {
                const fallback = arkts.factory.createUndefinedLiteral();
                let modifiedArg = this.createOrUpdateArgInBuilderLambda(fallback, arg, param, declInfo);
                if (index !== params.length - 1) {
                    const processedArg = factory.preprocessArgWithParamName(param, modifiedArg, structEntryStroage);
                    modifiedArg = arkts.isUndefinedLiteral(processedArg)
                        ? modifiedArg
                        : this.rewriteArgumentToLambda(processedArg as arkts.Expression);
                } else {
                    const reuseIdArg = reuseId?.clone() ?? defaultReuseId ?? arkts.factory.createUndefinedLiteral();
                    args.push(reuseIdArg);
                }
                args.push(modifiedArg);
            },
            { isTrailingCall }
        );
        if (!!lambdaBody) {
            const newLambdaBody = this.addApplyAttributesFinishToLambdaBodyEnd(lambdaBody);
            const styleArg = this.createStyleLambdaArgument(newLambdaBody, returnType);
            args.unshift(styleArg);
        }
        return args;
    }

    static preprocessArgWithParamName(
        param: arkts.Expression,
        arg: arkts.AstNode,
        name: string | undefined
    ): arkts.AstNode {
        if (!arkts.isEtsParameterExpression(param)) {
            return arg;
        }
        const paramName: string = param.identifier.name;
        if (paramName === BuilderLambdaNames.STORAGE_PARAM_NAME) {
            return name ? arkts.factory.createCallExpression(arkts.factory.createIdentifier(name), undefined, []) : arg;
        }
        return arg;
    }

    /**
     * transform arguments in a builder lambda call for components.
     */
    static generateComponentArgsInBuilderLambda(
        leaf: arkts.CallExpression,
        lambdaBodyInfo: BuilderLambdaStyleBodyInfo,
        declInfo: BuilderLambdaDeclInfo
    ): (arkts.AstNode | undefined)[] {
        const { params, returnType, moduleName, isFromCommonMethod } = declInfo;
        const type: arkts.Identifier | undefined = builderLambdaType(leaf);
        const typeName: string | undefined = type?.name;
        const args: (arkts.AstNode | undefined)[] = [];
        const modifiedArgs: (arkts.AstNode | undefined)[] = [];
        const isTrailingCall = leaf.isTrailingCall;
        const typeArguments = leaf.typeArguments;
        const hasLastTrailingLambda = checkIsTrailingLambdaInLastParam(params);
        forEachArgWithParam(
            leaf.arguments,
            params,
            (arg, param, index) => {
                let modifiedArg: arkts.AstNode | undefined;
                if (!modifiedArg) {
                    const fallback = arkts.factory.createUndefinedLiteral();
                    const updatedArg = this.createOrUpdateArgInBuilderLambda(fallback, arg, param, declInfo);
                    modifiedArg = factory.processModifiedArg(
                        updatedArg,
                        index,
                        leaf.arguments,
                        moduleName!,
                        type?.name
                    );
                }
                const shouldInsertToArgs = index === params.length - 1 && hasLastTrailingLambda;
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
            factory.addArgsInBuilderLambdaCall(modifiedArgs, typeName, moduleName ?? '', leaf),
            typeArguments,
            isFromCommonMethod
        );
        const styleArg = this.createComponentStyleArgInBuilderLambda(lambdaBody, returnType, moduleName!);
        args.unshift(styleArg);
        return args;
    }

    static addArgsInBuilderLambdaCall(
        modifiedArgs: (arkts.AstNode | undefined)[],
        typeName: string | undefined,
        moduleName: string,
        leaf: arkts.CallExpression
    ): (arkts.AstNode | undefined)[] {
        if (isNavigationOrNavDestination(typeName, moduleName)) {
            modifiedArgs.push(factory.createModuleInfoArg(getIsUserCreateStack(typeName, leaf.arguments)));
        }
        return modifiedArgs;
    }

    static createModuleInfoArg(isUserCreateStack: boolean | undefined): arkts.ObjectExpression {
        const projectConfig = MetaDataCollector.getInstance().projectConfig;
        const fileAbsName = MetaDataCollector.getInstance().fileAbsName;
        const moduleName = projectConfig?.moduleName ?? '';
        const filePath = path.relative(projectConfig?.projectRootPath ?? '', fileAbsName ?? '').replace(/\.ets$/, '');
        const pagePath = projectConfig?.moduleType === ModuleType.HAR ? '' : filePath;
        const properties: arkts.Property[] = [
            arkts.factory.createProperty(
                arkts.factory.createIdentifier(NavigationNames.MODULE_NAME),
                arkts.factory.createStringLiteral(moduleName)
            ),
            arkts.factory.createProperty(
                arkts.factory.createIdentifier(NavigationNames.PAGE_PATH),
                arkts.factory.createStringLiteral(pagePath)
            ),
        ];
        if (isUserCreateStack !== undefined) {
            properties.push(
                arkts.factory.createProperty(
                    arkts.factory.createIdentifier(NavigationNames.IS_USER_CREATE_STACK),
                    arkts.factory.createBooleanLiteral(isUserCreateStack)
                )
            );
        }
        return arkts.factory.createObjectExpression(
            arkts.Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION,
            properties,
            true
        );
    }

    /**
     * transform arguments in a builder lambda call for components.
     */
    static generateArgsInBuilderLambda(
        leaf: arkts.CallExpression,
        lambdaBodyInfo: BuilderLambdaStyleBodyInfo,
        declInfo: BuilderLambdaDeclInfo
    ): (arkts.AstNode | undefined)[] {
        if (declInfo.isFunctionCall) {
            return this.generateComponentArgsInBuilderLambda(leaf, lambdaBodyInfo, declInfo);
        }
        return this.generateCustomComponentArgsInBuilderLambda(leaf, lambdaBodyInfo, declInfo);
    }

    /**
     * process `@ComponentBuilder` call arguments for some specific transformation.
     */
    static processModifiedArg(
        modifiedArg: arkts.AstNode | undefined,
        index: number | undefined,
        args: readonly arkts.Expression[],
        moduleName: string,
        name: string | undefined
    ): arkts.AstNode | undefined {
        if (index === 0 && isForEach(name, moduleName) && !!modifiedArg && arkts.isExpression(modifiedArg)) {
            const newFunc = UIFactory.createScriptFunction({
                body: arkts.factory.createBlock([arkts.factory.createReturnStatement(modifiedArg)]),
                flags:
                    arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW |
                    arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_HAS_RETURN,
                modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            });
            const returnMemoableInfo = collectMemoableInfoInFunctionReturnType(newFunc);
            collectScriptFunctionReturnTypeFromInfo(newFunc, returnMemoableInfo);
            return arkts.factory.createArrowFunction(newFunc);
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
            args[1].scriptFunction.params.length <= 0
        ) {
            return undefined;
        }
        const argTypeParam: arkts.Expression = args[1].scriptFunction.params[0];
        if (!arkts.isEtsParameterExpression(argTypeParam)) {
            return undefined;
        }
        const type: arkts.AstNode | undefined = argTypeParam.type;
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
        const type = arkts.createTypeNodeFromTsType(node);
        if (!type || !arkts.isTypeNode(type)) {
            return undefined;
        }
        return type;
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
        if (arkts.isIdentifier(node) && !!declInfo.moduleName) {
            ImportCollector.getInstance().collectSource(funcName, declInfo.moduleName);
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
        const newNode = this.updateBuilderLambdaMethodDecl(
            node,
            [this.createStyleArgInBuilderLambdaDecl(typeNode)],
            removeAnnotationByName(func.annotations, BuilderLambdaNames.ANNOTATION_NAME),
            replaceBuilderLambdaDeclMethodName(nameNode.name)
        );
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
        const lambdaBodyInfo = factory.createInitLambdaBody(leaf, declInfo);
        let reuseId: arkts.AstNode | undefined;
        let lambdaBody: arkts.Identifier | arkts.CallExpression | undefined = lambdaBodyInfo.lambdaBody;
        if (instanceCalls.length > 0 && !!lambdaBodyInfo.lambdaBody) {
            instanceCalls = instanceCalls.reverse();
            this.updateAnimation(instanceCalls);
            instanceCalls.forEach((callInfo) => {
                reuseId = findReuseId(callInfo.call);
                lambdaBody = this.createStyleLambdaBody(lambdaBody!, callInfo);
            });
        }
        lambdaBodyInfo.lambdaBody = lambdaBody;
        lambdaBodyInfo.reuseId = reuseId;
        const args: (arkts.AstNode | undefined)[] = this.generateArgsInBuilderLambda(leaf, lambdaBodyInfo, declInfo);
        const isTrailingCall = leaf.isTrailingCall;
        const newNode = arkts.factory.updateCallExpression(node, replace, leaf.typeArguments, filterDefined(args));
        factory.setBuilderLambdaRange(isTrailingCall, newNode, node);
        arkts.NodeCache.getInstance().collect(newNode);
        return newNode;
    }

    /**
     * set range for `@ComponentBuilder` call.
     */
    static setBuilderLambdaRange(
        isTrailingCall: boolean,
        newNode: arkts.CallExpression,
        node: arkts.CallExpression
    ): void {
        if (isTrailingCall && node.parent && node.parent.parent) {
            newNode.range = node.parent.parent.range;
        } else {
            newNode.range = node.range;
        }
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
    static generateOnChangeArrowFunc(
        bindableArg: arkts.Expression,
        valueType: arkts.TypeNode | undefined
    ): arkts.Property {
        return arkts.factory.createProperty(
            arkts.factory.createIdentifier('onChange'),
            PropertyFactory.createArrowFunctionWithParamsAndBody(
                undefined,
                [
                    arkts.factory.createParameterDeclaration(
                        arkts.factory.createIdentifier('value', valueType?.clone()),
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
     * create `makeBuilderParameterProxy` function call to replace the ONLY argument in `@Builder` function call.
     */
    static createBuilderParameterProxyCall(
        node: arkts.ObjectExpression,
        typeRef: arkts.TypeNode,
        isFromClass: boolean
    ): arkts.CallExpression {
        const entries = flatObjectExpressionToEntries(node);
        const objectArg = isFromClass
            ? arkts.factory.createObjectExpression(arkts.Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION, [], false)
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
            [typeRef],
            [objectArg, newMapArg, updateArg]
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
        const newMapName = arkts.factory.createTypeReference(
            arkts.factory.createTypeReferencePart(
                arkts.factory.createIdentifier(TypeNames.MAP),
                arkts.factory.createTSTypeParameterInstantiation([
                    UIFactory.createTypeReferenceFromString(TypeNames.STRING),
                    arkts.factory.createFunctionType(
                        arkts.factory.createFunctionSignature(
                            undefined,
                            [],
                            UIFactory.createTypeReferenceFromString(TypeNames.ANY),
                            false
                        ),
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
                        const arrowFunc = arkts.factory.createArrowFunction(
                            UIFactory.createScriptFunction({
                                body: arkts.factory.createBlock([arkts.factory.createReturnStatement(value)]),
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
        const param = arkts.factory.createParameterDeclaration(
            arkts.factory.createIdentifier(genSymName, typeRef),
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
                          arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
                          right
                      )
                  );
              })
            : [];
        const body = arkts.factory.createBlock(statements);
        const flags = arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW;
        return arkts.factory.createArrowFunction(UIFactory.createScriptFunction({ params: [param], body, flags }));
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

    /**
     * create parameter declaration `ModuleInfo: NavigationModuleInfo` or `ModuleInfo: NavDestinationModuleInfo`.
     */
    static createModuleInfoParam(name: string): arkts.ETSParameterExpression {
        return arkts.factory
            .createParameterDeclaration(
                arkts.factory.createIdentifier(
                    NavigationNames.MODULE_INFO,
                    UIFactory.createTypeReferenceFromString(
                        name === InnerComponentNames.NAVIGATION
                            ? NavigationNames.NAVIGATION_MODULE_INFO
                            : NavigationNames.NAV_DESTINATION_MODULE_INFO
                    )
                ),
                undefined
            )
            .setOptional(true);
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
        const returnTypeAnnotation = arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID);
        const flags = arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD;
        const params = factory.createDeclaredComponentFunctionParameters(
            attributeName,
            attributeTypeParams,
            hasLastTrailingLambda
        );
        const typeParamItems = record.typeParameters?.map((p) => TypeFactory.createTypeParameterFromRecord(p));
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
        const styleArg: arkts.ETSParameterExpression = this.createStyleArgInBuilderLambdaDecl(typeNode);
        params.push(styleArg);

        if (!!hasLastTrailingLambda) {
            const contentArg: arkts.ETSParameterExpression = this.createContentArgInBuilderLambdaDecl();
            params.push(contentArg);
        }

        return params;
    }
}
