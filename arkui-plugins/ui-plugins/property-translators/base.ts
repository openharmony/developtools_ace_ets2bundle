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
import {
    collectStateManagementTypeImport,
    createGetter,
    createSetter,
    createSetter2,
    findCachedMemoMetadata,
    generateGetOrSetCall,
    generateThisBacking,
    hasDecoratorName,
    removeDecorator,
    removeImplementProperty,
} from './utils';
import { StructInfo, ClassInfo } from '../utils';
import {
    CustomComponentNames,
    DecoratorNames,
    GetSetTypes,
    NodeCacheNames,
    ObservedNames,
    StateManagementTypes,
} from '../../common/predefines';
import { ClassScopeInfo } from '../struct-translators/utils';
import { logDiagnostic, getPropertyType } from '../interop/initstatevar';
import { getHasAnnotationObserved } from '../interop/interop';
import {
    CustomComponentInterfacePropertyInfo,
    NormalClassMethodInfo,
    NormalClassPropertyInfo,
    StructMethodInfo,
    StructPropertyInfo,
} from '../../collectors/ui-collectors/records';
import { factory } from './factory';
import { PropertyCache } from './cache/propertyCache';
import { annotation, backingField, expectName, flatVisitMethodWithOverloads } from '../../common/arkts-utils';
import { factory as UIFactory } from '../ui-factory';
import { CustomDialogControllerPropertyCache } from './cache/customDialogControllerPropertyCache';
import { PropertyFactoryCallTypeCache } from '../memo-collect-cache';

export interface BasePropertyTranslatorOptions {
    property: arkts.ClassProperty;
}

export abstract class BasePropertyTranslator {
    protected stateManagementType: StateManagementTypes | undefined;
    protected property: arkts.ClassProperty;
    protected propertyType: arkts.TypeNode | undefined;
    protected isMemoCached?: boolean;
    protected hasWatch?: boolean;
    protected makeType?: StateManagementTypes;
    protected hasInitializeStruct?: boolean;
    protected hasUpdateStruct?: boolean;
    protected hasToRecord?: boolean;
    protected hasField?: boolean;
    protected hasGetter?: boolean;
    protected hasSetter?: boolean;
    protected shouldWrapPropertyType?: boolean;

