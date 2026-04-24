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
import {
    PresetDecorators,
    getClassPropertyAnnotationNames,
    getClassPropertyName,
    TypeFlags,
    isFromPresetModules,
    getIdentifierName,
    addImportFixes,
} from '../utils';
import { AbstractUISyntaxRule, FixSuggestion } from './ui-syntax-rule';

const CONTEXT_TYPE_CLASS = 'class';
const CONTEXT_TYPE_STRUCT = 'struct';

const STRUCT_REQUIRED_DECORATORS = [
    PresetDecorators.LOCAL,
    PresetDecorators.PARAM,
    PresetDecorators.PROVIDER,
    PresetDecorators.CONSUMER,
    PresetDecorators.COMPUTED,
];

enum ArrayTypes {
    Array = 'Array',
    Map = 'Map',
    Set = 'Set',
    Date = 'Date',
}

enum PathInvalidReason {
    VALID = 'valid',
    PROPERTY_NOT_EXISTS = 'property_not_exists',
    NOT_STATE_VARIABLE = 'not_state_variable',
    ARRAY_INDEX_OUT_OF_BOUNDS = 'array_index_out_of_bounds',
    ARRAY_LENGTH_HAS_TAIL = 'array_length_has_tail',
    ARRAY_LENGTH_ACCESS = 'array_length_access',
    ARRAY_INDEX_NO_PROPERTY = 'array_index_no_property',
    MAP_SET_SIZE_ACCESS = 'map_set_size_access',
    MAP_SET_SIZE_HAS_TAIL = 'map_set_size_has_tail',
    MAP_SET_NO_REQUIRED_DECORATOR = 'map_set_no_required_decorator',
    EXTERNAL_IMPORT = 'external_import',
    UNION_NO_MEMBER_HAS_PROPERTY = 'union_no_member_has_property',
    UNION_PARTIAL_NOT_STATE = 'union_partial_not_state',
}

interface PathValidationResult {
    valid: boolean;
    reason?: PathInvalidReason;
    level?: 'error' | 'warn';
    firstSegmentIsStateVariable?: boolean;
    isPropertyNotExists?: boolean;
    isExternalImport?: boolean;
}

interface PathValidationContext {
    type: string;
    node: arkts.ClassDeclaration | arkts.StructDeclaration;
    collectNode: Map<string, arkts.AstNode>;
    hasProperty?: (name: string) => boolean;
    hasStateVariable?: (name: string, isGetMethod: boolean) => boolean;
    variableMap?: Map<string, string[]>;
    requiredDecorators?: string[];
    hasRequiredDecorator?: boolean;
}

interface ArrayDimension {
    typeName: string;
    dimension: number;
}

class SyncMonitorDecoratorCheckRule extends AbstractUISyntaxRule {
    private collectNode: Map<string, arkts.AstNode> = new Map();
    private enumMemberValues: Map<string, string> = new Map();

    public setup(): Record<string, string> {
        return {
            syncMonitorUsedAlone:
                `The member property or method can not be decorated by multiple built-in annotations.`,
            syncMonitorUsedInObservedV2Class:
                `The '@SyncMonitor' can decorate only member method within a 'class' decorated with @ObservedV2.`,
            syncMonitorUsedInComponentV2Struct:
                `The '@SyncMonitor' annotation can only be used in a 'struct' decorated with '@ComponentV2'.`,
            syncMonitorDecorateMethod:
                `@SyncMonitor can only decorate method.`,
            syncMonitorTargetInvalid:
                `'@SyncMonitor' cannot observe non-existent variables or non-state variables, except in wildcard-based monitoring scenarios.`,
            syncMonitorWildcardInvalid:
                `In wildcard-based monitoring scenarios with '@SyncMonitor', the .* pattern must be placed at the end of the string.`,
        };
    }

    public beforeTransform(): void {
        this.collectNode = new Map();
        this.enumMemberValues = new Map();
    }

    public parsed(node: arkts.AstNode): void {
        if (!arkts.isEtsScript(node)) {
            return;
        }

        this.initList(node);

        for (const child of node.statements) {
            if (!arkts.isClassDeclaration(child) && !arkts.isStructDeclaration(child)) {
                continue;
            }

            this.checkDecorateMethod(child);

            const hasSyncMonitor = this.hasAnySyncMonitorMethod(child);
            if (!hasSyncMonitor) {
                continue;
            }

            this.validateWildcardPaths(child);

            if (arkts.isClassDeclaration(child)) {
                this.checkInObservedV2Class(child);
                this.validatePathsInClass(child);
            } else {
                this.checkInComponentV2Struct(child);
                this.validatePathsInStruct(child);
            }
        }
    }

    private hasAnySyncMonitorMethod(node: arkts.ClassDeclaration | arkts.StructDeclaration): boolean {
        return (node.definition?.body ?? []).some(
            (member) => arkts.isMethodDefinition(member) && this.findSyncMonitorAnnotation(member) !== undefined
        );
    }

    private validateWildcardPaths(node: arkts.ClassDeclaration | arkts.StructDeclaration): void {
        for (const member of node.definition?.body ?? []) {
            if (!arkts.isMethodDefinition(member)) {
                continue;
            }
            const annotation = this.findSyncMonitorAnnotation(member);
            if (!annotation) {
                continue;
            }
            const paths = this.extractPaths(annotation);
            if (!paths) {
                continue;
            }
            for (const path of paths) {
                if (!path.includes('*')) {
                    continue;
                }
                if (this.isWildcardPathInvalid(path)) {
                    this.report({
                        node: annotation,
                        message: this.messages.syncMonitorWildcardInvalid,
                    });
                }
            }
        }
    }

    private isWildcardPathInvalid(path: string): boolean {
        const segments = path.split('.');
        const wildcardCount = segments.filter((s) => s === '*').length;
        if (wildcardCount !== 1) {
            return true;
        }
        const lastSegment = segments[segments.length - 1];
        if (lastSegment !== '*') {
            return true;
        }
        if (segments.length < 2) {
            return true;
        }
        return false;
    }

    // Collect the necessary nodes
    private initList(node: arkts.EtsScript): void {
        this.collectNode = new Map();
        this.enumMemberValues = new Map();

        node.statements.forEach((member) => {
            this.collectClassDeclaration(member);
            this.collectInterfaceDeclaration(member);
            this.collectEnumDeclaration(member);
            this.collectImportDeclaration(member);
        });
    }

    private collectClassDeclaration(member: arkts.AstNode): void {
        if (!arkts.isClassDeclaration(member)) {
            return;
        }
        if (member.definition && member.definition.ident?.name) {
            this.collectNode.set(member.definition.ident.name, member);
        }
    }

    private collectInterfaceDeclaration(member: arkts.AstNode): void {
        if (arkts.isTSInterfaceDeclaration(member) && member.id?.name) {
            this.collectNode.set(member.id.name, member);
        }
    }

    private collectEnumDeclaration(member: arkts.AstNode): void {
        if (arkts.nodeType(member) !== arkts.Es2pandaAstNodeType.AST_NODE_TYPE_TS_ENUM_DECLARATION) {
            return;
        }
        const enumDecl = member as arkts.TSEnumDeclaration;
        const enumName = this.getEnumName(enumDecl);
        if (!enumName || !enumDecl.members || enumDecl.members.length === 0) {
            return;
        }
        enumDecl.members.forEach((enumMember: arkts.AstNode) => {
            this.collectEnumMember(enumName, enumMember);
        });
        if (enumDecl.key && arkts.isIdentifier(enumDecl.key)) {
            this.collectNode.set(enumDecl.key.name, enumDecl);
        }
    }

    private getEnumName(enumDecl: arkts.TSEnumDeclaration): string | undefined {
        if (!enumDecl.key || !arkts.isIdentifier(enumDecl.key)) {
            return undefined;
        }
        return enumDecl.key.name;
    }

    private collectEnumMember(enumNameStr: string, enumMember: arkts.AstNode): void {
        if (!arkts.isTSEnumMember(enumMember)) {
            return;
        }
        const memberNameStr = this.getEnumMemberName(enumMember);
        if (!memberNameStr || !enumMember.init) {
            return;
        }
        if (!arkts.isStringLiteral(enumMember.init)) {
            return;
        }
        const enumValue = enumMember.init.str;
        const key = `${enumNameStr}.${memberNameStr}`;
        this.enumMemberValues.set(key, enumValue);
    }

