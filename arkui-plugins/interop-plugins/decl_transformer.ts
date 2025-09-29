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

import { AbstractVisitor } from '../common/abstract-visitor';
import { ARKUI_DECLARE_LIST } from './arkuiImportList';
import { debugLog } from '../common/debug';

export class DeclTransformer extends AbstractVisitor {
    constructor(private options?: interop.DeclTransformerOptions) {
        super();
    }

    processComponent(node: arkts.StructDeclaration): arkts.ClassDeclaration {
        const className = node.definition?.ident?.name;
        if (!className) {
            throw 'Non Empty className expected for Component';
        }

        let newDec: arkts.ClassDeclaration = arkts.factory.createClassDeclaration(node.definition);

        const newDefinition = arkts.factory.updateClassDefinition(
            newDec.definition!,
            newDec.definition?.ident,
            undefined,
            undefined,
            newDec.definition?.implements!,
            undefined,
            undefined,
            node.definition?.body,
            newDec.definition?.modifiers!,
            arkts.classDefinitionFlags(newDec.definition!) | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE
        );

        arkts.factory.updateClassDeclaration(newDec, newDefinition);
        newDec.modifiers = node.modifiers;
        return newDec;
    }

    visitor(beforeChildren: arkts.AstNode): arkts.AstNode {
        let astNode: arkts.AstNode = beforeChildren;
        if (arkts.isEtsScript(astNode)) {
            astNode = this.transformImportDecl(astNode);
        }
        const node = this.visitEachChild(astNode);
        if (arkts.isStructDeclaration(node)) {
            debugLog(`DeclTransformer:before:flag:${arkts.classDefinitionIsFromStructConst(node.definition!)}`);
            arkts.classDefinitionSetFromStructModifier(node.definition!);
            let newnode = this.processComponent(node);
            debugLog(`DeclTransformer:after:flag:${arkts.classDefinitionIsFromStructConst(newnode.definition!)}`);
            return newnode;
        } else if (arkts.isETSImportDeclaration(astNode)) {
            return this.updateImportDeclaration(astNode);
        } else if (arkts.isMethodDefinition(astNode)) {
            if (astNode.name?.name === 'build' ) {
                return this.transformMethodDefinition(astNode);
            }
            return astNode;
        } else if (arkts.isClassProperty(astNode)) {
            astNode.setAnnotations([]);
        } else if (arkts.isVariableDeclarator(astNode)) {
            return this.transformWrappedBuilderVarDecl(astNode);
        }
        return node;
    }

    transformImportDecl(astNode: arkts.AstNode):arkts.AstNode {
        if (!arkts.isEtsScript(astNode)) {
            return astNode;
        }
        let statements = astNode.statements.filter(node => this.isImportDeclarationNeedFilter(node));
        return arkts.factory.updateEtsScript(astNode, statements);
  }

    transformMethodDefinition(node: arkts.MethodDefinition): arkts.AstNode {
        const func: arkts.ScriptFunction = node.scriptFunction;
        const isFunctionCall: boolean = false;
        const typeNode: arkts.TypeNode | undefined = node.scriptFunction?.returnTypeAnnotation;
        const updateFunc = arkts.factory.updateScriptFunction(
            func,
            !!func.body && arkts.isBlockStatement(func.body)
            ? arkts.factory.updateBlock(
                    func.body,
                    func.body.statements.filter((st) => false)
                )
            : undefined,
            arkts.FunctionSignature.createFunctionSignature(func.typeParams, func.params, func.returnTypeAnnotation, false),
            func?.flags,
            func?.modifiers
        );

        return arkts.factory.updateMethodDefinition(
            node,
            node.kind,
            arkts.factory.updateIdentifier(
                node.name,
                node.name?.name
            ),
            updateFunc,
            node.modifiers,
            false
        );
    }
  
    isImportDeclarationNeedFilter(astNode: arkts.AstNode):boolean {
        if (!arkts.isETSImportDeclaration(astNode)) {
            return true;
        }
        return astNode?.source?.str !== '@global.arkui';
    }

    updateImportDeclaration(astNode: arkts.AstNode):arkts.AstNode {
        if (!arkts.isETSImportDeclaration(astNode) || (astNode?.source?.str !== '@ohos.arkui.component' && astNode?.source?.str !== '@ohos.arkui.stateManagement')) {
            return astNode;
        }
        astNode.specifiers.forEach((element) => {
            if (arkts.isImportSpecifier(element)) {
                if (ARKUI_DECLARE_LIST.has(element.imported?.name as string)) {
                    arkts.ImportSpecifierSetRemovable(element);
                }
            }
        });
        return astNode;
    }

    transformWrappedBuilderVarDecl(node: arkts.VariableDeclarator): arkts.VariableDeclarator {
        const typeAnn = node?.name?.typeAnnotation;
        if (!typeAnn || !arkts.isETSTypeReference(typeAnn)) {
            return node;
        }
        const part = typeAnn.part;
        if (!part?.name || !arkts.isIdentifier(part?.name) || part?.name.name !== 'WrappedBuilder') {
            return node;
        }
        const fnType = part.typeParams?.params?.[0];
        if (!fnType || !arkts.isETSFunctionType(fnType)) {
            return node;
        }
        const types: arkts.TypeNode[] = [];
        for (const p of fnType.params) {
            if (!arkts.isEtsParameterExpression(p) || !p.type || !arkts.isTypeNode(p.type)) {
                return node;
            }
            types.push(p.type);
        }
        const tuple = arkts.ETSTuple.create2ETSTuple(types);

        const newTypeParams = arkts.factory.updateTSTypeParameterInstantiation(part.typeParams, [tuple]);
        const newPart = arkts.factory.updateTypeReferencePart(part, part.name, newTypeParams, part.previous);
        const newTypeRef = arkts.factory.updateTypeReference(typeAnn, newPart);
        const newId = arkts.factory.updateIdentifier(node.name, node.name.name, newTypeRef);
        return arkts.factory.updateVariableDeclarator(node, node.flag, newId, node.initializer);
    }
}
