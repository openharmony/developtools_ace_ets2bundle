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
import { StructMethodInfo, NormalClassMethodInfo } from '../../records';
import { DecoratorNames, LogType } from '../../../../common/predefines';
import { getPerfName, performanceLog } from '../../../../common/debug';

const STATE_DECORATOR_NAMES: Set<string> = new Set([
    DecoratorNames.STATE,
    DecoratorNames.LOCAL,
    DecoratorNames.PARAM,
    DecoratorNames.ONCE,
    DecoratorNames.LINK,
    DecoratorNames.PROP_REF,
    DecoratorNames.STORAGE_LINK,
    DecoratorNames.STORAGE_PROP_REF,
    DecoratorNames.LOCAL_STORAGE_LINK,
    DecoratorNames.LOCAL_STORAGE_PROP_REF,
    DecoratorNames.OBJECT_LINK,
    DecoratorNames.PROVIDE,
    DecoratorNames.CONSUME,
    DecoratorNames.PROVIDER,
    DecoratorNames.CONSUMER,
    DecoratorNames.ENV,
    DecoratorNames.EVENT,
    DecoratorNames.TRACE,
    DecoratorNames.TRACK,
]);

const ERROR_MESSAGE = `State variables cannot be modified within a getter function decorated with '@Computed'.`;

export const checkComputedStateModification = performanceLog(
    _checkComputedStateModification,
    getPerfName([0, 0, 0, 0, 0], 'checkComputedStateModification')
);

function _checkComputedStateModification(
    this: BaseValidator<arkts.MethodDefinition, StructMethodInfo | NormalClassMethodInfo>,
    node: arkts.MethodDefinition
): void {
    const metadata = this.context ?? {};
    if (!metadata.annotationInfo?.hasComputed) {
        return;
    }
    if (node.kind !== arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET) {
        return;
    }
    const body = node.scriptFunction.body;
    if (!body || !arkts.isBlockStatement(body)) {
        return;
    }
    traverseBody.bind(this)(body);
}

function traverseBody(
    this: BaseValidator<arkts.MethodDefinition, StructMethodInfo | NormalClassMethodInfo>,
    node: arkts.AstNode
): void {
    const children = node.getChildren();
    for (const child of children) {
        // Skip anonymous functions
        if (arkts.isArrowFunctionExpression(child) || arkts.isFunctionExpression(child)) {
            continue;
        }
        // Check assignment operators: =, +=, -=, *=, /=, %=
        if (arkts.isAssignmentExpression(child)) {
            const left = child.left;
            if (left && arkts.isMemberExpression(left)) {
                checkMemberExpressionTarget.bind(this)(left, child);
            }
        // Check update operators: ++, --
        } else if (arkts.isUpdateExpression(child)) {
            const argument = child.argument;
            if (argument && arkts.isMemberExpression(argument)) {
                checkMemberExpressionTarget.bind(this)(argument, child);
            }
        }
        traverseBody.bind(this)(child);
    }
}

function checkMemberExpressionTarget(
    this: BaseValidator<arkts.MethodDefinition, StructMethodInfo | NormalClassMethodInfo>,
    memberExpr: arkts.MemberExpression,
    reportNode: arkts.AstNode
): void {
    const lastProperty = findLastPropertyInChain(memberExpr);
    if (!lastProperty) {
        return;
    }
    if (isStateVariableProperty(lastProperty)) {
        this.report({
            node: reportNode,
            level: LogType.ERROR,
            message: ERROR_MESSAGE,
        });
    }
}

function findLastPropertyInChain(memberExpr: arkts.MemberExpression): arkts.Identifier | undefined {
    if (!arkts.isIdentifier(memberExpr.property)) {
        return undefined;
    }
    const targetProperty = memberExpr.property;
    let current: arkts.AstNode = memberExpr.object;
    while (arkts.isMemberExpression(current)) {
        current = current.object;
    }
    if (arkts.isThisExpression(current)) {
        return targetProperty;
    }
    return undefined;
}

function isStateVariableProperty(propertyNode: arkts.Identifier): boolean {
    const decl = arkts.getPeerIdentifierDecl(propertyNode.peer);
    if (!decl || !arkts.isClassProperty(decl)) {
        return false;
    }
    return hasStateDecorator(decl);
}

function hasStateDecorator(node: arkts.ClassProperty): boolean {
    for (const annotation of node.annotations) {
        const name = getAnnotationNameFromUsage(annotation);
        if (name && STATE_DECORATOR_NAMES.has(name)) {
            return true;
        }
    }
    return false;
}

function getAnnotationNameFromUsage(annotation: arkts.AnnotationUsage): string | undefined {
    if (!annotation.expr || !arkts.isIdentifier(annotation.expr)) {
        return undefined;
    }
    return annotation.expr.name;
}
