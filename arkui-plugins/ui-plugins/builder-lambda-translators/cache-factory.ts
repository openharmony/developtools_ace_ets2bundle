/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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
import {
    CallInfo,
    checkIsTrailingLambdaInLastParam,
    CustomComponentInterfacePropertyInfo,
    FunctionInfo,
    InnerComponentFunctionInfo,
    StructMethodInfo,
} from '../../collectors/ui-collectors/records';
import {
    checkIsFunctionMethodDeclFromInfo,
    collectStructPropertyInfos,
} from '../../collectors/ui-collectors/utils';
import {
    AnimationNames,
    BuilderLambdaNames,
    NodeCacheNames,
    StateManagementTypes,
} from '../../common/predefines';
import {
    annotation,
    backingField,
    collect,
    filterDefined,
    forEachArgWithParam,
    removeAnnotationByName,
} from '../../common/arkts-utils';
import { getPerfName } from '../../common/debug';
import {
    MemoNames,
} from '../../collectors/memo-collectors/utils';
import { ConditionScopeCacheVisitor } from '../condition-scope-translators/condition-scope-visitor';
import { factory as TypeFactory } from '../type-translators/factory';
import { factory as UIFactory } from '../ui-factory';
import { factory as BuilderLambdaFactory } from './factory';
import { optionsHasField } from '../utils';
import { InnerComponentInfoCache } from './cache/innerComponentInfoCache';
import { ComponentRecord } from './cache/componentAttributeCache';
import {
    BuilderLambdaChainingCallArgInfo,
    BuilderLambdaDeclInfo,
    builderLambdaMethodDeclType,
    BuilderLambdaStyleBodyInfo,
    builderLambdaType,
    buildSecondLastArgInfo,
    collectDeclInfoFromInfo,
    getDeclaredSetAttribtueMethodName,
    InstanceCallInfo,
    isDoubleDollarCall,
    isStyleChainedCallee,
    isStyleWithReceiverCallee,
    OptionsPropertyInfo,
    replaceBuilderLambdaDeclMethodName,
} from './utils';
import { BindableFactory } from './bindable-factory';
import { BuilderParamPropertyCache, ConditionScopeInfoCache, InitialBuilderLambdaBodyCache } from '../memo-collect-cache';

