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
import { coerceToAstNode } from '../../common/arkts-utils';

export enum TypeRecordTypes {
    PRIMITIVE,
    FUNCTION,
    UNION,
    UNDEFINED,
    NULL,
    TYPE_REFERENCE,
    TYPE_PARAMETER,
    THIS,
    ARRAY,
}

export interface ThisTypeRecord {
    type: TypeRecordTypes.THIS;
}

export interface ArrayTypeRecord {
    type: TypeRecordTypes.ARRAY;
    elementType?: TypeRecord;
}

export interface UndefinedTypeRecord {
    type: TypeRecordTypes.UNDEFINED;
}

export interface NullTypeRecord {
    type: TypeRecordTypes.NULL;
}

export interface TypeReferenceTypeRecord {
    type: TypeRecordTypes.TYPE_REFERENCE;
    typeName: string | string[];
    annotations: readonly arkts.AnnotationUsage[];
    typeParams?: TypeRecord[];
}

export interface PrimitiveTypeRecord {
    type: TypeRecordTypes.PRIMITIVE;
    typeName: string;
}

export interface FunctionTypeRecord {
    type: TypeRecordTypes.FUNCTION;
    params: ParameterRecord[];
    returnType: TypeRecord;
    annotations: readonly arkts.AnnotationUsage[];
    typeParams?: TypeParameterTypeRecord[];
}

export interface UnionTypeRecord {
    type: TypeRecordTypes.UNION;
    types: TypeRecord[];
}

export interface TypeParameterTypeRecord {
    type: TypeRecordTypes.TYPE_PARAMETER;
    annotations: readonly arkts.AnnotationUsage[];
    typeName?: string;
    constraint?: TypeRecord;
    defaultType?: TypeRecord;
}

export type TypeRecord =
    | ArrayTypeRecord
    | ThisTypeRecord
    | UndefinedTypeRecord
    | NullTypeRecord
    | TypeReferenceTypeRecord
    | PrimitiveTypeRecord
    | FunctionTypeRecord
    | UnionTypeRecord;

export interface ParameterRecord {
    name: string;
    typeRecord: TypeRecord;
    annotations: readonly arkts.AnnotationUsage[];
    isOptional: boolean;
}

export function collectTypeRecordFromTypeParameterInstatiation(
    typeParams: arkts.TSTypeParameterInstantiation | undefined
): TypeRecord[] | undefined {
    if (!typeParams) {
        return undefined;
    }
    return typeParams.params.map((p) => collectTypeRecordFromType(p)!);
}

export function collectTypeRecordFromTypeParameterDeclaration(
    typeParams: arkts.TSTypeParameterDeclaration | undefined
): TypeParameterTypeRecord[] | undefined {
    if (!typeParams) {
        return undefined;
    }
    return typeParams.params.map((p) => collectTypeRecordFromTypeParameter(p));
}

export function collectTypeRecordFromTypeParameter<T extends arkts.AstNode = arkts.TSTypeParameter>(
    typeParameter: T
): TypeParameterTypeRecord {
    const _typeParameter = coerceToAstNode<arkts.TSTypeParameter>(typeParameter);
    const type = TypeRecordTypes.TYPE_PARAMETER;
    const typeName = _typeParameter.name?.name;
    const annotations = _typeParameter.annotations;
    const constraint = collectTypeRecordFromType(_typeParameter.constraint);
    const defaultType = collectTypeRecordFromType(_typeParameter.defaultType);
    return { type, typeName, annotations, constraint, defaultType };
}

export function collectTypeRecordFromUnionType<T extends arkts.AstNode = arkts.TSUnionType>(
    unionType: T
): UnionTypeRecord {
    const _unionType = coerceToAstNode<arkts.TSUnionType>(unionType);
    const type = TypeRecordTypes.UNION;
    const types = _unionType.types.map((t) => collectTypeRecordFromType(t)!);
    return { type, types };
}

export function collectTypeRecordFromFunctionType<T extends arkts.AstNode = arkts.ETSFunctionType>(
    funcType: T
): FunctionTypeRecord {
    const _funcType = coerceToAstNode<arkts.ETSFunctionType>(funcType);
    const type = TypeRecordTypes.FUNCTION;
    const params = _funcType.params.map((p) => collectTypeRecordFromParameter(p as arkts.ETSParameterExpression));
    const returnType = collectTypeRecordFromType(_funcType.returnType)!;
    const annotations = _funcType.annotations;
    const typeParams = collectTypeRecordFromTypeParameterDeclaration(_funcType.typeParams);
    return { type, params, returnType, annotations, typeParams };
}

