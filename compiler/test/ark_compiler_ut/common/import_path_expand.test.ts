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
import { projectConfig } from '../../../main';

const compilerOptions = ts.readConfigFile(
  path.resolve(__dirname, '../../../tsconfig.json'), ts.sys.readFile).config.compilerOptions;
compilerOptions['moduleResolution'] = 'nodenext';
compilerOptions['module'] = 'es2020';

function createMultiSymbolProgram(testContent: string, symbolToFileMap: Record<string, string>,
  indexContent: string, rootDir: string = '/TestProject'): { program: ts.Program; testSourceFile: ts.SourceFile } {
  const moduleRootPath: string = `${rootDir}/testPkg`;
  const fileMap = new Map<string, ts.SourceFile>();

  for (const [relativePath, code] of Object.entries(symbolToFileMap)) {
    const fullFilePath = `${moduleRootPath}/${relativePath}`;
    const sourceFile = ts.createSourceFile(fullFilePath, code, ts.ScriptTarget.ES2020, true);
    Object.defineProperty(sourceFile, 'fileName', { value: fullFilePath });
    fileMap.set(fullFilePath, sourceFile);
  }

  const testFileName = `${rootDir}/test/testFile.ets`;
  const testSourceFile = ts.createSourceFile(testFileName, testContent, ts.ScriptTarget.ES2020, true);
  Object.defineProperty(testSourceFile, 'fileName', { value: testFileName });

  const compilerHost = ts.createCompilerHost({ target: ts.ScriptTarget.ES2020 });
  const allSourceFiles = new Map<string, ts.SourceFile>([...fileMap.entries(), [testFileName, testSourceFile]]);

  compilerHost.getSourceFile = (fileName) => allSourceFiles.get(fileName);

  compilerHost.resolveModuleNames = (moduleNames: string[], containingFile: string) => {
    return moduleNames.map(name => {
      if (name === 'testPkg') {
        return {
          resolvedFileName: `${moduleRootPath}/Index.ts`,
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
  };

  const indexFilePath = `${moduleRootPath}/Index.ts`;
  const indexSourceFile = ts.createSourceFile(indexFilePath, indexContent, ts.ScriptTarget.ESNext, true);
  Object.defineProperty(indexSourceFile, 'fileName', { value: indexFilePath });
  allSourceFiles.set(indexFilePath, indexSourceFile);

  return {
    program: ts.createProgram({
      rootNames: [...allSourceFiles.keys()],
      options: compilerOptions,
      host: compilerHost,
    }),
    testSourceFile
  };
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
const EXPECT_1_1 = `import { type C } from "testPkg";
import def, { A as AA, B } from "testPkg/testDir/test";
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

const baseConfig = { enable: true, exclude: [] };
const rollupObejct =  {
  share: {
    projectConfig: {
      expandImportPath: baseConfig,
      depName2DepInfo: new Map()
    }
  }
};
rollupObejct.share.projectConfig.depName2DepInfo.set('testPkg', {});

mocha.describe('test import_path_expand file api', () => {
  mocha.it('1-1: split default + named + type imports', () => {
    const tmpModulePathMap = projectConfig.modulePathMap;
    projectConfig.modulePathMap = {
      'testPkg': '/TestProject/testPkg'
    };
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_1_1_TEST, CASE_1_1_FILES, CASE_1_1_INDEX);
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_1_1).to.be.true;
    projectConfig.modulePathMap = tmpModulePathMap;
  });

  mocha.it('1-2: resolve multi-symbol to different files', () => {
    const tmpModulePathMap = projectConfig.modulePathMap;
    projectConfig.modulePathMap = {
      'testPkg': '/TestProject/testPkg'
    };
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_1_2_TEST, CASE_1_2_FILES, CASE_1_2_INDEX);
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_1_2).to.be.true;
    projectConfig.modulePathMap = tmpModulePathMap;
  });

  mocha.it('1-3: resolve re-export chain to final file', () => {
    const tmpModulePathMap = projectConfig.modulePathMap;
    projectConfig.modulePathMap = {
      'testPkg': '/TestProject/testPkg'
    };
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_1_3_TEST, CASE_1_3_FILES, CASE_1_3_INDEX);
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_1_3).to.be.true;
    projectConfig.modulePathMap = tmpModulePathMap;
  });

  mocha.it('1-4: exclude import path from transform', () => {
    const tmpModulePathMap = projectConfig.modulePathMap;
    projectConfig.modulePathMap = {
      'testPkg': '/TestProject/testPkg'
    };
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_1_4_TEST, CASE_1_4_FILES, CASE_1_4_INDEX);
    rollupObejct.share.projectConfig.expandImportPath.exclude = ['excludePkg'];
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_1_4).to.be.true;
    projectConfig.modulePathMap = tmpModulePathMap;
    rollupObejct.share.projectConfig.expandImportPath.exclude = [];
  });

  mocha.it('1-5: fallback default import to named', () => {
    const tmpModulePathMap = projectConfig.modulePathMap;
    projectConfig.modulePathMap = {
      'testPkg': '/TestProject/testPkg'
    };
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_1_5_TEST, CASE_1_5_FILES, CASE_1_5_INDEX);
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_1_5).to.be.true;
    projectConfig.modulePathMap = tmpModulePathMap;
  });

  mocha.it('1-6: transform type-only named import', () => {
    const tmpModulePathMap = projectConfig.modulePathMap;
    projectConfig.modulePathMap = {
      'testPkg': '/TestProject/testPkg'
    };
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_1_6_TEST, CASE_1_6_FILES, CASE_1_6_INDEX);
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_1_6).to.be.true;
    projectConfig.modulePathMap = tmpModulePathMap;
  });

  mocha.it('2-1: should not transform when config is disabled', () => {
    const tmpModulePathMap = projectConfig.modulePathMap;
    projectConfig.modulePathMap = {
      'testPkg': '/TestProject/testPkg'
    };
    rollupObejct.share.projectConfig.expandImportPath.enable = false;
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_2_1_TEST, CASE_2_1_FILES, CASE_2_1_INDEX);
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_2_1).to.be.true;
    projectConfig.modulePathMap = tmpModulePathMap;
    rollupObejct.share.projectConfig.expandImportPath.enable = true;
  });

  mocha.it('2-2: transform the variable name is default', () => {
    const tmpModulePathMap = projectConfig.modulePathMap;
    projectConfig.modulePathMap = {
      'testPkg': '/TestProject/testPkg'
    };
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_2_2_TEST, CASE_2_2_FILES, CASE_2_2_INDEX);
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_2_2).to.be.true;
    projectConfig.modulePathMap = tmpModulePathMap;
  });

  mocha.it('3-1: should preserve namespace import', () => {
    const tmpModulePathMap = projectConfig.modulePathMap;
    projectConfig.modulePathMap = {
      'testPkg': '/TestProject/testPkg'
    };
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_3_1_TEST, CASE_3_1_FILES, CASE_3_1_INDEX);
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_3_1).to.be.true;
    projectConfig.modulePathMap = tmpModulePathMap;
  });

  mocha.it('3-2: should preserve side-effect import', () => {
    const tmpModulePathMap = projectConfig.modulePathMap;
    projectConfig.modulePathMap = {
      'testPkg': '/TestProject/testPkg'
    };
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_3_2_IMPORT, CASE_3_2_FILES, CASE_3_2_INDEX);
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed)

    expect(result === EXPECT_3_2).to.be.true;
    projectConfig.modulePathMap = tmpModulePathMap;
  });

  mocha.it('3-3: should preserve "pkgName/filePath" import', () => {
    const tmpModulePathMap = projectConfig.modulePathMap;
    projectConfig.modulePathMap = {
      'testPkg': '/TestProject/testPkg'
    };
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_3_3_TEST, CASE_3_3_FILES, CASE_3_3_INDEX);
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_3_3).to.be.true;
    projectConfig.modulePathMap = tmpModulePathMap;
  });

  mocha.it('3-4: should preserve import when symbol is from js | .d.ts | .d.ets file', () => {
    const tmpModulePathMap = projectConfig.modulePathMap;
    projectConfig.modulePathMap = {
      'testPkg': '/TestProject/testPkg'
    };
    const { program, testSourceFile } = createMultiSymbolProgram(CASE_3_4_TEST, CASE_3_4_FILES, CASE_3_4_INDEX);
    const transformed = ts.transform(testSourceFile, [expandAllImportPaths(program.getTypeChecker(), rollupObejct)],
      program.getCompilerOptions()).transformed[0];
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    const result = printer.printFile(transformed);

    expect(result === EXPECT_3_4).to.be.true;
    projectConfig.modulePathMap = tmpModulePathMap;
  });
});
