/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import ts from 'typescript';

import {
  addLog,
  LogType,
  LogInfo
} from './utils';
import constantDefine from './constant_define';

function checkLocalBuilderDecoratorCount(node: ts.Node, sourceFileNode: ts.SourceFile, checkDecoratorCount: number, log: LogInfo[]): void {
  if (checkDecoratorCount > 0) {
    const message: string = 'The member property or method can not be decorated by multiple decorators.';
    addLog(LogType.ERROR, message, node.getStart(), log, sourceFileNode);
  }
}

function checkTwoWayComputed(node: ts.PropertyAccessExpression, symbol: ts.Symbol, log: LogInfo[]): void {
  if (symbol && symbol.declarations) {
    symbol.declarations.forEach((declaration: ts.Declaration) => {
      if (ts.isGetAccessor(declaration) && declaration.modifiers && 
        isTagWithDecorator(declaration.modifiers, constantDefine.COMPUTED)) {
        log.push({
          type: LogType.ERROR,
          message: `A property decorated by '${constantDefine.COMPUTED_DECORATOR}' cannot be used with two-bind syntax.`,
          pos: node.getStart()
        });
      }
    });
  }
}

function checkComputedGetter(symbol: ts.Symbol, declaration: ts.Declaration, log: LogInfo[]): void {
  if (ts.isSetAccessor(declaration) && declaration.name && ts.isIdentifier(declaration.name) &&
    symbol.escapedName.toString() === declaration.name.escapedText.toString()) {
    log.push({
      type: LogType.ERROR,
      message: `A property decorated by '${constantDefine.COMPUTED_DECORATOR}' cannot define a set method.`,
      pos: declaration.getStart()
    });
  }
}

function checkIfNeedDollarEvent(doubleExclamationCollection: string[], dollarPropertyCollection: string[], 
  node: ts.CallExpression, log: LogInfo[]): void {
  for (const item of doubleExclamationCollection) {
    if (dollarPropertyCollection.some((value) => value === '$' + item)) {
      log.push({
        type: LogType.ERROR,
        message: `When the two-way binding syntax is used, do not assign a value to '${constantDefine.EVENT_DECORATOR}' variable '${'$' + item}' because the framework generates the default assignment.`,
        pos: node.getStart()
      });
    }
  }
}

function isTagWithDecorator(node: ts.NodeArray<ts.ModifierLike>, decoratorName: string): boolean {
  return node.some((item: ts.Decorator) => ts.isDecorator(item) && 
    ts.isIdentifier(item.expression) && item.expression.escapedText.toString() === decoratorName);
}

export default {
  checkLocalBuilderDecoratorCount,
  checkTwoWayComputed,
  checkComputedGetter,
  checkIfNeedDollarEvent
};
