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

import { global } from './static/global';
import { factory } from './factory/nodeFactory';
import {
    Es2pandaClassDefinitionModifiers,
    Es2pandaImportKinds,
    Es2pandaModifierFlags,
    Es2pandaVariableDeclaratorFlag,
} from '../generated/Es2pandaEnums';
import { AstNode } from './peers/AstNode';
import {
    isAwaitExpression,
    isBlockStatement,
    isConditionalExpression,
    isTSInterfaceBody,
    isTSInterfaceDeclaration,
    isClassDeclaration,
    isClassDefinition,
    isTSAsExpression,
    isETSImportDeclaration,
    ImportSource,
    isScriptFunction,
    FunctionSignature,
    Property,
    isClassProperty,
    isImportDeclaration,
    isObjectExpression,
    ObjectExpression,
    isProperty,
    Expression,
    isETSNewClassInstanceExpression,
    isTemplateLiteral,
    isBlockExpression,
    isReturnStatement,
    isArrayExpression,
    isTryStatement,
    isBinaryExpression,
    isForInStatement,
    isForUpdateStatement,
    isForOfStatement,
    isTSTypeAliasDeclaration,
    isETSParameterExpression,
    isETSFunctionType,
    isSwitchStatement,
    isSwitchCaseStatement,
    isSpreadElement,
    isClassStaticBlock,
    isFunctionExpression,
    FunctionExpression
} from '../generated';
import {
    isEtsScript,
    isCallExpression,
    isFunctionDeclaration,
    isExpressionStatement,
    isStructDeclaration,
    isMethodDefinition,
    // isScriptFunction,
    isMemberExpression,
    isIfStatement,
    isVariableDeclaration,
    isVariableDeclarator,
    isArrowFunctionExpression,
    isAssignmentExpression,
    isEtsParameterExpression,
} from './factory/nodeTests';
import { classDefinitionFlags } from './utilities/public';
import { Es2pandaAstNodeType } from '../Es2pandaEnums';
import { updateFunctionExpression } from './node-utilities/FunctionExpression';
import { MethodDefinition } from './types';

type Visitor = (node: AstNode) => AstNode;

// TODO: rethink (remove as)
function nodeVisitor<T extends AstNode | undefined>(node: T, visitor: Visitor): T {
    if (node === undefined) {
        return node;
    }
    return visitor(node) as T;
}

// TODO: rethink (remove as)
function nodesVisitor<T extends AstNode, TIn extends readonly T[] | undefined>(
    nodes: TIn,
    visitor: Visitor
): T[] | TIn {
    if (nodes === undefined) {
        return nodes;
    }
    return nodes.map((node) => visitor(node) as T);
}

let updated: boolean = false;

export function visitEachChild(node: AstNode, visitor: Visitor): AstNode {
    updated = false;
    let script: AstNode = node;
    script = visitETSModule(script, visitor);
    script = visitDeclaration(script, visitor);
    script = visitDefinition(script, visitor);
    script = visitDefinitionBody(script, visitor);
    script = visitStatement(script, visitor);
    script = visitForLoopStatement(script, visitor);
    script = visitSwitchCaseStatement(script, visitor);
    script = visitOuterExpression(script, visitor);
    script = visitInnerExpression(script, visitor);
    script = visitTrivialExpression(script, visitor);
    script = visitLiteral(script, visitor);
    // TODO
    return visitWithoutUpdate(script, visitor);
}

