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
    VariableDeclarator
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
    TSAsExpression
} from "../../generated"

function compose<T extends AstNode, ARGS extends any[]>(
    create: (...args: ARGS) => T,
    update: (node: T, original: T) => T = updateNodeByNode
): (node: T, ...args: ARGS) => T {
    return (node: T, ...args: ARGS) => update(create(...args), node);
}

export const factory = {
    get createIdentifier() {
        return Identifier.create2Identifier
    },
    get updateIdentifier() {
        return Identifier.update2Identifier
    },
    get createCallExpression() {
        return CallExpression.create
    },
    get updateCallExpression() {
        return CallExpression.update
    },
    get createExpressionStatement() {
        return ExpressionStatement.create
    },
    get updateExpressionStatement() {
        return ExpressionStatement.update
    },
    get createMemberExpression() {
        return MemberExpression.create
    },
    get updateMemberExpression() {
        return MemberExpression.update
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
        return FunctionDeclaration.update
    },
    get createBlock() {
        return BlockStatement.createBlockStatement
    },
    get updateBlock() {
        return BlockStatement.updateBlockStatement
    },
    get createArrowFunction() {
        return ArrowFunctionExpression.create
    },
    get updateArrowFunction() {
        return ArrowFunctionExpression.update
    },
    get createScriptFunction() {
        return ScriptFunction.createScriptFunction
    },
    get updateScriptFunction() {
        return ScriptFunction.updateScriptFunction
    },
    get createStringLiteral() {
        return StringLiteral.create1StringLiteral
    },
    get updateStringLiteral() {
        return StringLiteral.update1StringLiteral
    },
    get create1StringLiteral() {
        return StringLiteral.create1StringLiteral
    },
    get update1StringLiteral() {
        return StringLiteral.update1StringLiteral
    },
    get createNumericLiteral() {
        return NumberLiteral.create
    },
    get updateNumericLiteral() {
        return compose(NumberLiteral.create) // TODO: No UpdateNumberLiteral, need to change this
    },
    get createParameterDeclaration() {
        return ETSParameterExpression.create
    },
    get updateParameterDeclaration() {
        return ETSParameterExpression.update
    },
    get createTypeParameter() {
        return TSTypeParameter.createTSTypeParameter
    },
    get updateTypeParameter() {
        return TSTypeParameter.updateTSTypeParameter
    },
    get createTypeParameterDeclaration() {
        return TSTypeParameterDeclaration.createTSTypeParameterDeclaration
    },
    get updateTypeParameterDeclaration() {
        return TSTypeParameterDeclaration.updateTSTypeParameterDeclaration
    },
    get createPrimitiveType() {
        return ETSPrimitiveType.createETSPrimitiveType
    },
    get updatePrimitiveType() {
        return ETSPrimitiveType.updateETSPrimitiveType
    },
    get createTypeReference() {
        return ETSTypeReference.createETSTypeReference
    },
    get updateTypeReference() {
        return ETSTypeReference.updateETSTypeReference
    },
    get createTypeReferencePart() {
        return ETSTypeReferencePart.createETSTypeReferencePart
    },
    get updateTypeReferencePart() {
        return ETSTypeReferencePart.updateETSTypeReferencePart
    },
    get createImportDeclaration() {
        return ETSImportDeclaration.createETSImportDeclaration
    },
    get updateImportDeclaration() {
        return ETSImportDeclaration.updateETSImportDeclaration
    },
    get createImportSpecifier() {
        return ImportSpecifier.createImportSpecifier
    },
    get updateImportSpecifier() {
        return ImportSpecifier.updateImportSpecifier
    },
    get createVariableDeclaration() {
        return VariableDeclaration.create
    },
    get updateVariableDeclaration() {
        return VariableDeclaration.update
    },
    get createVariableDeclarator() {
        return VariableDeclarator.create
    },
    get updateVariableDeclarator() {
        return VariableDeclarator.update
    },
    get createUnionType() {
        return ETSUnionType.createETSUnionType
    },
    get updateUnionType() {
        return ETSUnionType.updateETSUnionType
    },
    get createReturnStatement() {
        return ReturnStatement.create1ReturnStatement
    },
    get updateReturnStatement() {
        return ReturnStatement.update1ReturnStatement
    },
    get createIfStatement() {
        return IfStatement.create
    },
    get updateIfStatement() {
        return IfStatement.update
    },
    get createBinaryExpression() {
        return BinaryExpression.createBinaryExpression
    },
    get updateBinaryExpression() {
        return BinaryExpression.updateBinaryExpression
    },
    get createClassDeclaration() {
        return ClassDeclaration.createClassDeclaration
    },
    get updateClassDeclaration() {
        return ClassDeclaration.updateClassDeclaration
    },
    get createStructDeclaration() {
        return StructDeclaration.create
    },
    get updateStructDeclaration() {
        return StructDeclaration.update
    },
    get createClassDefinition() {
        return ClassDefinition.createClassDefinition
    },
    get updateClassDefinition() {
        return ClassDefinition.updateClassDefinition
    },
    get createClassProperty() {
        return ClassProperty.createClassProperty
    },
    get updateClassProperty() {
        return ClassProperty.updateClassProperty
    },
    get createFunctionType() {
        return ETSFunctionType.createETSFunctionType
    },
    get updateFunctionType() {
        return ETSFunctionType.updateETSFunctionType
    },
    get createFunctionExpression() {
        return FunctionExpression.create
    },
    get updateFunctionExpression() {
        return FunctionExpression.update
    },
    get createMethodDefinition() {
        return MethodDefinition.create
    },
    get updateMethodDefinition() {
        return MethodDefinition.update
    },
    get createSuperExpression() {
        return SuperExpression.createSuperExpression
    },
    get updateSuperExpression() {
        return SuperExpression.updateSuperExpression
    },
    get createTSTypeParameterInstantiation() {
        return TSTypeParameterInstantiation.createTSTypeParameterInstantiation
    },
    get updateTSTypeParameterInstantiation() {
        return TSTypeParameterInstantiation.updateTSTypeParameterInstantiation
    },
    get createInterfaceDeclaration() {
        return TSInterfaceDeclaration.createTSInterfaceDeclaration
    },
    get updateInterfaceDeclaration() {
        return TSInterfaceDeclaration.updateTSInterfaceDeclaration
    },
    get createInterfaceBody() {
        return TSInterfaceBody.createTSInterfaceBody
    },
    get updateInterfaceBody() {
        return TSInterfaceBody.updateTSInterfaceBody
    },
    get createUndefinedLiteral() {
        return UndefinedLiteral.createUndefinedLiteral
    },
    get updateUndefinedLiteral() {
        return UndefinedLiteral.updateUndefinedLiteral
    },
    get createAnnotationUsage() {
        return AnnotationUsage.createAnnotationUsage
    },
    get updateAnnotationUsageIr() {
        return AnnotationUsage.updateAnnotationUsage
    },
    get createAssignmentExpression() {
        return AssignmentExpression.create
    },
    get updateAssignmentExpression() {
        return AssignmentExpression.update
    },
    get createETSUndefinedType() {
        return ETSUndefinedType.createETSUndefinedType
    },
    get updateETSUndefinedType() {
        return ETSUndefinedType.updateETSUndefinedType
    },
    get createFunctionSignature() {
        return FunctionSignature.createFunctionSignature
    },
    get createConditionalExpression() {
        return ConditionalExpression.createConditionalExpression
    },
    get updateConditionalExpression() {
        return ConditionalExpression.updateConditionalExpression
    },
    get createTSAsExpression() {
        return TSAsExpression.createTSAsExpression
    },
    get updateTSAsExpression() {
        return TSAsExpression.updateTSAsExpression
    },
    get createThisExpression() {
        return ThisExpression.createThisExpression
    },
    get updateThisExpression() {
        return ThisExpression.updateThisExpression
    },
    get createTSNonNullExpression() {
        return TSNonNullExpression.createTSNonNullExpression;
    },
    get updateTSNonNullExpression() {
        return TSNonNullExpression.updateTSNonNullExpression;
    },
    get createNullLiteral() {
        return NullLiteral.createNullLiteral;
    },
    get updateNullLiteral() {
        return NullLiteral.updateNullLiteral;
    },
    /** @deprecated */
    createTypeParameter1_(name: Identifier, constraint?: TypeNode, defaultType?: TypeNode) {
        return TSTypeParameter.createTSTypeParameter(Identifier.create1Identifier(name.name), constraint, defaultType)
    },
}
