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

import { global } from "./static/global"
import { factory } from "./factory/nodeFactory"
import {
    Es2pandaClassDefinitionModifiers,
    Es2pandaImportKinds,
    Es2pandaModifierFlags,
    Es2pandaVariableDeclaratorFlag
} from "../generated/Es2pandaEnums"
import { AstNode } from "./peers/AstNode"
import { 
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
    FunctionSignature
} from "../generated"
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
    isArrowFunctionExpression  
} from "./factory/nodeTests"
import { classDefinitionFlags } from "./utilities/public"

type Visitor = (node: AstNode) => AstNode

export interface DoubleNode {
    originNode: AstNode;
    translatedNode: AstNode;
}

export class StructInfo {
    stateVariables: Set<DoubleNode> = new Set();
    initializeBody: AstNode[] = [];
    updateBody: AstNode[] = [];
}

export class GlobalInfo {
    private _structCollection: Set<string>;
    private static instance: GlobalInfo;
    private _structMap: Map<string, StructInfo>;

    private constructor() {
        this._structCollection = new Set();
        this._structMap = new Map();
    }

    public static getInfoInstance(): GlobalInfo {
        if (!this.instance) {
            this.instance = new GlobalInfo();
        }
        return this.instance;
    }

    public add(str: string): void {
        this._structCollection.add(str);
    }

    public getStructCollection(): Set<string> {
        return this._structCollection;
    }

    public getStructInfo(structName: string): StructInfo {
        const structInfo = this._structMap.get(structName);
        if (!structInfo) {
            return new StructInfo();
        }
        return structInfo;
    }

    public setStructInfo(structName: string, info: StructInfo): void {
        this._structMap.set(structName, info);
    }
}

// TODO: rethink (remove as)
function nodeVisitor<T extends AstNode | undefined>(node: T, visitor: Visitor): T {
    if (node === undefined) {
        return node
    }
    return visitor(node) as T
}

// TODO: rethink (remove as)
function nodesVisitor<T extends AstNode, TIn extends readonly T[] | undefined>(nodes: TIn, visitor: Visitor): T[] | TIn {
    if (nodes === undefined) {
        return nodes
    }
    return nodes.map(node => visitor(node) as T)
}

