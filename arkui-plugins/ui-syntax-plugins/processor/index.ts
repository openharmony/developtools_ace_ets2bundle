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
import { UISyntaxRule, UISyntaxRuleContext } from '../rules/ui-syntax-rule';
import { getContainerComponents } from '../utils';

export type UISyntaxRuleProcessor = {
  parsed(node: arkts.AstNode): void;
};

export function createUISyntaxRuleProcessor(
  rules: UISyntaxRule[],
): UISyntaxRuleProcessor {
  const containerComponents = getContainerComponents('../../components/');
  const context: UISyntaxRuleContext = {
    report(options) {
      const position = arkts.getStartPosition(options.node);
      let message: string;
      if (!options.data) {
        message = options.message;
      } else {
        message = Object.entries(options.data).reduce(
          (message, [placehoderName, placehoderValue]) => {
            return message.replace(`{{${placehoderName}}}`, placehoderValue);
          },
          options.message,
        );
      }
      // todo
      if (options.fix) {
        const suggestion = options.fix(options.node);
        console.log(`error: ${message}`);
        console.log(`range: (${suggestion.range[0].index()}, ${suggestion.range[0].line()}) - (${suggestion.range[1].index()}, ${suggestion.range[1].line()})`,
          `code: ${suggestion.code}`);
      } else {
        console.log(`syntax-error: ${message}  (${position.index()},${position.line()})`);
      }
    },
    containerComponents: containerComponents,
  };

  const instances = rules.map((rule) => rule.setup(context));

  return {
    parsed(node): void {
      for (const instance of instances) {
        instance.parsed?.(node);
      }
    },
  };
}
