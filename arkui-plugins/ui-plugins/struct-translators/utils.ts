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
import { CustomComponentInfo, isMemoAnnotation, MemoNames } from '../utils';
import { isDecoratorAnnotation } from '../property-translators/utils';
import { matchPrefix } from '../../common/arkts-utils';
import { ARKUI_IMPORT_PREFIX_NAMES, DecoratorNames, Dollars } from '../../common/predefines';
import { DeclarationCollector } from '../../common/declaration-collector';

export type ScopeInfoCollection = {
    customComponents: CustomComponentScopeInfo[];
};

export type CustomComponentScopeInfo = CustomComponentInfo & {
    hasInitializeStruct?: boolean;
    hasUpdateStruct?: boolean;
    hasReusableRebind?: boolean;
};

/**
 * Determine whether it is method with specified name.
 *
 * @param method method definition node
 * @param name specified method name
 */
export function isKnownMethodDefinition(method: arkts.MethodDefinition, name: string): boolean {
    if (!method || !arkts.isMethodDefinition(method)) {
        return false;
    }

    // For now, we only considered matched method name.
    const isNameMatched: boolean = method.name?.name === name;
    return isNameMatched;
}

/**
 * Determine whether it is ETSGLOBAL class.
 *
 * @param node class declaration node
 */
export function isEtsGlobalClass(node: arkts.ClassDeclaration): boolean {
    if (node.definition?.ident?.name === 'ETSGLOBAL') {
        return true;
    }
    return false;
}

/**
 * Determine whether it is resource node begin with `$r` or `$rawfile`.
 *
 * @param node call expression node
 */
export function isResourceNode(node: arkts.CallExpression, ignoreDecl: boolean = false): boolean {
    if (
        !(
            arkts.isIdentifier(node.expression) &&
            (node.expression.name === Dollars.DOLLAR_RESOURCE || node.expression.name === Dollars.DOLLAR_RAWFILE)
        )
    ) {
        return false;
    }
    if (!ignoreDecl) {
        const decl = arkts.getDecl(node.expression);
        if (!decl) {
            return false;
        }
        const moduleName: string = arkts.getProgramFromAstNode(decl).moduleName;
        if (!moduleName || !matchPrefix(ARKUI_IMPORT_PREFIX_NAMES, moduleName)) {
            return false;
        }
        DeclarationCollector.getInstance().collect(decl);
    }
    return true;
}

export function isMemoCall(node: arkts.AstNode): node is arkts.CallExpression {
    if (!arkts.isCallExpression(node)) {
        return false;
    }
    const expr: arkts.AstNode = node.expression;
    const decl: arkts.AstNode | undefined = arkts.getDecl(expr);

    if (!decl) {
        return false;
    }

    if (arkts.isMethodDefinition(decl)) {
        return decl.scriptFunction.annotations.some(
            (anno) => isDecoratorAnnotation(anno, DecoratorNames.BUILDER) || isMemoAnnotation(anno, MemoNames.MEMO)
        );
    }
    return false;
}

export function findCanAddMemoFromArrowFunction(node: arkts.AstNode): node is arkts.ArrowFunctionExpression {
    if (!arkts.isArrowFunctionExpression(node)) {
        return false;
    }
    const hasMemo: boolean = node.annotations.some((anno) => isMemoAnnotation(anno, MemoNames.MEMO));
    if (!hasMemo && !!node.scriptFunction.body && arkts.isBlockStatement(node.scriptFunction.body)) {
        return node.scriptFunction.body.statements.some(
            (st) => arkts.isExpressionStatement(st) && isMemoCall(st.expression)
        );
    }
    return false;
}
