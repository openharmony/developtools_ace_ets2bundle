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
import { PresetDecorators, findDecorator, getClassDeclarationAnnotation } from '../utils/index';

class TrackDecoratorCheckRule extends AbstractUISyntaxRule {
    public setup(): Record<string, string> {
        return {
            trackOnClassMemberOnly: `The '@Track' annotation can decorate only member variables of a class.`,
            trackMustUsedWithObserved: `'@Track' cannot be used with classes decorated by '@ObservedV2'. Use the '@Trace' annotation instead.`,
        };
    }

    public parsed(node: arkts.AstNode): void {
        if (arkts.isFunctionDeclaration(node) ||
            arkts.isVariableDeclaration(node) ||
            arkts.isTSInterfaceDeclaration(node) ||
            arkts.isTSTypeAliasDeclaration(node)) {
            this.reportInvalidTrackDecoratorUsage(node);
        }
        if (arkts.isStructDeclaration(node)) {
            this.checkInvalidTrackAnnotations(node);
        }
        // Check if the current node is a class declaration
        if (arkts.isClassDeclaration(node)) {
            this.checkTrackUsedWithObservedV2(node);
        }
    }

    private reportInvalidTrackDecoratorUsage(
        node: arkts.FunctionDeclaration | arkts.VariableDeclaration | arkts.ScriptFunction |
            arkts.TSInterfaceDeclaration | arkts.TSTypeAliasDeclaration
    ): void {
        const trackDecorator = findDecorator(node, PresetDecorators.TRACK);
        if (trackDecorator) {
            this.reportInvalidTarget(trackDecorator);
        }
    }

    private checkInvalidTrackAnnotations(node: arkts.StructDeclaration): void {
        // Traverse all members of the struct body
        node.definition.body.forEach((member) => {
            // Check whether it is a member variable
            if (arkts.isClassProperty(member)) {
                const trackDecorator = findDecorator(member, PresetDecorators.TRACK);
                // If a member variable is decorated with @Track, an error is reported immediately
                if (trackDecorator) {
                    this.reportInvalidTarget(trackDecorator);
                }
            }
            // Check whether this is the method
            if (arkts.isMethodDefinition(member)) {
                const trackDecorator = findDecorator(member.scriptFunction, PresetDecorators.TRACK);
                // If the method is decorated with @Track, an error is reported immediately
                if (trackDecorator) {
                    this.reportInvalidTarget(trackDecorator);
                }
            }
        },);
    }

    private checkTrackUsedWithObservedV2(node: arkts.ClassDeclaration): void {
        // Check if the class is decorated with @Observed
        const observedV2Decorator = getClassDeclarationAnnotation(node, PresetDecorators.OBSERVED_V2);
        // Traverse all members of the body class
        node.definition?.body.forEach((member) => {
            // Check whether it is a class attribute
            if (arkts.isClassProperty(member)) {
                const trackDecorator = findDecorator(member, PresetDecorators.TRACK);
                // If the class is not decorated with @Observed and has decorators, an error is reported
                if (observedV2Decorator && trackDecorator) {
                    this.reportInvalidClass(trackDecorator);
                }
            }
            // Check whether this is the method
            if (arkts.isMethodDefinition(member)) {
                const trackDecorator = findDecorator(member.scriptFunction, PresetDecorators.TRACK);
                // If the method is decorated with @Track, an error is reported immediately
                if (trackDecorator) {
                    this.reportInvalidTarget(trackDecorator);
                }
                if (observedV2Decorator && trackDecorator) {
                    this.reportInvalidClass(trackDecorator);
                }
            }
        });
    }

    private reportInvalidClass(trackDecorator: arkts.AnnotationUsage): void {
        this.report({
            node: trackDecorator,
            message: this.messages.trackMustUsedWithObserved,
            fix: (trackDecorator) => {
                const startPosition = trackDecorator.startPosition;
                const endPosition = trackDecorator.endPosition;
                return {
                    range: [startPosition, endPosition],
                    code: '',
                };
            },
        });
    }

    private reportInvalidTarget(node: arkts.AnnotationUsage): void {
        this.report({
            node: node,
            message: this.messages.trackOnClassMemberOnly,
            fix: (node) => {
                const startPosition = node.startPosition;
                const endPosition = node.endPosition;
                return {
                    range: [startPosition, endPosition],
                    code: '',
                };
            },
        });
    }
}

export default TrackDecoratorCheckRule;