    constructor(options: BasePropertyTranslatorOptions) {
        this.property = options.property;
        this.propertyType = options.property.typeAnnotation?.clone();
        this.isMemoCached = arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).has(options.property);
    }

    abstract translateMember(): arkts.AstNode[];

    protected _checkObservedWhenInterop(
        property: arkts.ClassProperty,
        hasComponent?: boolean,
        hasComponentV2?: boolean
    ): void {
        if (!!hasComponent) {
            const isObservedV2From1_1 = getHasAnnotationObserved(property, 'ObservedV2');
            if (isObservedV2From1_1) {
                let decoratorType = 'regular';
                property?.annotations?.some((annotations) => (decoratorType = getPropertyType(annotations)));
                const errorMessage = `The type of the ${decoratorType} property can not be a class decorated with @ObservedV2 when interop`;
                logDiagnostic(errorMessage, property);
            }
        }
        if (!!hasComponentV2) {
            const isObservedFrom1_1 = getHasAnnotationObserved(property, 'Observed');
            if (isObservedFrom1_1) {
                let decoratorType = 'regular';
                property?.annotations?.some((annotations) => (decoratorType = getPropertyType(annotations)));
                const errorMessage = `The type of the ${decoratorType} property can not be a class decorated with @Observed when interop`;
                logDiagnostic(errorMessage, property);
            }
        }
    }

    protected cacheTranslatedInitializer(
        newName: string,
        originalName: string,
        metadata?: arkts.AstNodeCacheValueMetadata
    ): void {}

    protected translateWithoutInitializer(
        newName: string,
        originalName: string,
        metadata?: arkts.AstNodeCacheValueMetadata
    ): arkts.AstNode[] {
        const nodes: arkts.AstNode[] = [];
        if (this.hasField) {
            nodes.push(this.field(newName, originalName, metadata));
        }
        if (this.hasGetter) {
            nodes.push(this.getter(newName, originalName, metadata));
        }
        if (this.hasSetter) {
            nodes.push(this.setter(newName, originalName, metadata));
        }
        return nodes;
    }

    field(newName: string, originalName?: string, metadata?: arkts.AstNodeCacheValueMetadata): arkts.ClassProperty {
        const field: arkts.ClassProperty = factory.createOptionalClassProperty(
            newName,
            this.property,
            this.stateManagementType,
            arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PRIVATE
        );
        if (this.isMemoCached) {
            arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(field, metadata);
        }
        return field;
    }

    getter(newName: string, originalName: string, metadata?: arkts.AstNodeCacheValueMetadata): arkts.MethodDefinition {
        const thisValue: arkts.Expression = generateThisBacking(newName, false, true);
        const thisGet: arkts.CallExpression = generateGetOrSetCall(thisValue, GetSetTypes.GET);
        const getter: arkts.MethodDefinition = createGetter(
            originalName,
            this.propertyType,
            thisGet,
            this.isMemoCached,
            false,
            metadata
        );
        if (this.isMemoCached) {
            arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(getter, metadata);
        }
        return getter;
    }

    setter(newName: string, originalName: string, metadata?: arkts.AstNodeCacheValueMetadata): arkts.MethodDefinition {
        const thisValue: arkts.Expression = generateThisBacking(newName, false, true);
        const thisSet: arkts.ExpressionStatement = arkts.factory.createExpressionStatement(
            generateGetOrSetCall(thisValue, GetSetTypes.SET)
        );
        const setter: arkts.MethodDefinition = createSetter2(originalName, this.propertyType, thisSet);
        if (this.isMemoCached) {
            arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).collect(setter, metadata);
        }
        return setter;
    }

    initializeStruct(
        newName: string,
        originalName: string,
        metadata?: arkts.AstNodeCacheValueMetadata
    ): arkts.Statement | undefined {
        if (!this.stateManagementType || !this.makeType) {
            return undefined;
        }
        const args: arkts.Expression[] = [
            arkts.factory.create1StringLiteral(originalName),
            factory.generateInitializeValue(this.property, this.propertyType, originalName),
        ];
        if (this.hasWatch) {
            factory.addWatchFunc(args, this.property);
        }
        collectStateManagementTypeImport(this.stateManagementType);
        const assign: arkts.AssignmentExpression = arkts.factory.createAssignmentExpression(
            generateThisBacking(newName),
            arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
            factory.generateStateMgmtFactoryCall(this.makeType, this.propertyType?.clone(), args, true, metadata)
        );
        return arkts.factory.createExpressionStatement(assign);
    }

    updateStruct(
        newName: string,
        originalName: string,
        metadata?: arkts.AstNodeCacheValueMetadata
    ): arkts.Statement | undefined {
        if (!this.propertyType) {
            return undefined;
        }

        const mutableThis: arkts.Expression = generateThisBacking(newName);
        const member: arkts.MemberExpression = arkts.factory.createMemberExpression(
            arkts.factory.createTSNonNullExpression(mutableThis),
            arkts.factory.createIdentifier(StateManagementTypes.UPDATE),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        );
        const propertyType = this.propertyType.clone();
        const asExpression = arkts.factory.createTSAsExpression(
            factory.createNonNullOrOptionalMemberExpression(
                CustomComponentNames.COMPONENT_INITIALIZERS_NAME,
                originalName,
                false,
                true
            ),
            propertyType,
            false
        );
        if (this.isMemoCached) {
            PropertyFactoryCallTypeCache.getInstance().collect({ node: propertyType, metadata });
        }
        return factory.createIfInUpdateStruct(originalName, member, [asExpression]);
    }

    toRecord(originalName: string): arkts.Property {
        return arkts.Property.createProperty(
            arkts.factory.createStringLiteral(originalName),
            arkts.factory.createBinaryExpression(
                arkts.factory.createMemberExpression(
                    arkts.factory.createIdentifier('paramsCasted'),
                    arkts.factory.createIdentifier(originalName),
                    arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
                    false,
                    false
                ),
                arkts.ETSNewClassInstanceExpression.createETSNewClassInstanceExpression(
                    arkts.factory.createTypeReference(
                        arkts.factory.createTypeReferencePart(arkts.factory.createIdentifier('Object'))
                    ),
                    []
                ),
                arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_NULLISH_COALESCING
            )
        );
    }
}

