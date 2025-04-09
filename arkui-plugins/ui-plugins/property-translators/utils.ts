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
import { DeclarationCollector } from '../../common/declaration-collector';
import { ImportCollector } from '../import-collector';
import { ARKUI_COMPONENT_IMPORT_NAME, ARKUI_STATEMANAGEMENT_IMPORT_NAME } from '../../common/predefines';
import {
    addMemoAnnotation,
    findCanAddMemoFromParamExpression,
    findCanAddMemoFromTypeAnnotation,
    findImportSource,
} from '../utils';

export enum DecoratorNames {
    STATE = 'State',
    STORAGE_LINK = 'StorageLink',
    STORAGE_PROP = 'StorageProp',
    LINK = 'Link',
    PROP = 'Prop',
    PROVIDE = 'Provide',
    CONSUME = 'Consume',
    OBJECT_LINK = 'ObjectLink',
    OBSERVED = 'Observed',
    WATCH = 'Watch',
    BUILDER_PARAM = 'BuilderParam',
    BUILDER = 'Builder',
    CUSTOM_DIALOG = 'CustomDialog',
    LOCAL_STORAGE_PROP = 'LocalStorageProp',
    LOCAL_STORAGE_LINK = 'LocalStorageLink',
    REUSABLE = 'Reusable',
    TRACK = 'Track',
}

export enum DecoratorIntrinsicNames {
    LINK = '__Link_intrinsic',
}

export enum DecoratorDeclarationNames {
    STMT_COMMON = 'arkui.stateManagement.common',
    COMP_COMMON = 'arkui.component.common',
    CUSTOM_COMP = 'arkui.component.customComponent',
}

export enum StateManagementTypes {
    STATE_DECORATED = 'StateDecoratedVariable',
    LINK_DECORATED = 'LinkDecoratedVariable',
    STORAGE_LINK_DECORATED = 'StorageLinkDecoratedVariable',
    STORAGE_PROP_DECORATED = 'StoragePropDecoratedVariable',
    DECORATED_V1 = 'DecoratedV1VariableBase',
    PROP_DECORATED = 'PropDecoratedVariable',
    MUTABLE_STATE = 'MutableState',
    MUTABLE_STATE_META = 'MutableStateMeta',
    SYNCED_PROPERTY = 'SyncedProperty',
    PROVIDE_DECORATED = 'ProvideDecoratedVariable',
    CONSUME_DECORATED = 'ConsumeDecoratedVariable',
    OBJECT_LINK_DECORATED = 'ObjectLinkDecoratedVariable',
    BACKING_VALUE = 'BackingValue',
    SET_OBSERVATION_DEPTH = 'setObservationDepth',
    OBSERVED_OBJECT = 'IObservedObject',
    WATCH_ID_TYPE = 'WatchIdType',
    SUBSCRIBED_WATCHES = 'SubscribedWatches',
    STORAGE_LINK_STATE = 'StorageLinkState',
    OBSERVABLE_PROXY = 'observableProxy',
    PROP_STATE = 'propState',
    INT_32 = 'int32',
}

export interface DecoratorInfo {
    annotation: arkts.AnnotationUsage;
    name: DecoratorNames;
}

export const decoratorTypeMap = new Map<DecoratorNames, StateManagementTypes>([
    [DecoratorNames.STATE, StateManagementTypes.STATE_DECORATED],
    [DecoratorNames.LINK, StateManagementTypes.DECORATED_V1],
    [DecoratorNames.PROP, StateManagementTypes.PROP_DECORATED],
    [DecoratorNames.STORAGE_LINK, StateManagementTypes.STORAGE_LINK_DECORATED],
    [DecoratorNames.STORAGE_PROP, StateManagementTypes.STORAGE_PROP_DECORATED],
    [DecoratorNames.LOCAL_STORAGE_PROP, StateManagementTypes.SYNCED_PROPERTY],
    [DecoratorNames.LOCAL_STORAGE_LINK, StateManagementTypes.MUTABLE_STATE],
    [DecoratorNames.OBJECT_LINK, StateManagementTypes.OBJECT_LINK_DECORATED],
    [DecoratorNames.PROVIDE, StateManagementTypes.PROVIDE_DECORATED],
    [DecoratorNames.CONSUME, StateManagementTypes.CONSUME_DECORATED],
]);

