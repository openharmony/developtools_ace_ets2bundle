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
import { COMPONENT_REPEAT, getIdentifierName, PresetDecorators, TEMPLATE } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

class NestedReuseComponentCheckRule extends AbstractUISyntaxRule {
    private reusableV2StructName: string[] = [];
    private reusableStructName: string[] = [];

    public setup(): Record<string, string> {
        return {
            noReusableV2InComponentV1: `A custom component decorated with @Component cannot contain child components decorated with @ReusableV2.`,
            noReusableV2InReusableV1: `A custom component decorated with @Reusable cannot contain child components decorated with @ReusableV2.`,
            noReusableV1InReusableV2: `A custom component decorated with @ReusableV2 cannot contain child components decorated with @Reusable.`,
            noReusableV2InRepeatTemplate: `The template attribute of the Repeat component cannot contain any custom component decorated with @ReusableV2.`,
        };
    }

    public beforeTransform(): void {
        this.reusableV2StructName = [];
        this.reusableStructName = [];
    }

    public parsed(node: arkts.StructDeclaration): void {
        this.initStructName(node);
        this.checkNestedReuseComponent(node);
        this.checkNoReusableV1InReusableV2(node);
    }

    private initStructName(node: arkts.AstNode): void {
        if (arkts.nodeType(node) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
            return;
        }
        //Go through all the children of Program
        for (const childNode of node.getChildren()) {
            // Check whether the type is struct
            if (!arkts.isStructDeclaration(childNode)) {
                continue;
            }
            // Get a list of annotations
            const annotationsList = childNode.definition.annotations;
            // Check that the current component has @Reusable and @ReusableV2 decorators
            if (annotationsList?.some((annotation: any) => annotation.expr.name === PresetDecorators.REUSABLE_V2)) {
                const struceName = childNode.definition?.ident?.name || '';
                this.reusableV2StructName.push(struceName);
            } else if (annotationsList?.some((annotation: any) => annotation.expr.name === PresetDecorators.REUSABLE_V1)) {
                const struceName = childNode.definition?.ident?.name || '';
                this.reusableStructName.push(struceName);
            }
        }
    }

    private reportNoReusableV2InRepeatTemplate(errorNode: arkts.AstNode): void {
        this.report({
            node: errorNode,
            message: this.messages.noReusableV2InRepeatTemplate,
            fix: (errorNode) => {
                return {
                    title: 'Remove the component',
                    range: [errorNode.startPosition, errorNode.endPosition],
                    code: '',
                };
            }
        });
    }

    private checkHasRepeatOrTemplate(node: arkts.CallExpression): { hasRepeat: boolean, hasTemplate: boolean } {
        let hasRepeat: boolean = false;
        let hasTemplate: boolean = false;
        while (arkts.isCallExpression(node) &&
            node.expression && arkts.isMemberExpression(node.expression) &&
            node.expression.object && arkts.isCallExpression(node.expression.object)) {
            if (arkts.isIdentifier(node.expression.property) && getIdentifierName(node.expression.property) === TEMPLATE) {
                hasTemplate = true;
            }
            node = node.expression.object;
        }
        if (arkts.isCallExpression(node) && arkts.isIdentifier(node.expression)) {
            hasRepeat = getIdentifierName(node.expression) === COMPONENT_REPEAT;
        }
        return { hasRepeat, hasTemplate };
    }

    private checkNoReusableV2InRepeatTemplate(node: arkts.AstNode, errorNode: arkts.AstNode): boolean {
        if (!arkts.isCallExpression(node)) {
            return false;
        }
        const flag = this.checkHasRepeatOrTemplate(node);
        if (!flag.hasRepeat || !flag.hasTemplate) {
            return false;
        }
        this.reportNoReusableV2InRepeatTemplate(errorNode);
        return true;
    }

    private reportNoReusableV1InReusableV2(node: arkts.AstNode): void {
        this.report({
            node: node,
            message: this.messages.noReusableV1InReusableV2,
            fix: (node) => {
                return {
                    title: 'Remove the component',
                    range: [node.startPosition, node.endPosition],
                    code: '',
                };
            }
        });
    }

    private checkNoReusableV1InReusableV2(node: arkts.AstNode): void {
        if (!arkts.isCallExpression(node) || !arkts.isIdentifier(node.expression)) {
            return;
        }
        if (this.reusableStructName.includes(node.expression.name)) {
            // Traverse upwards to find the custom component.
            let struceNode: arkts.AstNode = node;
            while (!arkts.isStructDeclaration(struceNode)) {
                if (!struceNode.parent) {
                    return;
                }
                struceNode = struceNode.parent;
            }
            const annotationsList = struceNode.definition.annotations;
            // Check that the current component is decorated by the @ComponentV2 decorator
            if (annotationsList.some((annotation: any) => annotation.expr.name === PresetDecorators.REUSABLE_V2)) {
                this.reportNoReusableV1InReusableV2(node);
            }
        }
    }

    private reportNoReusableV2InReusableV1(node: arkts.AstNode): void {
        this.report({
            node: node,
            message: this.messages.noReusableV2InReusableV1,
            fix: (node) => {
                return {
                    title: 'Remove the component',
                    range: [node.startPosition, node.endPosition],
                    code: '',
                };
            }
        });
    }

    private reportNoReusableV2InComponentV1(node: arkts.AstNode): void {
        this.report({
            node: node,
            message: this.messages.noReusableV2InComponentV1,
            fix: (node) => {
                return {
                    title: 'Remove the component',
                    range: [node.startPosition, node.endPosition],
                    code: '',
                };
            }
        });
    }

    private checkNestedReuseComponent(node: arkts.AstNode): void {
        if (!arkts.isCallExpression(node) || !arkts.isIdentifier(node.expression)) {
            return;
        }
        if (this.reusableV2StructName.includes(node.expression.name)) {
            // Traverse upwards to find the custom component.
            let struceNode: arkts.AstNode = node;
            let hasReportedError = false;
            while (!arkts.isStructDeclaration(struceNode)) {
                if (!struceNode.parent) {
                    return;
                }
                struceNode = struceNode.parent;
                if (!hasReportedError) {
                    hasReportedError = this.checkNoReusableV2InRepeatTemplate(struceNode, node);
                }
            }
            // Gets a list of decorators for the current Struct
            const annotationsList = struceNode.definition.annotations;
            if (annotationsList?.some((annotation: any) => annotation.expr.name === PresetDecorators.REUSABLE_V1)) {
                this.reportNoReusableV2InReusableV1(node);
            } else if (annotationsList?.some((annotation: any) => annotation.expr.name === PresetDecorators.COMPONENT_V1)) {
                this.reportNoReusableV2InComponentV1(node);
            }
        }
    }
}

export default NestedReuseComponentCheckRule;