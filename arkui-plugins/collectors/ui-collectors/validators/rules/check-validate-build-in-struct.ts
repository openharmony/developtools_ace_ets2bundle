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
import { BaseValidator } from '../base';
import { CustomComponentInfo } from '../../records';
import { LogType } from '../../../../common/predefines';
import { createSuggestion } from '../../../../common/log-collector';
import { getPerfName, performanceLog } from '../../../../common/debug';

const BUILD_NAME = 'build';

export const checkValidateBuildInStruct = performanceLog(
    _checkValidateBuildInStruct,
    getPerfName([0, 0, 0, 0, 0], 'checkValidateBuildInStruct')
);

function _checkValidateBuildInStruct(
  this: BaseValidator<arkts.ClassDeclaration, CustomComponentInfo>,
  node: arkts.ClassDeclaration
): void {
  const metadata = this.context ?? {};
  let hasBuild = false;
  node.definition?.body.forEach((item) => {
    if (!arkts.isMethodDefinition(item) || item.id?.name !== BUILD_NAME) {
      return;
    }

    if (!hasBuild) {
      hasBuild = true;
    }

    if (item.function.params.length !== 0) {
      const firstParam = item.function.params[0];
      item.function.params.forEach((param) => {
        this.report({
          node: param,
          message: `The 'build' method can not have arguments.`,
          level: LogType.ERROR,
          suggestion: createSuggestion(
              ``,
              ...getStartAndEndPosition(item.function.params, firstParam),
              `Remove the parameters of the build function`
          ),
        });
      });
    }
  });

  if (!hasBuild) {
    const identifier = node.definition?.ident;
    if (!identifier) {
      return;
    }
    const position = arkts.createSourcePosition(node.endPosition.getIndex() - 1, node.endPosition.getLine());
    this.report({
      node: identifier,
      message: `The struct '${identifier.name}' must have at least and at most one 'build' method.`,
      level: LogType.ERROR,
      suggestion: createSuggestion(
          `build() {\n}\n`,
          position,
          position,
          `Add a build function to the custom component`
      ),
    });
  }
}

function getStartAndEndPosition(
  params: readonly arkts.Expression[],
  firstParam: arkts.Expression
): [arkts.SourcePosition, arkts.SourcePosition] {
  let lastParam = firstParam;
  params.forEach((param) => {
    lastParam = param;
  });

  return [firstParam.startPosition, lastParam.endPosition];
}