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

import * as ts from 'typescript';

interface ProcessSourceFileResult {
  node: ts.SourceFile;
  isCopyrightDeleted: boolean;
}

interface NeedDeleteExportInfo {
  fileName: string;
  default: string;
  exportName: Set<string>;
}

interface ReferenceModuleInfo {
  isUsed: boolean;
  modules: Record<string, string[]>;
  reference?: string;
}

interface FormatNodeInfo {
  node: ts.SourceFile;
  referencesMessage: string;
  copyrightMessage: string;
  isCopyrightDeleted: boolean;
}

interface FormatImportInfo {
  statement?: ts.ImportDeclaration;
  copyrightMessage?: string;
  isCopyrightDeleted?: boolean; 
}

interface ClauseSetValueInfo {
  exsitClauseSet: Set<string>;
  hasExsitStatus: boolean;
  hasNonExsitStatus: boolean;
}

type ExportStatementType = ts.ModuleDeclaration |
  ts.InterfaceDeclaration |
  ts.ClassDeclaration |
  ts.EnumDeclaration |
  ts.StructDeclaration |
  ts.TypeAliasDeclaration;

export type {
  ClauseSetValueInfo,
  ExportStatementType,
  FormatImportInfo,
  FormatNodeInfo,
  NeedDeleteExportInfo,
  ProcessSourceFileResult,
  ReferenceModuleInfo,
};
