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
import { expectNameInTypeReference, matchPrefix } from './arkts-utils';
import { ARKUI_IMPORT_PREFIX_NAMES, EXTERNAL_SOURCE_ARKTS_BUILTIN } from './predefines';

/**
 * Result for a single path segment.
 */
export interface PropertyPathSegmentResult {
    /** Property name */
    segment: string;
    /** Resolved type for this segment */
    type: arkts.TypeNode | null;
    /** Property resolver (ClassPropertyResolver or MethodDefinitionResolver, or null) */
    resolver: arkts.ClassPropertyResolver | arkts.MethodDefinitionResolver | null;
}

/**
 * Branch in property path tree. Multiple branches handle union types.
 */
export class TypePathBranch {
    private _next: PropertyPathNode | null = null;

    constructor(
        public readonly type: arkts.TypeNode | null,
        public readonly declaration: arkts.ClassDefinition | arkts.TSInterfaceDeclaration | null,
        public readonly isTerminal: boolean
    ) {}

    get next(): PropertyPathNode | null {
        return this._next;
    }

    /** @internal */
    setNext(node: PropertyPathNode | null): void {
        this._next = node;
    }

    getDeclaration(): arkts.ClassDefinition | arkts.TSInterfaceDeclaration | null {
        return this.declaration;
    }
}

/**
 * Node in property path tree.
 */
export class PropertyPathNode {
    private _branches: TypePathBranch[] = [];

    constructor(
        public readonly propertyName: string,
        public readonly property: arkts.ClassPropertyResolver | arkts.MethodDefinitionResolver | null,
        public readonly exists: boolean
    ) {
        if (!exists) {
            this._branches = [];
        }
    }

    get branches(): readonly TypePathBranch[] {
        return this._branches;
    }

    /** @internal */
    addBranch(branch: TypePathBranch): void {
        this._branches.push(branch);
    }

    hasBranches(): boolean {
        return this._branches.length > 0;
    }

    get branchCount(): number {
        return this._branches.length;
    }

    /**
     * Get all type paths to target depth. Only fully resolved paths included.
     * @internal
     */
    getAllTypePaths(targetDepth: number | undefined, currentDepth: number = 0): (arkts.TypeNode | null)[][] {
        const paths: (arkts.TypeNode | null)[][] = [];

        if (!this.exists || this._branches.length === 0) {
            return paths;
        }

        const collectPaths = (
            branch: TypePathBranch,
            currentPath: (arkts.TypeNode | null)[],
            depth: number
        ): void => {
            const newPath = [...currentPath, branch.type];
            const isAtTarget = targetDepth !== undefined && depth === targetDepth;
            const canContinue = !branch.isTerminal && branch.next;

            // If we've reached the target depth, add this path
            if (isAtTarget) {
                paths.push(newPath);
                return;
            }

            // Continue collecting if we haven't reached target and can continue
            if (canContinue) {
                for (const nextBranch of branch.next.branches) {
                    collectPaths(nextBranch, newPath, depth + 1);
                }
            }
            // If not at target and cannot continue (terminal), do not add path
        };

        for (const branch of this._branches) {
            collectPaths(branch, [], currentDepth);
        }

        return paths;
    }

    /**
     * Get all resolver paths to target depth. Only fully resolved paths included.
     * @internal
     */
    getAllResolverPaths(targetDepth: number | undefined, currentDepth: number = 0): (arkts.ClassPropertyResolver | arkts.MethodDefinitionResolver | null)[][] {
        const paths: (arkts.ClassPropertyResolver | arkts.MethodDefinitionResolver | null)[][] = [];

        if (!this.exists || this._branches.length === 0) {
            return paths;
        }

        const collectResolverPaths = (
            node: PropertyPathNode,
            branch: TypePathBranch,
            currentPath: (arkts.ClassPropertyResolver | arkts.MethodDefinitionResolver | null)[],
            depth: number
        ): void => {
            // Add the current node's property to the path
            const newPath = [...currentPath, node.property];
            const isAtTarget = targetDepth !== undefined && depth === targetDepth;
            const nextNode = branch.next;
            const canContinue = !branch.isTerminal && nextNode;

            // If we've reached the target depth, add this path
            if (isAtTarget) {
                paths.push(newPath);
                return;
            }

            // Continue collecting if we haven't reached target and can continue
            if (canContinue) {
                for (const nextBranch of nextNode.branches) {
                    collectResolverPaths(nextNode, nextBranch, newPath, depth + 1);
                }
            }
            // If not at target and cannot continue (terminal), do not add path
        };

        for (const branch of this._branches) {
            collectResolverPaths(this, branch, [], currentDepth);
        }

        return paths;
    }

