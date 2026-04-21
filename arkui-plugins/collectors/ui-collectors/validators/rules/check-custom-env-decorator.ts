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
import { BaseValidator } from '../base';
import { StructMethodInfo } from '../../records';
import { LogType } from '../../../../common/predefines';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkCustomEnvDecorator = performanceLog(
    _checkCustomEnvDecorator,
    getPerfName([0, 0, 0, 0, 0], 'checkCustomEnvDecorator')
);

const RESOLVE_METHOD_NAME = '__resolveDecoratorSymbols';
const CUSTOM_ENV_VAR_PREFIX = '__customEnv_';
const CUSTOM_ENV_KEY_CLASS = 'CustomEnvKey';
const CUSTOM_ENV_KEY_CREATE = 'create';

interface CustomEnvKeyInfo {
    keyIdent: arkts.Identifier;
    varDecl: arkts.VariableDeclaration;
}

function _checkCustomEnvDecorator(
    this: BaseValidator<arkts.MethodDefinition, StructMethodInfo>,
    node: arkts.MethodDefinition
): void {
    if (
        node.id?.name !== RESOLVE_METHOD_NAME ||
        !arkts.hasModifierFlag(node, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC)
    ) {
        return;
    }

    const keyInfos = collectCustomEnvVarEntries(node);
    for (const keyInfo of keyInfos) {
        const keyDecl = arkts.getDecl(keyInfo.keyIdent);
        if (!keyDecl) {
            continue;
        }

        if (!validateCustomEnvKeyDecl(keyDecl)) {
            this.report({
                node: keyInfo.varDecl,
                level: LogType.ERROR,
                message: `Invalid key for '@CustomEnv', '@CustomEnv' key must be global const and created from CustomEnvKey.create<T>()`,
            });
        }
    }
}

function collectCustomEnvVarEntries(
    method: arkts.MethodDefinition
): CustomEnvKeyInfo[] {
    const func = method.function;
    if (!func || !func.body || !arkts.isBlockStatement(func.body)) {
        return [];
    }

    const keyInfos: CustomEnvKeyInfo[] = [];
    for (const stmt of func.body.statements) {
        if (!arkts.isVariableDeclaration(stmt)) {
            continue;
        }
        const keyInfo = extractCustomEnvKeyInfo(stmt);
        if (keyInfo) {
            keyInfos.push(keyInfo);
        }
    }
    return keyInfos;
}

function extractCustomEnvKeyInfo(varDecl: arkts.VariableDeclaration): CustomEnvKeyInfo | undefined {
    for (const declarator of varDecl.declarators) {
        if (!arkts.isVariableDeclarator(declarator)) {
            continue;
        }
        if (
            declarator.id &&
            arkts.isIdentifier(declarator.id) &&
            declarator.id.name.startsWith(CUSTOM_ENV_VAR_PREFIX)
        ) {
            const init = declarator.init;
            if (init && arkts.isIdentifier(init)) {
                return { keyIdent: init, varDecl };
            }
        }
    }
    return undefined;
}

function validateCustomEnvKeyDecl(decl: arkts.AstNode): boolean {
    if (!arkts.isClassProperty(decl)) {
        return false;
    }

    if (!arkts.hasModifierFlag(decl, arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_CONST)) {
        return false;
    }

    const init = decl.value;
    if (!init || !arkts.isCallExpression(init)) {
        return false;
    }

    return isCustomEnvKeyCreateCall(init);
}

function isCustomEnvKeyCreateCall(expr: arkts.CallExpression): boolean {
    const callee = expr.callee;
    if (!callee || !arkts.isMemberExpression(callee)) {
        return false;
    }

    const obj = callee.object;
    const prop = callee.property;

    return arkts.isIdentifier(obj) && obj.name === CUSTOM_ENV_KEY_CLASS &&
           arkts.isIdentifier(prop) && prop.name === CUSTOM_ENV_KEY_CREATE;
}
