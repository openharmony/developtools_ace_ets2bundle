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

import { debugLog } from '../common/debug';

export class EmitTransformer extends AbstractVisitor {
  constructor(private options?: interop.EmitTransformerOptions) {
    super();
  }

  processComponent(node: arkts.ClassDeclaration): arkts.ClassDeclaration {
    const className = node.definition?.ident?.name;
    if (!className) {
      throw "Non Empty className expected for Component";
    }

    const newDefinition = arkts.factory.updateClassDefinition(
      node.definition,
      node.definition?.ident,
      undefined,
      undefined,
      node.definition?.implements,
      undefined,
      undefined,
      node.definition?.body,
      node.definition?.modifiers,
      arkts.classDefinitionFlags(node.definition) | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_NONE
    );

    let newDec: arkts.ClassDeclaration = arkts.factory.updateClassDeclaration(node, newDefinition);

    debugLog(`DeclTransformer:checked:struct_ast:${newDefinition.dumpJson()}`);
    newDec.modifiers = node.modifiers;
    return newDec;
  }

  visitor(beforeChildren: arkts.AstNode): arkts.AstNode {
    const node = this.visitEachChild(beforeChildren);
    if (arkts.isClassDeclaration(node) && arkts.classDefinitionIsFromStructConst(node.definition!)) {
      return this.processComponent(node);
    }
    return node;
  }
}
