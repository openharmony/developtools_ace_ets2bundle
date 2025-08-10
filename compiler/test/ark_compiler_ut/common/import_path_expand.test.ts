/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

import mocha from 'mocha';
import { expect } from 'chai';
import path from 'path';
import * as ts from 'typescript';

import { expandAllImportPaths } from '../../../lib/import_path_expand';

const compilerOptions = ts.readConfigFile(
  path.resolve(__dirname, '../../../tsconfig.json'), ts.sys.readFile).config.compilerOptions;
compilerOptions['moduleResolution'] = 'nodenext';
compilerOptions['module'] = 'es2020';

function createMultiSymbolProgram(testContent: string, testPkgSymbolToFileMap: Record<string, string>,
  testPkgIndexContent: string, twoPkgSymbolToFileMap?: Record<string, string>, twoPkgIndexContent?: string
  ): { program: ts.Program; testSourceFile: ts.SourceFile } {
  const rootDir: string = '/TestProject';
  const moduleRootPath: string = `${rootDir}/testPkg`;
  const twoModuleRootPath: string = `${rootDir}/twoPkg`;
  const fileMap = new Map<string, ts.SourceFile>();

  populateFileMap(fileMap, testPkgSymbolToFileMap, moduleRootPath);

  if (twoPkgSymbolToFileMap) {
    populateFileMap(fileMap, twoPkgSymbolToFileMap, twoModuleRootPath);
  }

  const testFileName = `${rootDir}/test/testFile.ets`;
  const testSourceFile = ts.createSourceFile(testFileName, testContent, ts.ScriptTarget.ES2020, true);
  Object.defineProperty(testSourceFile, 'fileName', { value: testFileName });

  const compilerHost = ts.createCompilerHost({ target: ts.ScriptTarget.ES2020 });
  const allSourceFiles = new Map<string, ts.SourceFile>([...fileMap.entries(), [testFileName, testSourceFile]]);

  compilerHost.getSourceFile = (fileName) => allSourceFiles.get(fileName);

  compilerHost.resolveModuleNames = (moduleNames, containingFile) => resolveModuleNames(moduleNames, containingFile,
    fileMap, {
    testPkg: moduleRootPath,
    twoPkg: twoModuleRootPath
  });

  populateSingleFile(allSourceFiles, testPkgIndexContent, moduleRootPath);

  if (twoPkgIndexContent) {
    populateSingleFile(allSourceFiles, twoPkgIndexContent, twoModuleRootPath);
  }

  return {
    program: ts.createProgram({
      rootNames: [...allSourceFiles.keys()],
      options: compilerOptions,
      host: compilerHost,
    }),
    testSourceFile
  };
}

function resolveModuleNames(moduleNames: string[], containingFile: string, fileMap: Map<string, ts.SourceFile>,
  moduleRootPaths: Record<string, string>): (ts.ResolvedModule | undefined)[] {
  return moduleNames.map(name => {
    if (moduleRootPaths[name]) {
      return {
        resolvedFileName: `${moduleRootPaths[name]}/Index.ts`,
        isExternalLibraryImport: false
      };
    }
    const candidate = path.resolve(path.dirname(containingFile), name);
    const resolved = [...fileMap.keys()].find(filePath =>
      filePath === candidate || filePath === candidate + '.ts');

    if (resolved) {
      return {
        resolvedFileName: resolved,
        isExternalLibraryImport: false
      };
    }
    return undefined;
  });
}

function populateFileMap(fileMap: Map<string, ts.SourceFile>, symbolToFileMap: Record<string, string>, moduleRootPath: string): void {
  for (const [relativePath, code] of Object.entries(symbolToFileMap)) {
    const fullFilePath = `${moduleRootPath}/${relativePath}`;
    const sourceFile = ts.createSourceFile(fullFilePath, code, ts.ScriptTarget.ES2020, true);
    Object.defineProperty(sourceFile, 'fileName', { value: fullFilePath });
    fileMap.set(fullFilePath, sourceFile);
  }
}

function populateSingleFile(fileMap: Map<string, ts.SourceFile>, content: string, moduleRootPath: string): void {
  const indexFilePath = `${moduleRootPath}/Index.ts`;
  const sourceFile = ts.createSourceFile(indexFilePath, content, ts.ScriptTarget.ES2020, true);
  Object.defineProperty(sourceFile, 'fileName', { value: indexFilePath });
  fileMap.set(indexFilePath, sourceFile);
}

