/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
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

const ts = require('typescript')
const path = require('path')
const fs = require('fs')

generateTargetFile(process.argv[2], process.argv[3]);
function generateTargetFile(filePath, output) {
  const files = [];
  const globalTsFile = path.resolve(filePath, '../../global.d.ts');
  if (fs.existsSync(globalTsFile)) {
    files.push(globalTsFile);
  }
  readFile(filePath, files);
  if (!fs.existsSync(output)) {
    mkDir(output);
  }
  const license = `/*
  * Copyright (c) 2021 Huawei Device Co., Ltd.
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
  */`;
  files.forEach((item) => {
    let content = fs.readFileSync(item, 'utf8');
    const fileName = path.resolve(output, path.basename(item));
    if (item === globalTsFile) {
      content = license + '\n\n' + processsFile(content, fileName, true);
    } else {
      content = license + '\n\n' + processsFile(content, fileName, false);
    }
    fs.writeFile(fileName, content, err => {
      if (err) {
        console.error(err);
        return;
      }
    });
  });
}

function readFile(dir, fileDir) {
  const files = fs.readdirSync(dir);
  files.forEach((element) => {
    const filePath = path.join(dir, element);
    const status = fs.statSync(filePath);
    if (status.isDirectory()) {
      readFile(filePath, fileDir);
    } else {
      fileDir.push(filePath);
    }
  });
}

function mkDir(filePath) {
  const parent = path.join(filePath, '..');
  if (!(fs.existsSync(parent) && !fs.statSync(parent).isFile())) {
    mkDir(parent);
  }
  fs.mkdirSync(filePath);
}

function processsFile(content, fileName, isGlobal) {
  let sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const newStatements = [];
  if (sourceFile.statements && sourceFile.statements.length) {
    if (isGlobal) {
      sourceFile.statements.forEach((node) => {
        if (!ts.isImportDeclaration(node)) {
          if (node.modifiers && node.modifiers.length && node.modifiers[0].kind === ts.SyntaxKind.ExportKeyword) {
            node.modifiers.splice(0, 1);
          }
          if (isVariable(node)) {
            const name = node.declarationList.declarations[0].name.getText();
            const type = node.declarationList.declarations[0].type.getText();
            if (name.indexOf(type) !== -1) {
              const declarationNode = ts.factory.updateVariableDeclaration(node.declarationList.declarations[0],
                ts.factory.createIdentifier(type), node.declarationList.declarations[0].exclamationToken,
                node.declarationList.declarations[0].type, node.declarationList.declarations[0].initializer);
              node.declarationList = ts.factory.updateVariableDeclarationList(node.declarationList, [declarationNode]);
            }
          }
          newStatements.push(node);
        }
      });
    } else {
      sourceFile.statements.forEach((node) => {
        let extendNode = null;
        if (isInterface(node)) {
          const componentName = node.name.getText().replace(/Interface$/, '');
          let isComponentName = false;
          if (node.members) {
            for (let i = 0; i < node.members.length; i++) {
              const callSignNode = node.members[i];
              if (isSignNode(callSignNode)) {
                const callSignName = callSignNode.type.name.getText().repleace(/Attribute$/, '');
                if (componentName === callSignName) {
                  extendNode = callSignNode.type.typeName;
                  isComponentName = true;
                  break;
                }
              }
            }
          }
          if (isComponentName) {
            const heritageClause = ts.factory.createHeritageClause(ts.SyntaxKind.ExtendsKeyword,
              [ts.factory.createExpressionWithTypeArguments(extendNode, undefined)]);
            extendNode = null;
            node = ts.factory.updateInterfaceDeclaration(node, node.decorators, node.modifiers,
              node.name, node.typeParameters, [heritageClause], node.members);
          }
        }
        newStatements.push(node);
      });
    }
  }
  sourceFile = ts.factory.updateSourceFile(sourceFile, newStatements);
  const printer = ts.createPrinter({ removeComments: true, newLine: ts.NewLineKind.LineFeed });
  const result = printer.printNode(ts.EmitHint.Unspecified, sourceFile, sourceFile);
  return result;
}

function isVariable(node) {
  if (ts.isVariableStatement(node) && node.declarationList && node.declarationList.declarations &&
    node.declarationList.declarations.length && ts.isVariableDeclaration(node.declarationList.declarations[0]) &&
    node.declarationList.declarations[0].name && node.declarationList.declarations[0].type) {
    return true;
  }
  return false;
}

function isInterface(node) {
  return ts.isInterfaceDeclaration(node) && node.name && ts.isIdentifier(node.name) &&
    /Interface$/.test(node.name.getText());
}

function isSignNode(node) {
  return (ts.isCallSignatureDeclaration(node) || ts.isConstructSignatureDeclaration(node)) &&
    node.type && ts.isTypeReferenceNode(node.type) && node.type.name && ts.isIdentifier(node.type.name) &&
    /Attribute$/.test(node.type.name.getText());
}

generateComponentConfig(process.argv[4]);
function generateComponentConfig(dir) {
  const configFile = path.resolve(dir, 'component_map.js');
  if (fs.existsSync(configFile)) {
    const { COMPONENT_MAP } = require(configFile);
    try {
      fs.writeFileSync(path.resolve(dir, '../component_config.json'), JSON.stringify(COMPONENT_MAP));
    } catch (error) {
      console.error(error);
    }
  }
}