    /**
     * Get all result paths to target depth. Only fully resolved paths included.
     * @internal
     */
    getAllResultPaths(targetDepth: number | undefined, currentDepth: number = 0): PropertyPathSegmentResult[][] {
        const paths: PropertyPathSegmentResult[][] = [];

        if (!this.exists || this._branches.length === 0) {
            return paths;
        }

        const collectResultPaths = (
            node: PropertyPathNode,
            branch: TypePathBranch,
            currentPath: PropertyPathSegmentResult[],
            depth: number
        ): void => {
            // Add the current node's segment result to the path
            const segmentResult: PropertyPathSegmentResult = {
                segment: node.propertyName,
                type: branch.type,
                resolver: node.property
            };
            const newPath = [...currentPath, segmentResult];
            const isAtTarget = targetDepth !== undefined && depth === targetDepth;
            const nextNode = branch.next;
            const canContinue = !branch.isTerminal && nextNode;

            // If we've reached the target depth, add this path
            if (isAtTarget) {
                paths.push(newPath);
                return;
            }

            // Continue collecting if we haven't reached target and can continue
            if (canContinue) {
                for (const nextBranch of nextNode.branches) {
                    collectResultPaths(nextNode, nextBranch, newPath, depth + 1);
                }
            }
            // If not at target and cannot continue (terminal), do not add path
        };

        for (const branch of this._branches) {
            collectResultPaths(this, branch, [], currentDepth);
        }

        return paths;
    }

    /**
     * Check if any branch can reach target depth.
     */
    canReachEnd(targetDepth: number, currentDepth: number = 0): boolean {
        if (currentDepth === targetDepth) {
            return this.exists;
        }
        for (const branch of this._branches) {
            if (!branch.isTerminal && branch.next) {
                if (branch.next.canReachEnd(targetDepth, currentDepth + 1)) {
                    return true;
                }
            }
        }
        return false;
    }

    toString(indent: string = ''): string {
        return PropertyPathFormatter.formatNode(this, indent);
    }
}

export interface PropertyPathOptions {
    /** Enable wildcard segment handling (*) for array/map/set/class types (excludes primitives) */
    enableWildcard?: boolean;
}

/** Formatter for property path tree string representations. */
class PropertyPathFormatter {
    private static readonly NOT_FOUND_LABEL = ': [NOT FOUND]';
    private static readonly FOUND_LABEL = ': [FOUND]';
    private static readonly BRANCHES_LABEL = ' branch(es)';
    private static readonly PRIMITIVE_TYPE_LABEL = 'Primitive/Non-class';
    private static readonly CLASS_TYPE_LABEL = 'Class: ';
    private static readonly INTERFACE_TYPE_LABEL = 'Interface: ';
    private static readonly UNKNOWN_TYPE_LABEL = '<unknown>';
    private static readonly BRANCH_PREFIX = '  └─ Branch: ';
    private static readonly TERMINAL_SUFFIX = ' [TERMINAL]';
    private static readonly INDENT_STEP = '    ';
    private static readonly RESULT_PREFIX = 'PropertyPathResult (segments: ';
    private static readonly SEGMENTS_LABEL = ', fullyResolved: ';
    private static readonly POSSIBLY_RESOLVED_LABEL = ', possiblyResolved: ';
    private static readonly RESULT_SUFFIX = ')';

    static formatNode(node: PropertyPathNode, indent: string = ''): string {
        if (!node.exists) {
            return `${indent}${node.propertyName}${PropertyPathFormatter.NOT_FOUND_LABEL}\n`;
        }

        let result = `${indent}${node.propertyName}${PropertyPathFormatter.FOUND_LABEL} (${node.branchCount}${PropertyPathFormatter.BRANCHES_LABEL})\n`;

        for (const branch of node.branches) {
            const typeInfo = PropertyPathFormatter.getTypeInfo(branch);
            result += `${indent}${PropertyPathFormatter.BRANCH_PREFIX}${typeInfo}`;

            if (branch.isTerminal) {
                result += `${PropertyPathFormatter.TERMINAL_SUFFIX}\n`;
            } else if (branch.next) {
                result += '\n' + PropertyPathFormatter.formatNode(branch.next, indent + PropertyPathFormatter.INDENT_STEP);
            } else {
                result += '\n';
            }
        }

        return result;
    }

    private static getTypeInfo(branch: TypePathBranch): string {
        // If we have a declaration, use it to get the type info
        if (branch.declaration) {
            if (arkts.isClassDefinition(branch.declaration)) {
                const ident = branch.declaration.ident;
                const name = arkts.isIdentifier(ident) ? ident.name : PropertyPathFormatter.UNKNOWN_TYPE_LABEL;
                return `${PropertyPathFormatter.CLASS_TYPE_LABEL}${name}`;
            }

            if (arkts.isTSInterfaceDeclaration(branch.declaration)) {
                const id = branch.declaration.id;
                const name = arkts.isIdentifier(id) ? id.name : PropertyPathFormatter.UNKNOWN_TYPE_LABEL;
                return `${PropertyPathFormatter.INTERFACE_TYPE_LABEL}${name}`;
            }
        }

        // If we don't have a declaration but have a type, try to show the type name
        if (branch.type && arkts.isETSTypeReference(branch.type)) {
            const baseName = branch.type.baseName;
            if (baseName && arkts.isIdentifier(baseName)) {
                return `Type: ${baseName.name}`;
            }
        }

        return PropertyPathFormatter.PRIMITIVE_TYPE_LABEL;
    }