    private getEnumMemberName(enumMember: arkts.TSEnumMember): string | undefined {
        if (!enumMember.key || !arkts.isIdentifier(enumMember.key)) {
            return undefined;
        }
        return enumMember.key.name;
    }

    private collectImportDeclaration(member: arkts.AstNode): void {
        if (!arkts.isImportDeclaration(member)) {
            return;
        }
        const source = member.source;
        if (!source || isFromPresetModules(source.str)) {
            return;
        }
        const specifiers = member.specifiers;
        for (const specifier of specifiers) {
            if (
                !arkts.isImportSpecifier(specifier) &&
                !arkts.isImportDefaultSpecifier(specifier) &&
                !arkts.isImportNamespaceSpecifier(specifier)
            ) {
                continue;
            }
            if (!specifier.local || !arkts.isIdentifier(specifier.local)) {
                continue;
            }
            const name = getIdentifierName(specifier.local);
            this.collectNode.set(name, member);
        }
    }

    private getEnumMemberValue(node: arkts.MemberExpression): string | undefined {
        if (!node.object || !node.property) {
            return undefined;
        }
        const objName = arkts.isIdentifier(node.object) ? node.object.name : undefined;
        const propName = arkts.isIdentifier(node.property) ? node.property.name : undefined;
        if (!objName || !propName) {
            return undefined;
        }
        return this.enumMemberValues.get(`${objName}.${propName}`);
    }

    // Decorator Usage Validation
    private findSyncMonitorAnnotation(body: arkts.MethodDefinition): arkts.AnnotationUsage | undefined {
        return body.scriptFunction?.annotations?.find(
            (annotation) =>
                annotation.expr && arkts.isIdentifier(annotation.expr) &&
                annotation.expr.name === PresetDecorators.SYNC_MONITOR
        );
    }

    private checkSyncMonitorUsedAlone(node: arkts.ClassDeclaration | arkts.StructDeclaration): void {
        for (const body of node.definition?.body ?? []) {
            if (!arkts.isMethodDefinition(body)) {
                continue;
            }
            const syncMonitor = this.findSyncMonitorAnnotation(body);
            if (!syncMonitor) {
                continue;
            }

            const conflicting = this.getConflictingAnnotations(body);
            if (conflicting.length > 0) {
                this.reportConflictingAnnotations(syncMonitor, conflicting);
            }
        }
    }

    private getConflictingAnnotations(body: arkts.MethodDefinition): arkts.AnnotationUsage[] {
        return body.scriptFunction!.annotations!.filter(
            (annotation) =>
                annotation.expr && arkts.isIdentifier(annotation.expr) &&
                annotation.expr.name !== PresetDecorators.SYNC_MONITOR
        );
    }

    private reportConflictingAnnotations(syncMonitor: arkts.AnnotationUsage, conflicting: arkts.AnnotationUsage[]): void {
        this.report({
            node: syncMonitor,
            message: this.messages.syncMonitorUsedAlone,
            fix: () => {
                const startPositions = conflicting.map((a) => a.startPosition);
                const endPositions = conflicting.map((a) => a.endPosition);
                let startPosition = startPositions[0];
                startPosition = arkts.SourcePosition.create(startPosition.index() - 1, startPosition.line());
                const endPosition = endPositions[endPositions.length - 1];
                return {
                    title: 'Remove the annotation',
                    range: [startPosition, endPosition],
                    code: '',
                };
            },
        });
    }

    private checkDecorateMethod(node: arkts.ClassDeclaration | arkts.StructDeclaration): void {
        node.definition?.body.forEach((body) => {
            if (!arkts.isClassProperty(body)) {
                return;
            }

            const syncMonitorDecorator = body.annotations?.find(
                (annotation) =>
                    annotation.expr && arkts.isIdentifier(annotation.expr) &&
                    annotation.expr.name === PresetDecorators.SYNC_MONITOR
            );

            if (syncMonitorDecorator === undefined) {
                return;
            }
            this.report({
                node: syncMonitorDecorator,
                message: this.messages.syncMonitorDecorateMethod,
                fix: () => {
                    let startPosition = syncMonitorDecorator.startPosition;
                    startPosition = arkts.SourcePosition.create(startPosition.index() - 1, startPosition.line());
                    const endPosition = syncMonitorDecorator.endPosition;
                    return {
                        title: 'Remove the @SyncMonitor annotation',
                        range: [startPosition, endPosition],
                        code: '',
                    };
                },
            });
        });
    }

    private checkInObservedV2Class(node: arkts.ClassDeclaration): void {
        this.checkSyncMonitorUsedAlone(node);

        const hasObservedV2 = this.checkDecorator(node, PresetDecorators.OBSERVED_V2);
        if (hasObservedV2) {
            return;
        }

        const hasObservedV1 = this.checkDecorator(node, PresetDecorators.OBSERVED_V1);
        if (hasObservedV1) {
            this.reportChangeToObservedV2(node);
        } else {
            this.reportAddObservedV2(node);
        }
    }

    private checkInComponentV2Struct(node: arkts.StructDeclaration): void {
        this.checkSyncMonitorUsedAlone(node);

        const hasComponentV2 = this.checkDecorator(node, PresetDecorators.COMPONENT_V2);
        if (hasComponentV2) {
            return;
        }

        const hasComponentV1 = this.checkDecorator(node, PresetDecorators.COMPONENT_V1);
        if (hasComponentV1) {
            this.reportChangeToComponentV2(node);
        } else {
            this.reportAddComponentV2(node);
        }
    }

    private reportAddObservedV2(node: arkts.ClassDeclaration): void {
        const syncMonitorAnnotation = this.findFirstSyncMonitorInNode(node);
        if (!syncMonitorAnnotation) {
            return;
        }
        const fixes: FixSuggestion[] = [];
        const fixTitle = 'Add @ObservedV2';

        fixes.push({
            title: fixTitle,
            range: [node.startPosition, node.startPosition],
            code: `@${PresetDecorators.OBSERVED_V2}\n`,
        });

        addImportFixes(node, fixes, this.context, [PresetDecorators.OBSERVED_V2], fixTitle);

        this.report({
            node: syncMonitorAnnotation,
            message: this.messages.syncMonitorUsedInObservedV2Class,
            fix: () => fixes,
        });
    }

    private reportChangeToObservedV2(node: arkts.ClassDeclaration): void {
        const syncMonitorAnnotation = this.findFirstSyncMonitorInNode(node);
        if (!syncMonitorAnnotation) {
            return;
        }
        const observedAnnotation = node.definition?.annotations?.find(
            (annotation) =>
                annotation.expr && arkts.isIdentifier(annotation.expr) &&
                annotation.expr.name === PresetDecorators.OBSERVED_V1
        );
        if (!observedAnnotation) {
            return;
        }
        const fixes: FixSuggestion[] = [];
        const fixTitle = 'Change to @ObservedV2';

        fixes.push({
            title: fixTitle,
            range: [observedAnnotation.startPosition, observedAnnotation.endPosition],
            code: `${PresetDecorators.OBSERVED_V2}`,
        });

        addImportFixes(observedAnnotation, fixes, this.context, [PresetDecorators.OBSERVED_V2], fixTitle);

        this.report({
            node: syncMonitorAnnotation,
            message: this.messages.syncMonitorUsedInObservedV2Class,
            fix: () => fixes,
        });
    }

    private reportAddComponentV2(node: arkts.StructDeclaration): void {
        const syncMonitorAnnotation = this.findFirstSyncMonitorInNode(node);
        if (!syncMonitorAnnotation) {
            return;
        }
        const fixes: FixSuggestion[] = [];
        const fixTitle = 'Add @ComponentV2';

        fixes.push({
            title: fixTitle,
            range: [node.startPosition, node.startPosition],
            code: `@${PresetDecorators.COMPONENT_V2}\n`,
        });

        addImportFixes(node, fixes, this.context, [PresetDecorators.COMPONENT_V2], fixTitle);

        this.report({
            node: syncMonitorAnnotation,
            message: this.messages.syncMonitorUsedInComponentV2Struct,
            fix: () => fixes,
        });
    }

