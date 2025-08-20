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
import { COMPATIBLESTATICCOMPONENT, COMPONENT_POP_FUNCTION, GLOBAL_THIS, PUSH, STATICPOINTER, VIEWSTACKPROCESSOR } from './pre_define';


function generateGetClassStatements(): ts.Statement[] {
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
                  ts.factory.createIdentifier(GLOBAL_THIS),
                  ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
              ),
              ts.factory.createIdentifier('Panda.getClass')
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

/**
 * 
 * @param sourceFile 
 * @returns const __Options_Child = (globalThis as any).Panda.getClass(...);
 */
export function insertGetOptionsAtTop(sourceFile: ts.SourceFile): ts.SourceFile {
    const getClassStatements = generateGetClassStatements();
    const newStatements = [...getClassStatements, ...sourceFile.statements];
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

/**
 * 
 * @param objectExpr 
 * @param options 
 * @returns (() => { const result = new Child(); result[key] = value; return result; })()
 */
export function transformObjectExpression(
  objectExpr: ts.ObjectExpression,
  options: string
): ts.Expression {
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

  const propertyAssignments: ts.Statement[] = objectExpr.properties.map(prop => {
    if (ts.isPropertyAssignment(prop)) {
      let propertyName: ts.Expression;
      if (ts.isIdentifier(prop.name)) {
        propertyName = ts.factory.createStringLiteral(prop.name.text);
      } else if (ts.isStringLiteral(prop.name)) {
        propertyName = ts.factory.createStringLiteral(prop.name.text);
      } else {
        propertyName = ts.factory.createStringLiteral(prop.name.getText());
      }

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
    return null;
  }).filter(Boolean) as ts.Statement[];

  const returnStatement = ts.factory.createReturnStatement(
    ts.factory.createIdentifier('result')
  );

  const functionBody = ts.factory.createBlock([
    constResult,
    ...propertyAssignments,
    returnStatement
  ], true);

  const arrowFunction = ts.factory.createArrowFunction(
    undefined,
    undefined,
    [],
    undefined,
    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    functionBody
  );

  return ts.factory.createCallExpression(
    ts.factory.createParenthesizedExpression(arrowFunction),
    undefined,
    []
  );
}

function makeStaticFactory(name: string): ts.arrowFunction {
  return ts.factory.createArrowFunction(
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
  );
}

/**
 * 
 * @param name the name of staticComponent
 * @param newNode 
 * @returns let staticPointer = compatibleStaticComponent(() => { return new Child(); });
 */
export function createStaticComponent(name: string, newNode: ts.NewExpression): ts.VariableStatement {
  const argument = newNode.arguments;
  const options = argument.length > 2 ? argument[1] : undefined;
  return ts.factory.createVariableStatement(
    undefined,
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier(STATICPOINTER),
          undefined,
          undefined,
          ts.factory.createCallExpression(
            ts.factory.createIdentifier(COMPATIBLESTATICCOMPONENT),
            undefined,
            [
              makeStaticFactory(name),
              transformObjectExpression(options, `__Options_${name}`)
            ]
          )
        )
      ]
    )
  );
}

/**
 * 
 * @returns ViewStackProcessor.push(staticPointer);
 */
export function pushStaticComponent(): ts.ExpressionStatement {
  return ts.factory.createExpressionStatement(
    ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier(VIEWSTACKPROCESSOR),
        ts.factory.createIdentifier(PUSH)
      ),
      undefined,
      [
        ts.factory.createIdentifier(STATICPOINTER)
      ]
    )
  );
}

/**
 * 
 * @returns ViewStackProcessor.pop();
 */
export function popStaticComponent(): ts.ExpressionStatement {
  return ts.factory.createExpressionStatement(
    ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier(VIEWSTACKPROCESSOR),
        ts.factory.createIdentifier(COMPONENT_POP_FUNCTION)
      ),
      undefined,
      undefined
    )
  );
}