const CASE_1_1_TEST = `import def, { A as AA, B, type C } from 'testPkg';
def();
let a: AA = new AA();
B();
const c: C = 'c';`;
const CASE_1_1_FILES = {
  'testDir/test.ts': `
    function def() {}
    export class A {}
    export function B() {}
    export type C = string;
    export default def;
  `
};
const CASE_1_1_INDEX = `
import def from './testDir/test';
export { A, B, type C } from './testDir/test';
export default def;
`;
const EXPECT_1_1 = `import def, { A as AA, B } from "testPkg/testDir/test";
import { type C } from "testPkg";
def();
let a: AA = new AA();
B();
const c: C = 'c';
`;


const CASE_1_2_TEST = `import { A, B, C } from 'testPkg';
A();
B();
C();`;
const CASE_1_2_FILES = {
  'a.ts': `export function A() {}`,
  'b.ts': `export function B() {}`,
  'c.ts': `export function C() {}`
};
const CASE_1_2_INDEX = `
export { A } from './a';
export { B } from './b';
export { C } from './c';
`;
const EXPECT_1_2 = `import { A } from "testPkg/a";
import { B } from "testPkg/b";
import { C } from "testPkg/c";
A();
B();
C();
`;

const CASE_1_3_TEST = `import { x, y as y1 } from 'testPkg';
console.log(x, y1);`;
const CASE_1_3_FILES = {
  'final.ts': `const x = 1; export const y = 2; export default x;`
};
const CASE_1_3_INDEX = `import x, { y } from './final';
export { x, y };`;
const EXPECT_1_3 = `import x, { y as y1 } from "testPkg/final";
console.log(x, y1);
`;

const CASE_1_4_TEST = `import { y as y1 } from 'excludePkg';
import { x } from 'testPkg';
console.log(x, y1);`;
const CASE_1_4_FILES = {
  'final.ts': `const x = 1; export default x;`
};
const CASE_1_4_INDEX = `import x from './final';
export { x };`;
const EXPECT_1_4 = `import { y as y1 } from 'excludePkg';
import x from "testPkg/final";
console.log(x, y1);
`;

const CASE_1_5_TEST = `import fallback from 'testPkg';
console.log(fallback);`;
const CASE_1_5_FILES = {
  'test.ts': `export const fallback = 1;`
};
const CASE_1_5_INDEX = `export { fallback as default } from './test';`;
const EXPECT_1_5 = `import { fallback as fallback } from "testPkg/test";
console.log(fallback);
`;

const CASE_1_6_TEST = `import type { T1 } from 'testPkg';
const a: T1 = 'a';`;
const CASE_1_6_FILES = {
  'test.ts': `export type T1 = string;`
};
const CASE_1_6_INDEX = `export type { T1 } from './test';`;
const EXPECT_1_6 = `import type { T1 } from 'testPkg';
const a: T1 = 'a';
`;

const CASE_2_1_TEST = `import { x } from 'testPkg';
console.log(x);`;
const CASE_2_1_FILES = {
  'test.ts': `export const x = 1;`
};
const CASE_2_1_INDEX = `export { x } from './test';`;
const EXPECT_2_1 = `import { x } from 'testPkg';
console.log(x);
`;

const CASE_2_2_TEST = `import { def } from 'testPkg';
def();`;
const CASE_2_2_FILES = {
  'test.ts': `export default function def() {};`
};
const CASE_2_2_INDEX = ` import def from './test';
export { def };`;
const EXPECT_2_2 = `import def from "testPkg/test";
def();
`;

const CASE_3_1_TEST = `import * as test from 'testPkg';
test.fn();`;
const CASE_3_1_FILES = {
  'test.ts': `export function fn() {}`
};
const CASE_3_1_INDEX = `export * from './test';`;
const EXPECT_3_1 = `import * as test from 'testPkg';
test.fn();
`;

const CASE_3_2_IMPORT = `import 'testPkg';`;
const CASE_3_2_FILES = {
  'test.ts': `console.log('loaded');`
};
const CASE_3_2_INDEX = `export * from './test';`;
const EXPECT_3_2 = `import 'testPkg';
`;

const CASE_3_3_TEST = `import { test } from 'testPkg/Index';
test();`;
const CASE_3_3_FILES = {
  'test.ts': `export function test() {}`
};
const CASE_3_3_INDEX = `export * from './test';`;
const EXPECT_3_3 = `import { test } from 'testPkg/Index';
test();
`;

const CASE_3_4_TEST = `import { A, B, C, D } from 'testPkg';
A();
B();
C();
D();`;
const CASE_3_4_FILES = {
  'a.js': `export function A() {}`,
  'b.d.ts': `export function B() {}`,
  'c.d.ets': `export function C() {}`,
  'd.ts': `export function D() {}`
};
const CASE_3_4_INDEX = `
export { A } from './a';
export { B } from './b';
export { C } from './c';
export { D } from './d';
`;
const EXPECT_3_4 = `import { A, B, C } from "testPkg";
import { D } from "testPkg/d";
A();
B();
C();
D();
`;