    static formatResult(result: PropertyPathResult): string {
        const possiblyResolvedPart = result.possiblyResolved ?
            `${PropertyPathFormatter.POSSIBLY_RESOLVED_LABEL}${result.possiblyResolved}` : '';
        return `${PropertyPathFormatter.RESULT_PREFIX}${result.segmentCount}${PropertyPathFormatter.SEGMENTS_LABEL}${result.fullyResolved}${possiblyResolvedPart}${PropertyPathFormatter.RESULT_SUFFIX}\n` +
               PropertyPathFormatter.formatNode(result.root);
    }
}

/**
 * Result of property path resolution.
 */
export class PropertyPathResult {
    private _root: PropertyPathNode;
    private _possiblyResolved: boolean = false;

    /** @internal */
    constructor(root: PropertyPathNode, public readonly segmentCount: number) {
        this._root = root;
    }

    get root(): PropertyPathNode {
        return this._root;
    }

    /** @internal */
    setPossiblyResolved(value: boolean): void {
        this._possiblyResolved = value;
    }

    /** True for extended Array type paths where element type resolution is uncertain */
    get possiblyResolved(): boolean {
        return this._possiblyResolved;
    }

    get fullyResolved(): boolean {
        if (this.segmentCount === 0) {
            return false;
        }
        if (this.segmentCount === 1) {
            return this._root.exists;
        }
        return this._root.canReachEnd(this.segmentCount - 1);
    }

    /** Get all type paths from root to leaf (fully resolved paths only) */
    getAllTypePaths(): (arkts.TypeNode | null)[][] {
        return this._root.getAllTypePaths(this.segmentCount - 1);
    }

    /** Get all resolver paths from root to leaf (fully resolved paths only) */
    getAllResolverPaths(): (arkts.ClassPropertyResolver | arkts.MethodDefinitionResolver | null)[][] {
        return this._root.getAllResolverPaths(this.segmentCount - 1);
    }

    /** Get all result paths from root to leaf (fully resolved paths only) */
    getAllResultPaths(): PropertyPathSegmentResult[][] {
        return this._root.getAllResultPaths(this.segmentCount - 1);
    }

    toString(): string {
        return PropertyPathFormatter.formatResult(this);
    }
}

interface NextSegmentContext {
    type: arkts.TypeNode;
    pathSegments: string[];
    segmentIndex: number;
    currentNode: PropertyPathNode;
    isLastSegment: boolean;
}

interface HandleResult {
    handled: boolean;
    branch: TypePathBranch | null;
}

interface NextSegmentHandler {
    canHandle(context: NextSegmentContext, nextSegment: string | undefined): boolean;
    handle(context: NextSegmentContext, builder: PropertyPathTreeBuilder): HandleResult;
}

/** Handles numeric array index segments (e.g., "items.0.name") */
export class ArrayIndexSegmentHandler implements NextSegmentHandler {
    private static readonly NUMERIC_SEGMENT_PATTERN = /^\d+$/;

    canHandle(context: NextSegmentContext, nextSegment: string | undefined): boolean {
        // Only handle if the next segment is numeric AND the current type is an array type
        if (nextSegment === undefined || !ArrayIndexSegmentHandler.isNumericSegment(nextSegment)) {
            return false;
        }
        // First, check if it's a direct array type (T[] or Array<T>) - original handling
        const testResolver = arkts.ArrayTypeResolver.resolve(context.type);
        if (testResolver !== null) {
            return true;
        }
        // NEW: Also check if it's a class that extends Array
        return extendsArrayType(context.type);
    }

    handle(context: NextSegmentContext, builder: PropertyPathTreeBuilder): HandleResult {
        const { type, pathSegments, segmentIndex } = context;

        // Build the array index node - this will create branches for each element type
        const arrayIndexNode = builder.buildArrayElementNode(
            type,
            pathSegments,
            segmentIndex + 1
        );

        // Add a branch from current node to the array index node
        // This branch represents "accessing the array at index"
        const branch = new TypePathBranch(type, null, false);
        branch.setNext(arrayIndexNode);

        return { handled: true, branch };
    }

    static isNumericSegment(segment: string): boolean {
        return ArrayIndexSegmentHandler.NUMERIC_SEGMENT_PATTERN.test(segment);
    }
}

/** Handles "length" property on array types (e.g., "items.length") */
export class ArrayLengthSegmentHandler implements NextSegmentHandler {
    private static readonly LENGTH_PROPERTY = 'length';

    canHandle(context: NextSegmentContext, nextSegment: string | undefined): boolean {
        // Only handle if the next segment is "length" AND the current type is an array type
        if (nextSegment !== ArrayLengthSegmentHandler.LENGTH_PROPERTY) {
            return false;
        }
        // First, check if it's a direct array type (T[] or Array<T>) - original handling
        const testResolver = arkts.ArrayTypeResolver.resolve(context.type);
        if (testResolver !== null) {
            return true;
        }
        // NEW: Also check if it's a class that extends Array
        return extendsArrayType(context.type);
    }

