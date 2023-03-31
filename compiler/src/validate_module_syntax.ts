/*
 * Copyright (c) 2022 Huawei Device Co., Ltd.
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

import { LogInfo, LogType } from './utils';
import { IMPORT_FILE_ASTCACHE, generateSourceFileAST, getFileFullPath } from './process_import'

const FILE_TYPE_EXPORT_NAMES: Map<string, Set<string>> = new Map();

interface ImportName {
  name: string,
  node: ts.Node,
  source: string
}

function collectNonTypeMarkedReExportName(node: ts.SourceFile, pagesDir: string): Map<string, Map<string, ts.Node>> {
 /* those cases need be validated
  * case 1: re-export
  *   export { externalName as localName } from './xxx'
  * 
  * case 2: indirect re-export nameBindings
  *   import { externalName as localName } from './xxx'
  *   export [type] { localName as re-exportName }
  * 
  * case 3: indirect re-export default
  *   import defaultLocalName from './xxx'
  *   export [type] { defaultLocalName as re-exportName }
  */
  const RE_EXPORT_NAME: Map<string, Map<string, ts.Node>> = new Map();
  const IMPORT_AS: Map<string, ImportName> = new Map();
  const EXPORT_LOCAL: Set<string> = new Set();

  node.statements.forEach(stmt => {
    if (ts.isImportDeclaration(stmt) && stmt.importClause && !stmt.importClause.isTypeOnly) {
      let fileFullPath: string = getFileFullPath(stmt.moduleSpecifier.getText().replace(/'|"/g, ''), pagesDir);
      if (fileFullPath.endsWith('.ets') || fileFullPath.endsWith('.ts')) {
        const importClause: ts.ImportClause = stmt.importClause;
        if (importClause.name) {
          let localName: string = importClause.name.escapedText.toString();
          let importName: ImportName = {name: 'default', node: stmt, source: fileFullPath};
          IMPORT_AS.set(localName, importName);
        }
        if (importClause.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
          importClause.namedBindings.elements.forEach(elem => {
            let localName: string = elem.name.escapedText.toString();
            let importName: string = elem.propertyName ? elem.propertyName.escapedText.toString() : localName;
            IMPORT_AS.set(localName, <ImportName>{name: importName, node: stmt, source: fileFullPath})
          });
        }
      }
    }

    if (ts.isExportDeclaration(stmt)) {
      // TD: Check `export * from ...` when tsc supports `export type * from ...`.
      if (stmt.moduleSpecifier && !stmt.isTypeOnly && stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
        let fileFullPath: string = getFileFullPath(stmt.moduleSpecifier.getText().replace(/'|"/g, ''), pagesDir);
        if (fileFullPath.endsWith('.ets') || fileFullPath.endsWith('.ts')) {
          stmt.exportClause.elements.forEach(elem => {
            let importName: string = elem.propertyName ? elem.propertyName.escapedText.toString() :
                                      elem.name.escapedText.toString();
            if (RE_EXPORT_NAME.has(fileFullPath)) {
              RE_EXPORT_NAME.get(fileFullPath).set(importName, stmt);
            } else {
              RE_EXPORT_NAME.set(fileFullPath, (new Map<string, ts.Node>()).set(importName, stmt));
            }
          });
        }
      }
      if (!stmt.moduleSpecifier && stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
        stmt.exportClause.elements.forEach(elem => {
          let localName: string = elem.propertyName ? elem.propertyName.escapedText.toString() :
                                  elem.name.escapedText.toString();
          EXPORT_LOCAL.add(localName);
        });
      }
    }
  });

  EXPORT_LOCAL.forEach(local => {
    if (IMPORT_AS.has(local)) {
      let importName: ImportName = IMPORT_AS.get(local);
      if (RE_EXPORT_NAME.has(importName.source)) {
        RE_EXPORT_NAME.get(importName.source).set(importName.name, importName.node);
      } else {
        RE_EXPORT_NAME.set(importName.source, (new Map<string, ts.Node>()).set(importName.name, importName.node));
      }
    }
  });

  return RE_EXPORT_NAME;
}

function processTypeImportDecl(node: ts.ImportDeclaration, localTypeNames: Set<string>): void {
  if (node.importClause && node.importClause.isTypeOnly) {
    // import type T from ...
    if (node.importClause.name) {
      localTypeNames.add(node.importClause.name.escapedText.toString());
    }
    // import type * as T from ...
    if (node.importClause.namedBindings && ts.isNamespaceImport(node.importClause.namedBindings)) {
      localTypeNames.add(node.importClause.namedBindings.name.escapedText.toString());
    }
    // import type { e_T as T } from ...
    if (node.importClause.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
      node.importClause.namedBindings.elements.forEach((elem: any) => {
        localTypeNames.add(elem.name.escapedText.toString());
      });
    }
  }
}

function processExportDecl(node: ts.ExportDeclaration, typeExportNames: Set<string>,
                           exportAs: Map<string, string>): void {
  if (node.isTypeOnly) {
    if (node.moduleSpecifier && node.exportClause) {
      // export type * as T from ...
      if (ts.isNamespaceExport(node.exportClause)) {
        typeExportNames.add(node.exportClause.name.escapedText.toString());
      }
      // export type { e_T as T } from ...
      if (ts.isNamedExports(node.exportClause)) {
        node.exportClause.elements.forEach((elem: any) => {
          typeExportNames.add(elem.name.escapedText.toString());
        })
      }
    }
    // export type { e_T as T }
    if (!node.moduleSpecifier && node.exportClause && ts.isNamedExports(node.exportClause)) {
      node.exportClause.elements.forEach((elem: any) => {
        typeExportNames.add(elem.name.escapedText.toString());
      });
    }
  } else {
    // export { e_T as T }
    if (!node.moduleSpecifier && node.exportClause && ts.isNamedExports(node.exportClause)) {
      node.exportClause.elements.forEach((elem: any) => {
        let exportName: string = elem.name.escapedText.toString();
        let localName: string = elem.propertyName ? elem.propertyName.escapedText.toString() : exportName;
        exportAs.set(localName, exportName);
      });
    }
  }
}

function processInterfaceAndTypeAlias(node: ts.InterfaceDeclaration | ts.TypeAliasDeclaration,
                                      localTypeNames: Set<string>, typeExportNames: Set<string>): void {
  let hasDefault: boolean = false, hasExport: boolean = false;
  node.modifiers && node.modifiers.forEach(m => {
    if (m.kind == ts.SyntaxKind.DefaultKeyword) {
      hasDefault = true;
    }
    if (m.kind == ts.SyntaxKind.ExportKeyword) {
      hasExport = true;
    }
  });
  localTypeNames.add(node.name.escapedText.toString());

  if (hasExport) {
    let exportName = hasDefault ? 'default' : node.name.escapedText.toString();
    typeExportNames.add(exportName);
  }
}

function checkTypeModuleDeclIsType(node: ts.ModuleDeclaration): boolean {
  if (ts.isIdentifier(node.name) && node.body && ts.isModuleBlock(node.body)) {
    for (let idx = 0; idx < node.body.statements.length; idx++) {
      let stmt: ts.Statement = node.body.statements[idx];
      if (ts.isModuleDeclaration(stmt) && !checkTypeModuleDeclIsType(<ts.ModuleDeclaration>stmt)) {
        return false;
      } else if (ts.isImportEqualsDeclaration(stmt)) {
        let hasExport: boolean = false;
        stmt.modifiers && stmt.modifiers.forEach(m => {
          if (m.kind == ts.SyntaxKind.ExportKeyword) {
            hasExport = true;
          }
        });
        if (hasExport) {
          return false;
        }
      } else if (!ts.isInterfaceDeclaration(stmt) && !ts.isTypeAliasDeclaration(stmt)) {
        return false;
      }
    }
  }
  return true;
}

function processNamespace(node: ts.ModuleDeclaration, localTypeNames: Set<string>, typeExportNames: Set<string>): void {
  if (ts.isIdentifier(node.name) && node.body && ts.isModuleBlock(node.body)) {
    if (!checkTypeModuleDeclIsType(<ts.ModuleDeclaration>node)) {
      return;
    }

    let hasExport: boolean = false;
    node.modifiers && node.modifiers.forEach(m => {
      if (m.kind == ts.SyntaxKind.ExportKeyword) {
        hasExport = true;
      }
    });
    if (hasExport) {
      typeExportNames.add(node.name.escapedText.toString());
    }
    localTypeNames.add(node.name.escapedText.toString());
  }
}

function addErrorLogIfReExportType(sourceFile: ts.SourceFile, log: LogInfo[], typeExportNames: Set<string>,
                                   exportNames: Map<string, ts.Node>): void {
  let reExportNamesArray: Array<string> = Array.from(exportNames.keys());
  let typeExportNamesArray: Array<string> = Array.from(typeExportNames);
  const needWarningNames: Array<string> = reExportNamesArray.filter(name => typeExportNamesArray.includes(name));
  needWarningNames.forEach(name => {
    const moduleNode: ts.Node = exportNames.get(name)!;
    let typeIdentifier: string = name;
    if (name === 'default' && ts.isImportDeclaration(moduleNode) && moduleNode.importClause) {
      typeIdentifier = moduleNode.importClause.name!.escapedText.toString();
    }
    const posOfNode: ts.LineAndCharacter = sourceFile.getLineAndCharacterOfPosition(moduleNode.getStart());
    let warningMessage: string = `The re-export name '${typeIdentifier}' need to be marked as type, `;
    warningMessage += ts.isImportDeclaration(moduleNode) ? "please use 'import type'." : "please use 'export type'.";
    const warning: LogInfo = {
      type: LogType.WARN,
      message: warningMessage,
      pos: moduleNode.getStart(),
      fileName: sourceFile.fileName,
      line: posOfNode.line + 1,
      column: posOfNode.character + 1
    }
    log.push(warning);
  });
}

function collectTypeExportNames(source: string): Set<string> {
  let importFileAst: ts.SourceFile;
  if (IMPORT_FILE_ASTCACHE.has(source)) {
    importFileAst = IMPORT_FILE_ASTCACHE.get(source);
  } else {
    importFileAst = generateSourceFileAST(source, source);
    IMPORT_FILE_ASTCACHE[source] = importFileAst;
  }
  const EXPORT_AS: Map<string, string> = new Map();
  const LOCAL_TYPE_NAMES: Set<string> = new Set();
  const TYPE_EXPORT_NAMES: Set<string> = new Set();
  importFileAst.statements.forEach(stmt => {
    switch(stmt.kind) {
      case ts.SyntaxKind.ImportDeclaration: {
        processTypeImportDecl(<ts.ImportDeclaration>stmt, LOCAL_TYPE_NAMES);
        break;
      }
      case ts.SyntaxKind.ExportDeclaration: {
        processExportDecl(<ts.ExportDeclaration>stmt, TYPE_EXPORT_NAMES, EXPORT_AS);
        break;
      }
      case ts.SyntaxKind.ExportAssignment: {
        if (ts.isIdentifier((<ts.ExportAssignment>stmt).expression)) {
          EXPORT_AS.set((<ts.Identifier>(<ts.ExportAssignment>stmt).expression).escapedText.toString(), "default");
        }
        break;
      }
      case ts.SyntaxKind.ModuleDeclaration: {
        processNamespace(<ts.ModuleDeclaration>stmt, LOCAL_TYPE_NAMES, TYPE_EXPORT_NAMES);
        break;
      }
      case ts.SyntaxKind.InterfaceDeclaration:
      case ts.SyntaxKind.TypeAliasDeclaration: {
        processInterfaceAndTypeAlias(<ts.InterfaceDeclaration|ts.TypeAliasDeclaration>stmt,
                                      LOCAL_TYPE_NAMES, TYPE_EXPORT_NAMES);
        break;
      }
      default:
        break;
    }
  });
  LOCAL_TYPE_NAMES.forEach(localName => {
    if (EXPORT_AS.has(localName)) {
      TYPE_EXPORT_NAMES.add(EXPORT_AS.get(localName));
    }
  });
  FILE_TYPE_EXPORT_NAMES.set(source, TYPE_EXPORT_NAMES);
  return TYPE_EXPORT_NAMES;
}

/*
 * Validate re-export names from ets/ts file whether is a type by compiling with [TranspileOnly].
 * Currently, there are three scenarios as following can not be validated correctly:
 * case 1 export some specify type Identifier from one module's export * from ...:
 * // A
 * export { xx } from 'B'
 * // B
 * export * from 'C'
 * // C
 * export interface xx{}
 * case 2 export some type Identifier from indirect .d.ts module:
 * // A(ts)
 * export { xx } from 'B'
 * // B(.d.ts)
 * export { xx } from 'C'
 * // C(.d.ts)
 * export interface xx {}
 * case 3 export some type Identifier from '/// .d.ts'
 * // A(ts)
 * export { xx } from 'B'
 * // B(.d.ts)
 * ///C // extend B with C by using '///'
 * // C(.d.ts)
 * export interface xx {}
 */
export default function validateReExportType(node: ts.SourceFile, pagesDir: string, log: LogInfo[]): void {
  /*
   * those cases' name should be treat as Type 
   * case1: 
   *   import type {T} from ...
   *   import type T from ...
   *   import type * as T from ...
   * case2:
   *   export type {T} from ...
   *   export type * as T from ...
   * case3:
   *   export interface T {}
   *   export type T = {}
   * case4:
   *   export default interface {}
   * case5:
   *   interface T {}
   *   export {T}
   */
  const RE_EXPORT_NAME: Map<string, Map<string, ts.Node>> = collectNonTypeMarkedReExportName(node, pagesDir);
  RE_EXPORT_NAME.forEach((exportNames: Map<string, ts.Node>, source: string) => {
    let typeExportNames: Set<string> = FILE_TYPE_EXPORT_NAMES.has(source) ?
                                        FILE_TYPE_EXPORT_NAMES.get(source) : collectTypeExportNames(source);
    addErrorLogIfReExportType(node, log, typeExportNames, exportNames);
  });
}
  