export function collectTypeRecordFromParameter<T extends arkts.AstNode = arkts.ETSParameterExpression>(
    param: T
): ParameterRecord {
    const _param = coerceToAstNode<arkts.ETSParameterExpression>(param);
    const name = _param.identifier.name;
    const typeRecord = collectTypeRecordFromType(_param.type)!;
    const annotations = _param.annotations;
    const isOptional = _param.optional;
    return { name, typeRecord, annotations, isOptional };
}

function coerceTypeNameToArray(name: string | string[] | undefined): string[] {
    if (Array.isArray(name)) {
        return name;
    }
    if (!!name) {
        return [name];
    }
    return [];
}

function getTypeNameFromTypeReferencePartName(name: arkts.Expression | undefined): string | string[] | undefined {
    if (!name) {
        return undefined;
    }
    if (arkts.isIdentifier(name)) {
        return name.name;
    }
    if (arkts.isTSQualifiedName(name)) {
        const leftName: string | string[] | undefined = getTypeNameFromTypeReferencePartName(name.left);
        const rightName: string | string[] | undefined = getTypeNameFromTypeReferencePartName(name.right);
        const nameArr: string[] = [...coerceTypeNameToArray(leftName), ...coerceTypeNameToArray(rightName)];
        if (nameArr.length === 0) {
            return undefined;
        }
        return nameArr;
    }
    return undefined;
}

export function collectTypeRecordFromTypeReference<T extends arkts.AstNode = arkts.ETSTypeReference>(
    node: T
): TypeReferenceTypeRecord | undefined {
    const _node = coerceToAstNode<arkts.ETSTypeReference>(node);
    if (!_node.part || !arkts.isETSTypeReferencePart(_node.part)) {
        return undefined;
    }
    if (!_node.part.name) {
        return undefined;
    }
    const typeName = getTypeNameFromTypeReferencePartName(_node.part.name);
    if (!typeName) {
        return undefined;
    }
    const type = TypeRecordTypes.TYPE_REFERENCE;
    const annotations = _node.annotations;
    const typeParams = collectTypeRecordFromTypeParameterInstatiation(_node.part.typeParams);
    return { type, typeName, annotations, typeParams };
}

export function collectTypeRecordFromUndefinedType<T extends arkts.AstNode = arkts.ETSUndefinedType>(
    node: T
): UndefinedTypeRecord {
    const type = TypeRecordTypes.UNDEFINED;
    return { type };
}

export function collectTypeRecordFromNullType<T extends arkts.AstNode = arkts.ETSNullType>(node: T): NullTypeRecord {
    const type = TypeRecordTypes.NULL;
    return { type };
}

export function collectTypeRecordFromThisType<T extends arkts.AstNode = arkts.TSThisType>(node: T): ThisTypeRecord {
    const type = TypeRecordTypes.THIS;
    return { type };
}

export function collectTypeRecordFromArrayType<T extends arkts.AstNode = arkts.TSArrayType>(node: T): ArrayTypeRecord {
    const _node = coerceToAstNode<arkts.TSArrayType>(node);
    const type = TypeRecordTypes.ARRAY;
    const elementType = collectTypeRecordFromType(_node.elementType);
    return { type, elementType };
}

export function collectTypeRecordFromPrimitiveType<T extends arkts.AstNode = arkts.ETSPrimitiveType>(
    node: T
): PrimitiveTypeRecord {
    const _node = coerceToAstNode<arkts.ETSPrimitiveType>(node);
    const type = TypeRecordTypes.PRIMITIVE;
    const typeName: string = _node.dumpSrc();
    return { type, typeName };
}

export function collectTypeRecordFromType(node: arkts.AstNode | undefined): TypeRecord | undefined {
    if (!node) {
        return undefined;
    }
    const type = arkts.nodeType(node);
    if (collectTypeRecordByType.has(type)) {
        return collectTypeRecordByType.get(type)!(node);
    }
    return undefined;
}

type TypeRecordCollectFunction = <T extends arkts.AstNode>(node: T) => TypeRecord | undefined;

const collectTypeRecordByType = new Map<arkts.Es2pandaAstNodeType, TypeRecordCollectFunction>([
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_TYPE_REFERENCE, collectTypeRecordFromTypeReference],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_FUNCTION_TYPE, collectTypeRecordFromFunctionType],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_UNDEFINED_TYPE, collectTypeRecordFromUndefinedType],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_PRIMITIVE_TYPE, collectTypeRecordFromPrimitiveType],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_NULL_TYPE, collectTypeRecordFromNullType],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_UNION_TYPE, collectTypeRecordFromUnionType],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_TS_THIS_TYPE, collectTypeRecordFromThisType],
    [arkts.Es2pandaAstNodeType.AST_NODE_TYPE_TS_ARRAY_TYPE, collectTypeRecordFromArrayType],
]);
