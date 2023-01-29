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
  NODE_MODULES,
  GEN_ABC_PLUGIN_NAME
} from '../common/ark_define';
import { getOhmUrlByFilepath, getOhmUrlByHarName } from '../../../ark_utils';
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

  static processModuleSourceFiles(rollupObject: any) {
    this.initPluginEnv(rollupObject);
    ModuleSourceFile.sourceFiles.forEach((source: ModuleSourceFile) => {
      source.processModuleRequest(rollupObject);
      source.writeSourceFile();
    });
    ModuleSourceFile.sourceFiles = [];
  }

  writeSourceFile() {
    if (this.isSourceNode && !isJsSourceFile(this.moduleId)) {
      writeFileSyncByNode(<ts.SourceFile>this.source, true, ModuleSourceFile.projectConfig);
    } else {
      writeFileContentToTempDir(this.moduleId, <string>this.source, ModuleSourceFile.projectConfig,
        ModuleSourceFile.logger);
    }
  }

  private getOhmUrl(moduleRequest: string, filePath: string | undefined): string | undefined {
    const harOhmUrl: string | undefined = getOhmUrlByHarName(moduleRequest, ModuleSourceFile.projectConfig);
    if (harOhmUrl !== undefined) {
      return harOhmUrl;
    }
    if (filePath) {
      const ohmUrl: string = getOhmUrlByFilepath(filePath, ModuleSourceFile.projectConfig, ModuleSourceFile.logger);
      return ohmUrl.startsWith(NODE_MODULES) ? `@package:${ohmUrl}` : `@bundle:${ohmUrl}`;
    }
    return undefined;
  }

  private processJsModuleRequest(rollupObject: any) {
    const moduleInfo: any = rollupObject.getModuleInfo(this.moduleId);
    const importMap: any = moduleInfo.importedIdMaps;
    const REG_DEPENDENCY: RegExp = /(?:import|from)(?:\s*)['"]([^'"]+)['"]/g;
    this.source = (<string>this.source).replace(REG_DEPENDENCY, (item, moduleRequest) => {
      const ohmUrl: string | undefined = this.getOhmUrl(moduleRequest, importMap[moduleRequest]);
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
        const ohmUrl: string | undefined = this.getOhmUrl(node.source.value, importMap[node.source.value]);
        if (ohmUrl !== undefined) {
          code.update(node.source.start, node.source.end, `'${ohmUrl}'`);
        }
      }
    });
    this.source = code.toString();
  }

  private processTransformedTsmoduleRequest(rollupObject: any) {
    const moduleInfo: any = rollupObject.getModuleInfo(this.moduleId);
    const importMap: any = moduleInfo.importedIdMaps;
    (<ts.SourceFile>this.source)!.forEachChild((childNode: ts.Node) => {
      if (ts.isImportDeclaration(childNode) || (ts.isExportDeclaration(childNode) && childNode.moduleSpecifier)) {
        const moduleRequest: string = childNode.moduleSpecifier.getText();
        const ohmUrl: string | undefined = this.getOhmUrl(moduleRequest, importMap[moduleRequest]);
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
    });
  }

  processModuleRequest(rollupObject: any) {
    if (isJsonSourceFile(this.moduleId)) {
      return;
    }
    if (isJsSourceFile(this.moduleId)) {
      this.processJsModuleRequest(rollupObject);
      return;
    }
    this.isSourceNode ? this.processTransformedTsmoduleRequest(rollupObject) :
      this.processTransformedJsModuleRequest(rollupObject);
  }

  private static initPluginEnv(rollupObject: any) {
    this.projectConfig = Object.assign(rollupObject.share.arkProjectConfig, rollupObject.share.projectConfig);
    this.logger = rollupObject.share.getLogger(GEN_ABC_PLUGIN_NAME);
  }
}