function visitOuterExpression(node: AstNode, visitor: Visitor): AstNode {
    if (updated) {
        return node;
    } else if (isBlockExpression(node)) {
        updated = true;
        return factory.updateBlockExpression(node, nodesVisitor(node.statements, visitor));
    } else if (isCallExpression(node)) {
        updated = true;
        const call = factory.updateCallExpression(
            node,
            nodeVisitor(node.expression, visitor),
            nodesVisitor(node.typeArguments, visitor),
            nodesVisitor(node.arguments, visitor)
        );
        if (!!node.trailingBlock) {
            call.setTralingBlock(nodeVisitor(node.trailingBlock, visitor));
        }
        return call;
    } else if (isArrowFunctionExpression(node)) {
        updated = true;
        return factory.updateArrowFunction(node, nodeVisitor(node.scriptFunction, visitor));
    } else if (isAssignmentExpression(node)) {
        updated = true;
        return factory.updateAssignmentExpression(
            node,
            nodeVisitor(node.left as Expression, visitor),
            node.operatorType,
            nodeVisitor(node.right as Expression, visitor)
        );
    } else if (isETSNewClassInstanceExpression(node)) {
        updated = true;
        return factory.updateETSNewClassInstanceExpression(
            node,
            nodeVisitor(node.getTypeRef, visitor),
            nodesVisitor(node.getArguments, visitor)
        );
    }
    if (isArrayExpression(node)) {
        updated = true;
        return factory.updateArrayExpression(node, nodesVisitor(node.elements, visitor));
    }
    return node;
}

function visitInnerExpression(node: AstNode, visitor: Visitor): AstNode {
    if (updated) {
        return node;
    }
    if (isMemberExpression(node)) {
        updated = true;
        return factory.updateMemberExpression(
            node,
            nodeVisitor(node.object, visitor),
            nodeVisitor(node.property, visitor),
            node.kind,
            node.computed,
            node.optional
        );
    }
    if (isConditionalExpression(node)) {
        updated = true;
        return factory.updateConditionalExpression(
            node,
            nodeVisitor(node.test, visitor),
            nodeVisitor(node.consequent, visitor),
            nodeVisitor(node.alternate, visitor)
        );
    }
    if (isTSAsExpression(node)) {
        updated = true;
        return factory.updateTSAsExpression(
            node,
            nodeVisitor(node.expr, visitor),
            nodeVisitor(node.typeAnnotation, visitor),
            node.isConst
        );
    }
    if (isObjectExpression(node)) {
        updated = true;
        return factory.updateObjectExpression(
            node,
            Es2pandaAstNodeType.AST_NODE_TYPE_OBJECT_EXPRESSION,
            nodesVisitor(node.properties as Property[], visitor),
            false
        );
    }
    if (isProperty(node)) {
        updated = true;
        return factory.updateProperty(node, node.key, nodeVisitor(node.value, visitor));
    }
    // TODO
    return node;
}

function visitTrivialExpression(node: AstNode, visitor: Visitor): AstNode {
    if (updated) {
        return node;
    }
    if (
        global.generatedEs2panda._AstNodeTypeConst(global.context, node.peer) ===
        Es2pandaAstNodeType.AST_NODE_TYPE_FUNCTION_EXPRESSION
    ) {
        updated = true;
        return factory.updateFunctionExpression(
            node as FunctionExpression,
            nodeVisitor((node as FunctionExpression).scriptFunction, visitor)
        );
    }
    if (isBinaryExpression(node)) {
        updated = true;
        return factory.updateBinaryExpression(
            node,
            nodeVisitor(node.left, visitor),
            nodeVisitor(node.right, visitor),
            node.operatorType
        );
    }
    if (isAwaitExpression(node)) {
        updated = true;
        return factory.updateAwaitExpression(
            node,
            nodeVisitor(node.argument, visitor)
        );
    }
    if (isSpreadElement(node)) {
        const nodeType = global.generatedEs2panda._AstNodeTypeConst(global.context, node.peer);
        return factory.updateSpreadElement(node, nodeType, nodeVisitor(node.argument, visitor));
    }
    // TODO
    return node;
}