export function isFromDecoratorDeclaration(value: any): value is DecoratorDeclarationNames {
    return Object.values(DecoratorDeclarationNames).includes(value);
}

export function getImportSourceFromDeclarationName(name: DecoratorDeclarationNames): string {
    if (name === DecoratorDeclarationNames.STMT_COMMON) {
        return ARKUI_STATEMANAGEMENT_IMPORT_NAME;
    }
    return ARKUI_COMPONENT_IMPORT_NAME;
}

export function isDecoratorIntrinsicAnnotation(
    anno: arkts.AnnotationUsage,
    decoratorName: DecoratorIntrinsicNames
): boolean {
    return !!anno.expr && arkts.isIdentifier(anno.expr) && anno.expr.name === decoratorName;
}

export function isDecoratorAnnotation(
    anno: arkts.AnnotationUsage,
    decoratorName: DecoratorNames,
    ignoreDecl?: boolean
): boolean {
    if (!(!!anno.expr && arkts.isIdentifier(anno.expr) && anno.expr.name === decoratorName)) {
        return false;
    }
    if (!ignoreDecl) {
        const decl = arkts.getDecl(anno.expr);
        if (!decl) {
            return false;
        }
        const moduleName: string = arkts.getProgramFromAstNode(decl).moduleName;
        if (!isFromDecoratorDeclaration(moduleName)) {
            return false;
        }
        ImportCollector.getInstance().collectSource(decoratorName, getImportSourceFromDeclarationName(moduleName));
        DeclarationCollector.getInstance().collect(decl);
    }
    return true;
}

export function removeDecorator(
    property: arkts.ClassProperty | arkts.ClassDefinition | arkts.MethodDefinition,
    decoratorName: DecoratorNames,
    ignoreDecl?: boolean
): void {
    if (arkts.isMethodDefinition(property)) {
        property.scriptFunction.setAnnotations(
            property.scriptFunction.annotations.filter(
                (anno) => !isDecoratorAnnotation(anno, decoratorName, ignoreDecl)
            )
        );
    } else {
        property.setAnnotations(
            property.annotations.filter((anno) => !isDecoratorAnnotation(anno, decoratorName, ignoreDecl))
        );
    }
}

/**
 * checking whether astNode's annotations contain given corresponding decorator name,
 * regardless where the annotation's declaration is from arkui declaration files.
 */
export function hasDecoratorName(
    property: arkts.ClassProperty | arkts.ClassDefinition | arkts.MethodDefinition,
    decoratorName: DecoratorNames
): boolean {
    if (arkts.isMethodDefinition(property)) {
        return property.scriptFunction.annotations.some((anno) => isDecoratorAnnotation(anno, decoratorName, true));
    }
    return property.annotations.some((anno) => isDecoratorAnnotation(anno, decoratorName, true));
}

export function hasDecorator(
    property: arkts.ClassProperty | arkts.ClassDefinition | arkts.MethodDefinition,
    decoratorName: DecoratorNames
): boolean {
    if (arkts.isMethodDefinition(property)) {
        return property.scriptFunction.annotations.some((anno) => isDecoratorAnnotation(anno, decoratorName));
    }
    return property.annotations.some((anno) => isDecoratorAnnotation(anno, decoratorName));
}

/**
 * Determine whether the node `<st>` is decorated by decorators that need initializing without assignment.
 *
 * @param st class property node
 */