export interface PropertyTranslatorOptions extends BasePropertyTranslatorOptions {
    structInfo: StructInfo;
}

export abstract class PropertyTranslator extends BasePropertyTranslator {
    protected structInfo: StructInfo;

    constructor(options: PropertyTranslatorOptions) {
        super(options);
        this.structInfo = options.structInfo;
        this.checkObservedWhenInterop(this.property, this.structInfo);
    }

    checkObservedWhenInterop(property: arkts.ClassProperty, structInfo: StructInfo): void {
        const hasComponent = !!structInfo.annotations.component;
        const hasComponentV2 = !!structInfo.annotations.componentV2;
        this._checkObservedWhenInterop(property, hasComponent, hasComponentV2);
    }

    translateMember(): arkts.AstNode[] {
        const originalName: string = expectName(this.property.key);
        const newName: string = backingField(originalName);
        const shouldWrapPropertyType =
            this.shouldWrapPropertyType || (!!this.propertyType && arkts.isETSTypeReference(this.propertyType));
        const metadata = this.isMemoCached ? findCachedMemoMetadata(this.property, shouldWrapPropertyType) : undefined;
        this.cacheTranslatedInitializer(newName, originalName, metadata);
        return this.translateWithoutInitializer(newName, originalName, metadata);
    }

    protected cacheTranslatedInitializer(
        newName: string,
        originalName: string,
        metadata?: arkts.AstNodeCacheValueMetadata
    ): void {
        const structName: string = this.structInfo.name;
        if (this.hasInitializeStruct) {
            const initializeStruct = this.initializeStruct(newName, originalName, metadata);
            if (initializeStruct) {
                PropertyCache.getInstance().collectInitializeStruct(structName, [initializeStruct]);
            }
        }
        if (this.hasUpdateStruct) {
            const updateStruct = this.updateStruct(newName, originalName, metadata);
            if (updateStruct) {
                PropertyCache.getInstance().collectUpdateStruct(structName, [updateStruct]);
            }
        }
        if (this.hasToRecord && !!this.structInfo.annotations?.reusable) {
            const toRecord = this.toRecord(originalName);
            PropertyCache.getInstance().collectToRecord(structName, [toRecord]);
        }
    }
}

export interface PropertyCachedTranslatorOptions extends BasePropertyTranslatorOptions {
    propertyInfo: StructPropertyInfo;
}

export abstract class PropertyCachedTranslator extends BasePropertyTranslator {
    protected propertyInfo: StructPropertyInfo;

    constructor(options: PropertyCachedTranslatorOptions) {
        super(options);
        this.propertyInfo = options.propertyInfo;
        this.checkObservedWhenInterop(options.property, options.propertyInfo);
        this.collectCustomDialogControllerProperty();
    }

    collectCustomDialogControllerProperty(): void {
        if (!this.propertyInfo.structInfo?.annotationInfo?.hasCustomDialog || !this.propertyInfo.structInfo?.name) {
            return;
        }
        if (!this.propertyType) {
            return;
        }
        CustomDialogControllerPropertyCache.getInstance().collect(
            this.property,
            this.propertyType,
            this.propertyInfo.structInfo.name
        );
    }

    checkObservedWhenInterop(property: arkts.ClassProperty, propertyInfo: StructPropertyInfo): void {
        const hasComponent = !!propertyInfo.structInfo?.annotationInfo?.hasComponent;
        const hasComponentV2 = !!propertyInfo.structInfo?.annotationInfo?.hasComponentV2;
        this._checkObservedWhenInterop(property, hasComponent, hasComponentV2);
    }