    private reportChangeToComponentV2(node: arkts.StructDeclaration): void {
        const syncMonitorAnnotation = this.findFirstSyncMonitorInNode(node);
        if (!syncMonitorAnnotation) {
            return;
        }
        const componentAnnotation = node.definition?.annotations?.find(
            (annotation) =>
                annotation.expr && arkts.isIdentifier(annotation.expr) &&
                annotation.expr.name === PresetDecorators.COMPONENT_V1
        );
        if (!componentAnnotation) {
            return;
        }
        const fixes: FixSuggestion[] = [];
        const fixTitle = 'Change to @ComponentV2';

        fixes.push({
            title: fixTitle,
            range: [componentAnnotation.startPosition, componentAnnotation.endPosition],
            code: `${PresetDecorators.COMPONENT_V2}`,
        });

        addImportFixes(componentAnnotation, fixes, this.context, [PresetDecorators.COMPONENT_V2], fixTitle);

        this.report({
            node: syncMonitorAnnotation,
            message: this.messages.syncMonitorUsedInComponentV2Struct,
            fix: () => fixes,
        });
    }

    private findFirstSyncMonitorInNode(node: arkts.ClassDeclaration | arkts.StructDeclaration): arkts.AnnotationUsage | undefined {
        for (const body of node.definition?.body ?? []) {
            if (!arkts.isMethodDefinition(body)) {
                continue;
            }
            const annotation = this.findSyncMonitorAnnotation(body);
            if (annotation) {
                return annotation;
            }
        }
        return undefined;
    }

    // Path Validation
    private validatePathsInClass(node: arkts.ClassDeclaration): void {
        if (!this.checkDecorator(node, PresetDecorators.OBSERVED_V2)) {
            return;
        }

        node.definition?.body.forEach((body) => {
            if (!arkts.isMethodDefinition(body)) {
                return;
            }
            const syncMonitorAnnotation = this.findSyncMonitorAnnotation(body);
            if (!syncMonitorAnnotation) {
                return;
            }
            const paths = this.extractPaths(syncMonitorAnnotation);
            if (!paths) {
                return;
            }

            const context: PathValidationContext = {
                type: CONTEXT_TYPE_CLASS,
                node,
                collectNode: this.collectNode,
                hasProperty: (name: string) => this.hasClassProperty(node, name),
                hasStateVariable: (name: string, isGetMethod: boolean) => {
                    if (isGetMethod) {
                        return this.hasGetMethodWithDecorator(node, name, PresetDecorators.COMPUTED);
                    }
                    return this.hasClassProperty(node, name, PresetDecorators.TRACE);
                },
            };

            paths.forEach((path) => {
                const result = this.validatePath(path, context);
                this.reportPathInvalid(syncMonitorAnnotation, result);
            });
        });
    }

    // Path Validation
    private validatePathsInStruct(node: arkts.StructDeclaration): void {
        if (!this.checkDecorator(node, PresetDecorators.COMPONENT_V2)) {
            return;
        }

        const variableMap = this.collectVariables(node);

        node.definition?.body.forEach((body) => {
            if (!arkts.isMethodDefinition(body)) {
                return;
            }
            const syncMonitorAnnotation = this.findSyncMonitorAnnotation(body);
            if (!syncMonitorAnnotation) {
                return;
            }
            const paths = this.extractPaths(syncMonitorAnnotation);
            if (!paths) {
                return;
            }

            paths.forEach((path) => {
                const segments = path.split('.');
                if (segments.length === 0) {
                    return;
                }
                const firstSegment = segments[0];
                const decorators = variableMap.get(firstSegment) || [];
                const hasRequiredDecorator = STRUCT_REQUIRED_DECORATORS.some((d) => decorators.includes(d));

                const context: PathValidationContext = {
                    type: CONTEXT_TYPE_STRUCT,
                    node,
                    collectNode: this.collectNode,
                    variableMap,
                    requiredDecorators: STRUCT_REQUIRED_DECORATORS,
                    hasRequiredDecorator,
                };

                const result = this.validatePath(path, context);
                this.reportPathInvalid(syncMonitorAnnotation, result);
            });
        });
    }

    // Unified Path Validation Entry
    private validatePath(path: string, context: PathValidationContext): PathValidationResult {
        const segments = path.split('.').filter((s) => s.trim());
        if (segments.length === 0) {
            return { valid: true };
        }

        if (path.includes('*')) {
            const wildcardIndex = segments.indexOf('*');
            const trimmedSegments = segments.slice(0, wildcardIndex);
            if (trimmedSegments.length === 0) {
                return { valid: true };
            }
            return this.validatePath(trimmedSegments.join('.'), context);
        }

        const firstSegment = segments[0];
        const rest = segments.slice(1);

        // First segment existence
        if (!this.checkFirstSegmentExists(context, firstSegment)) {
            return { valid: false, reason: PathInvalidReason.PROPERTY_NOT_EXISTS, level: 'error' };
        }

        const isGetMethod = this.isGetMethod(context.node, firstSegment);
        const firstSegmentIsStateVariable = this.isFirstSegmentStateVariable(
            firstSegment, isGetMethod, context
        );

        // No more segments, just check state variable
        if (rest.length === 0) {
            if (!firstSegmentIsStateVariable) {
                return { valid: false, reason: PathInvalidReason.NOT_STATE_VARIABLE, level: 'warn' };
            }
            const typeName = this.firstSegmentTypeName(firstSegment, context.node);
            if (typeName) {
                const typeNode = this.collectNode.get(typeName);
                if (typeNode && arkts.isImportDeclaration(typeNode)) {
                    return { valid: false, reason: PathInvalidReason.EXTERNAL_IMPORT, level: 'warn' };
                }
            }
            return { valid: true };
        }

        // Resolve first segment type
        const typeName = this.firstSegmentTypeName(firstSegment, context.node);
        if (!typeName) {
            if (!firstSegmentIsStateVariable) {
                return { valid: false, reason: PathInvalidReason.NOT_STATE_VARIABLE, level: 'warn' };
            }
            return { valid: true };
        }

        // Check if first segment is array type
        const property = this.getPropertyInDeclByName(context.node, firstSegment);
        if (property && property.typeAnnotation && this.isArrayType(property.typeAnnotation)) {
            const arrayResult = this.validateArrayAccess(
                property, rest, firstSegmentIsStateVariable
            );
            return arrayResult;
        }

        // Dispatch by type
        if (this.isMapOrSetType(typeName)) {
            return this.validateMapSetAccess(
                typeName, rest, context, firstSegment, isGetMethod, firstSegmentIsStateVariable
            );
        }

        if (typeName === TypeFlags.Union) {
            return this.validateUnionTypeAccess(
                context.node, firstSegment, rest, context, isGetMethod, firstSegmentIsStateVariable
            );
        }

        return this.validateNestedSegments(typeName, rest, context, firstSegmentIsStateVariable);
    }

    // First Segment Check
    private checkFirstSegmentExists(context: PathValidationContext, segment: string): boolean {
        if (context.type === CONTEXT_TYPE_CLASS) {
            return this.hasClassProperty(context.node as arkts.ClassDeclaration, segment);
        }
        return (context.variableMap?.has(segment)) ?? false;
    }

    private isFirstSegmentStateVariable(
        segment: string, isGetMethod: boolean, context: PathValidationContext
    ): boolean {
        if (isGetMethod) {
            if (context.type === CONTEXT_TYPE_CLASS) {
                return this.hasGetMethodWithDecorator(
                    context.node as arkts.ClassDeclaration, segment, PresetDecorators.COMPUTED
                );
            }
            return this.hasGetMethodWithDecorator(
                context.node as arkts.StructDeclaration, segment, PresetDecorators.COMPUTED
            );
        }
        if (context.type === CONTEXT_TYPE_CLASS) {
            return this.hasClassProperty(
                context.node as arkts.ClassDeclaration, segment, PresetDecorators.TRACE
            );
        }
        return context.hasRequiredDecorator ?? false;
    }

