/*
 * Copyright (c) 2023 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use rollupObject file except in compliance with the License.
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

import * as ts from 'typescript';
import MagicString from 'magic-string';
import {
  GEN_ABC_PLUGIN_NAME,
  PACKAGES
} from '../common/ark_define';
import {
  getOhmUrlByFilepath,
  getOhmUrlByHarName,
  getOhmUrlBySystemApiOrLibRequest
} from '../../../ark_utils';
import { writeFileSyncByNode } from '../../../process_module_files';
import {
  isJsonSourceFile,
  isJsSourceFile,
  writeFileContentToTempDir
} from '../utils';

const ROLLUP_IMPORT_NODE: string = 'ImportDeclaration';
const ROLLUP_EXPORTNAME_NODE: string = 'ExportNamedDeclaration';
const ROLLUP_EXPORTALL_NODE: string = 'ExportAllDeclaration';

export class ModuleSourceFile {
  private static sourceFiles: ModuleSourceFile[] = [];
  private moduleId: string;
  private source: string | ts.SourceFile;
  private isSourceNode: boolean = false;
  private static projectConfig: any;
  private static logger: any;

  constructor(moduleId: string, source: string | ts.SourceFile) {
    this.moduleId = moduleId;
    this.source = source;
    if (typeof this.source !== 'string') {
      this.isSourceNode = true;
    }
  }

  static newSourceFile(moduleId: string, source: string | ts.SourceFile) {
    ModuleSourceFile.sourceFiles.push(new ModuleSourceFile(moduleId, source));
  }

  static async processModuleSourceFiles(rollupObject: any) {
    this.initPluginEnv(rollupObject);
    for (const source of ModuleSourceFile.sourceFiles) {
      if (!rollupObject.share.projectConfig.compileHar) {
        // compileHar: compile closed source har of project, which convert .ets to .d.ts and js, doesn't transform module request.
        source.processModuleRequest(rollupObject);
      }
      await source.writeSourceFile();
    }
    ModuleSourceFile.sourceFiles = [];
  }

  private async writeSourceFile() {
    if (this.isSourceNode && !isJsSourceFile(this.moduleId)) {
      writeFileSyncByNode(<ts.SourceFile>this.source, true, ModuleSourceFile.projectConfig);
    } else {
      await writeFileContentToTempDir(this.moduleId, <string>this.source, ModuleSourceFile.projectConfig,
        ModuleSourceFile.logger);
    }
  }

  private getOhmUrl(rollupObject: any, moduleRequest: string, filePath: string | undefined): string | undefined {
    let systemOrLibOhmUrl: string | undefined = getOhmUrlBySystemApiOrLibRequest(moduleRequest);
    if (systemOrLibOhmUrl != undefined) {
      return systemOrLibOhmUrl;
    }
    const harOhmUrl: string | undefined = getOhmUrlByHarName(moduleRequest, ModuleSourceFile.projectConfig);
    if (harOhmUrl !== undefined) {
      return harOhmUrl;
    }
    if (filePath) {
      const targetModuleInfo: any = rollupObject.getModuleInfo(filePath);
      const namespace: string = targetModuleInfo['meta']['moduleName'];
      const ohmUrl: string =
        getOhmUrlByFilepath(filePath, ModuleSourceFile.projectConfig, ModuleSourceFile.logger, namespace);
      return ohmUrl.startsWith(PACKAGES) ? `@package:${ohmUrl}` : `@bundle:${ohmUrl}`;
    }
    return undefined;
  }

  private processJsModuleRequest(rollupObject: any) {
    const moduleInfo: any = rollupObject.getModuleInfo(this.moduleId);
    const importMap: any = moduleInfo.importedIdMaps;
    const REG_DEPENDENCY: RegExp = /(?:import|from)(?:\s*)['"]([^'"]+)['"]/g;
    this.source = (<string>this.source).replace(REG_DEPENDENCY, (item, moduleRequest) => {
      const ohmUrl: string | undefined = this.getOhmUrl(rollupObject, moduleRequest, importMap[moduleRequest]);
      if (ohmUrl !== undefined) {
        item = item.replace(/(['"])(?:\S+)['"]/, (_, quotation) => {
          return quotation + ohmUrl + quotation;
        });
      }
      return item;
    });
  }

  private processTransformedJsModuleRequest(rollupObject: any) {
    const moduleInfo: any = rollupObject.getModuleInfo(this.moduleId);
    const importMap: any = moduleInfo.importedIdMaps;
    const code: MagicString = new MagicString(<string>this.source);
    const ast = moduleInfo.ast;
    ast.body.forEach(node => {
      if (node.type === ROLLUP_IMPORT_NODE || (node.type === ROLLUP_EXPORTNAME_NODE && node.source) ||
          node.type === ROLLUP_EXPORTALL_NODE) {
        const ohmUrl: string | undefined =
          this.getOhmUrl(rollupObject, node.source.value, importMap[node.source.value]);
        if (ohmUrl !== undefined) {
          code.update(node.source.start, node.source.end, `'${ohmUrl}'`);
        }
      }
    });
    this.source = code.toString();
  }

  private processTransformedTsModuleRequest(rollupObject: any) {
    const moduleInfo: any = rollupObject.getModuleInfo(this.moduleId);
    const importMap: any = moduleInfo.importedIdMaps;
    const statements: ts.Statement[] = [];
    (<ts.SourceFile>this.source)!.forEachChild((childNode: ts.Statement) => {
      if (ts.isImportDeclaration(childNode) || (ts.isExportDeclaration(childNode) && childNode.moduleSpecifier)) {
        // moduleSpecifier.getText() returns string carrying on quotation marks which the importMap's key does not,
        // so we need to remove the quotation marks from moduleRequest.
        const moduleRequest: string = childNode.moduleSpecifier.getText().replace(/'|"/g, '');
        const ohmUrl: string | undefined = this.getOhmUrl(rollupObject, moduleRequest, importMap[moduleRequest]);
        if (ohmUrl !== undefined) {
          if (ts.isImportDeclaration(childNode)) {
            childNode = ts.factory.updateImportDeclaration(childNode, childNode.decorators, childNode.modifiers,
                          childNode.importClause, ts.factory.createStringLiteral(ohmUrl));
          } else {
            childNode = ts.factory.updateExportDeclaration(childNode, childNode.decorators, childNode.modifiers,
                          childNode.isTypeOnly, childNode.exportClause, ts.factory.createStringLiteral(ohmUrl));
          }
        }
      }
      statements.push(childNode);
    });
    this.source = ts.factory.updateSourceFile(<ts.SourceFile>this.source, statements);
  }

  // Replace each module request in source file to a unique representation which is called 'ohmUrl'.
  // This 'ohmUrl' will be the same as the record name for each file, to make sure runtime can find the corresponding
  // record based on each module request.
  processModuleRequest(rollupObject: any) {
    if (isJsonSourceFile(this.moduleId)) {
      return;
    }
    if (isJsSourceFile(this.moduleId)) {
      this.processJsModuleRequest(rollupObject);
      return;
    }

    // Only when files were transformed to ts, the corresponding ModuleSourceFile were initialized with sourceFile node,
    // if files were transformed to js, ModuleSourceFile were initialized with srouce string.
    this.isSourceNode ? this.processTransformedTsModuleRequest(rollupObject) :
      this.processTransformedJsModuleRequest(rollupObject);
  }

  private static initPluginEnv(rollupObject: any) {
    this.projectConfig = Object.assign(rollupObject.share.arkProjectConfig, rollupObject.share.projectConfig);
    this.logger = rollupObject.share.getLogger(GEN_ABC_PLUGIN_NAME);
  }
}