    translateMember(): arkts.AstNode[] {
        if (!this.propertyInfo || !this.propertyInfo.structInfo || !this.propertyInfo.name) {
            return [];
        }
        const originalName = this.propertyInfo.name;
        const newName: string = backingField(originalName);
        const shouldWrapPropertyType =
            this.shouldWrapPropertyType || (!!this.propertyType && arkts.isETSTypeReference(this.propertyType));
        const metadata = this.isMemoCached ? findCachedMemoMetadata(this.property, shouldWrapPropertyType) : undefined;
        this.cacheTranslatedInitializer(newName, originalName, metadata);
        const res = this.translateWithoutInitializer(newName, originalName, metadata);
        return res;
    }

    protected cacheTranslatedInitializer(
        newName: string,
        originalName: string,
        metadata?: arkts.AstNodeCacheValueMetadata
    ): void {
        if (!this.propertyInfo?.structInfo?.name) {
            return;
        }
        const structName: string = this.propertyInfo.structInfo.name;
        if (this.hasInitializeStruct) {
            const initializeStruct = this.initializeStruct(newName, originalName, metadata);
            if (initializeStruct) {
                PropertyCache.getInstance().collectInitializeStruct(structName, [initializeStruct]);
            }
        }
        if (this.hasUpdateStruct) {
            const updateStruct = this.updateStruct(newName, originalName, metadata);
            if (updateStruct) {
                PropertyCache.getInstance().collectUpdateStruct(structName, [updateStruct]);
            }
        }
        if (this.hasToRecord && !!this.propertyInfo.structInfo.annotationInfo?.hasReusable) {
            const toRecord = this.toRecord(originalName);
            PropertyCache.getInstance().collectToRecord(structName, [toRecord]);
        }
    }
}

export interface BaseMethodTranslatorOptions {
    method: arkts.MethodDefinition;
}

export abstract class BaseMethodTranslator {
    protected method: arkts.MethodDefinition;
    protected returnType: arkts.TypeNode | undefined;

    constructor(options: BaseMethodTranslatorOptions) {
        this.method = options.method;
        this.returnType = this.method.scriptFunction.returnTypeAnnotation?.clone();
    }

    abstract translateMember(): arkts.AstNode[];
}

export interface MethodTranslatorOptions extends BaseMethodTranslatorOptions {
    classInfo: ClassInfo;
}

export abstract class MethodTranslator extends BaseMethodTranslator {
    protected classInfo: ClassInfo;

    constructor(options: MethodTranslatorOptions) {
        super(options);
        this.classInfo = options.classInfo;
    }
}

export interface MethodCacheTranslatorOptions extends BaseMethodTranslatorOptions {
    methodInfo: StructMethodInfo | NormalClassMethodInfo;
}

export abstract class MethodCacheTranslator extends BaseMethodTranslator {
    protected methodInfo: StructMethodInfo | NormalClassMethodInfo;

    constructor(options: MethodCacheTranslatorOptions) {
        super(options);
        this.methodInfo = options.methodInfo;
    }
}

export interface BaseObservedPropertyTranslatorOptions {
    property: arkts.ClassProperty;
}

export interface IBaseObservedPropertyTranslator {
    traceDecorator?: DecoratorNames.TRACE | DecoratorNames.TRACK;
    property?: arkts.ClassProperty;
    propertyType?: arkts.TypeNode | undefined;
    propertyModifier?: arkts.Es2pandaModifierFlags;
}

export abstract class BaseObservedPropertyTranslator implements IBaseObservedPropertyTranslator {
    property: arkts.ClassProperty;
    propertyType: arkts.TypeNode | undefined;
    traceDecorator?: DecoratorNames.TRACE | DecoratorNames.TRACK;
    propertyModifier?: arkts.Es2pandaModifierFlags;
    protected hasImplement?: boolean;
    protected hasBackingField?: boolean;
    protected hasMetaField?: boolean;
    protected hasGetterSetter?: boolean;

    constructor(options: BaseObservedPropertyTranslatorOptions) {
        this.property = options.property;
        this.propertyType = options.property.typeAnnotation;
        this.hasImplement = expectName(this.property.key).startsWith(ObservedNames.PROPERTY_PREFIX);
    }

    abstract translateMember(): arkts.AstNode[];