function visitDeclaration(node: AstNode, visitor: Visitor): AstNode {
    if (updated) {
        return node;
    } else if (isFunctionDeclaration(node)) {
        updated = true;
        return factory.updateFunctionDeclaration(
            node,
            nodeVisitor(node.scriptFunction, visitor),
            node.isAnon,
            node.annotations
        );
    } else if (isClassDeclaration(node)) {
        updated = true;
        return factory.updateClassDeclaration(node, nodeVisitor(node.definition, visitor));
    } else if (isStructDeclaration(node)) {
        updated = true;
        return factory.updateStructDeclaration(node, nodeVisitor(node.definition, visitor));
    } else if (isTSInterfaceDeclaration(node)) {
        updated = true;
        return factory.updateInterfaceDeclaration(
            node,
            nodesVisitor(node.extends, visitor),
            nodeVisitor(node.id, visitor),
            nodeVisitor(node.typeParams, visitor),
            nodeVisitor(node.body, visitor),
            node.isStatic,
            // TODO: how do I get it?
            true
        );
    } else if (isVariableDeclaration(node)) {
        updated = true;
        return factory.updateVariableDeclaration(
            node,
            0,
            node.declarationKind,
            nodesVisitor(node.declarators, visitor)
        );
    } else if (isTSTypeAliasDeclaration(node)) {
        updated = true;
        return factory.updateTSTypeAliasDeclaration(
            node,
            node.id,
            nodeVisitor(node.typeParams, visitor),
            nodeVisitor(node.typeAnnotation, visitor)
        );
    }
    // TODO
    return node;
}

function visitMethodDefinition(node: MethodDefinition, visitor: Visitor): MethodDefinition {
    const newOverloads: readonly MethodDefinition[] = nodesVisitor(node.overloads, visitor);
    const newNode = factory.updateMethodDefinition(
        node,
        node.kind,
        node.name,
        nodeVisitor(node.scriptFunction, visitor),
        node.modifiers,
        false
    );
    node.setOverloads(newOverloads);
    newOverloads.forEach((it): void => {
        it.setBaseOverloadMethod(node);
        it.parent = node;
    });
    return newNode;
}

function visitDefinition(node: AstNode, visitor: Visitor): AstNode {
    if (updated) {
        return node;
    }
    if (isClassDefinition(node)) {
        updated = true;
        return factory.updateClassDefinition(
            node,
            node.ident,
            node.typeParams,
            node.superTypeParams,
            node.implements,
            undefined,
            node.super,
            nodesVisitor(node.body, visitor),
            node.modifiers,
            classDefinitionFlags(node)
        );
    }
    if (isMethodDefinition(node)) {
        updated = true;
        return visitMethodDefinition(node, visitor);
    }
    if (isTSInterfaceBody(node)) {
        updated = true;
        return factory.updateInterfaceBody(node, nodesVisitor(node.body, visitor));
    }
    if (isVariableDeclarator(node)) {
        updated = true;
        return factory.updateVariableDeclarator(
            node,
            global.generatedEs2panda._VariableDeclaratorFlag(global.context, node.peer),
            nodeVisitor(node.name, visitor),
            nodeVisitor(node.initializer, visitor)
        );
    }
    return node;
}

function visitStatement(node: AstNode, visitor: Visitor): AstNode {
    if (updated) {
        return node;
    }
    if (isBlockStatement(node)) {
        updated = true;
        return factory.updateBlock(node, nodesVisitor(node.statements, visitor));
    }
    if (isExpressionStatement(node)) {
        updated = true;
        return factory.updateExpressionStatement(node, nodeVisitor(node.expression, visitor));
    }
    if (isIfStatement(node)) {
        updated = true;
        return factory.updateIfStatement(
            node,
            nodeVisitor(node.test, visitor),
            nodeVisitor(node.consequent, visitor),
            nodeVisitor(node.alternate, visitor)
        );
    }
    if (isReturnStatement(node)) {
        updated = true;
        return factory.updateReturnStatement(node, nodeVisitor(node.argument, visitor));
    }
    if (isTryStatement(node)) {
        updated = true;
        return factory.updateTryStatement(
            node,
            nodeVisitor(node.block, visitor),
            nodesVisitor(node.catchClauses, visitor),
            nodeVisitor(node.finallyBlock, visitor),
            [],
            []
        );
    }
    // TODO
    return node;
}

