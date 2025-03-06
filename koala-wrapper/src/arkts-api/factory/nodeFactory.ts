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
    // ScriptFunction,
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
    ReturnStatement,
    ScriptFunction,
    StringLiteral,
    SuperExpression,
    ThisExpression,
    TSInterfaceBody,
    TSInterfaceDeclaration,
    TSTypeParameter,
    TSTypeParameterDeclaration,
    TSTypeParameterInstantiation,
    TypeNode,
    UndefinedLiteral,
    TSAsExpression,
    TSTypeAliasDeclaration
} from "../../generated"
import {
    Es2pandaModifierFlags
} from "../../generated/Es2pandaEnums"
import {
    classPropertySetOptional,
    hasModifierFlag
} from "../utilities/public"

/**
 * @deprecated
 */
function compose<T extends AstNode, ARGS extends any[]>(
    create: (...args: ARGS) => T,
    update: (node: T, original: T) => T = updateNodeByNode
): (node: T, ...args: ARGS) => T {
    return (node: T, ...args: ARGS) => update(create(...args), node);
}

function updateThenAttach<T extends AstNode, ARGS extends any[]>(
    update: (original: T, ...args: ARGS) => T,
    ...attachFuncs: ((node: T, original: T) => T)[]
): (node: T, ...args: ARGS) => T {
    return (node: T, ...args: ARGS) => {
        let _node: T = update(node, ...args);
        attachFuncs.forEach((attach) => {
            _node = attach(_node, node);
        })
        return _node;
    }
}

function attachModifiers<T extends AstNode>(
    node: T,
    original: T
): T {
    node.modifiers = original.modifiers;
    return node;
}