export function needDefiniteOrOptionalModifier(st: arkts.ClassProperty): boolean {
    return (
        hasDecoratorName(st, DecoratorNames.LINK) ||
        hasDecoratorName(st, DecoratorNames.CONSUME) ||
        hasDecoratorName(st, DecoratorNames.OBJECT_LINK) ||
        (hasDecoratorName(st, DecoratorNames.PROP) && !st.value)
    );
}

export function findDecoratorByName(
    property: arkts.ClassProperty | arkts.ClassDefinition | arkts.MethodDefinition,
    decoratorName: DecoratorNames
): arkts.AnnotationUsage | undefined {
    if (arkts.isMethodDefinition(property)) {
        return property.scriptFunction.annotations.find((anno) => isDecoratorAnnotation(anno, decoratorName, true));
    }
    return property.annotations.find((anno) => isDecoratorAnnotation(anno, decoratorName, true));
}

export function findDecorator(
    property: arkts.ClassProperty | arkts.ClassDefinition | arkts.MethodDefinition,
    decoratorName: DecoratorNames
): arkts.AnnotationUsage | undefined {
    if (arkts.isMethodDefinition(property)) {
        return property.scriptFunction.annotations.find((anno) => isDecoratorAnnotation(anno, decoratorName));
    }
    return property.annotations.find((anno) => isDecoratorAnnotation(anno, decoratorName));
}

export function findDecoratorInfos(
    property: arkts.ClassProperty | arkts.ClassDefinition | arkts.MethodDefinition
): DecoratorInfo[] {
    const decoratorNames = Object.values(DecoratorNames);
    const infos: DecoratorInfo[] = [];
    for (let i = 0; i < decoratorNames.length; i++) {
        const name = decoratorNames[i];
        const annotation: arkts.AnnotationUsage | undefined = findDecoratorByName(property, name);
        if (!!annotation) {
            infos.push({ annotation, name });
        }
    }
    return infos;
}

export function getStateManagementType(decoratorInfo: DecoratorInfo): StateManagementTypes {
    const decoratorName = decoratorInfo.name;
    const typeName = decoratorTypeMap.get(decoratorName);
    if (!!typeName) {
        return typeName;
    }
    return StateManagementTypes.MUTABLE_STATE;
}

export function collectStateManagementTypeImport(type: StateManagementTypes): void {
    ImportCollector.getInstance().collectImport(type);
}

export function collectStateManagementTypeSource(type: StateManagementTypes): void {
    const source = findImportSource(type);
    ImportCollector.getInstance().collectSource(type, source);
}

export function createGetter(
    name: string,
    type: arkts.TypeNode | undefined,
    returns: arkts.Expression,
    needMemo: boolean = false
): arkts.MethodDefinition {
    const returnType: arkts.TypeNode | undefined = type?.clone();
    if (needMemo && findCanAddMemoFromTypeAnnotation(returnType)) {
        addMemoAnnotation(returnType);
    }
    const body = arkts.factory.createBlock([arkts.factory.createReturnStatement(returns)]);
    const scriptFunction = arkts.factory.createScriptFunction(
        body,
        arkts.FunctionSignature.createFunctionSignature(undefined, [], returnType, false),
        arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_GETTER,
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC
    );
    return arkts.factory.createMethodDefinition(
        arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_GET,
        arkts.factory.createIdentifier(name),
        scriptFunction,
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
        false
    );
}

export function createSetter(
    name: string,
    type: arkts.TypeNode | undefined,
    left: arkts.Expression,
    right: arkts.AstNode,
    needMemo: boolean = false
): arkts.MethodDefinition {
    const body = arkts.factory.createBlock([
        arkts.factory.createExpressionStatement(
            arkts.factory.createAssignmentExpression(
                left,
                arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_SUBSTITUTION,
                right
            )
        ),
    ]);
    const param: arkts.ETSParameterExpression = arkts.factory.createParameterDeclaration(
        arkts.factory.createIdentifier('value', type?.clone()),
        undefined
    );
    if (needMemo && findCanAddMemoFromParamExpression(param)) {
        addMemoAnnotation(param);
    }
    const scriptFunction = arkts.factory.createScriptFunction(
        body,
        arkts.FunctionSignature.createFunctionSignature(undefined, [param], undefined, false),
        arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_SETTER,
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC
    );

    return arkts.factory.createMethodDefinition(
        arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET,
        arkts.factory.createIdentifier(name),
        scriptFunction,
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
        false
    );
}