export class CacheFactory {
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
        const infos = InnerComponentInfoCache.getInstance().getComponentRecord(componentName);
        if (!infos || infos.length === 0) {
            return node;
        }
        const overloads = infos.map((info) => this.createDeclaredSetMethodFromInfo(info, componentName));
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
     * generate declared set method from `InnerComponentFunctionInfo`
     */
    static createDeclaredSetMethodFromInfo(
        info: InnerComponentFunctionInfo,
        componentName: string
    ): arkts.MethodDefinition {
        const name = getDeclaredSetAttribtueMethodName(componentName);
        const hasReceiver = !!info.hasReceiver;
        const params = info.paramRecords?.map((record) => TypeFactory.createParameterFromRecord(record)) ?? [];
        const typeParams = info.typeParameters?.map((p) => TypeFactory.createTypeParameterFromRecord(p));

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
     * create all `@ComponentBuilder` component Impl functions for each unique component name.
     */
    static createAllUniqueDeclaredComponentFunctions(
        componentNames: string[],
        cache: InnerComponentInfoCache
    ): arkts.MethodDefinition[] {
        const methods: arkts.MethodDefinition[] = [];
        componentNames.forEach((name: string) => {
            const info = cache.getComponentRecord(name)?.at(0);
            const hasLastTrailingLambda = cache.getHasLastTrailingLambda(name);
            const attributeName = cache.getAttributeName(name);
            const attributeTypeParams = cache.getAttributeTypeParams(name);
            if (!info || !attributeName) {
                return;
            }
            const componentImplMethod = BuilderLambdaFactory.createDeclaredComponentFunctionFromRecord(
                { name, ...info } as ComponentRecord,
                hasLastTrailingLambda,
                attributeName,
                attributeTypeParams
            );
            methods.push(componentImplMethod);
        });
        return methods;
    }

    /**
     * transform `@ComponentBuilder` in declared methods.
     */
    static transformBuilderLambdaMethodDeclFromInfo(
        node: arkts.MethodDefinition,
        metadata: StructMethodInfo | FunctionInfo,
        isFromStruct?: boolean
    ): arkts.MethodDefinition {
        if (!metadata.name) {
            return node;
        }
        if (!isFromStruct && checkIsFunctionMethodDeclFromInfo(metadata)) {
            InnerComponentInfoCache.getInstance().collect(metadata.name, metadata.innerComponentInfo);
        }
        const func: arkts.ScriptFunction = node.scriptFunction;
        const typeNode: arkts.TypeNode | undefined = builderLambdaMethodDeclType(node);
        const newNode = BuilderLambdaFactory.updateBuilderLambdaMethodDecl(
            node,
            [BuilderLambdaFactory.createStyleArgInBuilderLambdaDecl(typeNode)],
            removeAnnotationByName(func.annotations, BuilderLambdaNames.ANNOTATION_NAME),
            replaceBuilderLambdaDeclMethodName(metadata.name)
        );
        arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(newNode);
        return newNode;
    }

    /**
     * transform `@ComponentBuilder` in non-declared calls.
     */
    static transformBuilderLambdaFromInfo(node: arkts.CallExpression, metadata: CallInfo): arkts.CallExpression {
        const rootCallInfo: CallInfo = metadata.rootCallInfo ?? metadata;
        if (!rootCallInfo.declName) {
            return node;
        }
        arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 0, 1], 'find instance style'));
        let instanceCalls: InstanceCallInfo[] = [];
        const animateStartStacks: InstanceCallInfo[] = [];
        let leaf: arkts.CallExpression = node;
        const chainingCallInfos = metadata.chainingCallInfos ?? [];
        while (chainingCallInfos.length > 0) {
            const chainedCallInfo = chainingCallInfos.pop()!;
            const callee = leaf.expression;
            const updateInfo = this.createInstanceCallUpdateInfo(callee, leaf, chainedCallInfo);
            if (!updateInfo) {
                continue;
            }
            if (updateInfo.instanceCalls.length > 1 && updateInfo.hasAnimate) {
                instanceCalls.push(updateInfo.instanceCalls.at(0)!);
                animateStartStacks.push(updateInfo.instanceCalls.at(1)!);
            } else {
                instanceCalls.push(...updateInfo.instanceCalls);
                while (animateStartStacks.length > 0) {
                    instanceCalls.push(animateStartStacks.pop()!);
                }
            }
            leaf = updateInfo.leaf;
        }
        arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 0, 1], 'find instance style'));
        arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 0, 2], 'findBuilderLambdaDeclInfo'));
        const declInfo: BuilderLambdaDeclInfo | undefined = collectDeclInfoFromInfo(leaf, rootCallInfo);
        arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 0, 2], 'findBuilderLambdaDeclInfo'));
        arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 0, 3], 'builderLambdaReplace'));
        const replace: arkts.Identifier | arkts.MemberExpression | undefined =
            BuilderLambdaFactory.builderLambdaReplace(leaf, declInfo);
        arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 0, 3], 'builderLambdaReplace'));
        if (!replace || !declInfo) {
            return node;
        }
        arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 0, 4], 'createInitLambdaBody'));
        const lambdaBodyInfo = BuilderLambdaFactory.createInitLambdaBody(declInfo);
        arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 0, 4], 'createInitLambdaBody'));
        let lambdaBody: arkts.Identifier | arkts.CallExpression | undefined = lambdaBodyInfo.lambdaBody;
        if (instanceCalls.length > 0) {
            instanceCalls = instanceCalls.reverse();
            instanceCalls.forEach((callInfo) => {
                arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 0, 5], 'createStyleLambdaBody'));
                lambdaBody = this.createStyleLambdaBody(lambdaBody!, callInfo);
                arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 0, 5], 'createStyleLambdaBody'));
            });
        }
        lambdaBodyInfo.lambdaBody = lambdaBody;
        lambdaBodyInfo.structPropertyInfos =
            !!declInfo && !declInfo.isFunctionCall ? collectStructPropertyInfos(metadata) : undefined;
        arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 0, 5], 'generateArgsInBuilderLambda'));
        const args: (arkts.AstNode | undefined)[] = this.generateArgsInBuilderLambda(leaf, lambdaBodyInfo, declInfo);
        arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 0, 5], 'generateArgsInBuilderLambda'));
        arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 0, 6], 'update builderLambda Call'));
        const newNode = arkts.factory.updateCallExpression(node, replace, leaf.typeArguments, filterDefined(args));
        arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 0, 6], 'update builderLambda Call'));
        ConditionScopeInfoCache.getInstance().updateAll().reset();
        InitialBuilderLambdaBodyCache.getInstance().updateAll().reset();
        BuilderParamPropertyCache.getInstance().updateAll().reset();
        arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(newNode);
        return newNode;
    }

    /**
     * create style instance call, e.g. `instance.margin(10)`.
     */
    static createStyleLambdaBody(lambdaBody: arkts.AstNode, callInfo: InstanceCallInfo): arkts.CallExpression {
        const oriCall: arkts.CallExpression = callInfo.call;
        let call: arkts.CallExpression;
        if (!callInfo.isReceiver) {
            const argInfos: BuilderLambdaChainingCallArgInfo[] = BuilderLambdaFactory.getTransformedStyle(oriCall);
            call = arkts.factory.createCallExpression(
                arkts.factory.createMemberExpression(
                    lambdaBody,
                    oriCall.expression,
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
                undefined,
                argInfos.map((info) => {
                    return info.arg;
                })
            );
        } else {
            call = arkts.factory.createCallExpression(oriCall.expression, oriCall.typeArguments, [
                lambdaBody,
                ...oriCall.arguments.slice(1),
            ]);
            arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(call, { hasReceiver: true });
        }
        return call;
    }

    static createInstanceCallUpdateInfo(
        callee: arkts.AstNode,
        oriLeaf: arkts.CallExpression,
        info: CallInfo
    ): { instanceCalls: InstanceCallInfo[]; leaf: arkts.CallExpression; hasAnimate?: boolean } | undefined {
        const isReceiver = !!info?.hasReceiver;
        if (isStyleChainedCallee(callee)) {
            return {
                ...this.updateStyleChainedInstanceCallsFromInfo(callee, oriLeaf, info),
                leaf: callee.object as arkts.CallExpression,
            };
        }
        if (isStyleWithReceiverCallee(oriLeaf, callee, isReceiver)) {
            return {
                instanceCalls: [
                    {
                        isReceiver,
                        call: arkts.factory.createCallExpression(callee, oriLeaf.typeArguments, oriLeaf.arguments),
                    },
                ],
                leaf: oriLeaf.arguments[0] as arkts.CallExpression,
            };
        }
        return undefined;
    }

    static updateStyleChainedInstanceCallsFromInfo(
        callee: arkts.MemberExpression,
        oriLeaf: arkts.CallExpression,
        info: CallInfo
    ): { instanceCalls: InstanceCallInfo[]; hasAnimate?: boolean } {
        const name: string = info.declName!;
        const _callee: arkts.AstNode = callee.property;
        const _typeArguments = oriLeaf.typeArguments;
        const _arguments = oriLeaf.arguments;
        if (name !== AnimationNames.ANIMATION) {
            return {
                instanceCalls: [
                    {
                        isReceiver: false,
                        call: arkts.factory.createCallExpression(_callee, _typeArguments, _arguments),
                    },
                ],
            };
        }
        const aniStart: arkts.CallExpression = arkts.factory.createCallExpression(
            arkts.factory.createIdentifier(AnimationNames.ANIMATION_START),
            undefined,
            _arguments
        );
        const aniStop: arkts.CallExpression = arkts.factory.createCallExpression(
            arkts.factory.createIdentifier(AnimationNames.ANIMATION_STOP),
            undefined,
            _arguments.map((arg) => arg.clone())
        );
        // instance calls are inversed so animationStop(...) should before animationStart(...).
        return {
            instanceCalls: [
                { isReceiver: false, call: aniStop },
                { isReceiver: false, call: aniStart },
            ],
            hasAnimate: true,
        };
    }

    /**
     * transform arguments in a builder lambda call.
     */
    static generateArgsInBuilderLambda(
        leaf: arkts.CallExpression,
        lambdaBodyInfo: BuilderLambdaStyleBodyInfo,
        declInfo: BuilderLambdaDeclInfo
    ): (arkts.AstNode | undefined)[] {
        const { isFunctionCall, params, returnType, moduleName, isTrailingCall, isFromCommonMethod } = declInfo;
        arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 0, 5, 1], 'builderLambdaType'));
        const type: arkts.Identifier | undefined = builderLambdaType(leaf);
        arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 0, 5, 1], 'builderLambdaType'));
        const args: (arkts.AstNode | undefined)[] = [];
        const modifiedArgs: (arkts.AstNode | undefined)[] = [];
        arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 0, 5, 2], 'buildSecondLastArgInfo'));
        const secondLastArgInfo = buildSecondLastArgInfo(type, isFunctionCall);
        arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 0, 5, 2], 'buildSecondLastArgInfo'));
        const _isTrailingCall = isTrailingCall ?? leaf.isTrailingCall;
        const typeArguments = leaf.typeArguments;
        arkts.Performance.getInstance().createDetailedEvent(
            getPerfName([1, 1, 0, 5, 3], 'checkIsTrailingLambdaInLastParam')
        );
        const hasLastTrailingLambda = checkIsTrailingLambdaInLastParam(params);
        arkts.Performance.getInstance().stopDetailedEvent(
            getPerfName([1, 1, 0, 5, 3], 'checkIsTrailingLambdaInLastParam')
        );
        arkts.Performance.getInstance().createDetailedEvent(getPerfName([1, 1, 0, 5, 4], 'forEachArgWithParam'));
        forEachArgWithParam(
            leaf.arguments,
            params,
            (arg, param, index) => {
                const isLastTrailingLambda = index === params.length - 1 && hasLastTrailingLambda;
                let modifiedArg: arkts.AstNode | undefined;
                if (index === params.length - 2 && !arg) {
                    modifiedArg = BuilderLambdaFactory.createSecondLastArgInBuilderLambda(secondLastArgInfo);
                }
                if (!modifiedArg) {
                    const fallback = arkts.factory.createUndefinedLiteral();
                    const updatedArg = this.createOrUpdateArgInBuilderLambda(
                        fallback,
                        arg,
                        param,
                        isLastTrailingLambda,
                        declInfo,
                        lambdaBodyInfo.structPropertyInfos
                    );
                    modifiedArg = BuilderLambdaFactory.processModifiedArg(
                        updatedArg,
                        index,
                        leaf.arguments,
                        moduleName,
                        type?.name
                    );
                }
                if (!isFunctionCall || isLastTrailingLambda) {
                    args.push(modifiedArg);
                } else {
                    modifiedArgs.push(modifiedArg);
                }
            },
            { isTrailingCall: _isTrailingCall }
        );
        arkts.Performance.getInstance().stopDetailedEvent(getPerfName([1, 1, 0, 5, 4], 'forEachArgWithParam'));
        arkts.Performance.getInstance().createDetailedEvent(
            getPerfName([1, 1, 0, 5, 5], 'addOptionsArgsToLambdaBodyInStyleArg')
        );
        const lambdaBody = BuilderLambdaFactory.addOptionsArgsToLambdaBodyInStyleArg(
            lambdaBodyInfo,
            modifiedArgs,
            typeArguments,
            isFromCommonMethod
        );
        arkts.Performance.getInstance().stopDetailedEvent(
            getPerfName([1, 1, 0, 5, 5], 'addOptionsArgsToLambdaBodyInStyleArg')
        );
        const typeNode = !isFunctionCall && !!type ? UIFactory.createTypeReferenceFromString(type.name) : returnType;
        arkts.Performance.getInstance().createDetailedEvent(
            getPerfName([1, 1, 0, 5, 5], 'createStyleArgInBuilderLambda')
        );
        const styleArg = BuilderLambdaFactory.createStyleArgInBuilderLambda(lambdaBody, typeNode, moduleName);
        arkts.Performance.getInstance().stopDetailedEvent(
            getPerfName([1, 1, 0, 5, 5], 'createStyleArgInBuilderLambda')
        );
        args.unshift(styleArg);
        return args;
    }

    /**
     * create or update arguments in a builder lambda call.
     * If the corresponding argument is not provided, fill-in an `undefined` to it.
     */
    static createOrUpdateArgInBuilderLambda(
        fallback: arkts.AstNode | undefined,
        arg: arkts.Expression | undefined,
        param: arkts.Expression,
        hasBuilder?: boolean,
        declInfo?: BuilderLambdaDeclInfo,
        structPropertyInfos?: CustomComponentInterfacePropertyInfo[]
    ): arkts.AstNode | undefined {
        if (!arg) {
            return fallback;
        }
        if (arkts.isArrowFunctionExpression(arg)) {
            let _arg = !!hasBuilder ? this.updateBuilderArrowFunction(arg) : arg;
            if (arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).has(param)) {
                const metadata = arkts.NodeCacheFactory.getInstance()
                    .getCache(NodeCacheNames.MEMO)
                    .get(param)?.metadata;
                _arg.setAnnotations([annotation(MemoNames.MEMO_UI)]);
                arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(_arg, metadata);
            }
            return _arg;
        }
        // this is too optimistic to check if this is an options argument...
        if (arkts.isTSAsExpression(arg) || arkts.isObjectExpression(arg)) {
            return this.processOptionsArg(arg, declInfo, structPropertyInfos);
        }
        return arg;
    }

    static updateBuilderArrowFunction(func: arkts.ArrowFunctionExpression): arkts.ArrowFunctionExpression {
        const conditionScopeVisitor = ConditionScopeCacheVisitor.getInstance();
        const scriptFunc = func.scriptFunction;
        const body = scriptFunc.body! as arkts.BlockStatement;
        body.setStatements(
            body.statements.map((st) => {
                const newNode = conditionScopeVisitor.visitor(st);
                conditionScopeVisitor.reset();
                return newNode;
            })
        );
        func.setAnnotations([annotation(MemoNames.MEMO_UI)]);
        ConditionScopeInfoCache.getInstance().updateAll().reset();
        return func;
    }

    /**
     * transform options argument in a builder lambda call.
     */
    static processOptionsArg<T extends arkts.TSAsExpression | arkts.ObjectExpression>(
        arg: T,
        declInfo?: BuilderLambdaDeclInfo,
        structPropertyInfos?: CustomComponentInterfacePropertyInfo[]
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
        const properties = (expr.properties as arkts.Property[]).map((p, idx) => {
            return this.updatePropertiesInOptions(p, declInfo, structPropertyInfos?.at(idx));
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

    static updatePropertiesInOptions(
        prop: arkts.Property,
        declInfo?: BuilderLambdaDeclInfo,
        propertyInfo?: CustomComponentInterfacePropertyInfo
    ): arkts.Property[] {
        const key: arkts.AstNode | undefined = prop.key;
        const value: arkts.Expression | undefined = prop.value;
        if (!key || !arkts.isIdentifier(key) || !value) {
            return [prop];
        }
        const isNotBacking: boolean = !propertyInfo?.name?.startsWith(StateManagementTypes.BACKING);
        const isBuilderParam: boolean = !!propertyInfo?.annotationInfo?.hasBuilderParam;
        const isLink: boolean = !!propertyInfo?.annotationInfo?.hasLink;
        return this.updateSpecificProperties(prop, key, value, { isBuilderParam, isLink, isNotBacking }, declInfo);
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
        const isBuilder = (
            propertyInfo.isBuilderParam || 
            arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).has(prop) ||
            arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).has(value)
        );
        if (isDoubleDollarCall(value)) {
            newProperty = BindableFactory.updateBindableProperty(prop, value);
        } else if (isBuilder && arkts.isArrowFunctionExpression(value)) {
            newProperty = prop.setValue(this.updateBuilderArrowFunction(value));
            BuilderParamPropertyCache.getInstance().collect({ node: newProperty });
        } else if (
            propertyInfo.isLink &&
            propertyInfo.isNotBacking &&
            arkts.isMemberExpression(value) &&
            arkts.isThisExpression(value.object) &&
            arkts.isIdentifier(value.property)
        ) {
            newProperty = arkts.factory.updateProperty(
                prop,
                arkts.factory.createIdentifier(backingField(keyName)),
                BuilderLambdaFactory.updateBackingMember(value, value.property.name)
            );
        }
        return declInfo?.isFunctionCall
            ? [newProperty]
            : [
                  newProperty,
                  arkts.factory.createProperty(
                      arkts.factory.createIdentifier(optionsHasField(keyName)),
                      arkts.factory.createBooleanLiteral(true)
                  ),
              ];
    }
}