    handle(context: NextSegmentContext, builder: PropertyPathTreeBuilder): HandleResult {
        const { type, pathSegments, segmentIndex } = context;

        // Build the length node - this represents the "length" property access
        const lengthNode = builder.buildLengthNode(type, pathSegments, segmentIndex + 1);

        // Add a branch from current node to the length node
        // This branch represents "accessing the length property of the array"
        const branch = new TypePathBranch(type, null, false);
        branch.setNext(lengthNode);

        return { handled: true, branch };
    }
}

/** Handles "size" property on Set/Map types (e.g., "items.size") */
export class CollectionSizeSegmentHandler implements NextSegmentHandler {
    private static readonly SIZE_PROPERTY = 'size';
    private static readonly SIZE_COLLECTION_TYPES = ['Set', 'Map'];

    canHandle(context: NextSegmentContext, nextSegment: string | undefined): boolean {
        // Only handle if the next segment is "size"
        if (nextSegment !== CollectionSizeSegmentHandler.SIZE_PROPERTY) {
            return false;
        }
        // First, check if the type is an ETSTypeReference with name "Set" or "Map" - original handling
        if (arkts.isETSTypeReference(context.type)) {
            const baseName = context.type.baseName;
            if (arkts.isIdentifier(baseName)) {
                if (CollectionSizeSegmentHandler.SIZE_COLLECTION_TYPES.includes(baseName.name)) {
                    return true;
                }
            }
        }
        // NEW: Also check if it's a class that extends Set or Map
        return CollectionSizeSegmentHandler.SIZE_COLLECTION_TYPES.some(collectionType =>
            extendsCollectionType(context.type, collectionType as 'Set' | 'Map')
        );
    }

    handle(context: NextSegmentContext, builder: PropertyPathTreeBuilder): HandleResult {
        const { type, pathSegments, segmentIndex } = context;

        // Build the size node - this represents the "size" property access
        const sizeNode = builder.buildSizeNode(type, pathSegments, segmentIndex + 1);

        // Add a branch from current node to the size node
        // This branch represents "accessing the size property of the collection"
        const branch = new TypePathBranch(type, null, false);
        branch.setNext(sizeNode);

        return { handled: true, branch };
    }
}

function findSuperClassFromArkUI(type: arkts.Expression): boolean {
    if (!arkts.isETSTypeReference(type)) {
        return false;
    }
    const nameNode = expectNameInTypeReference(type);
    const decl = nameNode ? arkts.getPeerIdentifierDecl(nameNode.peer) : undefined;
    const moduleName = decl ? arkts.getProgramFromAstNode(decl)?.moduleName : undefined;
    return !!moduleName && matchPrefix(ARKUI_IMPORT_PREFIX_NAMES, moduleName);
}

/**
 * Extract element types from a class extending Array<T> or ObservedArray<T>.
 * First tries ObservedArray superClass, then falls back to Array.
 */
function getArrayElementTypesFromExtendingClass(type: arkts.TypeNode): arkts.TypeNode[] {
    // Check if it's an ETSTypeReference to a class that extends an array-like type
    if (!arkts.isETSTypeReference(type)) {
        return [];
    }

    const baseName = type.baseName;
    if (!baseName || !arkts.isIdentifier(baseName)) {
        return [];
    }

    // Get the ClassDefinition from the type
    const decl = arkts.getPeerIdentifierDecl(baseName.peer);
    if (!decl || !arkts.isClassDefinition(decl)) {
        return [];
    }

    // First, try to find ObservedArray superClass
    // This handles cases like "class A extends ObservedArray<Person>"
    // If we find ObservedArray first, we stop there instead of continuing to Array
    let superClass = arkts.findSuperClassByName(decl, 'ObservedArray');
    if (!superClass || !arkts.isETSTypeReference(superClass) || !findSuperClassFromArkUI(superClass)) {
        // If not found, try to find Array superClass
        // This handles cases like "class A extends Array<Person>"
        superClass = arkts.findSuperClassByName(decl, 'Array');
    } else {
        superClass = arkts.factory.createETSTypeReference(
            arkts.factory.createETSTypeReferencePart(
                arkts.factory.createIdentifier('Array'), 
                superClass.part?.typeParams?.clone()
            )
        );
    }

    if (!superClass || !arkts.isETSTypeReference(superClass)) {
        return [];
    }

    // Use ArrayTypeResolver to resolve element types from the found superClass
    // For ObservedArray<Person>, this returns Person as the element type
    // For Array<Person>, this also returns Person as the element type
    const resolver = arkts.ArrayTypeResolver.resolve(superClass);
    if (resolver) {
        return resolver.resolvedElementTypes;
    }

    return [];
}

/** Check if type extends Array (excluding direct Array types) */
function extendsArrayType(type: arkts.TypeNode): boolean {
    const elementTypes = getArrayElementTypesFromExtendingClass(type);
    return elementTypes.length > 0;
}

/** Check if type extends Set or Map (excluding direct types) */
function extendsCollectionType(type: arkts.TypeNode, collectionName: 'Set' | 'Map'): boolean {
    if (arkts.isETSTypeReference(type)) {
        const baseName = type.baseName;
        if (arkts.isIdentifier(baseName)) {
            const decl = arkts.getPeerIdentifierDecl(baseName.peer);
            if (decl && arkts.isClassDefinition(decl)) {
                const superClass = arkts.findSuperClassByName(decl, collectionName);
                return superClass !== null;
            }
        }
    }
    return false;
}

