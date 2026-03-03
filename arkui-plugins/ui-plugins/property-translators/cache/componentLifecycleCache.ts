/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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

export enum LifecycleMethodType {
    ABOUT_TO_APPEAR = 'aboutToAppear',
    ON_DID_BUILD = 'onDidBuild',
    ABOUT_TO_DISAPPEAR = 'aboutToDisappear',
    ABOUT_TO_REUSE = 'aboutToReuse',
    ABOUT_TO_RECYCLE = 'aboutToRecycle'
}

export interface LifecycleMethodInfo {
    methodName: string;
    methodType: LifecycleMethodType;
    hasReuseParam: boolean;
    reuseParams?: arkts.ETSParameterExpression[];
}

export interface LifecycleObserverCallInfo {
    internalVarDeclarations: arkts.Statement[];
    callbackBodyMap: Map<LifecycleMethodType, arkts.Statement[]>;
    varMap: Map<string, string>;
}

export type LifecycleObserverCallGenerator = (callInfo: LifecycleObserverCallInfo) => arkts.Statement[];

export class ComponentLifecycleCache {
    private _initCache: Map<string, string[]>;
    private _lifecycleObserverCache: Map<string, LifecycleObserverCallInfo>;
    private static instance: ComponentLifecycleCache | null = null;

    private constructor() {
        this._initCache = new Map<string, string[]>();
        this._lifecycleObserverCache = new Map<string, LifecycleObserverCallInfo>();
    }

    static getInstance(): ComponentLifecycleCache {
        if (!this.instance) {
            this.instance = new ComponentLifecycleCache();
        }
        return this.instance;
    }

    reset(): void {
        this._initCache.clear();
        this._lifecycleObserverCache.clear();
    }

    /**
     * Get all @ComponentInit method names for a class
     */
    getCachedInitMethods(className: string): string[] {
        return this._initCache.get(className) ?? [];
    }

    /**
     * Get cached @ComponentInit method call statements for a class
     */
    getCachedInitMethodCalls(className: string): arkts.ExpressionStatement[] {
        return this.getCachedInitMethods(className).map((methodName: string) => {
            return arkts.factory.createExpressionStatement(
                arkts.factory.createCallExpression(
                    arkts.factory.createMemberExpression(
                        arkts.factory.createThisExpression(),
                        arkts.factory.createIdentifier(methodName),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    ),
                    undefined,
                    []
                )
            );
        });
    }

    /**
     * Collect a @ComponentInit method for a class
     */
    collectInitMethod(className: string, methodName: string): void {
        let methods: string[] = [];
        if (this._initCache.has(className)) {
            methods = this._initCache.get(className)!;
        }
        if (!methods.includes(methodName)) {
            methods.push(methodName);
            this._initCache.set(className, methods);
        }
    }

    /**
     * Get cached lifecycle observer registration statements for a class
     */
    getCachedLifecycleObserverCalls(className: string, generator: LifecycleObserverCallGenerator): arkts.Statement[] {
        const callInfo = this._lifecycleObserverCache.get(className);
        if (!callInfo || callInfo.internalVarDeclarations.length === 0) {
            return [];
        }
        return generator(callInfo);
    }

    /**
     * Collect a lifecycle method for a class
     */
    collectLifecycleMethod(className: string, methodInfo: LifecycleMethodInfo): void {
        const callInfo = this.getOrCreateLifecycleObserverCallInfo(className);
        const internalVarName = this.collectInternalMethodReference(callInfo, methodInfo.methodName);
        this.collectLifecycleCallbackStatement(callInfo, methodInfo, internalVarName);
    }

    private getOrCreateLifecycleObserverCallInfo(className: string): LifecycleObserverCallInfo {
        if (this._lifecycleObserverCache.has(className)) {
            return this._lifecycleObserverCache.get(className)!;
        }
        const callInfo: LifecycleObserverCallInfo = {
            internalVarDeclarations: [],
            callbackBodyMap: new Map<LifecycleMethodType, arkts.Statement[]>(),
            varMap: new Map<string, string>(),
        };
        this._lifecycleObserverCache.set(className, callInfo);
        return callInfo;
    }

    private collectInternalMethodReference(callInfo: LifecycleObserverCallInfo, methodName: string): string {
        const cachedInternalVarName = callInfo.varMap.get(methodName);
        if (cachedInternalVarName) {
            return cachedInternalVarName;
        }
        const internalVarName = `__${methodName}__Internal`;
        callInfo.varMap.set(methodName, internalVarName);
        callInfo.internalVarDeclarations.push(
            ComponentLifecycleCache.createInternalVarDeclaration(internalVarName, methodName)
        );
        return internalVarName;
    }

    private collectLifecycleCallbackStatement(
        callInfo: LifecycleObserverCallInfo,
        methodInfo: LifecycleMethodInfo,
        internalVarName: string
    ): void {
        let callbackBody = callInfo.callbackBodyMap.get(methodInfo.methodType);
        if (!callbackBody) {
            callbackBody = [];
            callInfo.callbackBodyMap.set(methodInfo.methodType, callbackBody);
        }
        callbackBody.push(
            ComponentLifecycleCache.createUnsafeCallStatement(
                internalVarName,
                methodInfo.methodType === LifecycleMethodType.ABOUT_TO_REUSE && methodInfo.hasReuseParam
            )
        );
    }

    private static createInternalVarDeclaration(internalVarName: string, methodName: string): arkts.VariableDeclaration {
        return arkts.factory.createVariableDeclaration(
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
            arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_CONST,
            [
                arkts.factory.createVariableDeclarator(
                    arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_CONST,
                    arkts.factory.createIdentifier(internalVarName),
                    arkts.factory.createMemberExpression(
                        arkts.factory.createThisExpression(),
                        arkts.factory.createIdentifier(methodName),
                        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                        false,
                        false
                    )
                ),
            ]
        );
    }

    private static createUnsafeCallStatement(internalVarName: string, passParams: boolean): arkts.Statement {
        const args: arkts.Expression[] = passParams ? [arkts.factory.createIdentifier('params')] : [];
        return arkts.factory.createExpressionStatement(
            arkts.factory.createCallExpression(
                arkts.factory.createMemberExpression(
                    arkts.factory.createIdentifier(internalVarName),
                    arkts.factory.createIdentifier('unsafeCall'),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
                undefined,
                args
            )
        );
    }
}
