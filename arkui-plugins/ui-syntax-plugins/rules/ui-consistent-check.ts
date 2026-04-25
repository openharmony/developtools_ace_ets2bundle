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
import { getConsistentResourceMap } from '../../common/arkts-utils';

class UiConsistentCheckRule extends AbstractUISyntaxRule {
    // UI consistency is only detect in the limited decorator
    private static readonly specificDecorators = ['Builder', 'Extend', 'AnimatableExtend'];
    // The attributes of the VP unit must be used
    private static readonly checkVpProperties = ['padding'];
    // The property of VP/PX units must be used
    private static readonly checkVpAndPxProperties = [
        'borderWidth', 'borderRadius', 'outlineWidth', 'outlineRadius'
    ];
    // The types of colors allowed
    private static readonly colorUnionTypes = ['Color', 'Resource', 'string'];
    // Resource color type tags
    private static readonly resourceColorType = 'ResourceColor';

    private static readonly consistentResourceInfo = getConsistentResourceMap();

    public setup(): Record<string, string> {
        return {
            colorConsistentWarning: 'It is recommended that you use layered parameters for easier color mode switching and theme color changing.',
            vpSizeWarning: 'It is recommended that you use layered parameters for polymorphism development and resolution adaptation.',
            vpAndPxSizeWarning: 'It is recommended that you use layered parameters for polymorphism development and resolution adaptation.',
        };
    }

    public parsed(node: arkts.StructDeclaration): void {
        // Specific Attributes: Check the VP units
        this.checkVpUnit(node);
        // Specific attributes: Check the VP and PX units
        this.checkVpAndPxUnit(node);
        // Check the color parameter formatting
        this.checkColorParams(node);
    }

    private isHexColor(color: string): boolean {
        return /^(#([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8}))|(0x[0-9A-F]*)$/i.test(
            color,
        );
    }

    private isValidPx(size: string): boolean {
        return /^\d+(\.\d+)?px$/.test(size);
    }

    private isValidVp(size: string): boolean {
        return /^\d+(\.\d+)?vp$/.test(size);
    }

    private convertToDecimalPx(size: string): string {
        // Remove meaningless 0, eg: '12.00px'
        const formatSize = `${parseFloat(size)}${size.endsWith('px') ? 'px' : 'vp'
            }`;
        // Regular expressions match numbers and units (e.g. px)
        const regex = /^(\d+)(px|vp)$/;
        const match = regex.exec(formatSize);

        if (match) {
            // Get the numerical part and the unit part
            const numberPart = match[1];
            const unitPart = match[2];

            // Add a decimal point and a zero if there is no decimal point after the original number
            const decimalSize = `${parseFloat(numberPart).toFixed(1)}${unitPart}`;

            return decimalSize;
        } else {
            // If there is no match, the original string is returned
            return size;
        }
    }

    // Check whether it is in the UI component
    private isInUIComponent(node: arkts.AstNode): boolean | undefined {
        if (!node) {
            return false;
        }
        let curNode = node;
        try {
            while (!arkts.isStructDeclaration(curNode)) {
                if (!curNode.parent) {
                    return false;
                }
                curNode = curNode.parent;
            }
            return true;
        } catch (error) {
            return false;
        }
    }

    // Whether or not it is decorated by a specific decorator
    private isInSpecificDecorators(node: arkts.AstNode): boolean {
        if (!node) {
            return false;
        }
        let curNode = node;
        try {
            while (!arkts.isFunctionDeclaration(curNode)) {
                if (!curNode.parent) {
                    return false;
                }
                curNode = curNode.parent;
            }
            const annotations = arkts.getAnnotations(curNode);
            return annotations.some(annotation =>
                annotation.expr && arkts.isIdentifier(annotation.expr) &&
                annotation.expr.name && UiConsistentCheckRule.specificDecorators.includes(annotation.expr.name)
            );
        } catch (error) {
            return false;
        }
    }

    private isColorProperty(propertyName: string): boolean {
        // If the attribute name contains  'ResourceColor', 'Color', 'Resource', 'string', it is maybe a color property
        return propertyName.includes(UiConsistentCheckRule.resourceColorType) ||
            UiConsistentCheckRule.colorUnionTypes.some(str => propertyName.includes(str));
    }