/** Handles wildcard segments ("*") for array/map/set/class types (excludes primitives) */
class WildcardSegmentHandler implements NextSegmentHandler {
    private static readonly WILDCARD_SYMBOL = '*';
    private static readonly MINIMUM_PATH_LENGTH = 2;
    private static readonly WILDCARD_COLLECTION_TYPES = ['Array', 'Map', 'Set'];

    canHandle(context: NextSegmentContext, nextSegment: string | undefined): boolean {
        // Only handle if the next segment is "*"
        if (nextSegment !== WildcardSegmentHandler.WILDCARD_SYMBOL) {
            return false;
        }
        // Can only be used if the next segment (*) is the last segment
        const nextSegmentIndex = context.segmentIndex + 1;
        const isNextSegmentLast = nextSegmentIndex === context.pathSegments.length - 1;
        if (!isNextSegmentLast) {
            return false;
        }
        // Cannot be used standalone (path must have more than one segment)
        if (context.pathSegments.length < WildcardSegmentHandler.MINIMUM_PATH_LENGTH) {
            return false;
        }
        // Check if the type is a non-primitive type that we support
        return this.isSupportedType(context.type);
    }

    /** Check if type is supported for wildcard matching (array/map/set/class/interface, excludes primitives) */
    private isSupportedType(type: arkts.TypeNode): boolean {
        // Check for array type (using ArrayTypeResolver)
        if (arkts.ArrayTypeResolver.resolve(type) !== null) {
            return true;
        }

        // Check for ETSTypeReference to Array, Map, Set, or class/interface type (non-primitive ETSTypeReference)
        if (arkts.isETSTypeReference(type)) {
            const baseName = type.baseName;
            if (arkts.isIdentifier(baseName)) {
                return WildcardSegmentHandler.WILDCARD_COLLECTION_TYPES.includes(baseName.name) || 
                    this.getClassDefinitionFromType(type) !== null;
            }
        }

        return false;
    }

    private getClassDefinitionFromType(type: arkts.TypeNode): arkts.ClassDefinition | arkts.TSInterfaceDeclaration | null {
        if (!arkts.isETSTypeReference(type)) {
            return null;
        }

        const baseName = type.baseName;
        if (!arkts.isIdentifier(baseName)) {
            return null;
        }

        const decl = arkts.getPeerIdentifierDecl(baseName.peer);
        if (!decl) {
            return null;
        }

        if (arkts.isClassDefinition(decl)) {
            return decl;
        }

        if (arkts.isTSInterfaceDeclaration(decl)) {
            return decl;
        }

        return null;
    }

    handle(context: NextSegmentContext, builder: PropertyPathTreeBuilder): HandleResult {
        const { type, pathSegments, segmentIndex } = context;

        // Build the wildcard node - this represents the wildcard segment access
        const wildcardNode = builder.buildWildcardNode(type, pathSegments, segmentIndex + 1);

        // Add a branch from current node to the wildcard node
        // This branch represents "accessing the wildcard segment"
        const branch = new TypePathBranch(type, null, false);
        branch.setNext(wildcardNode);

        return { handled: true, branch };
    }
}

/** Default handler for normal property access (e.g., "a.b.c") */
export class DefaultPropertyHandler implements NextSegmentHandler {
    canHandle(_context: NextSegmentContext, _nextSegment: string | undefined): boolean {
        // This handler always matches as a fallback
        return true;
    }

    handle(context: NextSegmentContext, builder: PropertyPathTreeBuilder): HandleResult {
        const { type, pathSegments, segmentIndex, isLastSegment } = context;

        // Normal property access
        const nextDeclaration = PropertyPathTreeBuilder.getClassDefinitionFromType(type);
        // Builtin types (String, Number, Boolean, etc.) should be treated as terminal
        const isTerminal = !nextDeclaration || isLastSegment || PropertyPathTreeBuilder.isPrimitiveWrapperClass(nextDeclaration);
        const branch = new TypePathBranch(type, nextDeclaration, isTerminal);

        // Continue building if not terminal
        if (!isTerminal && nextDeclaration) {
            branch.setNext(builder.buildNode(nextDeclaration, pathSegments, segmentIndex + 1));
        }

        return { handled: true, branch };
    }
}

/** Builder for constructing property path trees */
export class PropertyPathTreeBuilder {
    private static readonly PATH_SEPARATOR = '.';
    private static readonly MINIMUM_SEGMENT_LENGTH = 1;
    private static readonly EMPTY_PROPERTY_NAME = '';
    private segmentHandlers: NextSegmentHandler[] = [];
    private options: PropertyPathOptions;
    private hasExtendedArrayType: boolean = false;

    constructor(options: PropertyPathOptions = {}) {
        this.options = options;
        this.registerHandlers();
    }

