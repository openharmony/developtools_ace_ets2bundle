/*
 * Copyright (c) 2024-2025 Huawei Device Co., Ltd.
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

import {
    global,
    KNativePointer,
    unpackNodeArray
}
 from '../../reexport-for-generated';
import {
    ClassDefinition,
    ClassProperty,
    isClassProperty,
    isTypeNode,
    TypeNode,
    MethodDefinition,
    TSInterfaceDeclaration,
    isMethodDefinition,
    isIdentifier,
} from '../../../generated';
import { Es2pandaAstNodeType } from '../../../generated/Es2pandaEnums';

/**
 * Extends ClassProperty with resolved type annotations.
 * Resolves type aliases and flattens union types via native interop.
 */
export class ClassPropertyResolver extends ClassProperty {
    private _classResolver: ClassDefinitionResolver | null = null;
    private _interfaceResolver: TSInterfaceDeclarationResolver | null = null;
    private _resolvedTypes: TypeNode[] | null = null;

    /** @internal */
    private constructor(pointer: KNativePointer) {
        super(pointer, Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_PROPERTY);
    }

    static resolve(property: ClassProperty): ClassPropertyResolver {
        return new ClassPropertyResolver(property.peer);
    }

    withClassResolver(classResolver: ClassDefinitionResolver): this {
        this._classResolver = classResolver;
        return this;
    }

    withInterfaceResolver(interfaceResolver: TSInterfaceDeclarationResolver): this {
        this._interfaceResolver = interfaceResolver;
        return this;
    }

    public get classResolver(): ClassDefinitionResolver | null {
        return this._classResolver;
    }

    public get interfaceResolver(): TSInterfaceDeclarationResolver | null {
        return this._interfaceResolver;
    }

    /** Get all resolved types (unwraps type aliases and flattens unions) */
    public get resolvedTypes(): TypeNode[] {
        if (this._resolvedTypes !== null) {
            return this._resolvedTypes;
        }

        this._resolvedTypes = [];

        // Call the native function to unwrap all types
        const typesPtr = global.es2panda._ResolveClassPropertyTypes(global.context, this.peer);
        const types = unpackNodeArray(typesPtr);

        for (const type of types) {
            if (isTypeNode(type)) {
                this._resolvedTypes.push(type);
            }
        }

        return this._resolvedTypes;
    }

}

/**
 * Extends ClassDefinition with resolved properties.
 * Collects properties from class and parent classes (child overrides parent).
 * Includes ClassProperty and getter MethodDefinition nodes via native interop.
 */
export class ClassDefinitionResolver extends ClassDefinition {
    private _propertyResolvers: (ClassPropertyResolver | MethodDefinitionResolver)[] | null = null;

    /** @internal */
    private constructor(pointer: KNativePointer) {
        super(pointer, Es2pandaAstNodeType.AST_NODE_TYPE_CLASS_DEFINITION);
    }

    static resolve(classDef: ClassDefinition): ClassDefinitionResolver {
        return new ClassDefinitionResolver(classDef.peer);
    }

    /** Get all property resolvers (child overrides parent) */
    public get propertyResolvers(): (ClassPropertyResolver | MethodDefinitionResolver)[] {
        if (this._propertyResolvers !== null) {
            return this._propertyResolvers;
        }

        this._propertyResolvers = [];

        // Call the native function to collect all properties (including from parent classes)
        const propertiesPtr = global.es2panda._ResolveClassDefinitionProperties(global.context, this.peer);
        const properties = unpackNodeArray(propertiesPtr);

        for (const prop of properties) {
            if (isClassProperty(prop)) {
                this._propertyResolvers.push(
                    ClassPropertyResolver.resolve(prop).withClassResolver(this)
                );
            } else if (isMethodDefinition(prop)) {
                this._propertyResolvers.push(
                    MethodDefinitionResolver.resolve(prop).withClassResolver(this)
                );
            }
        }

        return this._propertyResolvers;
    }

    public findPropertyResolver(name: string): ClassPropertyResolver | MethodDefinitionResolver | null {
        for (const resolver of this.propertyResolvers) {
            const key = resolver.key;
            if (key && isIdentifier(key) && key.name === name) {
                return resolver;
            }
        }
        return null;
    }
}

/**
 * Extends MethodDefinition with resolved getter return types.
 * Resolves type aliases and flattens union types via native interop.
 */
export class MethodDefinitionResolver extends MethodDefinition {
    private _classResolver: ClassDefinitionResolver | null = null;
    private _interfaceResolver: TSInterfaceDeclarationResolver | null = null;
    private _resolvedTypes: TypeNode[] | null = null;

    /** @internal */
    private constructor(pointer: KNativePointer) {
        super(pointer, Es2pandaAstNodeType.AST_NODE_TYPE_METHOD_DEFINITION);
    }

