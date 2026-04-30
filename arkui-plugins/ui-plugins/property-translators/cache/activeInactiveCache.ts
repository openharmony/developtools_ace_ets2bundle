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
import { StateManagementTypes } from '../../../common/predefines';
import { ImportCollector } from '../../../common/import-collector';

interface ActiveInactiveInfo {
    activeMethodNames: string[];
    inactiveMethodNames: string[];
}

export class ActiveInactiveCache {
    private _cache: Map<string, ActiveInactiveInfo>;
    private static instance: ActiveInactiveCache | null = null;

    private constructor() {
        this._cache = new Map<string, ActiveInactiveInfo>();
    }

    static getInstance(): ActiveInactiveCache {
        if (!this.instance) {
            this.instance = new ActiveInactiveCache();
        }
        return this.instance;
    }

    reset(): void {
        this._cache.clear();
    }

    collectActiveMethod(className: string, methodName: string): void {
        const info = this.getOrCreateInfo(className);
        if (!info.activeMethodNames.includes(methodName)) {
            info.activeMethodNames.push(methodName);
        }
    }

    collectInactiveMethod(className: string, methodName: string): void {
        const info = this.getOrCreateInfo(className);
        if (!info.inactiveMethodNames.includes(methodName)) {
            info.inactiveMethodNames.push(methodName);
        }
    }

    getCachedCallStatements(className: string): arkts.Statement[] {
        const info = this._cache.get(className);
        if (!info || (info.activeMethodNames.length === 0 && info.inactiveMethodNames.length === 0)) {
            return [];
        }
        return ActiveInactiveCache.generateCallStatements(info);
    }

    private getOrCreateInfo(className: string): ActiveInactiveInfo {
        if (!this._cache.has(className)) {
            this._cache.set(className, { activeMethodNames: [], inactiveMethodNames: [] });
        }
        return this._cache.get(className)!;
    }

    private static generateCallStatements(info: ActiveInactiveInfo): arkts.Statement[] {
        ImportCollector.getInstance().collectImport(StateManagementTypes.UI_UTILS);

        const statements: arkts.Statement[] = [];

        const allMethodNames = [...info.activeMethodNames, ...info.inactiveMethodNames];
        for (const methodName of allMethodNames) {
            statements.push(this.createInternalVarDeclaration(methodName));
        }

        const hasActive = info.activeMethodNames.length > 0;
        const hasInactive = info.inactiveMethodNames.length > 0;

        const activeArg = hasActive
            ? this.createMergedUnsafeCallArrowFunc(info.activeMethodNames)
            : arkts.factory.createUndefinedLiteral();
        const inactiveArg = hasInactive
            ? this.createMergedUnsafeCallArrowFunc(info.inactiveMethodNames)
            : arkts.factory.createUndefinedLiteral();

        const getCustomComponentContextCall = arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                arkts.factory.createIdentifier(StateManagementTypes.UI_UTILS),
                arkts.factory.createIdentifier('getCustomComponentContext'),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            [arkts.factory.createThisExpression()]
        );

        const callExpr = arkts.factory.createCallExpression(
            arkts.factory.createMemberExpression(
                getCustomComponentContextCall,
                arkts.factory.createIdentifier(StateManagementTypes.REGISTER_ACTIVE_AND_INACTIVE_FUNC),
                arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                false,
                false
            ),
            undefined,
            [activeArg, inactiveArg]
        );
        statements.push(arkts.factory.createExpressionStatement(callExpr));

        return statements;
    }

    private static createInternalVarDeclaration(methodName: string): arkts.VariableDeclaration {
        const internalVarName = `__${methodName}__Internal`;
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

    private static createMergedUnsafeCallArrowFunc(methodNames: string[]): arkts.ArrowFunctionExpression {
        const bodyStatements: arkts.Statement[] = methodNames.map((methodName) => {
            const internalVarName = `__${methodName}__Internal`;
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
                    []
                )
            );
        });

        return arkts.factory.createArrowFunction(
            arkts.factory.createScriptFunction(
                arkts.factory.createBlock(bodyStatements),
                arkts.FunctionSignature.createFunctionSignature(undefined, [], undefined, false),
                arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW,
                arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE
            )
        );
    }
}