    // Array Validation
    private validateArrayAccess(
        property: arkts.ClassProperty,
        segments: string[],
        firstSegmentIsStateVariable: boolean
    ): PathValidationResult {
        // Length check must be first
        if (segments.length === 1 && segments[0] === 'length') {
            return { valid: false, reason: PathInvalidReason.ARRAY_LENGTH_ACCESS, level: 'warn' };
        }

        if (segments.length > 1 && segments[0] === 'length') {
            return { valid: false, reason: PathInvalidReason.ARRAY_LENGTH_HAS_TAIL, level: 'error' };
        }

        // Check first segment is array index
        if (!this.isArrayIndex(segments[0])) {
            return { valid: false, reason: PathInvalidReason.ARRAY_INDEX_OUT_OF_BOUNDS, level: 'error' };
        }

        // Validate array element dimensions and nested paths
        return this.validateArrayElementTypes(
            property, segments, firstSegmentIsStateVariable
        );
    }

    private validateArrayElementTypes(
        property: arkts.ClassProperty,
        segments: string[],
        firstSegmentIsStateVariable: boolean
    ): PathValidationResult {
        const typeAnnotation = property.typeAnnotation;
        if (!typeAnnotation || !arkts.isTypeNode(typeAnnotation)) {
            return { valid: false, reason: PathInvalidReason.ARRAY_INDEX_OUT_OF_BOUNDS, level: 'error' };
        }

        const { maxDim, dimTypes } = this.getArrayDimensions(typeAnnotation, segments);
        const nestDepth = this.countArrayIndexNesting(segments);
        if (maxDim < nestDepth) {
            return { valid: false, reason: PathInvalidReason.ARRAY_INDEX_OUT_OF_BOUNDS, level: 'error' };
        }

        const memberSegments = segments.slice(nestDepth);
        if (memberSegments.length === 0) {
            return { valid: false, reason: PathInvalidReason.ARRAY_INDEX_NO_PROPERTY, level: 'warn' };
        }

        const dimTypeSet = dimTypes.get(nestDepth);
        if (!dimTypeSet || dimTypeSet.length === 0) {
            return { valid: false, reason: PathInvalidReason.ARRAY_INDEX_OUT_OF_BOUNDS, level: 'error' };
        }

        const aggregate = this.aggregateArrayTypeResults(dimTypes, nestDepth, memberSegments);
        return this.resolveArrayAggregateResult(aggregate, firstSegmentIsStateVariable);
    }

    private countArrayIndexNesting(segments: string[]): number {
        let depth = 0;
        for (const seg of segments) {
            if (this.isArrayIndex(seg)) {
                depth++;
            } else {
                break;
            }
        }
        return depth;
    }

    private aggregateArrayTypeResults(
        dimTypes: Map<number, { typeName: string; isExternal: boolean }[]>,
        nestDepth: number,
        memberSegments: string[]
    ): { hasPropertyExists: boolean; hasExternalImport: boolean; allValid: boolean; hasOtherDimension: boolean; hasValidType: boolean } {
        let hasPropertyExists = true;
        let hasExternalImport = false;
        let allValid = true;
        let hasOtherDimension = false;
        let hasValidType = false;

        for (const [dim, types] of dimTypes) {
            if (dim === nestDepth) {
                const typeResult = this.aggregateTypeEntries(types, memberSegments);
                if (typeResult.hasValidType) {
                    hasValidType = true;
                }
                if (!typeResult.entryAllValid) {
                    allValid = false;
                }
                if (!typeResult.entryHasPropertyExists) {
                    hasPropertyExists = false;
                }
                if (typeResult.entryHasExternalImport) {
                    hasExternalImport = true;
                }
            } else if (dim > nestDepth) {
                hasOtherDimension = true;
            }
        }

        return { hasPropertyExists, hasExternalImport, allValid, hasOtherDimension, hasValidType };
    }

    private aggregateTypeEntries(
        types: { typeName: string; isExternal: boolean }[],
        memberSegments: string[]
    ): { hasValidType: boolean; entryAllValid: boolean; entryHasPropertyExists: boolean; entryHasExternalImport: boolean } {
        let hasValidType = false;
        let entryAllValid = true;
        let entryHasPropertyExists = true;
        let entryHasExternalImport = false;

        for (const typeEntry of types) {
            if (typeEntry.isExternal) {
                entryHasExternalImport = true;
                continue;
            }
            const memberResult = this.checkNestedPathStateVariables(
                typeEntry.typeName, memberSegments
            );
            if (memberResult.valid) {
                hasValidType = true;
            } else {
                entryAllValid = false;
                if (memberResult.isPropertyNotExists) {
                    entryHasPropertyExists = false;
                }
                if (memberResult.isExternalImport) {
                    entryHasExternalImport = true;
                }
            }
        }

        return { hasValidType, entryAllValid, entryHasPropertyExists, entryHasExternalImport };
    }

    private resolveArrayAggregateResult(
        agg: { hasPropertyExists: boolean; hasExternalImport: boolean; allValid: boolean; hasOtherDimension: boolean; hasValidType: boolean },
        firstSegmentIsStateVariable: boolean
    ): PathValidationResult {
        if (!agg.hasValidType && !agg.hasExternalImport) {
            return { valid: false, reason: PathInvalidReason.PROPERTY_NOT_EXISTS, level: 'error' };
        }

        if (!firstSegmentIsStateVariable) {
            return { valid: false, reason: PathInvalidReason.NOT_STATE_VARIABLE, level: 'warn' };
        }

        if (agg.hasOtherDimension && !agg.allValid) {
            return { valid: false, reason: PathInvalidReason.UNION_PARTIAL_NOT_STATE, level: 'warn' };
        }

        if (agg.hasExternalImport) {
            return { valid: false, reason: PathInvalidReason.EXTERNAL_IMPORT, level: 'warn' };
        }

        if (!agg.allValid) {
            const level = (agg.hasPropertyExists || agg.hasValidType) ? 'warn' : 'error';
            const reason = (agg.hasPropertyExists || agg.hasValidType)
                ? PathInvalidReason.UNION_PARTIAL_NOT_STATE
                : PathInvalidReason.UNION_NO_MEMBER_HAS_PROPERTY;
            return { valid: false, reason, level };
        }

        return { valid: true };
    }

    private getArrayDimensions(
        typeAnnotation: arkts.TypeNode,
        segments: string[]
    ): { maxDim: number; dimTypes: Map<number, { typeName: string; isExternal: boolean }[]> } {
        const dimTypes = new Map<number, { typeName: string; isExternal: boolean }[]>();
        let maxDim = 0;

        if (arkts.isETSUnionType(typeAnnotation)) {
            const unionType = typeAnnotation as arkts.ETSUnionType;
            for (const memberType of unionType.types) {
                if (this.isArrayType(memberType)) {
                    const { typeName: elementTypeName, dimension } = this.getArrayDimensionByType(memberType);
                    maxDim = Math.max(maxDim, dimension);
                    if (elementTypeName) {
                        const existing = dimTypes.get(dimension) || [];
                        const isExternal = this.collectNode.get(elementTypeName) !== undefined &&
                            arkts.isImportDeclaration(this.collectNode.get(elementTypeName)!);
                        existing.push({ typeName: elementTypeName, isExternal });
                        dimTypes.set(dimension, existing);
                    }
                }
            }
        } else {
            const { typeName: elementTypeName, dimension } = this.getArrayDimensionByType(typeAnnotation);
            maxDim = dimension;
            if (elementTypeName) {
                const isExternal = this.collectNode.get(elementTypeName) !== undefined &&
                    arkts.isImportDeclaration(this.collectNode.get(elementTypeName)!);
                dimTypes.set(dimension, [{ typeName: elementTypeName, isExternal }]);
            }
        }

        return { maxDim, dimTypes };
    }