function visitForLoopStatement(node: AstNode, visitor: Visitor): AstNode {
    if (updated) {
        return node;
    }
    if (isForUpdateStatement(node)) {
        updated = true;
        return factory.updateForUpdateStatement(
            node,
            nodeVisitor(node.init, visitor),
            nodeVisitor(node.test, visitor),
            nodeVisitor(node.update, visitor),
            nodeVisitor(node.body, visitor)
        );
    }
    if (isForInStatement(node)) {
        updated = true;
        return factory.updateForInStatement(
            node,
            nodeVisitor(node.left, visitor),
            nodeVisitor(node.right, visitor),
            nodeVisitor(node.body, visitor)
        );
    }
    if (isForOfStatement(node)) {
        updated = true;
        return factory.updateForOfStatement(
            node,
            nodeVisitor(node.left, visitor),
            nodeVisitor(node.right, visitor),
            nodeVisitor(node.body, visitor),
            node.isAwait
        );
    }
    return node;
}

function visitSwitchCaseStatement(node: AstNode, visitor: Visitor): AstNode {
    if (updated) {
        return node;
    }
    if (isSwitchStatement(node)) {
        return factory.updateSwitchStatement(
            node,
            nodeVisitor(node.discriminant, visitor),
            nodesVisitor(node.cases, visitor)
        );
    }
    if (isSwitchCaseStatement(node)) {
        return factory.updateSwitchCaseStatement(node, node.test, nodesVisitor(node.consequent, visitor));
    }
    return node;
}

function visitETSModule(node: AstNode, visitor: Visitor): AstNode {
    if (updated) {
        return node;
    }
    if (isEtsScript(node)) {
        updated = true;
        return factory.updateEtsScript(node, nodesVisitor(node.statements, visitor));
    }
    return node;
}

function visitDefinitionBody(node: AstNode, visitor: Visitor): AstNode {
    if (updated) {
        return node;
    }
    if (isScriptFunction(node)) {
        updated = true;
        return factory.updateScriptFunction(
            node,
            nodeVisitor(node.body, visitor),
            factory.createFunctionSignature(
                nodeVisitor(node.typeParams, visitor),
                nodesVisitor(node.params, visitor),
                nodeVisitor(node.returnTypeAnnotation, visitor),
                node.hasReceiver
            ),
            node.flags,
            node.modifiers
        );
    }
    if (isClassProperty(node)) {
        updated = true;
        return factory.updateClassProperty(
            node,
            node.key,
            nodeVisitor(node.value, visitor),
            node.typeAnnotation,
            node.modifiers,
            node.isComputed
        );
    }
    if (isClassStaticBlock(node)) {
        updated = true;
        return factory.updateClassStaticBlock(
            node,
            nodeVisitor(node.value, visitor)
        );
    }
    // TODO
    return node;
}

function visitLiteral(node: AstNode, visitor: Visitor): AstNode {
    if (updated) {
        return node;
    }
    if (isTemplateLiteral(node)) {
        updated = true;
        return factory.updateTemplateLiteral(
            node,
            nodesVisitor(node.quasis, visitor),
            nodesVisitor(node.expressions, visitor),
            node.multilineString
        );
    }
    return node;
}

// TODO: apply this to all nodes that does not require updating
function visitWithoutUpdate<T extends AstNode>(node: T, visitor: Visitor): T {
    if (updated) {
        return node;
    }
    if (isImportDeclaration(node)) {
        nodesVisitor(node.specifiers, visitor);
    }
    if (isETSFunctionType(node)) {
        nodesVisitor(node.params, visitor);
    }
    if (isEtsParameterExpression(node)) {
        nodeVisitor(node.type, visitor);
    }
    return node;
}
