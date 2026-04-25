/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License at a You may obtain a copy of the License at
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
import { SuggestionOptions } from './log-collector';

export function findFirstStmtPosition(program: arkts.Program): arkts.SourcePosition {
    const scriptFile = program.astNode;
    if (!arkts.isEtsScript(scriptFile) || !scriptFile.statements || scriptFile.statements.length === 0) {
        return arkts.SourcePosition.create(0, 0);
    }
    return scriptFile.statements[0].endPosition;
}

export interface ImportInfo {
    importedNames: Set<string>;
    arkUIImportNode?: arkts.ImportDeclaration;
    lastImportNode?: arkts.ImportDeclaration;
}

export function collectFileImports(scriptFile: arkts.EtsScript): ImportInfo {
    const importedNames = new Set<string>();
    let arkUIImportNode: arkts.ImportDeclaration | undefined;
    let lastImportNode: arkts.ImportDeclaration | undefined;

    if (!arkts.isEtsScript(scriptFile) || !scriptFile.statements) {
        return { importedNames, arkUIImportNode, lastImportNode };
    }
    for (const stmt of scriptFile.statements) {
        if (!arkts.isImportDeclaration(stmt)) {
            continue;
        }
        lastImportNode = stmt;
        const moduleName = getImportModuleName(stmt);
        if (!moduleName) {
            continue;
        }
        collectImportedNames(stmt.specifiers, importedNames);
        if (moduleName === '@kit.ArkUI' && !arkUIImportNode) {
            arkUIImportNode = stmt;
        }
    }
    return { importedNames, arkUIImportNode, lastImportNode };
}

function getImportModuleName(importNode: arkts.ImportDeclaration): string | undefined {
    if (!importNode.source || !arkts.isStringLiteral(importNode.source)) {
        return undefined;
    }
    return importNode.source.str;
}

function collectImportedNames(
    specifiers: readonly arkts.AstNode[] | undefined,
    importedNames: Set<string>
): void {
    if (!specifiers) {
        return;
    }
    for (const spec of specifiers) {
        if (!arkts.isImportSpecifier(spec) || !spec.imported) {
            continue;
        }
        importedNames.add(getIdentifierName(spec.imported));
    }
}

function getIdentifierName(node: arkts.AstNode): string {
    if (arkts.isIdentifier(node)) {
        return node.name;
    }
    if (arkts.isStringLiteral(node)) {
        return node.str;
    }
    return '';
}

export function collectFileImportsByProgram(program: arkts.Program): ImportInfo {
    const scriptFile = program.astNode;
    if (!arkts.isEtsScript(scriptFile)) {
        return { importedNames: new Set<string>(), arkUIImportNode: undefined, lastImportNode: undefined };
    }
    return collectFileImports(scriptFile);
}

export function createImportFixesByProgram(
    importsInfo: ImportInfo | undefined,
    program: arkts.Program | undefined,
    importNames: string[],
    title: string
): SuggestionOptions[] {
    if (!program) {
        return [];
    }
    const missingImports = importsInfo ? importNames.filter(name => !importsInfo.importedNames.has(name)) : importNames;
    if (missingImports.length === 0) {
        return [];
    }
    const fixes: SuggestionOptions[] = [];
    if (importsInfo?.arkUIImportNode) {
        const specifiers = importsInfo.arkUIImportNode.specifiers;
        if (specifiers && specifiers.length > 0) {
            const lastSpecifier = specifiers[specifiers.length - 1];
            const insertPos = lastSpecifier.endPosition;
            fixes.push({
                code: ', ' + missingImports.join(', '),
                range: [insertPos, insertPos],
                title: title,
            });
        }
    } else if (importsInfo?.lastImportNode) {
        const importCode = `\nimport { ${missingImports.join(', ')} } from '@kit.ArkUI';`;
        const insertPos = importsInfo.lastImportNode.endPosition;
        fixes.push({
            code: importCode,
            range: [insertPos, insertPos],
            title: title,
        });
    } else {
        const importCode = `import { ${missingImports.join(', ')} } from '@kit.ArkUI';\n`;
        const firstStmtPos = findFirstStmtPosition(program);
        fixes.push({
            code: importCode,
            range: [firstStmtPos, firstStmtPos],
            title: title,
        });
    }
    return fixes;
}