export function createSetter2(
    name: string,
    type: arkts.TypeNode | undefined,
    statement: arkts.AstNode
): arkts.MethodDefinition {
    const body = arkts.factory.createBlock([statement]);
    const param: arkts.ETSParameterExpression = arkts.factory.createParameterDeclaration(
        arkts.factory.createIdentifier('value', type?.clone()),
        undefined
    );
    const scriptFunction = arkts.factory.createScriptFunction(
        body,
        arkts.FunctionSignature.createFunctionSignature(undefined, [param], undefined, false),
        arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_SETTER,
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC
    );

    return arkts.factory.createMethodDefinition(
        arkts.Es2pandaMethodDefinitionKind.METHOD_DEFINITION_KIND_SET,
        arkts.factory.createIdentifier(name),
        scriptFunction,
        arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC,
        false
    );
}

export function generateThisBackingValue(
    name: string,
    optional: boolean = false,
    nonNull: boolean = false
): arkts.MemberExpression {
    const member: arkts.Expression = generateThisBacking(name, optional, nonNull);
    return arkts.factory.createMemberExpression(
        member,
        arkts.factory.createIdentifier('value'),
        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
        false,
        false
    );
}

export function generateThisBacking(
    name: string,
    optional: boolean = false,
    nonNull: boolean = false
): arkts.Expression {
    const member: arkts.Expression = arkts.factory.createMemberExpression(
        arkts.factory.createThisExpression(),
        arkts.factory.createIdentifier(`${name}`),
        arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
        false,
        optional
    );
    return nonNull ? arkts.factory.createTSNonNullExpression(member) : member;
}

function getValueStr(node: arkts.AstNode): string | undefined {
    if (!arkts.isClassProperty(node) || !node.value) return undefined;
    return arkts.isStringLiteral(node.value) ? node.value.str : undefined;
}

function getAnnotationValue(anno: arkts.AnnotationUsage, decoratorName: DecoratorNames): string | undefined {
    const isSuitableAnnotation: boolean =
        !!anno.expr && arkts.isIdentifier(anno.expr) && anno.expr.name === decoratorName;
    if (isSuitableAnnotation && anno.properties.length === 1) {
        return getValueStr(anno.properties.at(0)!);
    }
    return undefined;
}

export function getValueInAnnotation(node: arkts.ClassProperty, decoratorName: DecoratorNames): string | undefined {
    const annotations: readonly arkts.AnnotationUsage[] = node.annotations;
    for (let i = 0; i < annotations.length; i++) {
        const anno: arkts.AnnotationUsage = annotations[i];
        const str: string | undefined = getAnnotationValue(anno, decoratorName);
        if (!!str) {
            return str;
        }
    }
    return undefined;
}

export interface ProvideOptions {
    alias: string;
    allowOverride: boolean;
}

export function getValueInProvideAnnotation(node: arkts.ClassProperty): ProvideOptions | undefined {
    const annotations: readonly arkts.AnnotationUsage[] = node.annotations;
    for (let i = 0; i < annotations.length; i++) {
        const anno: arkts.AnnotationUsage = annotations[i];
        if (anno.expr && arkts.isIdentifier(anno.expr) && anno.expr.name === DecoratorNames.PROVIDE) {
            const alias: string = getValueInObjectAnnotation(anno, DecoratorNames.PROVIDE, 'alias');
            const allowOverride: boolean = getValueInObjectAnnotation(anno, DecoratorNames.PROVIDE, 'allowOverride')
                ? true
                : false;
            return { alias, allowOverride };
        }
    }
    return undefined;
}