    backingField(originalName: string, newName: string): arkts.ClassProperty {
        const backingField = arkts.factory.createClassProperty(
            arkts.factory.createIdentifier(newName),
            this.property.value,
            this.propertyType,
            this.propertyModifier ?? arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
            false
        );
        if (!this.property.value) {
            backingField.modifiers |= arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_OPTIONAL;
        }
        const annotations: arkts.AnnotationUsage[] = [...this.property.annotations];
        if (
            !hasDecoratorName(this.property, DecoratorNames.JSONSTRINGIFYIGNORE) &&
            !hasDecoratorName(this.property, DecoratorNames.JSONRENAME)
        ) {
            annotations.push(
                annotation(DecoratorNames.JSONRENAME).addProperty(
                    arkts.factory.createClassProperty(
                        arkts.factory.createIdentifier(ObservedNames.NEW_NAME),
                        arkts.factory.createStringLiteral(originalName),
                        undefined,
                        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE,
                        false
                    )
                )
            );
        }
        backingField.setAnnotations(annotations);
        removeDecorator(backingField, this.traceDecorator!);
        return backingField;
    }

    metaField(originalName: string, newName: string): arkts.ClassProperty {
        collectStateManagementTypeImport(StateManagementTypes.MUTABLE_STATE_META);
        const metaField = arkts.factory.createClassProperty(
            arkts.factory.createIdentifier(`${StateManagementTypes.META}_${originalName}`),
            factory.generateStateMgmtFactoryCall(StateManagementTypes.MAKE_MUTABLESTATE_META, undefined, [], false),
            UIFactory.createTypeReferenceFromString(StateManagementTypes.MUTABLE_STATE_META),
            this.propertyModifier ?? arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
            false
        );
        return metaField;
    }

    abstract getter(originalName: string, newName: string): arkts.MethodDefinition;

    abstract setter(originalName: string, newName: string): arkts.MethodDefinition;
}

export interface ObservedPropertyTranslatorOptions extends BaseObservedPropertyTranslatorOptions {
    classScopeInfo: ClassScopeInfo;
}

export abstract class ObservedPropertyTranslator extends BaseObservedPropertyTranslator {
    protected classScopeInfo: ClassScopeInfo;

    constructor(options: ObservedPropertyTranslatorOptions) {
        super(options);
        this.classScopeInfo = options.classScopeInfo;
    }

    translateMember(): arkts.AstNode[] {
        const originalName: string = this.hasImplement
            ? removeImplementProperty(expectName(this.property.key))
            : expectName(this.property.key);
        const newName: string = backingField(originalName);
        const fields: arkts.AstNode[] = [];
        if (this.hasBackingField) {
            fields.push(this.backingField(originalName, newName));
        }
        if (this.hasMetaField) {
            fields.push(this.metaField(originalName, newName));
        }
        if (this.hasGetterSetter) {
            this.cacheGetterSetter(originalName, newName);
        }
        return fields;
    }

    protected cacheGetterSetter(originalName: string, newName: string): void {
        const newGetter = this.getter(originalName, newName);
        const newSetter = this.setter(originalName, newName);
        if (this.hasImplement) {
            {
                const idx: number = this.classScopeInfo.getters.findIndex(
                    (getter) => getter.name.name === originalName
                );
                const originGetter: arkts.MethodDefinition = this.classScopeInfo.getters[idx];
                const originSetter: arkts.MethodDefinition = originGetter.overloads[0];
                const updateGetter: arkts.MethodDefinition = arkts.factory.updateMethodDefinition(
                    originGetter,
                    originGetter.kind,
                    newGetter.name,
                    newGetter.scriptFunction.addFlag(arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD),
                    originGetter.modifiers,
                    false
                );
                arkts.factory.updateMethodDefinition(
                    originSetter,
                    originSetter.kind,
                    newSetter.name,
                    newSetter.scriptFunction
                        .addFlag(arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_OVERLOAD)
                        .addFlag(arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_METHOD),
                    originSetter.modifiers,
                    false
                );
                this.classScopeInfo.getters[idx] = updateGetter;
            }
        } else {
            this.classScopeInfo.getters.push(...[newGetter, newSetter]);
        }
    }
}

