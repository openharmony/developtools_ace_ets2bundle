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


const path = require('path');

module.exports = function (babel) {
    const { types: t } = babel;

    return {
        name: 'custom-import-plugin',
        visitor: {
            ImportDeclaration(pathNode) {
                const sourceValue = pathNode.node.source.value;
                if (sourceValue === '@koalaui/libarkts' && pathNode.node.specifiers.length === 1 && t.isImportNamespaceSpecifier(pathNode.node.specifiers[0])) {
                    const currentFileDir = path.dirname(pathNode.hub.file.opts.filename);
                    const configDir = process.cwd(); 
                    const relativePath = path.relative(currentFileDir, configDir);
                    const importPath = relativePath ? path.join(relativePath, 'path') : './path';

                    const newImport = t.importDeclaration(
                        [t.importSpecifier(t.identifier('getArktsPath'), t.identifier('getArktsPath'))],
                        t.stringLiteral(importPath)
                    );

                    const requireCall = t.callExpression(t.identifier('require'), [t.callExpression(t.identifier('getArktsPath'), [])]);
                    const arkts = t.variableDeclaration('const', [
                        t.variableDeclarator(t.identifier('arkts'), requireCall)
                    ]);

                    pathNode.replaceWithMultiple([newImport, arkts]);
                }
            }
        }
    };
};