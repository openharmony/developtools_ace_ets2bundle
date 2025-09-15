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
import { AbstractUISyntaxRule } from './ui-syntax-rule';
import { isBuiltInAttribute } from '../utils';

class NoSameAsBuiltInAttributeRule extends AbstractUISyntaxRule {
  public setup(): Record<string, string> {
    return {
      duplicateName: `The struct '{{structName}}' cannot have the same name as the built-in attribute '{{builtInName}}'.`,
    };
  }

  public parsed(node: arkts.AstNode): void {
    if (!arkts.isStructDeclaration(node)) {
      return;
    }
    if (!node.definition) {
      return;
    }
    if (!arkts.isClassDefinition(node.definition)) {
      return;
    }
    const structIdent = node.definition.ident;
    const structName = node.definition.ident?.name ?? ' ';
    // If the struct name matches any built-in attribute, report an error
    if (structIdent && isBuiltInAttribute(this.context, structName)) {
      const builtInName = structName;
      this.report({
        node: structIdent,
        message: this.messages.duplicateName,
        data: { structName, builtInName }
      });
    }
  }
};

export default NoSameAsBuiltInAttributeRule;
