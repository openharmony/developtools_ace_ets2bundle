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
import { getAnnotationUsage, PresetDecorators } from '../utils';

class ReusableComponentInV2CheckRule extends AbstractUISyntaxRule {
    private reusableStructName: string[] = [];

    public setup(): Record<string, string> {
        return {
            noReusableV1InComponentV2: `When a custom component is decorated with @ComponentV2 and contains a child component decorated with @Reusable, the child component will not create.`,
        };
    }

    public beforeTransform(): void {
        this.reusableStructName = [];
    }
    public parsed(node: arkts.ETSStructDeclaration): void {
        this.initStructName(node);
        this.checkNoReusableV1InComponentV2(node);
    }

    private initStructName(node: arkts.AstNode): void {
        if (arkts.nodeType(node) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
            return;
        }
        //Go through all the children of Program
        for (const childNode of node.getChildren()) {
            // Check whether the type is struct
            if (!arkts.isETSStructDeclaration(childNode)) {
                continue;
            }
            const reusableV1Decorator = getAnnotationUsage(childNode, PresetDecorators.REUSABLE_V1);
            const structName = childNode.definition?.ident?.name;
            if (reusableV1Decorator && structName) {
                this.reusableStructName.push(structName);
            }
        }
    }

    private checkNoReusableV1InComponentV2(node: arkts.AstNode,): void {
        if (!arkts.isCallExpression(node) || !arkts.isIdentifier(node.callee)) {
            return;
        }
        if (this.reusableStructName.includes(node.callee.name)) {
            // Traverse upwards to find the custom component.
            let structNode: arkts.AstNode = node;
            while (!arkts.isETSStructDeclaration(structNode)) {
                if (!structNode.parent) {
                    return;
                }
                structNode = structNode.parent;
            }
            const annotationsList = structNode.definition?.annotations;
            // Check that the current component is decorated by the @ComponentV2 decorator
            if (annotationsList?.some((annotation: any) => annotation.expr.name === PresetDecorators.COMPONENT_V2)) {
                this.report({
                    node: node,
                    message: this.messages.noReusableV1InComponentV2,
                });
            }
        }
    }
}

export default ReusableComponentInV2CheckRule;