export interface ObservedPropertyCachedTranslatorOptions extends BaseObservedPropertyTranslatorOptions {
    propertyInfo: NormalClassPropertyInfo;
}

export abstract class ObservedPropertyCachedTranslator extends BaseObservedPropertyTranslator {
    protected propertyInfo: NormalClassPropertyInfo;

    constructor(options: ObservedPropertyCachedTranslatorOptions) {
        super(options);
        this.propertyInfo = options.propertyInfo;
    }

    translateMember(): arkts.AstNode[] {
        if (!this.propertyInfo) {
            return [this.property];
        }
        const fields: arkts.AstNode[] = [];
        const name: string = this.propertyInfo.name!;
        const originalName: string = this.hasImplement ? removeImplementProperty(name) : name;
        const newName: string = backingField(originalName);
        if (this.hasBackingField) {
            fields.push(this.backingField(originalName, newName));
        }
        if (this.hasMetaField) {
            fields.push(this.metaField(originalName, newName));
        }
        if (!this.hasImplement) {
            fields.push(this.getter(originalName, newName), this.setter(originalName, newName));
        }
        return fields;
    }
}

export type InterfacePropertyTypes = arkts.MethodDefinition | arkts.ClassProperty;

export interface InterfacePropertyTranslatorOptions<T extends InterfacePropertyTypes> {
    property: T;
}

export abstract class InterfacePropertyTranslator<T extends InterfacePropertyTypes = InterfacePropertyTypes>
    implements InterfacePropertyTranslatorOptions<T>
{
    protected decorator: DecoratorNames | undefined;

    property: T;

    modified: boolean;

    constructor(options: InterfacePropertyTranslatorOptions<T>) {
        this.property = options.property;
        this.modified = false;
    }

    translateProperty(): T {
        if (arkts.isMethodDefinition(this.property)) {
            this.modified = true;
            const method = flatVisitMethodWithOverloads(
                this.property,
                this.updateStateMethodInInterface.bind(this)
            ) as T;
            return method;
        } else if (arkts.isClassProperty(this.property)) {
            this.modified = true;
            return this.updateStatePropertyInInterface(this.property) as T;
        }
        return this.property;
    }

    /**
     * Wrap getter's return type and setter's param type (expecting an union type with `T` and `undefined`)
     * to `StateManagementType<T> | undefined`.
     *
     * @param method expecting getter with decorator.
     */
    protected updateStateMethodInInterface(method: arkts.MethodDefinition): arkts.MethodDefinition {
        if (!this.decorator) {
            throw new Error('interface property does not have any decorator.');
        }
        const metadata = findCachedMemoMetadata(method);
        return factory.wrapStateManagementTypeToMethodInInterface(method, this.decorator, metadata);
    }

    /**
     * Wrap to the type of the property (expecting an union type with `T` and `undefined`)
     * to `StateManagementType<T> | undefined`.
     *
     * @param property expecting property with decorator.
     */
    protected updateStatePropertyInInterface(property: arkts.ClassProperty): arkts.ClassProperty {
        if (!this.decorator) {
            throw new Error('interface property does not have any decorator.');
        }
        return factory.wrapStateManagementTypeToPropertyInInterface(property, this.decorator);
    }

    static canBeTranslated(node: arkts.AstNode): node is InterfacePropertyTypes {
        return false;
    }
}

export interface InterfacePropertyCachedTranslatorOptions<T extends InterfacePropertyTypes>
    extends InterfacePropertyTranslatorOptions<T> {
    propertyInfo?: CustomComponentInterfacePropertyInfo;
}

export abstract class InterfacePropertyCachedTranslator<T extends InterfacePropertyTypes = InterfacePropertyTypes>
    extends InterfacePropertyTranslator<T>
    implements InterfacePropertyCachedTranslatorOptions<T>
{
    propertyInfo?: CustomComponentInterfacePropertyInfo;

    constructor(options: InterfacePropertyCachedTranslatorOptions<T>) {
        super(options);
        this.propertyInfo = options.propertyInfo;
    }

    static canBeTranslated(
        node: arkts.AstNode,
        metadata?: CustomComponentInterfacePropertyInfo
    ): node is InterfacePropertyTypes {
        return false;
    }
}
