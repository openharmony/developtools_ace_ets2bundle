/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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
import { componentCollection } from './validate_ui_syntax';
import { OPTIONS, PUSH, VIEWSTACKPROCESSOR } from './pre_define';


function generateExportStatements(): ts.Statement[] {
  const statements: ts.Statement[] = [];
  for (const element of componentCollection.arkoalaComponents) {
    const byteCodePath = generateBytecodePathFragement(element[0], element[1]);
    const optionsVariable = ts.factory.createVariableDeclaration(
      ts.factory.createIdentifier(`__Options_${element[0]}`),
      undefined,
      undefined,
      ts.factory.createCallExpression(
          ts.factory.createPropertyAccessExpression(
              ts.factory.createAsExpression(
                  ts.factory.createIdentifier("globalThis"),
                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
              ),
              ts.factory.createIdentifier("Panda.getClass")
          ),
          undefined,
          [ts.factory.createStringLiteral(byteCodePath)]
        )
      );

    const optionsVariableStatement = ts.factory.createVariableStatement(
        [],
        ts.factory.createVariableDeclarationList([optionsVariable], ts.NodeFlags.Const)
    );

    statements.push(optionsVariableStatement);
  }
  return statements;
}

export function insertExportsAtTop(sourceFile: ts.SourceFile): ts.SourceFile {
    const exportStatements = generateExportStatements();
    const newStatements = [...exportStatements, ...sourceFile.statements];
    return ts.factory.updateSourceFile(sourceFile, newStatements);
}

export function generateBytecodePathFragement(className: string, filePath: string): string {
    const regex = /.*declgenV1\/(.*?)\.d\.ets$/;
    const match = filePath.match(regex);

    if (!match) {
        throw new Error('declgenV1 path not found.');
    }

    const targetPath = match[1];
    const targetPathWithDollar = targetPath.replace(/\//g, '$');

    return `L${targetPath}/${targetPathWithDollar}$__Options_${className}$ObjectLiteral;`;
}

export function transformObjectExpression(
  objectExpr: ts.ObjectExpression,
  options: string
): ts.Expression {
  // 创建变量声明: const result = new Child();
  const newExpression = ts.factory.createNewExpression(
    ts.factory.createIdentifier(options),
    undefined,
    []
  );
  
  const resultVar = ts.factory.createVariableDeclaration(
    ts.factory.createIdentifier('result'),
    undefined,
    undefined,
    newExpression
  );
  
  const constResult = ts.factory.createVariableStatement(
    [],
    ts.factory.createVariableDeclarationList(
      [resultVar],
      ts.NodeFlags.Const
    )
  );

  // 处理对象属性，生成 result[key] = value; 语句
  const propertyAssignments: ts.Statement[] = objectExpr.properties.map(prop => {
    if (ts.isPropertyAssignment(prop)) {
      // 获取属性名（处理标识符和字符串两种形式）
      let propertyName: ts.Expression;
      if (ts.isIdentifier(prop.name)) {
        propertyName = ts.factory.createStringLiteral(prop.name.text);
      } else if (ts.isStringLiteral(prop.name)) {
        propertyName = ts.factory.createStringLiteral(prop.name.text);
      } else {
        // 处理数字等其他类型的属性名
        propertyName = ts.factory.createStringLiteral(prop.name.getText());
      }

      // 创建 result[key] = value 赋值表达式
      return ts.factory.createExpressionStatement(
        ts.factory.createAssignment(
          ts.factory.createElementAccessExpression(
            ts.factory.createIdentifier('result'),
            propertyName
          ),
          prop.initializer
        )
      );
    }
    // 忽略非 PropertyAssignment 类型的属性（如 spread 操作符）
    return null;
  }).filter(Boolean) as ts.Statement[];

  // 创建 return result; 语句
  const returnStatement = ts.factory.createReturnStatement(
    ts.factory.createIdentifier('result')
  );

  // 创建函数体
  const functionBody = ts.factory.createBlock([
    constResult,
    ...propertyAssignments,
    returnStatement
  ], true);

  // 创建箭头函数: () => { ... }
  const arrowFunction = ts.factory.createArrowFunction(
    undefined,
    undefined,
    [],
    undefined,
    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    functionBody
  );

  // 创建立即执行函数表达式: (() => { ... })()
  return ts.factory.createCallExpression(
    ts.factory.createParenthesizedExpression(arrowFunction),
    undefined,
    []
  );
}

export function createStaticComponent(name: string, newNode: ts.NewExpression): ts.VariableStatement {
  const argument = newNode.arguments;
  const options = argument.length > 2 ? argument[1] : undefined;
  return ts.factory.createVariableStatement(
    undefined,
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier('staticPointer'),
          undefined,
          undefined,
          ts.factory.createCallExpression(
            ts.factory.createIdentifier('compatibleStaticComponent'),
            undefined,
            [
              ts.factory.createArrowFunction(
                undefined,
                undefined,
                [],
                undefined,
                ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                ts.factory.createBlock(
                  [
                    ts.factory.createReturnStatement(
                      ts.factory.createNewExpression(
                        ts.factory.createIdentifier(name),
                        undefined,
                        []
                      )
                    )
                  ],
                  false
                )
              ),
              transformObjectExpression(options, `__Options_${name}`)
            ]
          )
        )
      ]
    )
  )
}

export function pushStaticComponent(): ts.ExpressionStatement {
  return ts.factory.createExpressionStatement(
    ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier(VIEWSTACKPROCESSOR),
        ts.factory.createIdentifier(PUSH)
      ),
      undefined,
      [
        ts.factory.createIdentifier('staticPointer')
      ]
    )
  )
}
