/*
 * Copyright (C) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as arkts from '@koalaui/libarkts';
import {
    ArrayTypeRecord,
    FunctionTypeRecord,
    NullTypeRecord,
    PrimitiveTypeRecord,
    ThisTypeRecord,
    TypeRecord,
    TypeRecordTypes,
    TypeReferenceTypeRecord,
    UndefinedTypeRecord,
    UnionTypeRecord,
    ParameterRecord,
    TypeParameterTypeRecord,
} from '../../collectors/utils/collect-types';

export class factory {
    /**
     * generate type node from `TypeRecord`
     */
    static createTypeNodeFromRecord(record: TypeRecord): arkts.TypeNode {
        const type = record?.type;
        switch (type) {
            case TypeRecordTypes.ARRAY:
                return factory.createArrayTypeFromRecord(record);
            case TypeRecordTypes.FUNCTION:
                return factory.createFunctionTypeFromRecord(record);
            case TypeRecordTypes.NULL:
                return factory.createNullTypeFromRecord(record);
            case TypeRecordTypes.UNDEFINED:
                return factory.createUndefinedTypeFromRecord(record);
            case TypeRecordTypes.THIS:
                return factory.createThisTypeFromRecord(record);
            case TypeRecordTypes.UNION:
                return factory.createUnionTypeFromRecord(record);
            case TypeRecordTypes.TYPE_REFERENCE:
                return factory.createTypeReferenceFromRecord(record);
            case TypeRecordTypes.PRIMITIVE:
                return factory.createPrimitiveTypeFromRecord(record);
            default:
                throw new Error(`Unknown type node's type: ${type}`);
        }
    }

    /**
     * generate `arkts.ETSPrimitiveType` node from `PrimitiveTypeRecord`
     */
    static createPrimitiveTypeFromRecord(record: PrimitiveTypeRecord): arkts.ETSPrimitiveType {
        const typeName = record?.typeName;
        switch (typeName) {
            case 'boolean':
                return arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_BOOLEAN);
            case 'byte':
                return arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_BYTE);
            case 'char':
                return arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_CHAR);
            case 'double':
                return arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_DOUBLE);
            case 'float':
                return arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_FLOAT);
            case 'int':
                return arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_INT);
            case 'long':
                return arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_LONG);
            case 'short':
                return arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_SHORT);
            case 'void':
                return arkts.factory.createPrimitiveType(arkts.Es2pandaPrimitiveType.PRIMITIVE_TYPE_VOID);
            default:
                throw new Error(`Cannot create primitive type because of name: ${typeName}`);
        }
    }

    /**
     * generate `arkts.ETSParameterExpression` node from `ParameterRecord`
     */
    static createParameterFromRecord(record: ParameterRecord): arkts.ETSParameterExpression {
        const name = record.name;
        const annotations = record.annotations.map((a) => a.clone());
        const isOptional = record.isOptional;
        const typeAnnotation = factory.createTypeNodeFromRecord(record.typeRecord);
        const parameter = arkts.factory.createParameterDeclaration(
            arkts.factory.createIdentifier(name, typeAnnotation),
            undefined
        );
        parameter.annotations = annotations;
        if (isOptional) {
            parameter.setOptional(true);
        }
        return parameter;
    }

    /**
     * generate `arkts.TSTypeParameter` node from `TypeParameterTypeRecord`
     */
    static createTypeParameterFromRecord(record: TypeParameterTypeRecord): arkts.TSTypeParameter {
        const annotations = record.annotations.map((a) => a.clone());
        const typeName = record.typeName ? arkts.factory.createIdentifier(record.typeName) : undefined;
        const defaultType = record.defaultType ? factory.createTypeNodeFromRecord(record.defaultType) : undefined;
        const constraint = record.constraint ? factory.createTypeNodeFromRecord(record.constraint) : undefined;
        const typeParameter = arkts.factory.createTypeParameter(typeName, constraint, defaultType);
        typeParameter.setAnnotations(annotations);
        return typeParameter;
    }

    /**
     * generate `arkts.TSArrayType` node from `ArrayTypeRecord`
     */
    static createArrayTypeFromRecord(record: ArrayTypeRecord): arkts.TSArrayType {
        const elementType = record.elementType ? factory.createTypeNodeFromRecord(record.elementType) : undefined;
        return arkts.factory.createTSArrayType(elementType);
    }

    /**
     * generate `arkts.ETSNullType` node from `NullTypeRecord`
     */
    static createNullTypeFromRecord(record: NullTypeRecord): arkts.ETSNullType {
        return arkts.factory.createETSNullType();
    }

    /**
     * generate `arkts.ETSUndefinedType` node from `UndefinedTypeRecord`
     */
    static createUndefinedTypeFromRecord(record: UndefinedTypeRecord): arkts.ETSUndefinedType {
        return arkts.factory.createETSUndefinedType();
    }

    /**
     * generate `arkts.TSThisType` node from `ThisTypeRecord`
     */
    static createThisTypeFromRecord(record: ThisTypeRecord): arkts.TSThisType {
        return arkts.factory.createTSThisType();
    }

    /**
     * generate `arkts.ETSFunctionType` node from `FunctionTypeRecord`
     */
    static createFunctionTypeFromRecord(record: FunctionTypeRecord): arkts.ETSFunctionType {
        const annotations = record.annotations.map((a) => a.clone());
        const returnType = factory.createTypeNodeFromRecord(record.returnType);
        const params = record.params.map((p) => factory.createParameterFromRecord(p));
        const typeParams = record.typeParams?.map((p) => factory.createTypeParameterFromRecord(p));
        const funcType = arkts.factory.createFunctionType(
            arkts.factory.createFunctionSignature(
                typeParams ? arkts.factory.createTypeParameterDeclaration(typeParams, typeParams.length) : undefined,
                params,
                returnType,
                false
            ),
            arkts.Es2pandaScriptFunctionFlags.SCRIPT_FUNCTION_FLAGS_ARROW
        );
        funcType.setAnnotations(annotations);
        return funcType;
    }

    /**
     * generate `arkts.ETSUnionType` node from `UnionTypeRecord`
     */
    static createUnionTypeFromRecord(record: UnionTypeRecord): arkts.ETSUnionType {
        const types = record.types.map((t) => factory.createTypeNodeFromRecord(t));
        return arkts.factory.createUnionType(types);
    }

    /**
     * @internal
     */
    static createTypeNameForTypeReferencePart(name: string | string[]): arkts.Expression {
        if (!Array.isArray(name)) {
            return arkts.factory.createIdentifier(name);
        }
        const names = name.map((n) => arkts.factory.createIdentifier(n));
        if (names.length === 1) {
            return names.at(0)!;
        }
        const leftName = names.shift();
        const rightName = names.shift();
        let nameNode: arkts.TSQualifiedName = arkts.factory.createTSQualifiedName(leftName, rightName);
        while (names.length > 0) {
            const currName = names.shift();
            nameNode = arkts.factory.updateTSQualifiedName(nameNode, nameNode, currName);
        }
        return nameNode;
    }

    /**
     * generate `arkts.ETSTypeReference` node from `TypeReferenceTypeRecord`
     */
    static createTypeReferenceFromRecord(record: TypeReferenceTypeRecord): arkts.ETSTypeReference {
        const name = record.typeName;
        const annotations = record.annotations;
        const typeParams = record.typeParams?.map((p) => factory.createTypeNodeFromRecord(p));
        const typeRef = arkts.factory.createTypeReference(
            arkts.factory.createTypeReferencePart(
                factory.createTypeNameForTypeReferencePart(name),
                typeParams ? arkts.factory.createTSTypeParameterInstantiation(typeParams) : undefined
            )
        );
        typeRef.setAnnotations(annotations);
        return typeRef;
    }
}