    private checkVpUnit(node: arkts.AstNode): void {
        if (!arkts.isCallExpression(node) || !node.expression ||
            !arkts.isMemberExpression(node.expression) || !node.expression.property) {
            return;
        }
        // Verify the attribute whose unit is VP
        if (!arkts.isIdentifier(node.expression.property) ||
            !UiConsistentCheckRule.checkVpProperties.includes(node.expression.property.name)) {
            return;
        }
        // Only the content under the UI component and the special decorator is verified
        if (!this.isInUIComponent(node.expression.property) &&
            !this.isInSpecificDecorators(node.expression.property)) {
            return;
        }
        // Gets the attribute value text and verifies the formatting
        const sizeParams = node.arguments.filter(
            argNode => arkts.isStringLiteral(argNode) && this.isValidVp(argNode.str)
        );
        sizeParams.forEach(argNode => {
            const resources =
                UiConsistentCheckRule.consistentResourceInfo.get((argNode as arkts.StringLiteral).str) ??
                UiConsistentCheckRule.consistentResourceInfo.get(
                    this.convertToDecimalPx((argNode as arkts.StringLiteral).str)
                );

            // If consistent resource information doesn't exist, it won't be fixed
            if (!resources || resources.length < 1) {
                return;
            }
            const propertyValue = (argNode as arkts.StringLiteral).str;
            const targetValue = `$r('sys.float.${resources[0].resourceName}')`;
            this.report({
                node: argNode,
                message: this.messages.vpSizeWarning,
                fix: () => {
                    return {
                        title: `change ${propertyValue} to ${targetValue}`,
                        range: [argNode.startPosition, argNode.endPosition],
                        code: `${targetValue}`,
                    };
                }
            });
        });
    }

    private checkVpAndPxUnit(node: arkts.AstNode): void {
        if (!arkts.isCallExpression(node) || !node.expression ||
            !arkts.isMemberExpression(node.expression) || !node.expression.property) {
            return;
        }
        // Verify the attribute whose unit is VP or PX
        if (!arkts.isIdentifier(node.expression.property) ||
            !UiConsistentCheckRule.checkVpAndPxProperties.includes(node.expression.property.name)) {
            return;
        }
        // Only the content under the UI component and the special decorator is verified
        if (!this.isInUIComponent(node.expression.property) &&
            !this.isInSpecificDecorators(node.expression.property)) {
            return;
        }
        // Gets the attribute value text and verifies the formatting
        const sizeParams = node.arguments.filter(
            argNode => arkts.isStringLiteral(argNode) && (this.isValidVp(argNode.str) || this.isValidPx(argNode.str))
        );
        sizeParams.forEach(argNode => {
            const resources =
                UiConsistentCheckRule.consistentResourceInfo.get((argNode as arkts.StringLiteral).str) ??
                UiConsistentCheckRule.consistentResourceInfo.get(
                    this.convertToDecimalPx((argNode as arkts.StringLiteral).str)
                );

            // If consistent resource information doesn't exist, it won't be fixed
            if (!resources || resources.length < 1) {
                return;
            }
            const propertyValue = (argNode as arkts.StringLiteral).str;
            const targetValue = `$r('sys.float.${resources[0].resourceName}')`;
            this.report({
                node: argNode,
                message: this.messages.vpAndPxSizeWarning,
                fix: () => {
                    return {
                        title: `change ${propertyValue} to ${targetValue}`,
                        range: [argNode.startPosition, argNode.endPosition],
                        code: `${targetValue}`,
                    };
                }
            });
        });
    }

    private checkColorParams(node: arkts.AstNode): void {
        if (!arkts.isCallExpression(node) || !node.expression ||
            !arkts.isMemberExpression(node.expression) || !node.expression.property) {
            return;
        }
        // Verify the attribute whose type is Color
        if (!arkts.isIdentifier(node.expression.property) ||
            !this.isColorProperty(node.expression.property.name)) {
            return;
        }
        // Only the content under the UI component and the special decorator is verified
        if (!this.isInUIComponent(node.expression.property) &&
            !this.isInSpecificDecorators(node.expression.property)) {
            return;
        }
        // Gets the attribute value text and verifies the formatting
        const colorParams = node.arguments.filter(
            argNode => arkts.isStringLiteral(argNode) && this.isHexColor(argNode.str)
        );
        colorParams.forEach(argNode => {
            const resources =
                UiConsistentCheckRule.consistentResourceInfo.get((argNode as arkts.StringLiteral).str) ??
                UiConsistentCheckRule.consistentResourceInfo.get((argNode as arkts.StringLiteral).str.toUpperCase());

            // If consistent resource information doesn't exist, it won't be fixed
            if (!resources || resources.length < 1) {
                return;
            }
            const propertyValue = (argNode as arkts.StringLiteral).str;
            const targetValue = `$r('sys.color.${resources[0].resourceName}')`;
            this.report({
                node: argNode,
                message: this.messages.colorConsistentWarning,
                fix: () => {
                    return {
                        title: `change ${propertyValue} to ${targetValue}`,
                        range: [argNode.startPosition, argNode.endPosition],
                        code: `${targetValue}`,
                    };
                }
            });
        });
    }
}

export default UiConsistentCheckRule;