function getValueInObjectAnnotation(anno: arkts.AnnotationUsage, decoratorName: DecoratorNames, key: string): any {
    const isSuitableAnnotation: boolean =
        !!anno.expr && arkts.isIdentifier(anno.expr) && anno.expr.name === decoratorName;
    if (!isSuitableAnnotation) {
        return undefined;
    }
    const keyItem: arkts.AstNode | undefined = anno.properties.find(
        (annoProp: arkts.AstNode) =>
            arkts.isClassProperty(annoProp) &&
            annoProp.key &&
            arkts.isIdentifier(annoProp.key) &&
            annoProp.key.name === key
    );
    if (keyItem && arkts.isClassProperty(keyItem) && keyItem.value) {
        return getDifferentAnnoTypeValue(keyItem.value);
    }
    return undefined;
}

function getDifferentAnnoTypeValue(value: arkts.Expression): string | boolean {
    if (arkts.isBooleanLiteral(value)) {
        return value.value;
    } else if (arkts.isStringLiteral(value)) {
        return value.str;
    }
    return value.dumpSrc();
}

export function generateGetOrSetCall(beforCall: arkts.AstNode, type: string) {
    return arkts.factory.createCallExpression(
        arkts.factory.createMemberExpression(
            beforCall,
            arkts.factory.createIdentifier(type),
            arkts.Es2pandaMemberExpressionKind.MEMBER_EXPRESSION_KIND_PROPERTY_ACCESS,
            false,
            false
        ),
        undefined,
        type === 'set' ? [arkts.factory.createIdentifier('value')] : undefined,
        undefined
    );
}

export function generateToRecord(newName: string, originalName: string): arkts.Property {
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

// CACHE
export interface PropertyCachedBody {
    initializeBody?: arkts.AstNode[];
    updateBody?: arkts.AstNode[];
    toRecordBody?: arkts.Property[];
}

export class PropertyCache {
    private _cache: Map<string, PropertyCachedBody>;
    private static instance: PropertyCache;

    private constructor() {
        this._cache = new Map<string, PropertyCachedBody>();
    }

    static getInstance(): PropertyCache {
        if (!this.instance) {
            this.instance = new PropertyCache();
        }
        return this.instance;
    }

    reset(): void {
        this._cache.clear();
    }

    getInitializeBody(name: string): arkts.AstNode[] {
        return this._cache.get(name)?.initializeBody ?? [];
    }

    getUpdateBody(name: string): arkts.AstNode[] {
        return this._cache.get(name)?.updateBody ?? [];
    }

    getToRecordBody(name: string): arkts.Property[] {
        return this._cache.get(name)?.toRecordBody ?? [];
    }

    collectInitializeStruct(name: string, initializeStruct: arkts.AstNode[]): void {
        const initializeBody = this._cache.get(name)?.initializeBody ?? [];
        const newInitializeBody = [...initializeBody, ...initializeStruct];
        this._cache.set(name, { ...this._cache.get(name), initializeBody: newInitializeBody });
    }

    collectUpdateStruct(name: string, updateStruct: arkts.AstNode[]): void {
        const updateBody = this._cache.get(name)?.updateBody ?? [];
        const newUpdateBody = [...updateBody, ...updateStruct];
        this._cache.set(name, { ...this._cache.get(name), updateBody: newUpdateBody });
    }

    collectToRecord(name: string, toRecord: arkts.Property[]): void {
        const toRecordBody = this._cache.get(name)?.toRecordBody ?? [];
        const newToRecordBody = [...toRecordBody, ...toRecord];
        this._cache.set(name, { ...this._cache.get(name), toRecordBody: newToRecordBody });
    }
}