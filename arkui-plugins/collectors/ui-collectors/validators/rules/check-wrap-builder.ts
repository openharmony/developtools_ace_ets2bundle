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
import { BaseValidator } from '../base';
import { CallInfo } from '../../records';
import { DecoratorNames, LogType } from '../../../../common/predefines';
import { getAnnotationUsageByName } from '../utils';
import { getPerfName, performanceLog } from '../../../../common/debug';

export const checkWrapBuilder = performanceLog(_checkWrapBuilder, getPerfName([0, 0, 0, 0, 0], 'checkWrapBuilder'));

const WRAP_BUILDER: string = 'wrapBuilder';

/**
 * 校验规则：用于验证wrapBuilder函数的使用。
 * 1. wrapBuilder的参数必须为`@Builder`修饰的function
 *
 * 校验等级：error
 */
function _checkWrapBuilder(this: BaseValidator<arkts.CallExpression, CallInfo>, node: arkts.CallExpression): void {
    const metadata = this.context ?? {};
    // If it is a custom component or the name is not wrapBuilder, it returns
    if (metadata.structDeclInfo || metadata.declName !== WRAP_BUILDER) {
        return;
    }
    // If the parameter length is not 1, the report type is incorrect
    if (node.arguments.length !== 1) {
        return;
    }
    const funcIdentifier = node.arguments[0];
    // When node.arguments[0] is the identifier, it means that the parameter is a global function
    if (arkts.isIdentifier(node.arguments[0])) {
        let decl: arkts.AstNode | undefined;
        if (
            !(decl = arkts.getPeerIdentifierDecl(funcIdentifier.peer)) ||
            !arkts.isMethodDefinition(decl) ||
            !arkts.isFunctionExpression(decl.funcExpr) ||
            !arkts.isScriptFunction(decl.funcExpr.function!)
            // !arkts.isScriptFunction(decl.funcExpr.scriptFunction)
        ) {
            return;
        }
        // If the parameter is a Builder decorated method, no error will be reported
        const funcAnnotations = decl.funcExpr.function.annotations;
        const builderDecorator = getAnnotationUsageByName(funcAnnotations, DecoratorNames.BUILDER);
        if (builderDecorator) {
            return;
        }
    }
    // wrapBuilder的参数必须为`@Builder`修饰的function
    this.report({
        node: funcIdentifier,
        level: LogType.ERROR,
        message: `The wrapBuilder\'s parameter should be @Builder function.`,
    });
}
