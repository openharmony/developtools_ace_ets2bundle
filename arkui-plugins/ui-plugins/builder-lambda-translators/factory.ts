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
import * as path from 'path';
import { LocalImportInfo, optionsHasField } from '../utils';
import {
    backingField,
    filterDefined,
    isDecoratorAnnotation,
    removeAnnotationByName,
    forEachArgWithParam,
    annotation,
    collect,
    withAPIVersion,
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
    isCustomBuilderLambdaFunctionCall,
    isSafeType,
    replaceBuilderLambdaDeclMethodName,
    isDoubleDollarCall,
    InstanceCallInfo,
    isStyleChainedCall,
    isStyleWithReceiverCall,
    builderLambdaType,
    BuilderLambdaChainingCallArgInfo,
    OptionsPropertyInfo,
    flatObjectExpressionToEntries,
    BuilderLambdaStyleBodyInfo,
    getDeclaredSetAttribtueMethodName,
    getTransformedComponentName,
    findReuseId,
    getStructCalleeInfoFromCallee,
    isInEntryWrapper,
    isDebugLineEnabled,
    getObjectInstanceDeclTypeMap,
    StructCalleeInfo,
} from './utils';
import { checkIsNameStartWithBackingField, hasDecorator } from '../property-translators/utils';
import { BuilderFactory } from './builder-factory';
import { factory as MemoCollectFactory } from '../../collectors/memo-collectors/factory';
import { factory as PropertyFactory } from '../property-translators/factory';
import { BindableFactory } from './bindable-factory';
import { factory as TypeFactory } from '../type-translators/factory';
import { factory as UIFactory } from '../ui-factory';
import {
    AnimationNames,
    ARKUI_BUILDER_SOURCE_NAME,
    DecoratorNames,
    InnerComponentNames,
    ModuleType,
    NavigationNames,
    StateManagementTypes,
    TypeNames,
    NodeCacheNames,
    BuilderLambdaNames,
    APIVersions,
    APIComparison,
    INNER_COMPONENT_NON_SKIP_DECL_NAMES,
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
import { checkIsTrailingLambdaInLastParam, isForEach, isNavigationOrNavDestination } from '../../collectors/ui-collectors/records';
import { InitialBuilderLambdaBodyCache } from '../memo-collect-cache';
import { NodeCacheFactory } from '../../common/node-cache';

interface CreateStyleLambdaArgumentOptions {
    shouldApplyAttribute?: boolean;
    shouldSkipDebugLine?: boolean;
}

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
                func.modifierFlags,
                newName ? arkts.factory.createIdentifier(newName) : func.id,
                newAnno
            );
        const updated =  arkts.factory.updateMethodDefinition(
            node,
            node.kind,
            newName ? arkts.factory.createIdentifier(newName) : node.id,
            arkts.factory.createFunctionExpression(
                newName ? arkts.factory.createIdentifier(newName) : func.id?.clone(),
                isFunctionCall ? updateFunc : addMemoAnnotation(updateFunc)
            ),
            node.modifierFlags,
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
                if (!!arg) {
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
                        return this.processArgArrowFunction(info.arg);
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
                [],
                undefined,
                false,
                false
            );
        }
        return arkts.factory.createCallExpression(methodName, [lambdaBody], undefined, false, false);
    }

    /**
     * create initialized lambda body
     */
    static createInitLambdaBody(
        declInfo: BuilderLambdaDeclInfo,
 	    structInfo: StructCalleeInfo | undefined
    ): BuilderLambdaStyleBodyInfo {
        const { name, isFunctionCall, hasReceiver } = declInfo;
        const lambdaBodyInfo: BuilderLambdaStyleBodyInfo = {
            lambdaBody: undefined,
            initCallPtr: undefined,
            reuseId: undefined,
            defaultReuseId: undefined,
            structEntryStroage: undefined,
        };
        if (!!structInfo?.isFromCustomDialog) {
            return lambdaBodyInfo;
        }
        if (!!structInfo?.isFromReuse && !!structInfo?.structName && !structInfo?.isFromEntry) {
            lambdaBodyInfo.defaultReuseId = arkts.factory.createStringLiteral(structInfo.structName);
        }
        if (!!structInfo?.isFromReuseV2 && !!structInfo?.structName && !structInfo?.isFromEntry) {
            lambdaBodyInfo.defaultReuseId = arkts.factory.createArrowFunctionExpression(
                UIFactory.createScriptFunction({
                    body: arkts.factory.createBlockStatement([arkts.factory.createReturnStatement(arkts.factory.createStringLiteral(structInfo.structName))]),
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
        InitialBuilderLambdaBodyCache.getInstance().collect({ node: lambdaBody });
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
        typeNode: arkts.TypeNode | undefined,
        options?: CreateStyleLambdaArgumentOptions,
        sourceNode?: arkts.CallExpression
    ): arkts.ArrowFunctionExpression {
        const shouldApplyAttribute = options?.shouldApplyAttribute ?? true;
        const shouldSkipDebugLine = options?.shouldSkipDebugLine ?? false;
        const styleLambdaParam: arkts.ETSParameterExpression = arkts.factory.createETSParameterExpression(
            arkts.factory.createIdentifier(BuilderLambdaNames.STYLE_ARROW_PARAM_NAME, typeNode),
            false,
            undefined
        );
        const debugLineStatement = sourceNode && !shouldSkipDebugLine ? factory.createDebugLineStatement(sourceNode) : undefined;
        const instanceIdentifier = arkts.factory.createIdentifier(BuilderLambdaNames.STYLE_ARROW_PARAM_NAME);
        InitialBuilderLambdaBodyCache.getInstance().collect({ node: instanceIdentifier });
        const applyAttributesFinish = arkts.factory.createExpressionStatement(
            arkts.factory.createCallExpression(
                arkts.factory.createMemberExpression(
                    instanceIdentifier,
                    arkts.factory.createIdentifier(BuilderLambdaNames.APPLY_ATTRIBUTES_FINISH_METHOD),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
                [],
                undefined,
                false,
                false
            )
        );

        const returnStatement = arkts.factory.createReturnStatement();
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(returnStatement);
        const body: arkts.BlockStatement = arkts.factory.createBlockStatement([
            ...(debugLineStatement ? [debugLineStatement] : []),
            ...(arkts.isIdentifier(lambdaBody) ? [] : [arkts.factory.createExpressionStatement(lambdaBody)]),
            ...(shouldApplyAttribute ? [applyAttributesFinish]: []),
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
        const newNode = arkts.factory.createArrowFunctionExpression(func);
        newNode.setNoDebugLineFlag();
        return addMemoAnnotation(newNode);
    }

    /**
     * create debugLine statement for component.
     */
    static createDebugLineStatement(sourceNode: arkts.CallExpression): arkts.ExpressionStatement | undefined {
        const projectConfig = MetaDataCollector.getInstance().projectConfig;
        const compatibleSdkVersion = projectConfig?.compatibleSdkVersion;
        if (compatibleSdkVersion === undefined || compatibleSdkVersion < 24) {
            return undefined;
        }

        const isDebugMode = projectConfig?.debugLine === true;
        if (!isDebugMode || !sourceNode) {
            return undefined;
        }

        const fileAbsName = MetaDataCollector.getInstance().fileAbsName;
        const moduleName = projectConfig?.moduleName;
        const projectRootPath = projectConfig?.projectRootPath;
        if (!fileAbsName || !moduleName || !projectRootPath) {
            return undefined;
        }

        const relativeFilePath = path.relative(projectRootPath, fileAbsName);
        const formattedFilePath = relativeFilePath.replace(/\//g, '\\\\');
        const line = sourceNode.startPosition.getLine() + 1;
        const column = sourceNode.startPosition.getCol();
        const locationString = `${formattedFilePath}(${line}:${column})`;
        const instanceIdentifier = arkts.factory.createIdentifier(BuilderLambdaNames.STYLE_ARROW_PARAM_NAME);
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(instanceIdentifier);
        const debugLineStatement = arkts.factory.createExpressionStatement(
            arkts.factory.createCallExpression(
                arkts.factory.createMemberExpression(
                    instanceIdentifier,
                    arkts.factory.createIdentifier(BuilderLambdaNames.DEBUG_LINE_METHOD),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
                [
                    arkts.factory.createStringLiteral(locationString),
                    arkts.factory.createStringLiteral(moduleName)
                ],
                undefined,
                false,
                false
            )
        );
        return debugLineStatement;
    }

    /**
     * create style arguments in builder lambda for components.
     */
    static createComponentStyleArgInBuilderLambda(
        lambdaBody: arkts.Expression | undefined,
        typeNode: arkts.TypeNode | undefined,
        moduleName: string,
        isFromCommonMethod: boolean | undefined,
        sourceNode?: arkts.CallExpression
    ): arkts.UndefinedLiteral | arkts.ArrowFunctionExpression {
        if (!lambdaBody) {
            return arkts.factory.createUndefinedLiteral();
        }
        collectComponentAttributeImport(typeNode, moduleName);
        const safeType: arkts.TypeNode | undefined = isSafeType(typeNode) ? typeNode : undefined;
        let shouldApplyAttribute: boolean = true;
        withAPIVersion(
            { version: APIVersions.API_24, compare: APIComparison.LESS_THAN_OR_EQUAL },
            (sdkVersion: APIVersions) => {
                shouldApplyAttribute = !!isFromCommonMethod
            },
            { ignoreCompare: true }
        );
        return this.createStyleLambdaArgument(lambdaBody, safeType, { shouldApplyAttribute }, sourceNode);
    }

    /**
     * create style argument in builder lambda declaration.
     */
    static createStyleArgInBuilderLambdaDecl(
        typeNode: arkts.TypeNode | undefined,
        hasMemoSkip?: boolean
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
        const unionType = arkts.factory.createETSUnionType([funcType, arkts.factory.createETSUndefinedType()]);
        addMemoAnnotation(funcType);
        const parameter = arkts.factory.createETSParameterExpression(
            arkts.factory.createIdentifier(BuilderLambdaNames.STYLE_PARAM_NAME, unionType),
            false,
            undefined
        );
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(parameter, { hasMemoSkip });
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
        arg: arkts.ArrowFunctionExpression
    ): arkts.ArrowFunctionExpression {
        const func: arkts.ScriptFunction = arg.function!;
        const updateFunc = arkts.factory.updateScriptFunction(
            func,
            !!func.body && arkts.isBlockStatement(func.body)
                ? arkts.factory.updateBlockStatement(
                      func.body,
                      func.body.statements.map((st) => this.updateContentBodyInBuilderLambda(st))
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
        let oriProperty: arkts.Property | undefined = undefined;
        if (propertyInfo.isBuilderParam && arkts.isArrowFunctionExpression(value)) {
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
                arkts.Es2pandaPropertyKind.PROPERTY_KIND_INIT,
                arkts.factory.createIdentifier(optionsHasField(keyName)),
                arkts.factory.createBooleanLiteral(true),
                false,
                false
            )
        )
        return propertyCollections;
    }

    /**
     * create or update arguments in a builder lambda call.
     * If the corresponding argument is not provided, fill-in an `undefined` to it.
     */
    static createOrUpdateArgInBuilderLambda(
        fallback: arkts.Expression,
        arg: arkts.Expression | undefined,
        param: arkts.Expression,
        declInfo?: BuilderLambdaDeclInfo
    ): arkts.Expression {
        if (!arg) {
            return fallback;
        }
        if (arkts.isArrowFunctionExpression(arg)) {
            const memoableInfo = collectMemoableInfoInParameter(param);
            const canAddMemo = findCanAddMemoFromArrowFunction(arg).canAddMemo || checkIsMemoFromMemoableInfo(memoableInfo, false);
            const newNode = this.processArgArrowFunction(arg);
            if (canAddMemo) {
                addMemoAnnotation(newNode);
            }
            newNode.setNoDebugLineFlag();
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
            body: arkts.factory.createBlockStatement([arkts.factory.createReturnStatement(arg)]),
            flags:
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW |
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_HAS_RETURN,
            modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
        });
        const returnMemoableInfo = collectMemoableInfoInFunctionReturnType(newFunc);
        collectScriptFunctionReturnTypeFromInfo(newFunc, returnMemoableInfo);
        const newNode = arkts.factory.createArrowFunctionExpression(newFunc);
        newNode.setNoDebugLineFlag();
        return newNode;
    }

    static generateCustomInnerComponentArgsInBuilderLambda(
        leaf: arkts.CallExpression,
        lambdaBodyInfo: BuilderLambdaStyleBodyInfo,
        declInfo: BuilderLambdaDeclInfo
    ): (arkts.Expression | undefined)[] {
        const { params, moduleName, isFromCommonMethod } = declInfo;
        let returnType: arkts.TypeNode | undefined;
        const expression = leaf.callee;
        if (arkts.isMemberExpression(expression) && !!expression.object && arkts.isIdentifier(expression.object)) {
            returnType = UIFactory.createTypeReferenceFromString(expression.object.name);
        }
        const args: Array<arkts.Expression | undefined> = [];
        const modifiedArgs: (arkts.Expression | undefined)[] = [];
        const isTrailingCall = leaf.isTrailingCall;
        const typeArguments = leaf.typeParams;
        const hasLastTrailingLambda = checkIsTrailingLambdaInLastParam(params);
        forEachArgWithParam(
            leaf.arguments,
            params,
            (arg, param, index) => {
                if (index === 0) {
                    args.push(arg);
                    return;
                }
                const fallback = arkts.factory.createUndefinedLiteral();
                const updatedArg = this.createOrUpdateArgInBuilderLambda(fallback, arg, param, declInfo);
                if (index === params.length - 1 && hasLastTrailingLambda) {
                    args.push(updatedArg);
                } else {
                    modifiedArgs.push(updatedArg);
                }
            },
            { isTrailingCall }
        );
        const lambdaBody = this.addOptionsArgsToLambdaBodyInStyleArg(
            lambdaBodyInfo,
            modifiedArgs,
            typeArguments?.params,
        );
        const styleArg = this.createComponentStyleArgInBuilderLambda(lambdaBody, returnType, moduleName!, isFromCommonMethod, leaf);
        args.unshift(styleArg);
        return args;
    }

    /**
     * transform arguments in a builder lambda call for custom components.
     */
    static generateCustomComponentArgsInBuilderLambda(
        leaf: arkts.CallExpression,
        lambdaBodyInfo: BuilderLambdaStyleBodyInfo,
        declInfo: BuilderLambdaDeclInfo
    ): (arkts.Expression | undefined)[] {
        const { params, returnType } = declInfo;
        const { lambdaBody, reuseId, defaultReuseId, structEntryStroage } = lambdaBodyInfo;
        const args: Array<arkts.Expression | undefined> = [];
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
            const shouldSkipDebugLine = isInEntryWrapper(leaf);
            const shouldAddDebugLine = !shouldSkipDebugLine && isDebugLineEnabled();
            if (!shouldAddDebugLine && arkts.isIdentifier(lambdaBody)) {
                args.unshift(arkts.factory.createUndefinedLiteral());
            } else {
                const styleArg = this.createStyleLambdaArgument(lambdaBody, returnType, { shouldSkipDebugLine: shouldSkipDebugLine }, leaf);
                args.unshift(styleArg);
            }
        }
        return args;
    }

    static preprocessArgWithParamName(
        param: arkts.Expression,
        arg: arkts.Expression,
        name: string | undefined
    ): arkts.Expression {
        if (!arkts.isETSParameterExpression(param)) {
            return arg;
        }
        const paramName: string | undefined = param.ident?.name;
        if (paramName === BuilderLambdaNames.STORAGE_PARAM_NAME) {
            return name ? arkts.factory.createCallExpression(arkts.factory.createIdentifier(name), [], undefined, false, false) : arg;
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
    ): (arkts.Expression | undefined)[] {
        const { params, returnType, moduleName, isFromCommonMethod } = declInfo;
        const type: arkts.Identifier | undefined = builderLambdaType(leaf);
        const typeName: string | undefined = type?.name;
        const args: (arkts.Expression | undefined)[] = [];
        const modifiedArgs: (arkts.Expression | undefined)[] = [];
        const isTrailingCall = leaf.isTrailingCall;
        const typeArguments = leaf.typeParams?.params;
        const hasLastTrailingLambda = checkIsTrailingLambdaInLastParam(params);
        forEachArgWithParam(
            leaf.arguments,
            params,
            (arg, param, index) => {
                let modifiedArg: arkts.Expression | undefined;
                if (!modifiedArg) {
                    const fallback = arkts.factory.createUndefinedLiteral();
                    modifiedArg = this.createOrUpdateArgInBuilderLambda(fallback, arg, param, declInfo);
                }
                const shouldUpdateMemo = !!arg && NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).shouldUpdate(arg);
                const shouldInsertToArgs = index === params.length - 1 && hasLastTrailingLambda;
                if (shouldInsertToArgs) {
                    if (shouldUpdateMemo) {
                        NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).addNodeToUpdateByPeer(modifiedArg.peer);
                    }
                    args.push(modifiedArg);
                } else {
                    modifiedArg = factory.processModifiedArg(modifiedArg, index, moduleName, type?.name);
                    if (shouldUpdateMemo && !!modifiedArg) {
                        NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).addNodeToUpdateByPeer(modifiedArg.peer);
                    }
                    modifiedArgs.push(modifiedArg);
                }
            },
            { isTrailingCall }
        );
        const lambdaBody = this.addOptionsArgsToLambdaBodyInStyleArg(
            lambdaBodyInfo,
            factory.addArgsInNavigationBuilderLambdaCall(modifiedArgs, typeName, moduleName),
            typeArguments,
        );
        const styleArg = this.createComponentStyleArgInBuilderLambda(lambdaBody, returnType, moduleName!, isFromCommonMethod, leaf);
        args.unshift(styleArg);
        return args;
    }

    static addArgsInNavigationBuilderLambdaCall(
        modifiedArgs: (arkts.Expression | undefined)[],
        typeName: string | undefined,
        moduleName: string | undefined
    ): (arkts.Expression | undefined)[] {
        const filteredModifiedArgs = filterDefined(modifiedArgs);
        const sourceName: string | undefined = moduleName ?? MetaDataCollector.getInstance().externalSourceName;
        if (isNavigationOrNavDestination(typeName, sourceName)) {
            const isUserCreateStack = typeName === InnerComponentNames.NAVIGATION
                ? filteredModifiedArgs.length > 0 && !arkts.isUndefinedLiteral(filteredModifiedArgs.at(0)!)
                : undefined;
            filteredModifiedArgs.push(factory.createModuleInfoArg(isUserCreateStack));
        }
        return filteredModifiedArgs;
    }

    static createModuleInfoArg(isUserCreateStack: boolean | undefined): arkts.ObjectExpression {
        const projectConfig = MetaDataCollector.getInstance().projectConfig;
        const fileAbsName = MetaDataCollector.getInstance().fileAbsName;
        const moduleName = projectConfig?.moduleName ?? '';
        const filePath = path.relative(projectConfig?.projectRootPath ?? '', fileAbsName ?? '').replace(/\.ets$/, '');
        const pagePath = projectConfig?.moduleType === ModuleType.HAR ? '' : filePath;
        const properties: arkts.Property[] = [
            arkts.factory.createProperty(
                arkts.Es2pandaPropertyKind.PROPERTY_KIND_INIT,
                arkts.factory.createIdentifier(NavigationNames.MODULE_NAME),
                arkts.factory.createStringLiteral(moduleName),
                false,
                false
            ),
            arkts.factory.createProperty(
                arkts.Es2pandaPropertyKind.PROPERTY_KIND_INIT,
                arkts.factory.createIdentifier(NavigationNames.PAGE_PATH),
                arkts.factory.createStringLiteral(pagePath),
                false,
                false
            ),
        ];
        if (isUserCreateStack !== undefined) {
            properties.push(
                arkts.factory.createProperty(
                    arkts.Es2pandaPropertyKind.PROPERTY_KIND_INIT,
                    arkts.factory.createIdentifier(NavigationNames.IS_USER_CREATE_STACK),
                    arkts.factory.createBooleanLiteral(isUserCreateStack),
                    false,
                    false
                )
            );
        }
        return arkts.factory.createObjectExpression(properties);
    }

    /**
     * transform arguments in a builder lambda call for components.
     */
    static generateArgsInBuilderLambda(
        leaf: arkts.CallExpression,
        lambdaBodyInfo: BuilderLambdaStyleBodyInfo,
        declInfo: BuilderLambdaDeclInfo
    ): (arkts.Expression | undefined)[] {
        if (declInfo.isFunctionCall) {
            if (declInfo.isCustomFunctionCall) {
                return this.generateCustomInnerComponentArgsInBuilderLambda(leaf, lambdaBodyInfo, declInfo);
            }
            return this.generateComponentArgsInBuilderLambda(leaf, lambdaBodyInfo, declInfo);
        }
        return this.generateCustomComponentArgsInBuilderLambda(leaf, lambdaBodyInfo, declInfo);
    }

    /**
     * process `@ComponentBuilder` call arguments for some specific transformation.
     */
    static processModifiedArg(
        modifiedArg: arkts.Expression | undefined,
        index: number | undefined,
        moduleName: string | undefined,
        typeName: string | undefined
    ): arkts.Expression | undefined {
        if (isForEach(typeName, moduleName) && !!modifiedArg) {
            if (index === 0 && arkts.isExpression(modifiedArg)) {
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
        typeArguments: readonly arkts.TypeNode[] | undefined
    ): arkts.CallExpression | arkts.Identifier | undefined {
        const { lambdaBody, initCallPtr } = lambdaBodyInfo;
        if (!lambdaBody) {
            return undefined;
        }
        if (!initCallPtr || arkts.isIdentifier(lambdaBody)) {
            return lambdaBody;
        }
        const styleInternalsVisitor = new StyleInternalsVisitor();
        const newLambdaBody = styleInternalsVisitor
            .registerInitCall(initCallPtr)
            .registerInitCallArgs(filterDefined(args))
            .registerInitCallTypeArguments(typeArguments)
            .visitor(lambdaBody) as arkts.CallExpression | arkts.Identifier;
        return newLambdaBody;
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
        const node = leaf.callee;
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
                declInfo.superName !== undefined ? arkts.factory.createIdentifier(declInfo.superName) : node.object,
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
        const isCustomFunctionCall: boolean = isCustomBuilderLambdaFunctionCall(nameNode);
        withAPIVersion(
            { version: APIVersions.API_24, compare: APIComparison.LESS_THAN_OR_EQUAL },
            (sdkVersion: APIVersions) => {
                if (isFunctionCall && !isCustomFunctionCall) {
                    ComponentAttributeCache.getInstance().collect(node);
                }
            },
            { ignoreCompare: !!nameNode?.name && INNER_COMPONENT_NON_SKIP_DECL_NAMES.includes(nameNode?.name) }
        )
        const typeNode: arkts.TypeNode | undefined = builderLambdaMethodDeclType(node, isFunctionCall);
        const newNode = this.updateBuilderLambdaMethodDecl(
            node,
            [this.createStyleArgInBuilderLambdaDecl(typeNode)],
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
        const structInfo = !declInfo.isFunctionCall ? getStructCalleeInfoFromCallee(leaf.callee) : {};
 	    const lambdaBodyInfo = factory.createInitLambdaBody(declInfo, structInfo);
        let reuseId: arkts.Expression | undefined;
        const isReuse = !!structInfo?.isFromReuse || !!structInfo?.isFromReuseV2;
        let lambdaBody: arkts.Identifier | arkts.CallExpression | undefined = lambdaBodyInfo.lambdaBody;
        if (instanceCalls.length > 0 && !!lambdaBodyInfo.lambdaBody) {
            instanceCalls = instanceCalls.reverse();
            this.updateAnimation(instanceCalls);
            instanceCalls.forEach((callInfo) => {
                if (isReuse) {
                    reuseId = !declInfo.isFunctionCall ? findReuseId(callInfo.call) : undefined;
                }
                const isReuseIdCall = findReuseId(callInfo.call) !== undefined;
                if (isReuseIdCall && !isReuse) {
                    return;
                }
                lambdaBody = this.createStyleLambdaBody(lambdaBody!, callInfo);
            });
        }
        lambdaBodyInfo.lambdaBody = lambdaBody;
        lambdaBodyInfo.reuseId = reuseId;
        const args: (arkts.Expression | undefined)[] = this.generateArgsInBuilderLambda(leaf, lambdaBodyInfo, declInfo);
        const isTrailingCall = leaf.isTrailingCall;
        const newNode = arkts.factory.updateCallExpression(node, replace, filterDefined(args), leaf.typeParams, node.isOptional, node.hasTrailingComma, node.trailingBlock);
        factory.setBuilderLambdaRange(isTrailingCall, newNode, node);
        InitialBuilderLambdaBodyCache.getInstance().updateAll().reset();
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(newNode);
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
            newNode.startPosition = node.parent.parent.startPosition;
            newNode.endPosition = node.parent.parent.endPosition;
        } else {
            newNode.startPosition = node.startPosition;
            newNode.endPosition = node.endPosition;
        }
    }

    /*
     * generate `value: <bindableArg>` in object.
     */
    static generateValueProperty(bindableArg: arkts.Expression): arkts.Property {
        return arkts.factory.createProperty(
            arkts.Es2pandaPropertyKind.PROPERTY_KIND_INIT,
            arkts.factory.createIdentifier('value'),
            bindableArg.clone(),
            false,
            false
        );
    }

    /*
     * generate `onChange: (value) => <bindableArg> = value` in object.
     */
    static generateOnChangeArrowFunc(
        bindableArg: arkts.Expression,
        valueType: arkts.TypeNode | undefined
    ): arkts.Property {
        return arkts.factory.createProperty(
            arkts.Es2pandaPropertyKind.PROPERTY_KIND_INIT,
            arkts.factory.createIdentifier('onChange'),
            PropertyFactory.createArrowFunctionWithParamsAndBody(
                undefined,
                [
                    arkts.factory.createETSParameterExpression(
                        arkts.factory.createIdentifier('value', valueType?.clone()),
                        false,
                        undefined
                    ),
                ],
                undefined,
                false,
                [
                    arkts.factory.createExpressionStatement(
                        arkts.factory.createAssignmentExpression(
                            bindableArg.clone(),
                            arkts.factory.createIdentifier('value'),
                            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION
                        )
                    ),
                ]
            ),
            false,
            false
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
     * create `makeBuilderParameterProxy` function call to replace the ONLY argument in `@Builder` function call.
     */
    static createBuilderParameterProxyCall(
        node: arkts.ObjectExpression,
        decl: arkts.ClassDefinition | arkts.TSInterfaceDeclaration,
        typeRef: arkts.TypeNode,
        isFromClass: boolean
    ): arkts.CallExpression {
        const typeMap = getObjectInstanceDeclTypeMap(decl);
        const entries = flatObjectExpressionToEntries(node);
        const objectArg = isFromClass
            ? arkts.factory.createObjectExpression([])
            : node;
        const newMapArg = this.createInitMapArgInBuilderParameterProxyCall(entries, typeMap);
        const updateArg = this.createUpdateArgInBuilderParameterProxyCall(typeRef.clone(), entries, typeMap, isFromClass);
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
        const typeName = nameNode.name;
        const localImportInfos: LocalImportInfo[] = [];
        const localName = UIFactory.addSymbolToLocalImport(decl, typeName, localImportInfos);
        for (const localImportInfo of localImportInfos) {
            ImportCollector.getInstance().collectLocalImport(
                localImportInfo.symbolName, 
                localImportInfo.localSource, 
                localImportInfo.localTypeName
            );
        }
        return UIFactory.createTypeReferenceFromString(localName);
    }

    /**
     * create `new Map<string, () => Any>([...])` as the second argument in `makeBuilderParameterProxy` function call.
     */
    static createInitMapArgInBuilderParameterProxyCall(
        entries: [arkts.Identifier, arkts.Expression | undefined][],
        typeMap: Map<string, arkts.TypeNode>
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
                        const value = this.prepareBuilderParameterPropertyValue(v, typeMap.get(name));
                        const arrowFunc = arkts.factory.createArrowFunctionExpression(
                            UIFactory.createScriptFunction({
                                body: arkts.factory.createBlockStatement([arkts.factory.createReturnStatement(value)]),
                                returnTypeAnnotation: UIFactory.createTypeReferenceFromString(TypeNames.ANY),
                                flags: arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW 
                                    | arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_HAS_RETURN,
                                modifiers: arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
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
        typeMap: Map<string, arkts.TypeNode>,
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
                  const right = this.prepareBuilderParameterPropertyValue(v, typeMap.get(k.name));
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
    static prepareBuilderParameterPropertyValue(
        value: arkts.Expression | undefined, 
        declType: arkts.TypeNode | undefined
    ): arkts.Expression {
        if (!value) {
            return arkts.factory.createUndefinedLiteral();
        }
        if (arkts.isArrayExpression(value) || arkts.isObjectExpression(value)) {
            let localImportInfos: LocalImportInfo[] = [];
            let localType: arkts.TypeNode | undefined = UIFactory.findSafeLocalType(declType, localImportInfos);
            if (localType === undefined) {
                localImportInfos = [];
                if (arkts.isObjectExpression(value)) {
                    localType = UIFactory.findObjectType(value, localImportInfos);
                }
            }
            if (localType !== undefined) {
                for (const localImportInfo of localImportInfos) {
                    ImportCollector.getInstance().collectLocalImport(
                        localImportInfo.symbolName, 
                        localImportInfo.localSource, 
                        localImportInfo.localTypeName
                    );
                }
            } else {
                localType = UIFactory.createTypeReferenceFromString(TypeNames.ANY);
            }
            return arkts.factory.createTSAsExpression(value.clone(), localType, false);
        }
        return value.clone();
    }

    /**
     * create parameter declaration `ModuleInfo: NavigationModuleInfo` or `ModuleInfo: NavDestinationModuleInfo`.
     */
    static createModuleInfoParam(name: string): arkts.ETSParameterExpression {
        return arkts.factory
            .createETSParameterExpression(
                arkts.factory.createIdentifier(
                    NavigationNames.MODULE_INFO,
                    UIFactory.createTypeReferenceFromString(
                        name === InnerComponentNames.NAVIGATION
                            ? NavigationNames.NAVIGATION_MODULE_INFO
                            : NavigationNames.NAV_DESTINATION_MODULE_INFO
                    )
                ),
                true,
                undefined
            );
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

        const hasSetOptions = node.body.body.find((member) => {
            if (arkts.isMethodDefinition(member)) {
                const methodName = member.id!.name;
                return methodName.startsWith('set') && methodName.endsWith('Options');
            }
            return false;
        });
        if (hasSetOptions) {
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
        const styleArg: arkts.ETSParameterExpression = this.createStyleArgInBuilderLambdaDecl(typeNode);
        params.push(styleArg);

        if (!!hasLastTrailingLambda) {
            const contentArg: arkts.ETSParameterExpression = this.createContentArgInBuilderLambdaDecl();
            params.push(contentArg);
        }

        return params;
    }
}
