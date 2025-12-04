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
import { getAnnotationUsage, getIdentifierName, hasAnnotation, PresetDecorators } from '../utils';
import { AbstractUISyntaxRule } from './ui-syntax-rule';

class ComponentComponentV2InitCheckRule extends AbstractUISyntaxRule {
    private componentV1WithLinkList: string[] = [];

    public setup(): Record<string, string> {
        return {
            componentInitLinkCheck: `A V2 component cannot be used with any member property decorated by '@Link' in a V1 component.`,
        };
    }

    public beforeTransform(): void {
        this.componentV1WithLinkList = [];
    }

    public parsed(node: arkts.ETSStructDeclaration): void {
        this.initComponentV1WithLinkList(node);
        this.checkComponentInitLink(node);
    }

    private initComponentV1WithLinkList(node: arkts.AstNode): void {
        if (arkts.nodeType(node) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE) {
            return;
        }
        node.getChildren().forEach((member) => {
            if (!arkts.isETSStructDeclaration(member) || !member.definition.ident ||
                !hasAnnotation(member?.definition.annotations, PresetDecorators.COMPONENT_V1)) {
                return;
            }
            let structName: string = member.definition.ident?.name ?? '';
            member.definition?.body?.forEach((item) => {
                if (!arkts.isClassProperty(item) || !item.key) {
                    return;
                }
                if (item.annotations.some(annotation => annotation.expr &&
                    getIdentifierName(annotation.expr) === PresetDecorators.LINK)) {
                    this.componentV1WithLinkList.push(structName);
                }
            });
        });
    }

    private checkComponentInitLink(node: arkts.AstNode): void {
        if (!arkts.isIdentifier(node) || !this.componentV1WithLinkList.includes(getIdentifierName(node))) {
            return;
        }
        if (!node.parent) {
            return;
        }
        let structNode = node.parent;
        while (!arkts.isETSStructDeclaration(structNode)) {
            if (!structNode.parent) {
                return;
            }
            structNode = structNode.parent;
        }
        if (getAnnotationUsage(structNode, PresetDecorators.COMPONENT_V2) !== undefined) {
            const parentNode = node.parent;
            this.report({
                node: parentNode,
                message: this.messages.componentInitLinkCheck,
                fix: () => {
                    return {
                        title: 'Remove the component',
                        range: [parentNode.startPosition, parentNode.endPosition],
                        code: '',
                    };
                }
            });
        }
    }
}

export default ComponentComponentV2InitCheckRule;