    // Map/Set Validation
    private validateMapSetAccess(
        typeName: string,
        segments: string[],
        context: PathValidationContext,
        firstSegment: string,
        isGetMethod: boolean,
        firstSegmentIsStateVariable: boolean
    ): PathValidationResult {
        // No more segments
        if (segments.length === 0) {
            if (context.type === CONTEXT_TYPE_CLASS) {
                if (!firstSegmentIsStateVariable) {
                    return { valid: false, reason: PathInvalidReason.NOT_STATE_VARIABLE, level: 'warn' };
                }
                return { valid: true };
            } else {
                if (!context.hasRequiredDecorator) {
                    return { valid: false, reason: PathInvalidReason.NOT_STATE_VARIABLE, level: 'warn' };
                }
                return { valid: true };
            }
        }

        if (segments.length === 1 && segments[0] === 'size') {
            if (context.type === CONTEXT_TYPE_CLASS) {
                if (!firstSegmentIsStateVariable) {
                    return { valid: false, reason: PathInvalidReason.NOT_STATE_VARIABLE, level: 'warn' };
                }
            } else {
                if (!context.hasRequiredDecorator) {
                    return { valid: false, reason: PathInvalidReason.NOT_STATE_VARIABLE, level: 'warn' };
                }
            }
            return { valid: false, reason: PathInvalidReason.MAP_SET_SIZE_ACCESS, level: 'warn' };
        }

        if (segments.length > 1 && segments[0] === 'size') {
            return { valid: false, reason: PathInvalidReason.MAP_SET_SIZE_HAS_TAIL, level: 'error' };
        }

        return { valid: false, reason: PathInvalidReason.PROPERTY_NOT_EXISTS, level: 'error' };
    }

    // Union Type Validation
    private validateUnionTypeAccess(
        parentNode: arkts.ClassDeclaration | arkts.StructDeclaration,
        segment: string,
        rest: string[],
        context: PathValidationContext,
        isGetMethod: boolean,
        firstSegmentIsStateVariable: boolean
    ): PathValidationResult {
        const property = this.getPropertyInDeclByName(parentNode, segment);
        if (!property || !property.typeAnnotation || !arkts.isETSUnionType(property.typeAnnotation)) {
            return { valid: false, reason: PathInvalidReason.PROPERTY_NOT_EXISTS, level: 'error' };
        }

        const unionType = property.typeAnnotation as arkts.ETSUnionType;

        if (rest.length === 0) {
            if (!firstSegmentIsStateVariable) {
                return { valid: false, reason: PathInvalidReason.NOT_STATE_VARIABLE, level: 'warn' };
            }
            return { valid: true };
        }

        const memberResults: PathValidationResult[] = [];
        for (const memberType of unionType.types) {
            const memberResult = this.validateUnionMember(memberType, rest);
            memberResults.push(memberResult);
        }

        return this.mergeUnionResults(memberResults, firstSegmentIsStateVariable);
    }

    private validateUnionMember(
        memberType: arkts.AstNode,
        segments: string[]
    ): PathValidationResult {
        if (this.isArrayType(memberType)) {
            return this.validateUnionArrayMember(memberType, segments);
        }

        if (arkts.isETSTypeReference(memberType)) {
            const partName = memberType.part?.name;
            const name = partName && arkts.isIdentifier(partName) ? partName.name : undefined;
            if (!name) {
                return { valid: false, isPropertyNotExists: true };
            }

            if (this.isMapOrSetType(name)) {
                return this.validateUnionMapSetMember(name, segments);
            }

            const typeNode = this.collectNode.get(name);
            if (!typeNode) {
                return { valid: false, isPropertyNotExists: true };
            }
            if (arkts.isImportDeclaration(typeNode)) {
                return { valid: false, isExternalImport: true };
            }

            return this.checkNestedPathStateVariables(name, segments);
        }

        return { valid: false, isPropertyNotExists: true };
    }

    private validateUnionArrayMember(
        memberType: arkts.AstNode,
        segments: string[]
    ): PathValidationResult {
        if (segments[0] === 'length') {
            return { valid: false, isPropertyNotExists: false };
        }

        if (!this.isArrayIndex(segments[0])) {
            return { valid: false, isPropertyNotExists: true };
        }

        const { typeName: elementTypeName, dimension } = this.getArrayDimensionByType(memberType);

        let indexCount = 0;
        for (const seg of segments) {
            if (this.isArrayIndex(seg)) {
                indexCount++;
            } else {
                break;
            }
        }

        if (indexCount > dimension) {
            return { valid: false, isPropertyNotExists: true };
        }

        const memberSegments = segments.slice(indexCount);
        if (memberSegments.length === 0) {
            return { valid: false, isPropertyNotExists: false };
        }

        if (!elementTypeName || elementTypeName === ArrayTypes.Array || elementTypeName === 'unknown') {
            return { valid: false, isPropertyNotExists: true };
        }

        const elementTypeNode = this.collectNode.get(elementTypeName);
        if (!elementTypeNode) {
            return { valid: false, isPropertyNotExists: true };
        }
        if (arkts.isImportDeclaration(elementTypeNode)) {
            return { valid: false, isExternalImport: true };
        }

        return this.checkNestedPathStateVariables(elementTypeName, memberSegments);
    }

    private validateUnionMapSetMember(
        typeName: string,
        segments: string[]
    ): PathValidationResult {
        if (segments.length === 0) {
            return { valid: true };
        }

        if (segments[0] === 'size') {
            return { valid: false, isPropertyNotExists: false };
        }

        return { valid: false, isPropertyNotExists: true };
    }

    private mergeUnionResults(
        results: PathValidationResult[],
        firstSegmentIsStateVariable: boolean
    ): PathValidationResult {
        const allValid = results.every((r) => r.valid);
        const hasValidType = results.some((r) => r.valid);
        const anyExternalImport = results.some((r) => r.isExternalImport);
        const allPropertyNotExists = results.every((r) => r.isPropertyNotExists === true);

        if (allValid) {
            if (!firstSegmentIsStateVariable) {
                return { valid: false, reason: PathInvalidReason.NOT_STATE_VARIABLE, level: 'warn' };
            }
            return { valid: true };
        }

        if (allPropertyNotExists) {
            return { valid: false, reason: PathInvalidReason.PROPERTY_NOT_EXISTS, level: 'error' };
        }

        if (anyExternalImport) {
            return { valid: false, reason: PathInvalidReason.EXTERNAL_IMPORT, level: 'warn' };
        }

        if (hasValidType) {
            return { valid: false, reason: PathInvalidReason.UNION_PARTIAL_NOT_STATE, level: 'warn' };
        }

        if (!firstSegmentIsStateVariable) {
            return { valid: false, reason: PathInvalidReason.NOT_STATE_VARIABLE, level: 'warn' };
        }

        return { valid: false, reason: PathInvalidReason.UNION_PARTIAL_NOT_STATE, level: 'warn' };
    }

    // Nested Segments Validation
    private validateNestedSegments(
        currentTypeName: string,
        segments: string[],
        context: PathValidationContext,
        firstSegmentIsStateVariable?: boolean
    ): PathValidationResult {
        const checkResult = this.checkNestedPathStateVariables(currentTypeName, segments);

        if (checkResult.valid) {
            if (firstSegmentIsStateVariable !== undefined && !firstSegmentIsStateVariable) {
                return { valid: false, reason: PathInvalidReason.NOT_STATE_VARIABLE, level: 'warn' };
            }
            return { valid: true };
        }

        if (checkResult.isExternalImport) {
            return { valid: false, reason: PathInvalidReason.EXTERNAL_IMPORT, level: 'warn' };
        }

        if (checkResult.isPropertyNotExists) {
            return { valid: false, reason: PathInvalidReason.PROPERTY_NOT_EXISTS, level: 'error' };
        }

        return { valid: false, reason: PathInvalidReason.NOT_STATE_VARIABLE, level: 'warn' };
    }

    private checkNestedPathStateVariables(
        startType: string,
        segments: string[]
    ): PathValidationResult {
        let currentType = startType;
        let previousPropertyNode: arkts.ClassProperty | undefined = undefined;

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];

            if (this.isArrayIndex(segment)) {
                const arrayResult = this.processArrayIndexInPath(currentType, previousPropertyNode, segments, i);
                if (arrayResult.shouldReturn) {
                    return arrayResult.result;
                }
                currentType = arrayResult.newType;
                i = arrayResult.newIndex;
                previousPropertyNode = undefined;
                continue;
            }

