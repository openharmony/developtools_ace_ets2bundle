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
import { AbstractUISyntaxRule } from './ui-syntax-rule';

interface IdInfo {
    value: string;
    node: arkts.AstNode;
}

const ID_NAME: string = 'id';

class NoDuplicateIdRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            duplicateId: `The current component id "{{id}}" is duplicate with {{path}}:{{line}}:{{index}}.`,
        };
    }

    public parsed(node: arkts.AstNode): void {
        const usedIds = new Map<string, IdInfo>();
        if (arkts.isBlockStatement(node)) {
            this.findAndValidateIds(node, usedIds);
        }
    }

    private findAndValidateIds(
        node: arkts.BlockStatement,
        usedIds: Map<string, IdInfo>
    ): void {

        node.statements.forEach((statement) => {
            if (
                arkts.isExpressionStatement(statement) &&
                arkts.isCallExpression(statement.expression)
            ) {
                this.findDuplicateComponentIds(statement.expression, usedIds);
            }
        });
    }

    private findDuplicateComponentIds(node: arkts.CallExpression, usedIds: Map<string, IdInfo>): void {
        const idInfos = this.getAllIdParams(node, []);
        for (const idInfo of idInfos) {
            const value = idInfo.value;
            const idNode = idInfo.node;
            if (usedIds.has(value)) {
                this.report({
                    node: idNode,
                    message: this.messages.duplicateId,
                    data: {
                        id: idInfo.value,
                        path: this.getPath() ?? '',
                        line: idNode.startPosition.line().toString(),
                        index: idNode.startPosition.index().toString()
                    }
                });
            } else {
                // Otherwise, record it
                usedIds.set(value, idInfo);
            }
        }
    }

    private getPath(): string | undefined {
        const contextPtr = arkts.arktsGlobal.compilerContext?.peer;
        if (!!contextPtr) {
            let program = arkts.getOrUpdateGlobalContext(contextPtr).program;
            return program.globalAbsName;
        }
        return undefined;
    }

    private getIdInfo(node: arkts.CallExpression): IdInfo | undefined {
        const callee = node.expression;

        if (!arkts.isMemberExpression(callee)) {
            return undefined;
        }
        const property = callee.property;
        if (!arkts.isIdentifier(property) || property.name !== ID_NAME) {
            return undefined;
        }

        const strArg = node.arguments.find(arkts.isStringLiteral);
        const value = strArg?.str;
        if (!value) {
            return undefined;
        }
        return { value, node: property };
    }

    private getAllIdParams(node: arkts.AstNode, results: IdInfo[]): IdInfo[] {
        if (arkts.isCallExpression(node)) {
            const idInfo = this.getIdInfo(node);
            if (idInfo) {
                results.push(idInfo);
            }

            // Just continue to check if the callee that calls the expression is a chain call (e.g. with .id())
            const callee = node.expression;
            if (arkts.isMemberExpression(callee)) {
                const object = callee.object;
                if (arkts.isCallExpression(object)) {
                    this.getAllIdParams(object, results);
                }
            }
        }

        return results.sort((a, b) => {
            return a.node.startPosition.index() - b.node.startPosition.index();
        });
    }
}

export default NoDuplicateIdRule;