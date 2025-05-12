/*
 * Copyright (c) 2022-2025 Huawei Device Co., Ltd.
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

import { updateNodeByNode } from "../utilities/private"
import {
    ArrowFunctionExpression,
    AssignmentExpression,
    CallExpression,
    ETSParameterExpression,
    EtsScript,
    ExpressionStatement,
    FunctionDeclaration,
    FunctionExpression,
    IfStatement,
    MethodDefinition,
    NumberLiteral,
    StructDeclaration,
    VariableDeclaration,
    VariableDeclarator,
    ETSStringLiteralType
} from "../types"
import { MemberExpression } from "../to-be-generated/MemberExpression"
import { AstNode } from "../peers/AstNode"
import {
    AnnotationUsage,
    BinaryExpression,
    BlockStatement,
    ClassDeclaration,
    ClassDefinition,
    ClassProperty,
    ConditionalExpression,
    ETSImportDeclaration,
    ETSFunctionType,
    ETSPrimitiveType,
    ETSTypeReference,
    ETSTypeReferencePart,
    ETSUndefinedType,
    ETSUnionType,
    FunctionSignature,
    Identifier,
    ImportSpecifier,
    NullLiteral,
    ReturnStatement,
    ScriptFunction,
    StringLiteral,
    SuperExpression,
    ThisExpression,
    TSInterfaceBody,
    TSInterfaceDeclaration,
    TSNonNullExpression,
    TSTypeParameter,
    TSTypeParameterDeclaration,
    TSTypeParameterInstantiation,
    TypeNode,
    UndefinedLiteral,
    TSAsExpression,
    TSTypeAliasDeclaration,
    ChainExpression,
    BlockExpression,
    ETSNewClassInstanceExpression,
    BooleanLiteral,
    ObjectExpression,
    Property,
    TemplateLiteral,
    ArrayExpression
} from "../../generated"
import {
    Es2pandaModifierFlags
} from "../../generated/Es2pandaEnums"
import {
    classPropertySetOptional,
    hasModifierFlag
} from "../utilities/public"
import { updateIdentifier } from "../node-utilities/Identifier"
import { updateCallExpression } from "../node-utilities/CallExpression"
import { updateExpressionStatement } from "../node-utilities/ExpressionStatement"
import { updateMemberExpression } from "../node-utilities/MemberExpression"
import { updateFunctionDeclaration } from "../node-utilities/FunctionDeclaration"
import { updateBlockStatement } from "../node-utilities/BlockStatement"
import { updateArrowFunctionExpression } from "../node-utilities/ArrowFunctionExpression"
import { updateScriptFunction } from "../node-utilities/ScriptFunction"
import { updateStringLiteral } from "../node-utilities/StringLiteral"
import { updateNumberLiteral } from "../node-utilities/NumberLiteral"
import { updateETSParameterExpression } from "../node-utilities/ETSParameterExpression"
import { updateTSTypeParameter } from "../node-utilities/TSTypeParameter"
import { updateTSTypeParameterDeclaration } from "../node-utilities/TSTypeParameterDeclaration"
import { updateETSPrimitiveType } from "../node-utilities/ETSPrimitiveType"
import { updateETSTypeReference } from "../node-utilities/ETSTypeReference"
import { updateETSTypeReferencePart } from "../node-utilities/ETSTypeReferencePart"
import { updateETSImportDeclaration } from "../node-utilities/ETSImportDeclaration"
import { updateImportSpecifier } from "../node-utilities/ImportSpecifier"
import { updateVariableDeclaration } from "../node-utilities/VariableDeclaration"
import { updateVariableDeclarator } from "../node-utilities/VariableDeclarator"
import { updateETSUnionType } from "../node-utilities/ETSUnionType"
import { updateReturnStatement } from "../node-utilities/ReturnStatement"
import { updateIfStatement } from "../node-utilities/IfStatement"
import { updateBinaryExpression } from "../node-utilities/BinaryExpression"
import { updateClassDeclaration } from "../node-utilities/ClassDeclaration"
import { updateStructDeclaration } from "../node-utilities/StructDeclaration"
import { updateClassDefinition } from "../node-utilities/ClassDefinition"
import { updateClassProperty } from "../node-utilities/ClassProperty"
import { updateETSFunctionType } from "../node-utilities/ETSFunctionType"
import { updateFunctionExpression } from "../node-utilities/FunctionExpression"
import { updateMethodDefinition } from "../node-utilities/MethodDefinition"
import { updateSuperExpression } from "../node-utilities/SuperExpression"
import { updateTSTypeParameterInstantiation } from "../node-utilities/TSTypeParameterInstantiation"
import { updateTSInterfaceDeclaration } from "../node-utilities/TSInterfaceDeclaration"
import { updateTSInterfaceBody } from "../node-utilities/TSInterfaceBody"
import { updateUndefinedLiteral } from "../node-utilities/UndefinedLiteral"
import { updateAnnotationUsage, update1AnnotationUsage } from "../node-utilities/AnnotationUsage"
import { updateAssignmentExpression } from "../node-utilities/AssignmentExpression"
import { updateETSUndefinedType } from "../node-utilities/ETSUndefinedType"
import { updateConditionalExpression } from "../node-utilities/ConditionalExpression"
import { updateTSAsExpression } from "../node-utilities/TSAsExpression"
import { updateThisExpression } from "../node-utilities/ThisExpression"
import { updateTSTypeAliasDeclaration } from "../node-utilities/TSTypeAliasDeclaration"
import { updateTSNonNullExpression } from "../node-utilities/TSNonNullExpression"
import { updateChainExpression } from "../node-utilities/ChainExpression"
import { updateBlockExpression } from "../node-utilities/BlockExpression"
import { updateNullLiteral } from "../node-utilities/NullLiteral"
import { updateETSNewClassInstanceExpression } from "../node-utilities/ETSNewClassInstanceExpression"
import { updateObjectExpression } from "../node-utilities/ObjectExpression"
import { updateProperty } from "../node-utilities/Property"
import { updateTemplateLiteral } from "../node-utilities/TemplateLiteral"
import { updateArrayExpression } from "../node-utilities/ArrayExpression";

export const factory = {
    get createIdentifier() {
        return Identifier.create2Identifier
    },
    get updateIdentifier() {
        return updateIdentifier
    },
    get createCallExpression() {
        return CallExpression.create
    },
    get updateCallExpression() {
        return updateCallExpression
    },
    get createExpressionStatement() {
        return ExpressionStatement.create
    },
    get updateExpressionStatement() {
        return updateExpressionStatement
    },
    get createMemberExpression() {
        return MemberExpression.create
    },
    get updateMemberExpression() {
        return updateMemberExpression
    },
    get createEtsScript() {
        return EtsScript.createFromSource
    },
    get updateEtsScript() {
        return EtsScript.updateByStatements
    },
    get createFunctionDeclaration() {
        return FunctionDeclaration.create
    },
    get updateFunctionDeclaration() {
        return updateFunctionDeclaration
    },
    get createBlock() {
        return BlockStatement.createBlockStatement
    },
    get updateBlock() {
        return updateBlockStatement
    },
    get createArrowFunction() {
        return ArrowFunctionExpression.create
    },
    get updateArrowFunction() {
        return updateArrowFunctionExpression
    },
    get createScriptFunction() {
        return ScriptFunction.createScriptFunction
    },
    get updateScriptFunction() {
        return updateScriptFunction
    },
    get createStringLiteral() {
        return StringLiteral.create1StringLiteral
    },
    get updateStringLiteral() {
        return updateStringLiteral
    },
    get create1StringLiteral() {
        return StringLiteral.create1StringLiteral
    },
    get update1StringLiteral() {
        return updateStringLiteral
    },
    get createNumericLiteral() {
        return NumberLiteral.create
    },
    get updateNumericLiteral() {
        return updateNumberLiteral
    },
    get createParameterDeclaration() {
        return ETSParameterExpression.create
    },
    get updateParameterDeclaration() {
        return updateETSParameterExpression
    },
    get createTypeParameter() {
        return TSTypeParameter.createTSTypeParameter
    },
    get updateTypeParameter() {
        return updateTSTypeParameter
    },
    get createTypeParameterDeclaration() {
        return TSTypeParameterDeclaration.createTSTypeParameterDeclaration
    },
    get updateTypeParameterDeclaration() {
        return updateTSTypeParameterDeclaration
    },
    get createPrimitiveType() {
        return ETSPrimitiveType.createETSPrimitiveType
    },
    get updatePrimitiveType() {
        return updateETSPrimitiveType
    },
    get createTypeReference() {
        return ETSTypeReference.createETSTypeReference
    },
    get updateTypeReference() {
        return updateETSTypeReference
    },
    get createTypeReferencePart() {
        return ETSTypeReferencePart.createETSTypeReferencePart
    },
    get updateTypeReferencePart() {
        return updateETSTypeReferencePart
    },
    get createImportDeclaration() {
        return ETSImportDeclaration.createETSImportDeclaration
    },
    get updateImportDeclaration() {
        return updateETSImportDeclaration
    },
    get createImportSpecifier() {
        return ImportSpecifier.createImportSpecifier
    },
    get updateImportSpecifier() {
        return updateImportSpecifier
    },
    get createVariableDeclaration() {
        return VariableDeclaration.create
    },
    get updateVariableDeclaration() {
        return updateVariableDeclaration
    },
    get createVariableDeclarator() {
        return VariableDeclarator.create
    },
    get updateVariableDeclarator() {
        return updateVariableDeclarator
    },
    get createUnionType() {
        return ETSUnionType.createETSUnionType
    },
    get updateUnionType() {
        return updateETSUnionType
    },
    get createReturnStatement() {
        return ReturnStatement.create1ReturnStatement
    },
    get updateReturnStatement() {
        return updateReturnStatement
    },
    get createIfStatement() {
        return IfStatement.create
    },
    get updateIfStatement() {
        return updateIfStatement
    },
    get createBinaryExpression() {
        return BinaryExpression.createBinaryExpression
    },
    get updateBinaryExpression() {
        return updateBinaryExpression
    },
    get createClassDeclaration() {
        return ClassDeclaration.createClassDeclaration
    },
    get updateClassDeclaration() {
        return updateClassDeclaration
    },
    get createStructDeclaration() {
        return StructDeclaration.create
    },
    get updateStructDeclaration() {
        return updateStructDeclaration
    },
    get createClassDefinition() {
        return ClassDefinition.createClassDefinition
    },
    get updateClassDefinition() {
        return updateClassDefinition
    },
    get createClassProperty() {
        return ClassProperty.createClassProperty
    },
    get updateClassProperty() {
        return updateClassProperty
    },
    get createFunctionType() {
        return ETSFunctionType.createETSFunctionType
    },
    get updateFunctionType() {
        return updateETSFunctionType
    },
    get createFunctionExpression() {
        return FunctionExpression.create
    },
    get updateFunctionExpression() {
        return updateFunctionExpression
    },
    get createMethodDefinition() {
        return MethodDefinition.create
    },
    get updateMethodDefinition() {
        return updateMethodDefinition
    },
    get createSuperExpression() {
        return SuperExpression.createSuperExpression
    },
    get updateSuperExpression() {
        return updateSuperExpression
    },
    get createTSTypeParameterInstantiation() {
        return TSTypeParameterInstantiation.createTSTypeParameterInstantiation
    },
    get updateTSTypeParameterInstantiation() {
        return updateTSTypeParameterInstantiation
    },
    get createInterfaceDeclaration() {
        return TSInterfaceDeclaration.createTSInterfaceDeclaration
    },
    get updateInterfaceDeclaration() {
        return updateTSInterfaceDeclaration
    },
    get createInterfaceBody() {
        return TSInterfaceBody.createTSInterfaceBody
    },
    get updateInterfaceBody() {
        return updateTSInterfaceBody
    },
    get createUndefinedLiteral() {
        return UndefinedLiteral.createUndefinedLiteral
    },
    get updateUndefinedLiteral() {
        return updateUndefinedLiteral
    },
    get createAnnotationUsage() {
        return AnnotationUsage.createAnnotationUsage
    },
    get updateAnnotationUsage() {
        return updateAnnotationUsage
    },
    get create1AnnotationUsage(): (...args: Parameters<typeof AnnotationUsage.create1AnnotationUsage>) => AnnotationUsage {
        return AnnotationUsage.create1AnnotationUsage;
    },
    get update1AnnotationUsage(): (...args: Parameters<typeof update1AnnotationUsage>) => AnnotationUsage {
        return update1AnnotationUsage;
    },
    get createAssignmentExpression() {
        return AssignmentExpression.create
    },
    get updateAssignmentExpression() {
        return updateAssignmentExpression
    },
    get createETSUndefinedType() {
        return ETSUndefinedType.createETSUndefinedType
    },
    get updateETSUndefinedType() {
        return updateETSUndefinedType
    },
    get createFunctionSignature() {
        return FunctionSignature.createFunctionSignature
    },
    get createConditionalExpression() {
        return ConditionalExpression.createConditionalExpression
    },
    get updateConditionalExpression() {
        return updateConditionalExpression
    },
    get createTSAsExpression() {
        return TSAsExpression.createTSAsExpression
    },
    get updateTSAsExpression() {
        return updateTSAsExpression
    },
    get createThisExpression() {
        return ThisExpression.createThisExpression
    },
    get updateThisExpression() {
        return updateThisExpression
    },
    get createTSTypeAliasDeclaration() {
        return TSTypeAliasDeclaration.createTSTypeAliasDeclaration
    },
    get updateTSTypeAliasDeclaration() {
        return updateTSTypeAliasDeclaration
    },
    get createTSNonNullExpression() {
        return TSNonNullExpression.createTSNonNullExpression
    },
    get updateTSNonNullExpression() {
        return updateTSNonNullExpression
    },
    get createChainExpression() {
        return ChainExpression.createChainExpression
    },
    get updateChainExpression() {
        return updateChainExpression
    },
    get createBlockExpression() {
        return BlockExpression.createBlockExpression
    },
    get updateBlockExpression() {
        return updateBlockExpression
    },
    get createNullLiteral() {
        return NullLiteral.createNullLiteral
    },
    get updateNullLiteral() {
        return updateNullLiteral
    },
    get createETSNewClassInstanceExpression() {
        return ETSNewClassInstanceExpression.createETSNewClassInstanceExpression
    },
    get updateETSNewClassInstanceExpression() {
        return updateETSNewClassInstanceExpression
    },
    get createETSStringLiteralType() {
        return ETSStringLiteralType.create;
    },
    get createBooleanLiteral(): (...args: Parameters<typeof BooleanLiteral.createBooleanLiteral>) => BooleanLiteral {
        return BooleanLiteral.createBooleanLiteral;
    },
    get createObjectExpression(): (...args: Parameters<typeof ObjectExpression.createObjectExpression>) => ObjectExpression {
        return ObjectExpression.createObjectExpression;
    },
    get updateObjectExpression(): (...args: Parameters<typeof updateObjectExpression>) => ObjectExpression {
        return updateObjectExpression;
    },
    get createProperty(): (...args: Parameters<typeof Property.createProperty>) => Property {
        return Property.createProperty;
    },
    get updateProperty(): (...args: Parameters<typeof updateProperty>) => Property {
        return updateProperty;
    },
    get createTemplateLiteral(): (...args: Parameters<typeof TemplateLiteral.createTemplateLiteral>) => TemplateLiteral {
        return TemplateLiteral.createTemplateLiteral;
    },
    get updateTemplateLiteral(): (...args: Parameters<typeof updateTemplateLiteral>) => TemplateLiteral {
        return updateTemplateLiteral;
    },
    get createArrayExpression(): (...args: Parameters<typeof ArrayExpression.createArrayExpression>) => ArrayExpression {
        return ArrayExpression.createArrayExpression;
    },
    get updateArrayExpression(): (...args: Parameters<typeof updateArrayExpression>) => ArrayExpression {
        return updateArrayExpression;
    },
    /** @deprecated */
    createTypeParameter1_(name: Identifier, constraint?: TypeNode, defaultType?: TypeNode) {
        return TSTypeParameter.createTSTypeParameter(Identifier.create1Identifier(name.name), constraint, defaultType)
    },
}