            const propertyResult = this.processPropertyAccessInPath(segment, currentType);
            if (propertyResult.shouldReturn) {
                return propertyResult.result;
            }
            currentType = propertyResult.newType;
            previousPropertyNode = propertyResult.newPropertyNode;
        }

        return { valid: true };
    }

    private processArrayIndexInPath(
        currentType: string,
        previousPropertyNode: arkts.ClassProperty | undefined,
        segments: string[],
        currentIndex: number
    ): ProcessArrayIndexReturn {
        if (!previousPropertyNode) {
            const typeNode = this.collectNode.get(currentType);
            if (typeNode && arkts.isImportDeclaration(typeNode)) {
                return {
                    shouldReturn: true,
                    result: { valid: false, isExternalImport: true },
                };
            }
            const isArray = typeNode && arkts.isTypeNode(typeNode) && this.isArrayType(typeNode);
            if (!isArray && currentType.toLowerCase() !== TypeFlags.Array) {
                return { shouldReturn: true, result: { valid: false, isPropertyNotExists: true } };
            }
            return { shouldReturn: true, result: { valid: false, isPropertyNotExists: false } };
        }

        const arrayTypeAnnotation = previousPropertyNode.typeAnnotation;
        if (!arrayTypeAnnotation || !arkts.isTypeNode(arrayTypeAnnotation) || !this.isArrayType(arrayTypeAnnotation)) {
            return { shouldReturn: true, result: { valid: false, isPropertyNotExists: false } };
        }

        const remainingSegments = segments.slice(currentIndex);
        const { elementType, pathIndex } = this.getArrayElementTypeAndDimension(arrayTypeAnnotation, remainingSegments);
        if (!elementType) {
            return { shouldReturn: true, result: { valid: false, isPropertyNotExists: false } };
        }

        const elementTypeName = this.extractElementTypeNameFromArray(elementType);
        if (!elementTypeName) {
            return { shouldReturn: true, result: { valid: false, isPropertyNotExists: false } };
        }

        const newIndex = currentIndex + pathIndex;
        if (newIndex >= segments.length) {
            return { shouldReturn: true, result: { valid: false, isPropertyNotExists: false } };
        }

        return { shouldReturn: false, newType: elementTypeName, newIndex: newIndex - 1 };
    }

    private processPropertyAccessInPath(
        segment: string,
        currentType: string
    ): ProcessPropertyAccessReturn {
        const typeNode = this.collectNode.get(currentType);
        if (!typeNode) {
            return { shouldReturn: true, result: { valid: false, isPropertyNotExists: true } };
        }

        if (arkts.isImportDeclaration(typeNode)) {
            return { shouldReturn: true, result: { valid: false, isExternalImport: true } };
        }

        const isClassNode = arkts.isClassDeclaration(typeNode);
        const isStructNode = arkts.isStructDeclaration(typeNode);
        const isGetMethod = (isClassNode || isStructNode) ? this.isGetMethod(typeNode, segment) : false;
        const nextType = this.getPropTypeName(typeNode, segment);

        if (isGetMethod && !nextType) {
            return { shouldReturn: true, result: { valid: true } };
        }

        if (!nextType && !isGetMethod) {
            return { shouldReturn: true, result: { valid: false, isPropertyNotExists: true } };
        }

        const isStateVariable = this.checkSegmentStateVariable(typeNode, segment, isGetMethod, isClassNode, isStructNode);
        if (!isStateVariable) {
            return { shouldReturn: true, result: { valid: false, isPropertyNotExists: false } };
        }

        if (!nextType || nextType === 'unknown') {
            return { shouldReturn: true, result: { valid: true } };
        }

        const newPropertyNode = (isClassNode || isStructNode) ? this.getPropertyInDeclByName(typeNode, segment) : undefined;
        return { shouldReturn: false, newType: nextType, newPropertyNode };
    }

    private reportPathInvalid(annotation: arkts.AnnotationUsage, result: PathValidationResult): void {
        if (result.valid && !result.reason) {
            return;
        }

        const level = result.level ?? this.getDefaultLevel(result.reason);
        this.report({
            node: annotation,
            message: this.messages.syncMonitorTargetInvalid,
            level,
        });
    }

    private getDefaultLevel(reason?: PathInvalidReason): 'error' | 'warn' {
        if (!reason) {
            return 'error';
        }
        switch (reason) {
            case PathInvalidReason.NOT_STATE_VARIABLE:
            case PathInvalidReason.ARRAY_LENGTH_ACCESS:
            case PathInvalidReason.ARRAY_INDEX_NO_PROPERTY:
            case PathInvalidReason.MAP_SET_SIZE_ACCESS:
            case PathInvalidReason.MAP_SET_NO_REQUIRED_DECORATOR:
            case PathInvalidReason.EXTERNAL_IMPORT:
            case PathInvalidReason.UNION_PARTIAL_NOT_STATE:
                return 'warn';
            default:
                return 'error';
        }
    }

    private extractPaths(annotation: arkts.AnnotationUsage | undefined): string[] | undefined {
        if (!annotation || !annotation.expr || !arkts.isIdentifier(annotation.expr) ||
            annotation.expr.name !== PresetDecorators.SYNC_MONITOR || !annotation.properties) {
            return undefined;
        }

        const firstProp = annotation.properties[0];
        if (!arkts.isClassProperty(firstProp) || !firstProp.value || !arkts.isArrayExpression(firstProp.value)) {
            return undefined;
        }

        const values: string[] = [];
        for (const element of firstProp.value.elements) {
            if (arkts.isStringLiteral(element)) {
                values.push(element.str);
            } else if (arkts.isIdentifier(element)) {
                values.push(element.name);
            } else if (arkts.isMemberExpression(element)) {
                const enumValue = this.getEnumMemberValue(element);
                if (enumValue) {
                    values.push(enumValue);
                }
            }
        }

        return values.length > 0 ? values : undefined;
    }

    private firstSegmentTypeName(
        variableName: string, node: arkts.StructDeclaration | arkts.ClassDeclaration
    ): string | undefined {
        if (!node.definition?.body) {
            return arkts.isClassDeclaration(node)
                ? this.findVariableTypeInParentClass(variableName, node)
                : undefined;
        }
        for (const e of node.definition.body) {
            const typeFromProperty = this.getTypeFromClassProperty(e, variableName);
            if (typeFromProperty !== undefined) {
                return typeFromProperty;
            }
            const typeFromGetMethod = this.getTypeFromGetMethod(e, variableName);
            if (typeFromGetMethod !== undefined) {
                return typeFromGetMethod;
            }
        }
        return arkts.isClassDeclaration(node)
            ? this.findVariableTypeInParentClass(variableName, node)
            : undefined;
    }

    private getTypeFromClassProperty(member: arkts.AstNode, variableName: string): string | undefined {
        if (!arkts.isClassProperty(member)) {
            return undefined;
        }
        if (!this.isPropertyNameMatch(member, variableName) || !member.typeAnnotation) {
            return undefined;
        }
        return this.getTypeFromPropertyAnnotation(member.typeAnnotation);
    }

    private getTypeFromGetMethod(member: arkts.AstNode, variableName: string): string | undefined {
        if (!arkts.isMethodDefinition(member) ||
            member.kind !== arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET) {
            return undefined;
        }
        if (!this.isPropertyNameMatch(member, variableName) || !member.scriptFunction?.returnTypeAnnotation) {
            return undefined;
        }
        return this.getTypeFromPropertyAnnotation(member.scriptFunction.returnTypeAnnotation);
    }

    private findVariableTypeInParentClass(variableName: string, node: arkts.ClassDeclaration): string | undefined {
        if (!node.definition?.super || !arkts.isETSTypeReference(node.definition.super)) {
            return undefined;
        }
        const superPart = node.definition.super.part;
        if (!superPart || !arkts.isETSTypeReferencePart(superPart) ||
            !superPart.name || !arkts.isIdentifier(superPart.name)) {
            return undefined;
        }
        const parentName = superPart.name.name;
        const parentNode = this.collectNode.get(parentName);
        if (parentNode && arkts.isClassDeclaration(parentNode)) {
            return this.firstSegmentTypeName(variableName, parentNode);
        }
        return undefined;
    }

    private getTypeFromPropertyAnnotation(typeAnnotation: arkts.AstNode): string | undefined {
        if (!typeAnnotation) {
            return undefined;
        }
        if (arkts.isETSTypeReference(typeAnnotation)) {
            const partName = typeAnnotation.part?.name;
            return partName && arkts.isIdentifier(partName) ? partName.name : undefined;
        }
        if (arkts.isETSUnionType(typeAnnotation)) {
            return TypeFlags.Union;
        }
        if (arkts.isTypeNode(typeAnnotation) && this.isArrayType(typeAnnotation)) {
            return TypeFlags.Array;
        }
        if (arkts.isETSPrimitiveType(typeAnnotation)) {
            return 'unknown';
        }
        return undefined;
    }

    private getPropTypeName(node: arkts.AstNode, element: string): string | undefined {
        if (arkts.isClassDeclaration(node)) {
            return this.getPropTypeNameFromClass(node, element);
        }
        if (arkts.isTSInterfaceDeclaration(node)) {
            return this.getPropTypeNameFromInterface(node, element);
        }
        return undefined;
    }

    private getPropTypeNameFromClass(node: arkts.ClassDeclaration, element: string): string | undefined {
        if (!node.definition?.body) {
            return this.findPropTypeInParentClass(node, element);
        }
        const found = this.findMemberInClass(node.definition.body, element);
        if (!found) {
            return this.findPropTypeInParentClass(node, element);
        }
        if (arkts.isMethodDefinition(found)) {
            return this.getReturnTypeFromMethod(found);
        }
        if (arkts.isClassProperty(found)) {
            return this.getTypeFromProperty(found, node, element);
        }
        return undefined;
    }

    private getPropTypeNameFromInterface(node: arkts.TSInterfaceDeclaration, element: string): string | undefined {
        if (!node.body || !arkts.isTSInterfaceBody(node.body) || !node.body.body) {
            return undefined;
        }
        const targetProp = node.body.body.find(
            (e) => arkts.isClassProperty(e) && this.isPropertyNameMatch(e, element)
        ) as arkts.ClassProperty | undefined;
        return targetProp && targetProp.typeAnnotation
            ? this.getTypeFromPropertyAnnotation(targetProp.typeAnnotation) : undefined;
    }

    private findMemberInClass(
        body: readonly arkts.AstNode[], element: string
    ): arkts.ClassProperty | arkts.MethodDefinition | undefined {
        return body.find(
            (e) =>
                (arkts.isClassProperty(e) && this.isPropertyNameMatch(e, element)) ||
                (arkts.isMethodDefinition(e) &&
                    e.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET &&
                    this.isPropertyNameMatch(e, element))
        ) as arkts.ClassProperty | arkts.MethodDefinition | undefined;
    }

    private getReturnTypeFromMethod(method: arkts.MethodDefinition): string | undefined {
        return method.scriptFunction?.returnTypeAnnotation
            ? this.getTypeFromPropertyAnnotation(method.scriptFunction.returnTypeAnnotation)
            : undefined;
    }

    private getTypeFromProperty(
        prop: arkts.ClassProperty, node: arkts.AstNode, element: string
    ): string | undefined {
        if (!arkts.isClassProperty(prop) || !prop.typeAnnotation) {
            return this.findPropTypeInParentClass(node, element);
        }
        const typeName = this.getTypeFromPropertyAnnotation(prop.typeAnnotation);
        if (typeName) {
            return typeName;
        }
        return 'unknown';
    }

    private findPropTypeInParentClass(node: arkts.AstNode, element: string): string | undefined {
        if (!arkts.isClassDeclaration(node)) {
            return undefined;
        }
        const parentNode = this.getParentClass(node);
        return parentNode ? this.getPropTypeName(parentNode, element) : undefined;
    }

    private getParentClass(node: arkts.ClassDeclaration): arkts.ClassDeclaration | null {
        if (!node.definition?.super || !arkts.isETSTypeReference(node.definition.super)) {
            return null;
        }
        const superClassPart = node.definition.super.part;
        if (!superClassPart || !arkts.isETSTypeReferencePart(superClassPart) ||
            !superClassPart.name || !arkts.isIdentifier(superClassPart.name)) {
            return null;
        }
        const parentClassName = superClassPart.name.name;
        const parentNode = this.collectNode.get(parentClassName);
        return parentNode && arkts.isClassDeclaration(parentNode) ? parentNode : null;
    }

    private getPropertyInDeclByName(
        node: arkts.AstNode, propertyName: string
    ): arkts.ClassProperty | undefined {
        if (!arkts.isClassDeclaration(node) && !arkts.isStructDeclaration(node)) {
            return undefined;
        }
        const decl = node.definition;
        if (!decl?.body) {
            return undefined;
        }
        for (const member of decl.body) {
            if (arkts.isClassProperty(member) &&
                member.key && arkts.isIdentifier(member.key) &&
                member.key.name === propertyName) {
                return member;
            }
        }
        if (arkts.isClassDeclaration(node)) {
            const parentNode = this.getParentClass(node);
            if (parentNode) {
                return this.getPropertyInDeclByName(parentNode, propertyName);
            }
        }
        return undefined;
    }

    private isGetMethod(node: arkts.ClassDeclaration | arkts.StructDeclaration, variableName: string): boolean {
        if (!node.definition?.body) {
            return false;
        }
        for (const member of node.definition.body) {
            if (arkts.isMethodDefinition(member) &&
                member.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET &&
                member.name && arkts.isIdentifier(member.name) &&
                member.name.name === variableName) {
                return true;
            }
        }
        if (arkts.isClassDeclaration(node)) {
            const parentNode = this.getParentClass(node);
            if (parentNode) {
                return this.isGetMethod(parentNode, variableName);
            }
        }
        return false;
    }

    private hasClassProperty(node: arkts.ClassDeclaration, propertyName: string, decoratorName?: string): boolean {
        if (node.definition?.body) {
            for (const member of node.definition.body) {
                const result = this.checkMemberHasProperty(member, propertyName, decoratorName);
                if (result !== undefined) {
                    return result;
                }
            }
        }
        const parentNode = this.getParentClass(node);
        return parentNode ? this.hasClassProperty(parentNode, propertyName, decoratorName) : false;
    }

    private checkMemberHasProperty(
        member: arkts.AstNode, propertyName: string, decoratorName?: string
    ): boolean | undefined {
        if (arkts.isClassProperty(member) && this.isPropertyNameMatch(member, propertyName)) {
            return this.checkPropertyHasDecorator(member, decoratorName);
        }
        if (this.isGetMethodMatch(member, propertyName) && arkts.isMethodDefinition(member)) {
            return this.checkGetMethodHasDecorator(member, decoratorName);
        }
        return undefined;
    }

    private checkPropertyHasDecorator(member: arkts.ClassProperty, decoratorName?: string): boolean {
        if (!decoratorName) {
            return true;
        }
        const decorators = getClassPropertyAnnotationNames(member) || [];
        return decorators.includes(decoratorName);
    }

    private checkGetMethodHasDecorator(member: arkts.MethodDefinition, decoratorName?: string): boolean {
        if (!decoratorName) {
            return true;
        }
        if (!member.scriptFunction?.annotations) {
            return false;
        }
        return member.scriptFunction.annotations.some(
            (annotation) => annotation.expr && arkts.isIdentifier(annotation.expr) && annotation.expr.name === decoratorName
        );
    }

    private isGetMethodMatch(member: arkts.AstNode, propertyName: string): boolean {
        return arkts.isMethodDefinition(member) &&
            member.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET &&
            this.isPropertyNameMatch(member, propertyName);
    }

    private hasGetMethodWithDecorator(
        node: arkts.ClassDeclaration | arkts.StructDeclaration,
        methodName: string,
        decoratorName: string
    ): boolean {
        if (!node.definition?.body) {
            return false;
        }
        const method = node.definition.body.find(
            (member) =>
                arkts.isMethodDefinition(member) &&
                member.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET &&
                this.isPropertyNameMatch(member, methodName)
        ) as arkts.MethodDefinition | undefined;

        if (method && method.scriptFunction?.annotations) {
            const hasDecorator = method.scriptFunction.annotations.some(
                (annotation) => annotation.expr && arkts.isIdentifier(annotation.expr) && annotation.expr.name === decoratorName
            );
            if (hasDecorator) {
                return true;
            }
        }

        if (arkts.isClassDeclaration(node)) {
            const parentNode = this.getParentClass(node);
            if (parentNode) {
                return this.hasGetMethodWithDecorator(parentNode, methodName, decoratorName);
            }
        }
        return false;
    }

    private checkSegmentStateVariable(
        typeNode: arkts.AstNode,
        segment: string,
        isGetMethod: boolean,
        isClassNode: boolean,
        isStructNode: boolean
    ): boolean {
        if (isClassNode) {
            return isGetMethod
                ? this.hasGetMethodWithDecorator(typeNode as arkts.ClassDeclaration, segment, PresetDecorators.COMPUTED)
                : this.hasClassProperty(typeNode as arkts.ClassDeclaration, segment, PresetDecorators.TRACE);
        }
        if (isStructNode) {
            return isGetMethod
                ? this.hasGetMethodWithDecorator(typeNode as arkts.StructDeclaration, segment, PresetDecorators.COMPUTED)
                : this.hasClassPropertyWithRequiredDecorators(typeNode as arkts.StructDeclaration, segment, STRUCT_REQUIRED_DECORATORS);
        }
        return false;
    }

    private hasClassPropertyWithRequiredDecorators(
        node: arkts.StructDeclaration,
        propertyName: string,
        requiredDecorators: string[]
    ): boolean {
        if (!node.definition?.body) {
            return false;
        }
        for (const member of node.definition.body) {
            const result = this.checkMemberHasRequiredDecorators(member, propertyName, requiredDecorators);
            if (result !== undefined) {
                return result;
            }
        }
        return false;
    }

    private checkMemberHasRequiredDecorators(
        member: arkts.AstNode,
        propertyName: string,
        requiredDecorators: string[]
    ): boolean | undefined {
        if (arkts.isClassProperty(member) && this.isPropertyNameMatch(member, propertyName)) {
            const decorators = getClassPropertyAnnotationNames(member) || [];
            return requiredDecorators.some((d) => decorators.includes(d));
        }
        if (this.isGetMethodMatch(member, propertyName) && arkts.isMethodDefinition(member)) {
            if (!member.scriptFunction?.annotations) {
                return false;
            }
            const methodDecorators = member.scriptFunction.annotations
                .map((a) => a.expr && arkts.isIdentifier(a.expr) && a.expr.name ? a.expr.name : '')
                .filter((n) => n);
            return requiredDecorators.some((d) => methodDecorators.includes(d));
        }
        return undefined;
    }

    private isPropertyNameMatch(
        member: arkts.ClassProperty | arkts.MethodDefinition,
        propertyName: string
    ): boolean {
        if (arkts.isClassProperty(member)) {
            return !!(member.key && arkts.isIdentifier(member.key) && member.key.name === propertyName);
        }
        if (arkts.isMethodDefinition(member)) {
            return !!(member.name && arkts.isIdentifier(member.name) && member.name.name === propertyName);
        }
        return false;
    }

    private collectVariables(node: arkts.ClassDeclaration | arkts.StructDeclaration): Map<string, string[]> {
        const variableMap = new Map<string, string[]>();
        node.definition?.body.forEach((member) => {
            if (arkts.isClassProperty(member)) {
                const variableName = getClassPropertyName(member);
                if (variableName) {
                    variableMap.set(variableName, getClassPropertyAnnotationNames(member) || []);
                }
            } else if (arkts.isMethodDefinition(member) &&
                member.kind === arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET) {
                const methodId = member.scriptFunction?.id;
                if (methodId && arkts.isIdentifier(methodId) && methodId.name) {
                    const methodDecorators = member.scriptFunction.annotations
                        ?.map((e) => e.expr && arkts.isIdentifier(e.expr) && e.expr.name ? e.expr.name : '')
                        .filter((n) => n) || [];
                    variableMap.set(methodId.name, methodDecorators);
                }
            }
        });
        return variableMap;
    }

    private checkDecorator(node: arkts.ClassDeclaration | arkts.StructDeclaration, decoratorName: string): boolean {
        return node.definition?.annotations?.some(
            (annotation) => annotation.expr && arkts.isIdentifier(annotation.expr) && annotation.expr.name === decoratorName
        ) ?? false;
    }

    private isArrayType(typeNode: arkts.AstNode): boolean {
        if (arkts.isTSArrayType(typeNode)) {
            return true;
        }
        if (arkts.isETSTypeReference(typeNode)) {
            const typeName = typeNode.part?.name;
            if (typeName && arkts.isIdentifier(typeName) && typeName.name === ArrayTypes.Array) {
                return true;
            }
        }
        return false;
    }

    private isArrayIndex(segment: string): boolean {
        return /^\d+$/.test(segment);
    }

    private isMapOrSetType(typeName: string): boolean {
        return typeName === ArrayTypes.Map || typeName === ArrayTypes.Set;
    }

    private getArrayDimensionByType(typeNode: arkts.AstNode): ArrayDimension {
        if (!arkts.isTypeNode(typeNode)) {
            return { typeName: '', dimension: 0 };
        }
        let dimension = 0;
        let current: arkts.AstNode = typeNode;
        let elementTypeName = '';

        while (true) {
            if (arkts.isTSArrayType(current)) {
                dimension++;
                if (!current.elementType) {
                    break;
                }
                current = current.elementType;
            } else if (arkts.isETSTypeReference(current)) {
                const refResult = this.processTypeReferenceDimension(current as arkts.ETSTypeReference);
                dimension += refResult.dimensionDelta;
                if (refResult.nextElement) {
                    current = refResult.nextElement;
                    continue;
                }
                elementTypeName = refResult.elementTypeName;
                break;
            } else {
                elementTypeName = this.getTypeFromPropertyAnnotation(current) || '';
                break;
            }
        }

        if (dimension === 0) {
            return { typeName: '', dimension: 0 };
        }

        return { typeName: elementTypeName || ArrayTypes.Array, dimension };
    }

    private processTypeReferenceDimension(
        current: arkts.ETSTypeReference
    ): { dimensionDelta: number; nextElement: arkts.AstNode | null; elementTypeName: string } {
        const partName = current.part?.name;
        if (!partName || !arkts.isIdentifier(partName)) {
            return { dimensionDelta: 0, nextElement: null, elementTypeName: '' };
        }
        const name = partName.name;
        if (name === ArrayTypes.Array) {
            const typeArgs = current.part?.typeParams;
            if (typeArgs && typeArgs.params && typeArgs.params.length > 0) {
                return { dimensionDelta: 1, nextElement: typeArgs.params[0], elementTypeName: '' };
            }
            return { dimensionDelta: 1, nextElement: null, elementTypeName: '' };
        }
        return { dimensionDelta: 0, nextElement: null, elementTypeName: name };
    }

    private getArrayElementTypeAndDimension(
        typeAnnotation: arkts.AstNode,
        remainingSegments: string[]
    ): { elementType: arkts.AstNode | null; pathIndex: number } {
        let current: arkts.AstNode = typeAnnotation;
        let pathIndex = 0;

        for (let i = 0; i < remainingSegments.length; i++) {
            if (!this.isArrayIndex(remainingSegments[i])) {
                break;
            }
            pathIndex++;

            if (arkts.isTSArrayType(current) && current.elementType) {
                current = current.elementType;
            } else {
                break;
            }
        }

        const elementType = arkts.isTSArrayType(current) && current.elementType ? current.elementType : current;
        return { elementType, pathIndex };
    }

    private extractElementTypeNameFromArray(elementType: arkts.AstNode): string | undefined {
        let elementTypeName = this.getTypeFromPropertyAnnotation(elementType);
        if (elementTypeName === TypeFlags.Array && arkts.isTypeNode(elementType) && this.isArrayType(elementType)) {
            const arrayDimInfo = this.getArrayDimensionByType(elementType);
            elementTypeName = arrayDimInfo.typeName || TypeFlags.Array;
        }
        if (!elementTypeName && arkts.isETSTypeReference(elementType)) {
            const partName = elementType.part?.name;
            elementTypeName = partName && arkts.isIdentifier(partName) ? partName.name : undefined;
        }
        return elementTypeName;
    }
}

type ProcessArrayIndexReturn =
    | { shouldReturn: true; result: PathValidationResult }
    | { shouldReturn: false; newType: string; newIndex: number };

type ProcessPropertyAccessReturn =
    | { shouldReturn: true; result: PathValidationResult }
    | { shouldReturn: false; newType: string; newPropertyNode: arkts.ClassProperty | undefined };

export default SyncMonitorDecoratorCheckRule;