    static resolve(method: MethodDefinition): MethodDefinitionResolver {
        return new MethodDefinitionResolver(method.peer);
    }

    withClassResolver(classResolver: ClassDefinitionResolver): this {
        this._classResolver = classResolver;
        return this;
    }

    withInterfaceResolver(interfaceResolver: TSInterfaceDeclarationResolver): this {
        this._interfaceResolver = interfaceResolver;
        return this;
    }

    public get classResolver(): ClassDefinitionResolver | null {
        return this._classResolver;
    }

    public get interfaceResolver(): TSInterfaceDeclarationResolver | null {
        return this._interfaceResolver;
    }

    /** Get all resolved types from getter's return type (unwraps aliases and unions) */
    public get resolvedTypes(): TypeNode[] {
        if (this._resolvedTypes !== null) {
            return this._resolvedTypes;
        }

        this._resolvedTypes = [];

        // Call the native function to unwrap all types
        const typesPtr = global.es2panda._ResolveMethodDefinitionTypes(global.context, this.peer);
        const types = unpackNodeArray(typesPtr);

        for (const type of types) {
            if (isTypeNode(type)) {
                this._resolvedTypes.push(type);
            }
        }

        return this._resolvedTypes;
    }
}

/**
 * Extends TSInterfaceDeclaration with resolved properties.
 * Collects properties from interface and parent interfaces (child overrides parent).
 * Includes ClassProperty and getter MethodDefinition nodes via native interop.
 */
export class TSInterfaceDeclarationResolver extends TSInterfaceDeclaration {
    private _propertyResolvers: (ClassPropertyResolver | MethodDefinitionResolver)[] | null = null;

    /** @internal */
    private constructor(pointer: KNativePointer) {
        super(pointer, Es2pandaAstNodeType.AST_NODE_TYPE_TS_INTERFACE_DECLARATION);
    }

    static resolve(interfaceDecl: TSInterfaceDeclaration): TSInterfaceDeclarationResolver {
        return new TSInterfaceDeclarationResolver(interfaceDecl.peer);
    }

    /** Get all property resolvers (child overrides parent) */
    public get propertyResolvers(): (ClassPropertyResolver | MethodDefinitionResolver)[] {
        if (this._propertyResolvers !== null) {
            return this._propertyResolvers;
        }

        this._propertyResolvers = [];

        // Call the native function to collect all properties (including from parent interfaces)
        const propertiesPtr = global.es2panda._ResolveTSInterfaceDeclarationProperties(global.context, this.peer);
        const properties = unpackNodeArray(propertiesPtr);

        for (const prop of properties) {
            if (isClassProperty(prop)) {
                this._propertyResolvers.push(
                    ClassPropertyResolver.resolve(prop).withInterfaceResolver(this)
                );
            } else if (isMethodDefinition(prop)) {
                this._propertyResolvers.push(
                    MethodDefinitionResolver.resolve(prop).withInterfaceResolver(this)
                );
            }
        }

        return this._propertyResolvers;
    }

    public findPropertyResolver(name: string): ClassPropertyResolver | MethodDefinitionResolver | null {
        for (const resolver of this.propertyResolvers) {
            const key = resolver.key;
            if (key && isIdentifier(key) && key.name === name) {
                return resolver;
            }
        }
        return null;
    }
}

/**
 * Resolves array element types from T[] or Array<T> syntax.
 * Returns null if type is not an array type.
 */
export class ArrayTypeResolver extends TypeNode {
    private _resolvedElementTypes: TypeNode[];

    /** @internal */
    private constructor(resolvedElementTypes: TypeNode[], pointer: KNativePointer, nodeType: Es2pandaAstNodeType) {
        super(pointer, nodeType);
        this._resolvedElementTypes = resolvedElementTypes;
    }

    /** Returns ArrayTypeResolver with resolved element types, or null if not an array type */
    static resolve(typeNode: TypeNode): ArrayTypeResolver | null {
        const typesPtr = global.es2panda._ResolveArrayLikeType(global.context, typeNode.peer);
        const types = unpackNodeArray(typesPtr);

        if (types.length === 0) {
            return null;
        }

        const resolvedElementTypes: TypeNode[] = [];
        for (const type of types) {
            if (type !== null && isTypeNode(type)) {
                resolvedElementTypes.push(type);
            }
        }

        if (resolvedElementTypes.length === 0) {
            return null;
        }

        return new ArrayTypeResolver(resolvedElementTypes, typeNode.peer, typeNode.astNodeType);
    }

    /** Get all resolved element types (unwraps aliases and unions) */
    public get resolvedElementTypes(): TypeNode[] {
        return this._resolvedElementTypes;
    }
}