const CASE_3_5_TEST = `import { A } from 'testPkg';
A();`;
const CASE_3_5_TESTPKG_FILES = {
  'a.ts': `export { A } from 'twoPkg';`
};
const CASE_3_5_TESTPKG_INDEX = `
export { A } from './a';
`;
const CASE_3_5_TWOPKG_FILES = {
  'b.ts': `export function A() {}`
};
const CASE_3_5_TWOPKG_INDEX = `
export { A } from './b';
`;
const EXPECT_3_5 = `import { A } from "testPkg";
A();
`;

const CASE_4_1_TEST = `import { A } from './relativePath';
A();`;
const CASE_4_1_FILES = {
  'relativePath.ts': `export function A() {}`
};
const EXPECT_4_1 = `import { A } from './relativePath';
A();
`;

const CASE_4_2_TEST = `import { A } from '@ohos.system';
A();`;
const CASE_4_2_FILES = {
  'system.ts': `export function A() {}`
};
const EXPECT_4_2 = `import { A } from '@ohos.system';
A();
`;

const CASE_4_3_TEST = `import { A } from 'libtest.so';
A();`;
const CASE_4_3_FILES = {
  'libtest.so': `export function A() {}`
};
const EXPECT_4_3 = `import { A } from 'libtest.so';
A();
`;

const CASE_4_4_TEST = `import { A } from 'unknownPkg';
A();`;
const CASE_4_4_FILES = {
  'unknownPkg.ts': `export function A() {}`
};
const EXPECT_4_4 = `import { A } from 'unknownPkg';
A();
`;

const CASE_4_5_TEST = `import { A } from 'hspPkg';
A();`;
const CASE_4_5_FILES = {
  'hspPkg.ts': `export function A() {}`
};
const EXPECT_4_5 = `import { A } from 'hspPkg';
A();
`;

// 新增测试用例：测试新加的判断条件
const CASE_4_6_TEST = `import { A } from 'harPkg';
A();`;
const CASE_4_6_FILES = {
  'harPkg.ts': `export function A() {}`
};
const EXPECT_4_6 = `import { A } from 'harPkg';
A();
`;

const CASE_4_7_TEST = `import { A } from 'excludePkg';
A();`;
const CASE_4_7_FILES = {
  'excludePkg.ts': `export function A() {}`
};
const EXPECT_4_7 = `import { A } from 'excludePkg';
A();
`;

const CASE_4_8_TEST = `import { A } from '@system.system';
A();`;
const CASE_4_8_FILES = {
  'system.ts': `export function A() {}`
};
const EXPECT_4_8 = `import { A } from '@system.system';
A();
`;

const CASE_4_9_TEST = `import { A } from '@kit.system';
A();`;
const CASE_4_9_FILES = {
  'kit.ts': `export function A() {}`
};
const EXPECT_4_9 = `import { A } from '@kit.system';
A();
`;

const CASE_4_10_TEST = `import { A } from '@arkts.system';
A();`;
const CASE_4_10_FILES = {
  'arkts.ts': `export function A() {}`
};
const EXPECT_4_10 = `import { A } from '@arkts.system';
A();
`;

const baseConfig = { enable: true, exclude: [] };
const rollupObejct =  {
  share: {
    projectConfig: {
      expandImportPath: baseConfig,
      depName2DepInfo: new Map(),
      packageDir: 'oh_modules',
      hspNameOhmMap: {},
      harNameOhmMap: {}
    }
  }
};
rollupObejct.share.projectConfig.depName2DepInfo.set('testPkg', {
  pkgRootPath: '/TestProject/testPkg'
});
rollupObejct.share.projectConfig.depName2DepInfo.set('twoPkg', {
  pkgRootPath: '/TestProject/twoPkg'
});