    /** @private */
    private registerHandlers(): void {
        this.segmentHandlers = [
            new ArrayIndexSegmentHandler(),
            new ArrayLengthSegmentHandler(),
            new CollectionSizeSegmentHandler(),
        ];

        // Add wildcard handler if enabled
        if (this.options.enableWildcard) {
            this.segmentHandlers.push(new WildcardSegmentHandler());
        }

        // Default handler must be last (fallback)
        this.segmentHandlers.push(new DefaultPropertyHandler());
    }

    /** @internal */
    private findProperty(
        classDef: arkts.ClassDefinition,
        name: string
    ): arkts.ClassPropertyResolver | arkts.MethodDefinitionResolver | null {
        const resolver = arkts.ClassDefinitionResolver.resolve(classDef);
        return resolver.findPropertyResolver(name);
    }

    /** @internal */
    private findPropertyInInterface(
        interfaceDecl: arkts.TSInterfaceDeclaration,
        name: string
    ): arkts.ClassPropertyResolver | arkts.MethodDefinitionResolver | null {
        const resolver = arkts.TSInterfaceDeclarationResolver.resolve(interfaceDecl);
        return resolver.findPropertyResolver(name);
    }

    /** @internal */
    private findPropertyInDeclaration(
        declaration: arkts.ClassDefinition | arkts.TSInterfaceDeclaration,
        name: string
    ): arkts.ClassPropertyResolver | arkts.MethodDefinitionResolver | null {
        if (arkts.isClassDefinition(declaration)) {
            return this.findProperty(declaration, name);
        } else if (arkts.isTSInterfaceDeclaration(declaration)) {
            return this.findPropertyInInterface(declaration, name);
        }
        return null;
    }

    /** @internal */
    private getResolvedTypes(property: arkts.ClassPropertyResolver | arkts.MethodDefinitionResolver): arkts.TypeNode[] {
        return property.resolvedTypes;
    }

    /**
     * Get ClassDefinition or TSInterfaceDeclaration from a TypeNode.
     * @internal
     */
    static getClassDefinitionFromType(type: arkts.TypeNode): arkts.ClassDefinition | arkts.TSInterfaceDeclaration | null {
        // If not an ETSTypeReference, it's a primitive type or other non-reference type
        if (!arkts.isETSTypeReference(type)) {
            return null;
        }

        // ETSTypeReference - resolve to its declaration
        // Note: resolvedTypes already unwraps type aliases, so we just need to get the declaration
        const baseName = type.baseName;
        if (!arkts.isIdentifier(baseName)) {
            return null;
        }

        const decl = arkts.getPeerIdentifierDecl(baseName.peer);
        if (!decl) {
            return null;
        }

        // Check if it's a ClassDefinition
        if (arkts.isClassDefinition(decl)) {
            return decl;
        }

        // Check if it's a TSInterfaceDeclaration
        if (arkts.isTSInterfaceDeclaration(decl)) {
            return decl;
        }

        // For other declaration types (type aliases, enums, etc.), return null
        return null;
    }

    /**
     * Check if declaration is from ArkTS builtin module (String, Number, Boolean, etc.).
     * @internal
     */
    static isPrimitiveWrapperClass(declaration: arkts.ClassDefinition | arkts.TSInterfaceDeclaration | null): boolean {
        if (!declaration) {
            return false;
        }
        const moduleName = arkts.getProgramFromAstNode(declaration)?.moduleName;
        return !!moduleName && matchPrefix(EXTERNAL_SOURCE_ARKTS_BUILTIN, moduleName);
    }

    /** @internal */
    static isArrayType(type: arkts.TypeNode): boolean {
        const resolver = arkts.ArrayTypeResolver.resolve(type);
        return resolver !== null;
    }

    /**
     * Resolve array element types (direct T[]/Array<T>, ObservedArray<T>, or classes extending them).
     * @internal
     */
    static resolveArrayElementTypes(type: arkts.TypeNode): arkts.TypeNode[] {
        // First, check if it's a direct ObservedArray<T> type reference
        // For ObservedArray<Person>, we need to extract Person directly without traversing up to Array<T>
        const observedArrayElementTypes = PropertyPathTreeBuilder.extractElementTypesFromObservedArray(type);
        if (observedArrayElementTypes.length > 0) {
            return observedArrayElementTypes;
        }

        // Then, try the direct array type resolver (for T[] or Array<T>)
        const resolver = arkts.ArrayTypeResolver.resolve(type);
        if (resolver) {
            return resolver.resolvedElementTypes;
        }

        // Check if it's a class that extends Array/ObservedArray
        return getArrayElementTypesFromExtendingClass(type);
    }

    /**
     * Extract element types from direct ObservedArray<T> type reference.
     * Prevents ArrayTypeResolver from traversing up to Array<T>.
     * @internal
     */
    private static extractElementTypesFromObservedArray(type: arkts.TypeNode): arkts.TypeNode[] {
        if (!arkts.isETSTypeReference(type)) {
            return [];
        }

        const baseName = type.baseName;
        if (!baseName || !arkts.isIdentifier(baseName) || baseName.name !== 'ObservedArray') {
            return [];
        }

        const part = type.part;
        if (!part || !part.typeParams || !part.typeParams.params || part.typeParams.params.length === 0) {
            return [];
        }

        return [part.typeParams.params[0]];
    }

