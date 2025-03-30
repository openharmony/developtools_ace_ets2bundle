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

import * as arkts from "@koalaui/libarkts";

import { AbstractVisitor } from "../common/abstract-visitor";

interface DeclTransformerOptions {
  arkui: string;
}

export class DeclTransformer extends AbstractVisitor {
  constructor(private options?: DeclTransformerOptions) {
    super();
  }

  processComponent(node: arkts.StructDeclaration): arkts.ClassDeclaration {
    const className = node.definition?.ident?.name;
    if (!className) {
      throw "Non Empty className expected for Component";
    }

    let newDec: arkts.ClassDeclaration = arkts.factory.createClassDeclaration(node.definition);

    console.log("lxc --- old: " + node.definition.body.length);

    const newDefinition = arkts.factory.updateClassDefinition(
      newDec.definition!,
      newDec.definition?.ident,
      undefined,
      undefined,
      newDec.definition?.implements!,
      undefined,
      undefined,
      // newDec.definition?.body!.filter(child => !(arkts.isMethodDefinition(child) && this.fn() && child.name?.name === 'constructor'))!,
      node.definition?.body.filter(child => !(arkts.isMethodDefinition(child) && child.name?.name === 'constructor')),
      newDec.definition?.modifiers!,
      arkts.classDefinitionFlags(newDec.definition!) | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE
    );

    console.log("lxc --- new: " + newDefinition.body.length);

    // console.error(`DeclTransformer:dumpast:${newDefinition.dumpJson()}`)
    

    arkts.factory.updateClassDeclaration(newDec, newDefinition);
    newDec.modifiers = node.modifiers;
    return newDec;
  }

  fn(child: arkts.MethodDefinition) {
    console.error("lxc --- method: " + child.isConstructor() + child.name?.name);
    return true;
  }

  visitor(beforeChildren: arkts.AstNode): arkts.AstNode {
    let astNode:arkts.AstNode = beforeChildren;
    if (arkts.isEtsScript(astNode)) {
      astNode = this.transformImportDecl(astNode);
      // console.error(`liulong------ before visitor`, astNode.dumpJson());
    }

    const node = this.visitEachChild(astNode);
    if (arkts.isStructDeclaration(node)) {
      console.error(`DeclTransformer:before:flag:${arkts.classDefinitionIsFromStructConst(node.definition!)}`);
      arkts.classDefinitionSetFromStructModifier(node.definition!);
      let newnode = this.processComponent(node);
      console.error(`DeclTransformer:after:flag:${arkts.classDefinitionIsFromStructConst(newnode.definition!)}`);
      return newnode;
    }
    return node;
  }

  transformImportDecl(estNode: arkts.AstNode):arkts.AstNode {
    if (!arkts.isEtsScript(estNode)) {
      return estNode;
    }
    // console.error(`liulong------ before transformImportDecl`, estNode.statements.length);
    let statements = estNode.statements.filter(node=>this.isImportDeclarationNeedFilter(node)).map(node=>this.updateImportDeclaration(node));
    // console.error(`liulong------ end transformImportDecl`, statements.length);
    return arkts.factory.updateEtsScript(estNode,statements)
  }

  isImportDeclarationNeedFilter(astNode: arkts.AstNode):boolean {
    // long sir
    return !arkts.isETSImportDeclaration(astNode);
  }

  updateImportDeclaration(astNode: arkts.AstNode):arkts.AstNode {
    return astNode;
  }
}