export const factory = {
    get createIdentifier() {
        return Identifier.create2Identifier
    },
    get updateIdentifier() {
        return updateThenAttach(
            Identifier.update2Identifier,
            attachModifiers
        )
    },
    get createCallExpression() {
        return CallExpression.create
    },
    get updateCallExpression() {
        return updateThenAttach(
            CallExpression.update,
            attachModifiers
        )
    },
    get createExpressionStatement() {
        return ExpressionStatement.create
    },
    get updateExpressionStatement() {
        return updateThenAttach(
            ExpressionStatement.update,
            attachModifiers
        )
    },
    get createMemberExpression() {
        return MemberExpression.create
    },
    get updateMemberExpression() {
        return updateThenAttach(
            MemberExpression.update,
            attachModifiers
        )
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
        return updateThenAttach(
            FunctionDeclaration.update,
            attachModifiers
        )
    },
    get createBlock() {
        return BlockStatement.createBlockStatement
    },
    get updateBlock() {
        return updateThenAttach(
            BlockStatement.updateBlockStatement,
            attachModifiers
        )
    },
    get createArrowFunction() {
        return ArrowFunctionExpression.create
    },
    get updateArrowFunction() {
        return updateThenAttach(
            ArrowFunctionExpression.update,
            attachModifiers,
            (node: ArrowFunctionExpression, original: ArrowFunctionExpression) => node.setAnnotations(original.annotations)
        )
    },
    get createScriptFunction() {
        return ScriptFunction.createScriptFunction
    },
    get updateScriptFunction() {
        return updateThenAttach(
            ScriptFunction.updateScriptFunction,
            (node: ScriptFunction, original: ScriptFunction) => ( !!original.id ? node.setIdent(original.id) : node ),
            (node: ScriptFunction, original: ScriptFunction) => node.setAnnotations(original.annotations)
        )
    },
    get createStringLiteral() {
        return StringLiteral.create1StringLiteral
    },
    get updateStringLiteral() {
        return updateThenAttach(
            StringLiteral.update1StringLiteral,
            attachModifiers
        )
    },
    get create1StringLiteral() {
        return StringLiteral.create1StringLiteral
    },
    get update1StringLiteral() {
        return updateThenAttach(
            StringLiteral.update1StringLiteral,
            attachModifiers
        )
    },
    get createNumericLiteral() {
        return NumberLiteral.create
    },
    get updateNumericLiteral() {
        return updateThenAttach(
            compose(NumberLiteral.create), // TODO: No UpdateNumberLiteral, need to change this
            attachModifiers
        )
    },
    get createParameterDeclaration() {
        return ETSParameterExpression.create
    },
    get updateParameterDeclaration() {
        return updateThenAttach(
            ETSParameterExpression.update,
            attachModifiers,
            (node: ETSParameterExpression, original: ETSParameterExpression) => { node.annotations = original.annotations; return node; }
        )
    },
    get createTypeParameter() {
        return TSTypeParameter.createTSTypeParameter
    },
    get updateTypeParameter() {
        return updateThenAttach(
            TSTypeParameter.updateTSTypeParameter,
            attachModifiers
        )
    },
    get createTypeParameterDeclaration() {
        return TSTypeParameterDeclaration.createTSTypeParameterDeclaration
    },
    get updateTypeParameterDeclaration() {
        return updateThenAttach(
            TSTypeParameterDeclaration.updateTSTypeParameterDeclaration,
            attachModifiers
        )
    },
    get createPrimitiveType() {
        return ETSPrimitiveType.createETSPrimitiveType
    },
    get updatePrimitiveType() {
        return updateThenAttach(
            ETSPrimitiveType.updateETSPrimitiveType,
            attachModifiers
        )
    },
    get createTypeReference() {
        return ETSTypeReference.createETSTypeReference
    },
    get updateTypeReference() {
        return updateThenAttach(
            ETSTypeReference.updateETSTypeReference,
            attachModifiers
        )
    },
    get createTypeReferencePart() {
        return ETSTypeReferencePart.createETSTypeReferencePart
    },
    get updateTypeReferencePart() {
        return updateThenAttach(
            ETSTypeReferencePart.updateETSTypeReferencePart,
            attachModifiers
        )
    },
    get createImportDeclaration() {
        return ETSImportDeclaration.createETSImportDeclaration
    },
    get updateImportDeclaration() {
        return updateThenAttach(
            ETSImportDeclaration.updateETSImportDeclaration,
            attachModifiers
        )
    },
    get createImportSpecifier() {
        return ImportSpecifier.createImportSpecifier
    },
    get updateImportSpecifier() {
        return updateThenAttach(
            ImportSpecifier.updateImportSpecifier,
            attachModifiers
        )
    },
    get createVariableDeclaration() {
        return VariableDeclaration.create
    },
    get updateVariableDeclaration() {
        return updateThenAttach(
            VariableDeclaration.update,
            attachModifiers
        )
    },
    get createVariableDeclarator() {
        return VariableDeclarator.create
    },
    get updateVariableDeclarator() {
        return updateThenAttach(
            VariableDeclarator.update,
            attachModifiers
        )
    },
    get createUnionType() {
        return ETSUnionType.createETSUnionType
    },
    get updateUnionType() {
        return updateThenAttach(
            ETSUnionType.updateETSUnionType,
            attachModifiers
        )
    },
    get createReturnStatement() {
        return ReturnStatement.create1ReturnStatement
    },
    get updateReturnStatement() {
        return updateThenAttach(
            ReturnStatement.update1ReturnStatement,
            attachModifiers
        )
    },
    get createIfStatement() {
        return IfStatement.create
    },
    get updateIfStatement() {
        return updateThenAttach(
            IfStatement.update,
            attachModifiers
        )
    },
    get createBinaryExpression() {
        return BinaryExpression.createBinaryExpression
    },
    get updateBinaryExpression() {
        return updateThenAttach(
            BinaryExpression.updateBinaryExpression,
            attachModifiers
        )
    },
    get createClassDeclaration() {
        return ClassDeclaration.createClassDeclaration
    },
    get updateClassDeclaration() {
        return updateThenAttach(
            ClassDeclaration.updateClassDeclaration,
            attachModifiers
        )
    },
    get createStructDeclaration() {
        return StructDeclaration.create
    },
    get updateStructDeclaration() {
        return updateThenAttach(
            StructDeclaration.update,
            attachModifiers
        )
    },
    get createClassDefinition() {
        return ClassDefinition.createClassDefinition
    },
    get updateClassDefinition() {
        return updateThenAttach(
            ClassDefinition.updateClassDefinition,
            (node: ClassDefinition, original: ClassDefinition) => node.setAnnotations(original.annotations)
        )
    },
    get createClassProperty() {
        return ClassProperty.createClassProperty
    },
    get updateClassProperty() {
        return updateThenAttach(
            ClassProperty.updateClassProperty,
            (node: ClassProperty, original: ClassProperty) => node.setAnnotations(original.annotations),
            (node: ClassProperty, original: ClassProperty) => {
                if (hasModifierFlag(original, Es2pandaModifierFlags.MODIFIER_FLAGS_OPTIONAL)) {
                    return classPropertySetOptional(node, true);
                }
                return node;
            }
        )
    },
    get createFunctionType() {
        return ETSFunctionType.createETSFunctionType
    },
    get updateFunctionType() {
        return updateThenAttach(
            ETSFunctionType.updateETSFunctionType,
            attachModifiers,
            (node: ETSFunctionType, original: ETSFunctionType) => node.setAnnotations(original.annotations)
        )
    },
    get createFunctionExpression() {
        return FunctionExpression.create
    },
    get updateFunctionExpression() {
        return updateThenAttach(
            FunctionExpression.update,
            attachModifiers
        )
    },
    get createMethodDefinition() {
        return MethodDefinition.create
    },
    get updateMethodDefinition() {
        return updateThenAttach(
            MethodDefinition.update,
            (node: MethodDefinition, original: MethodDefinition) => node.setOverloads(original.overloads)
        )
    },
    get createSuperExpression() {
        return SuperExpression.createSuperExpression
    },
    get updateSuperExpression() {
        return updateThenAttach(
            SuperExpression.updateSuperExpression,
            attachModifiers
        )
    },
    get createTSTypeParameterInstantiation() {
        return TSTypeParameterInstantiation.createTSTypeParameterInstantiation
    },
    get updateTSTypeParameterInstantiation() {
        return updateThenAttach(
            TSTypeParameterInstantiation.updateTSTypeParameterInstantiation,
            attachModifiers
        )
    },
    get createInterfaceDeclaration() {
        return TSInterfaceDeclaration.createTSInterfaceDeclaration
    },
    get updateInterfaceDeclaration() {
        return updateThenAttach(
            TSInterfaceDeclaration.updateTSInterfaceDeclaration,
            attachModifiers
        )
    },
    get createInterfaceBody() {
        return TSInterfaceBody.createTSInterfaceBody
    },
    get updateInterfaceBody() {
        return updateThenAttach(
            TSInterfaceBody.updateTSInterfaceBody,
            attachModifiers
        )
    },
    get createUndefinedLiteral() {
        return UndefinedLiteral.createUndefinedLiteral
    },
    get updateUndefinedLiteral() {
        return updateThenAttach(
            UndefinedLiteral.updateUndefinedLiteral,
            attachModifiers
        )
    },
    get createAnnotationUsage() {
        return AnnotationUsage.createAnnotationUsage
    },
    get updateAnnotationUsage() {
        return updateThenAttach(
            AnnotationUsage.updateAnnotationUsage,
            attachModifiers
        )
    },
    get createAssignmentExpression() {
        return AssignmentExpression.create
    },
    get updateAssignmentExpression() {
        return updateThenAttach(
            AssignmentExpression.update,
            attachModifiers
        )
    },
    get createETSUndefinedType() {
        return ETSUndefinedType.createETSUndefinedType
    },
    get updateETSUndefinedType() {
        return updateThenAttach(
            ETSUndefinedType.updateETSUndefinedType,
            attachModifiers
        )
    },
    get createFunctionSignature() {
        return FunctionSignature.createFunctionSignature
    },
    get createConditionalExpression() {
        return ConditionalExpression.createConditionalExpression
    },
    get updateConditionalExpression() {
        return updateThenAttach(
            ConditionalExpression.updateConditionalExpression,
            attachModifiers
        )
    },
    get createTSAsExpression() {
        return TSAsExpression.createTSAsExpression
    },
    get updateTSAsExpression() {
        return updateThenAttach(
            TSAsExpression.updateTSAsExpression,
            attachModifiers
        )
    },
    get createThisExpression() {
        return ThisExpression.createThisExpression
    },
    get updateThisExpression() {
        return updateThenAttach(
            ThisExpression.updateThisExpression,
            attachModifiers
        )
    },
    get createTSTypeAliasDeclaration() {
        return TSTypeAliasDeclaration.createTSTypeAliasDeclaration
    },
    get updateTSTypeAliasDeclaration() {
        return updateThenAttach(
            TSTypeAliasDeclaration.updateTSTypeAliasDeclaration,
            attachModifiers,
            (node: TSTypeAliasDeclaration, original: TSTypeAliasDeclaration) => node.setAnnotations(original.annotations)
        )
    },
    /** @deprecated */
    createTypeParameter1_(name: Identifier, constraint?: TypeNode, defaultType?: TypeNode) {
        return TSTypeParameter.createTSTypeParameter(Identifier.create1Identifier(name.name), constraint, defaultType)
    },
}