    /**
     * Check if element types came from an extended Array class (not direct Array type).
     * @internal
     */
    static isExtendedArrayType(type: arkts.TypeNode): boolean {
        const resolver = arkts.ArrayTypeResolver.resolve(type);
        if (resolver) {
            return false; // Direct array type
        }

        const elementTypes = getArrayElementTypesFromExtendingClass(type);
        return elementTypes.length > 0;
    }

    /**
     * Build node for array element access (e.g., "a.0.b").
     * @internal
     */
    buildArrayElementNode(
        type: arkts.TypeNode,
        pathSegments: string[],
        segmentIndex: number
    ): PropertyPathNode {
        const arrayIndex = pathSegments[segmentIndex];

        // Use the unified resolution logic that handles ObservedArray correctly
        let elementTypes: arkts.TypeNode[];
        let isExtendedArray = false;

        // First, check if it's a direct ObservedArray<T> type reference
        const observedArrayElementTypes = PropertyPathTreeBuilder.extractElementTypesFromObservedArray(type);
        if (observedArrayElementTypes.length > 0) {
            elementTypes = observedArrayElementTypes;
            // ObservedArray is treated like an extended array for tracking purposes
            isExtendedArray = true;
        } else {
            // Check if it's a direct array type (T[] or Array<T>)
            const directResolver = arkts.ArrayTypeResolver.resolve(type);
            if (directResolver) {
                elementTypes = directResolver.resolvedElementTypes;
            } else {
                // Not a direct array type - check if it's a class extending Array/ObservedArray
                elementTypes = getArrayElementTypesFromExtendingClass(type);
                isExtendedArray = elementTypes.length > 0;
            }
        }

        // Mark the result as "possibly resolved" if we used an extended Array type
        if (isExtendedArray) {
            this.hasExtendedArrayType = true;
        }

        if (elementTypes.length === 0) {
            // Not an array type - return non-existent node
            return new PropertyPathNode(arrayIndex, null, false);
        }

        // Create node for array element access
        const node = new PropertyPathNode(arrayIndex, null, true);
        const isLastSegment = segmentIndex === pathSegments.length - 1;

        // Create a branch for each resolved element type
        for (const elementType of elementTypes) {
            // Get the declaration for the element type
            const nextDeclaration = PropertyPathTreeBuilder.getClassDefinitionFromType(elementType);

            // For multi-dimensional array support: check if the element type is itself an array type
            // If there's a next segment that is numeric, and the element type is an array,
            // we should continue processing rather than marking it as terminal.
            const nextSegment = isLastSegment ? undefined : pathSegments[segmentIndex + 1];
            const isNextSegmentNumeric = nextSegment !== undefined && ArrayIndexSegmentHandler.isNumericSegment(nextSegment);
            const isElementArrayType = PropertyPathTreeBuilder.isArrayType(elementType);

            // Builtin types (String, Number, Boolean, etc.) should be treated as terminal
            // But if the element type is an array and the next segment is numeric, we need to continue
            const isTerminal: boolean = (!nextDeclaration && !isElementArrayType) ||
                (isLastSegment && !isNextSegmentNumeric) ||
                (!!nextDeclaration && !isElementArrayType && PropertyPathTreeBuilder.isPrimitiveWrapperClass(nextDeclaration));

            const branch = new TypePathBranch(elementType, nextDeclaration, isTerminal);
            node.addBranch(branch);

            // Continue building if not terminal
            // For multi-dimensional array support: if element type is an array and next segment is numeric,
            // continue with buildArrayElementNode to handle the next array index access.
            if (!isTerminal) {
                if (isElementArrayType && isNextSegmentNumeric) {
                    // Multi-dimensional array: continue processing the next array index
                    branch.setNext(this.buildArrayElementNode(elementType, pathSegments, segmentIndex + 1));
                } else if (nextDeclaration) {
                    // Normal property access on the element type
                    branch.setNext(this.buildNode(nextDeclaration, pathSegments, segmentIndex + 1));
                }
            }
        }

        // For extended array types: if we have branches but none can continue (e.g., no declaration found),
        // create placeholder nodes with null types for remaining segments
        // This allows the path to be marked as fullyResolved even when types can't be resolved
        if (isExtendedArray && node.branchCount > 0 && !isLastSegment) {
            // Check if any branch can continue - if not, add placeholder branches
            let canContinue = false;
            for (const branch of node.branches) {
                if (!branch.isTerminal && branch.next) {
                    canContinue = true;
                    break;
                }
            }

            if (!canContinue) {
                // Create a placeholder branch with null type that continues with placeholder nodes
                const placeholderBranch = new TypePathBranch(null, null, false);
                placeholderBranch.setNext(this.createPlaceholderNodes(pathSegments, segmentIndex + 1));
                node.addBranch(placeholderBranch);
            }
        }

        return node;
    }