mocha.describe('test import_path_expand file api', () => {
  mocha.it('1-1: split default + named + type imports', () => {
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_1_1_TEST, CASE_1_1_FILES, CASE_1_1_INDEX);
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_1_1).to.be.true;
  });

  mocha.it('1-2: resolve multi-symbol to different files', () => {
    
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_1_2_TEST, CASE_1_2_FILES, CASE_1_2_INDEX);
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_1_2).to.be.true;
    
  });

  mocha.it('1-3: resolve re-export chain to final file', () => {
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_1_3_TEST, CASE_1_3_FILES, CASE_1_3_INDEX);
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_1_3).to.be.true;
  });

  mocha.it('1-4: exclude import path from transform', () => {
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_1_4_TEST, CASE_1_4_FILES, CASE_1_4_INDEX);
    rollupObejct.share.projectConfig.expandImportPath.exclude = ['excludePkg'];
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_1_4).to.be.true;
    rollupObejct.share.projectConfig.expandImportPath.exclude = [];
  });

  mocha.it('1-5: fallback default import to named', () => {
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_1_5_TEST, CASE_1_5_FILES, CASE_1_5_INDEX);
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_1_5).to.be.true;
  });

  mocha.it('1-6: transform type-only named import', () => {
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_1_6_TEST, CASE_1_6_FILES, CASE_1_6_INDEX);
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_1_6).to.be.true;
  });

  mocha.it('2-1: should not transform when config is disabled', () => {
    rollupObejct.share.projectConfig.expandImportPath.enable = false;
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_2_1_TEST, CASE_2_1_FILES, CASE_2_1_INDEX);
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_2_1).to.be.true;
    rollupObejct.share.projectConfig.expandImportPath.enable = true;
  });

  mocha.it('2-2: transform the variable name is default', () => {
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_2_2_TEST, CASE_2_2_FILES, CASE_2_2_INDEX);
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_2_2).to.be.true;
  });

  mocha.it('3-1: should preserve namespace import', () => {
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_3_1_TEST, CASE_3_1_FILES, CASE_3_1_INDEX);
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_3_1).to.be.true;
  });

  mocha.it('3-2: should preserve side-effect import', () => {
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_3_2_IMPORT, CASE_3_2_FILES, CASE_3_2_INDEX);
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed)

    expect(result === EXPECT_3_2).to.be.true;
  });

  mocha.it('3-3: should preserve "pkgName/filePath" import', () => {
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_3_3_TEST, CASE_3_3_FILES, CASE_3_3_INDEX);
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_3_3).to.be.true;
  });

  mocha.it('3-4: should preserve import when symbol is from js | .d.ts | .d.ets file', () => {
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_3_4_TEST, CASE_3_4_FILES, CASE_3_4_INDEX);
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_3_4).to.be.true;
  });

  mocha.it('3-5: should preserve import when the symbol is exported across modules', () => {
    const { program, testSourceFile } =
      createMultiSymbolProgram(CASE_3_5_TEST, CASE_3_5_TESTPKG_FILES, CASE_3_5_TESTPKG_INDEX, CASE_3_5_TWOPKG_FILES, CASE_3_5_TWOPKG_INDEX);
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_3_5).to.be.true;
  });

  mocha.it('4-1: should preserve relative path import (starts with .)', () => {
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_4_1_TEST, CASE_4_1_FILES, '');
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_4_1).to.be.true;
  });

  mocha.it('4-2: should preserve system module import (@ohos.system)', () => {
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_4_2_TEST, CASE_4_2_FILES, '');
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_4_2).to.be.true;
  });

  mocha.it('4-3: should preserve lib*.so module import', () => {
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_4_3_TEST, CASE_4_3_FILES, '');
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_4_3).to.be.true;
  });

  mocha.it('4-4: should preserve import when module not in depName2DepInfo', () => {
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_4_4_TEST, CASE_4_4_FILES, '');
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_4_4).to.be.true;
  });

  mocha.it('4-5: should preserve import when module in hspNameOhmMap', () => {
    rollupObejct.share.projectConfig.hspNameOhmMap = { 'hspPkg': 'hspPkg.ohm' };
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_4_5_TEST, CASE_4_5_FILES, '');
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_4_5).to.be.true;
    rollupObejct.share.projectConfig.hspNameOhmMap = {};
  });

  mocha.it('4-6: should preserve import when module in harNameOhmMap', () => {
    rollupObejct.share.projectConfig.harNameOhmMap = { 'harPkg': 'harPkg.ohm' };
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_4_6_TEST, CASE_4_6_FILES, '');
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_4_6).to.be.true;
    rollupObejct.share.projectConfig.harNameOhmMap = {};
  });

  mocha.it('4-7: should preserve import when module in exclude list', () => {
    rollupObejct.share.projectConfig.expandImportPath.exclude = ['excludePkg'];
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_4_7_TEST, CASE_4_7_FILES, '');
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_4_7).to.be.true;
    rollupObejct.share.projectConfig.expandImportPath.exclude = [];
  });

  mocha.it('4-8: should preserve import when module starts with @system', () => {
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_4_8_TEST, CASE_4_8_FILES, '');
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_4_8).to.be.true;
  });

  mocha.it('4-9: should preserve import when module starts with @kit', () => {
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_4_9_TEST, CASE_4_9_FILES, '');
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_4_9).to.be.true;
  });

  mocha.it('4-10: should preserve import when module starts with @arkts', () => {
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_4_10_TEST, CASE_4_10_FILES, '');
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_4_10).to.be.true;
  });
});