export function visitEachChild(
    node: AstNode,
    visitor: Visitor
): AstNode {
    if (isEtsScript(node)) {
        const _node = factory.updateEtsScript(
            node,
            nodesVisitor(node.statements, visitor)
        )
        _node.modifiers = node.modifiers;
        return _node;
    }
    if (isCallExpression(node)) {
        const _node = factory.updateCallExpression(
            node,
            nodeVisitor(node.expression, visitor),
            nodesVisitor(node.typeArguments, visitor),
            nodesVisitor(node.arguments, visitor),
            nodeVisitor(node.trailingBlock, visitor)
        )
        _node.modifiers = node.modifiers;
        return _node;
    }
    if (isFunctionDeclaration(node)) {
        const _node = factory.updateFunctionDeclaration(
            node,
            nodeVisitor(node.scriptFunction, visitor),
            node.isAnon,
            node.annotations,
        )
        _node.modifiers = node.modifiers;
        return _node;
    }
    if (isBlockStatement(node)) {
        const _node = factory.updateBlock(
            node,
            nodesVisitor(node.statements, visitor),
        )
        _node.modifiers = node.modifiers;
        return _node;
    }
    if (isExpressionStatement(node)) {
        const _node = factory.updateExpressionStatement(
            node,
            nodeVisitor(node.expression, visitor)
        )
        _node.modifiers = node.modifiers;
        return _node;
    }
    if (isClassDeclaration(node)) {
        const _node = factory.updateClassDeclaration(
            node,
            nodeVisitor(node.definition, visitor)
        )
        _node.modifiers = node.modifiers;
        return _node;
    }
    if (isStructDeclaration(node)) {
        const _node = factory.updateStructDeclaration(
            node,
            nodeVisitor(node.definition, visitor)
        )
        _node.modifiers = node.modifiers;
        return _node;
    }
    if (isClassDefinition(node)) {
        // TODO: fix
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
        ).setAnnotations(node.annotations)
    }
    if (isMethodDefinition(node)) {
        // TODO: fix
        return factory.updateMethodDefinition(
            node,
            node.kind,
            node.name,
            factory.createFunctionExpression(
                // TODO: maybe fix
                nodeVisitor(node.scriptFunction, visitor)
            ),
            node.modifiers,
            false
        )
    }
    if (isScriptFunction(node)) {
        const _node = factory.updateScriptFunction(
            node,
            nodeVisitor(node.body, visitor),
            FunctionSignature.createFunctionSignature(
                nodeVisitor(node.typeParams, visitor),
                nodesVisitor(node.params, visitor),
                nodeVisitor(node.returnTypeAnnotation, visitor),
                node.hasReceiver
            ),
            node.flags,
            node.modifiers
        ).setAnnotations(node.annotations)
        if (!!node.id) {
            _node.setIdent(nodeVisitor(node.id, visitor));
        }
        return _node;
        // return factory.updateScriptFunction(
        //     node,
        //     nodeVisitor(node.body, visitor),
        //     node.scriptFunctionFlags,
        //     node.modifiers,
        //     false,
        //     nodeVisitor(node.ident, visitor),
        //     nodesVisitor(node.parameters, visitor),
        //     nodeVisitor(node.typeParamsDecl, visitor),
        //     nodeVisitor(node.returnTypeAnnotation, visitor),
        //     node.annotations
        // )
    }
    if (isETSImportDeclaration(node)) {
        const importSource = ImportSource.createImportSource(
            nodeVisitor(node.source, visitor),
            nodeVisitor(node.resolvedSource, visitor),
            node.hasDecl
        );
        const importKind = node.isTypeKind
            ? Es2pandaImportKinds.IMPORT_KINDS_TYPE
            : Es2pandaImportKinds.IMPORT_KINDS_VALUE
        const _node = factory.updateImportDeclaration(
            node,
            importSource,
            nodesVisitor(node.specifiers, visitor),
            importKind
        )
        _node.modifiers = node.modifiers;
        return _node;
    }
    if (isMemberExpression(node)) {
        const _node = factory.updateMemberExpression(
            node,
            nodeVisitor(node.object, visitor),
            nodeVisitor(node.property, visitor),
            node.kind,
            node.computed,
            node.optional
        )
        _node.modifiers = node.modifiers;
        return _node;
    }
    if (isTSInterfaceDeclaration(node)) {
        const _node = factory.updateInterfaceDeclaration(
            node,
            nodesVisitor(node.extends, visitor),
            nodeVisitor(node.id, visitor),
            nodeVisitor(node.typeParams, visitor),
            nodeVisitor(node.body, visitor),
            node.isStatic,
            // TODO: how do I get it?
            true
        )
        _node.modifiers = node.modifiers;
        return _node;
    }
    // if (isTSInterfaceBody(node)) {
    //     const _node = factory.updateInterfaceBody(
    //         node,
    //         nodesVisitor(node.body, visitor)
    //     )
    //     _node.modifiers = node.modifiers;
    //     return _node;
    // }
    if (isIfStatement(node)) {
        const _node = factory.updateIfStatement(
            node,
            nodeVisitor(node.test, visitor),
            nodeVisitor(node.consequent, visitor),
            nodeVisitor(node.alternate, visitor),
        )
        _node.modifiers = node.modifiers;
        return _node;
    }
    if (isConditionalExpression(node)) {
        const _node = factory.updateConditionalExpression(
            node,
            nodeVisitor(node.test, visitor),
            nodeVisitor(node.consequent, visitor),
            nodeVisitor(node.alternate, visitor),
        )
        _node.modifiers = node.modifiers;
        return _node;
    }
    if (isVariableDeclaration(node)) {
        const _node = factory.updateVariableDeclaration(
            node,
            0,
            node.declarationKind,
            nodesVisitor(node.declarators, visitor),
        )
        _node.modifiers = node.modifiers;
        return _node;
    }
    if (isVariableDeclarator(node)) {
        const _node = factory.updateVariableDeclarator(
            node,
            global.generatedEs2panda._VariableDeclaratorFlag(global.context, node.peer),
            nodeVisitor(node.name, visitor),
            nodeVisitor(node.initializer, visitor),
        )
        _node.modifiers = node.modifiers;
        return _node;
    }
    if (isArrowFunctionExpression(node)) {
        const _node = factory.updateArrowFunction(
            node,
            nodeVisitor(node.scriptFunction, visitor),
        )
        _node.modifiers = node.modifiers;
        return _node;
    }
    if (isTSAsExpression(node)) {
        const _node = factory.updateTSAsExpression(
            node,
            nodeVisitor(node.expr, visitor),
            nodeVisitor(node.typeAnnotation, visitor),
            node.isConst
        );
        _node.modifiers = node.modifiers;
        return _node;
    }
    // TODO
    return node
}