    /**
     * Create placeholder nodes for remaining segments when element type can't be resolved.
     * @internal
     */
    private createPlaceholderNodes(pathSegments: string[], startIndex: number): PropertyPathNode {
        const segmentName = pathSegments[startIndex];
        const isLast = startIndex === pathSegments.length - 1;

        const node = new PropertyPathNode(segmentName, null, true);
        const branch = new TypePathBranch(null, null, isLast);
        node.addBranch(branch);

        if (!isLast) {
            branch.setNext(this.createPlaceholderNodes(pathSegments, startIndex + 1));
        }

        return node;
    }

    /**
     * Build node for 'length' property (e.g., "a.length").
     * @internal
     */
    buildLengthNode(
        _type: arkts.TypeNode,
        pathSegments: string[],
        segmentIndex: number
    ): PropertyPathNode {
        const lengthName = pathSegments[segmentIndex];
        const node = new PropertyPathNode(lengthName, null, true);
        const branch = new TypePathBranch(null, null, true); // length is terminal (number)
        node.addBranch(branch);
        return node;
    }

    /**
     * Build node for 'size' property (e.g., "a.size").
     * @internal
     */
    buildSizeNode(
        _type: arkts.TypeNode,
        pathSegments: string[],
        segmentIndex: number
    ): PropertyPathNode {
        const sizeName = pathSegments[segmentIndex];
        const node = new PropertyPathNode(sizeName, null, true);
        const branch = new TypePathBranch(null, null, true); // size is terminal (number)
        node.addBranch(branch);
        return node;
    }

    /**
     * Build node for wildcard segment "*" (e.g., "a.*").
     * @internal
     */
    buildWildcardNode(
        type: arkts.TypeNode,
        pathSegments: string[],
        segmentIndex: number
    ): PropertyPathNode {
        const wildcardName = pathSegments[segmentIndex];
        const isLastSegment = segmentIndex === pathSegments.length - 1;

        // For all supported types (array, set, map, class, interface), the wildcard represents the type itself
        // Get the declaration for the type
        const declaration = PropertyPathTreeBuilder.getClassDefinitionFromType(type);

        // Create a node for the wildcard segment
        // The wildcard itself doesn't have a type, so we use null
        const node = new PropertyPathNode(wildcardName, null, true);
        // Builtin types (String, Number, Boolean, etc.) should be treated as terminal
        const isTerminal = isLastSegment || PropertyPathTreeBuilder.isPrimitiveWrapperClass(declaration);
        const branch = new TypePathBranch(null, declaration, isTerminal);
        node.addBranch(branch);

        // Continue building if not terminal and we have a declaration
        if (!isTerminal && declaration) {
            branch.setNext(this.buildNode(declaration, pathSegments, segmentIndex + 1));
        }

        return node;
    }

    /**
     * Build tree recursively using handler chain.
     * @internal
     */
    buildNode(
        declaration: arkts.ClassDefinition | arkts.TSInterfaceDeclaration,
        pathSegments: string[],
        segmentIndex: number
    ): PropertyPathNode {
        const propertyName = pathSegments[segmentIndex];
        const property = this.findPropertyInDeclaration(declaration, propertyName);
        const isLastSegment = segmentIndex === pathSegments.length - 1;

        if (!property) {
            return new PropertyPathNode(propertyName, null, false);
        }

        const node = new PropertyPathNode(propertyName, property, true);

        // Get resolved types from the property resolver
        const resolvedTypes = this.getResolvedTypes(property);

        // Get the next segment (if any)
        const nextSegment = isLastSegment ? undefined : pathSegments[segmentIndex + 1];

        // Process each type through the handler chain
        for (const type of resolvedTypes) {
            const context: NextSegmentContext = {
                type,
                pathSegments,
                segmentIndex,
                currentNode: node,
                isLastSegment
            };

            // Find a handler that can process this type with the next segment
            for (const handler of this.segmentHandlers) {
                if (handler.canHandle(context, nextSegment)) {
                    const result = handler.handle(context, this);
                    if (result.handled && result.branch) {
                        node.addBranch(result.branch);
                    }
                    break;
                }
            }
        }

        return node;
    }

    /**
     * Build property path tree from class definition and path string.
     */
    build(
        classDef: arkts.ClassDefinition,
        path: string
    ): PropertyPathResult {
        const segments = path.split(PropertyPathTreeBuilder.PATH_SEPARATOR).filter(s => s.length >= PropertyPathTreeBuilder.MINIMUM_SEGMENT_LENGTH);

        if (segments.length === 0) {
            return new PropertyPathResult(
                new PropertyPathNode(PropertyPathTreeBuilder.EMPTY_PROPERTY_NAME, null, false),
                0
            );
        }

        this.hasExtendedArrayType = false;

        const root = this.buildNode(classDef, segments, 0);
        const result = new PropertyPathResult(root, segments.length);

        if (this.hasExtendedArrayType) {
            result.setPossiblyResolved(true);
        }

        return result;
    }
}

/**
 * Resolve property path like "a.b.c" into tree structure.
 * Handles union types by creating multiple branches.
 */
export function resolvePropertyPath(
    classDef: arkts.ClassDefinition,
    path: string,
    options?: PropertyPathOptions
): PropertyPathResult {
    const builder = new PropertyPathTreeBuilder(options);
    return builder.build(classDef, path);
}
