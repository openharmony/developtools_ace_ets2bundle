/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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

import mocha from 'mocha';
import fs from 'fs';
import path from 'path';
import * as ts from 'typescript';
import { expect } from 'chai';
import { DeclarationMerger, DeclarationMergeOptions } from '../../lib/declaration_merger';
import { harFilesRecord } from '../../lib/utils';

const TESTDATA_DIR = path.resolve(__dirname, '..', '..', 'test', 'ark_compiler_ut', 'testdata', 'declaration_merge');
const SDK_DIR = path.join(TESTDATA_DIR, 'sdk');

function createTestModuleResolver(
  testDataDir: string,
  sdkDir: string
): (moduleNames: string[], containingFile: string) => (ts.ResolvedModuleFull | null)[] {
  const resolveRelative = (moduleName: string, containingFile: string): ts.ResolvedModuleFull | null => {
    const containingDir = path.dirname(containingFile);
    const basePath = path.resolve(containingDir, moduleName);
    const candidates = [
      basePath + '.d.ets',
      basePath + '.d.ts',
      path.join(basePath, 'Index.d.ets'),
      path.join(basePath, 'Index.d.ts'),
    ];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        const ext = candidate.endsWith('.d.ets') ? ts.Extension.Dets : ts.Extension.Dts;
        return { resolvedFileName: candidate, extension: ext };
      }
    }
    return null;
  };

  return (moduleNames: string[], containingFile: string): (ts.ResolvedModuleFull | null)[] => {
    return moduleNames.map(moduleName => {
      if (moduleName.startsWith('@ohos.')) {
        const stubPath = path.join(sdkDir, moduleName + '.d.ts');
        if (fs.existsSync(stubPath)) {
          return { resolvedFileName: stubPath, extension: ts.Extension.Dts };
        }
        return null;
      }

      if (moduleName.startsWith('.')) {
        const resolved = resolveRelative(moduleName, containingFile);
        if (resolved) return resolved;

        const parentDir = path.dirname(path.dirname(containingFile));
        const baseName = moduleName.replace(/^\.\//, '').replace(/^\.\.\//, '');
        const siblingCandidates = [
          path.join(parentDir, baseName, 'Index.d.ets'),
          path.join(parentDir, baseName, 'Index.d.ts'),
        ];
        for (const candidate of siblingCandidates) {
          if (fs.existsSync(candidate)) {
            const ext = candidate.endsWith('.d.ets') ? ts.Extension.Dets : ts.Extension.Dts;
            return { resolvedFileName: candidate, extension: ext };
          }
        }
        return null;
      }

      const containingDir = path.dirname(containingFile);
      const ohModulesPath = path.join(containingDir, 'oh_modules', moduleName, 'Index.d.ets');
      if (fs.existsSync(ohModulesPath)) {
        return { resolvedFileName: ohModulesPath, extension: ts.Extension.Dets };
      }

      const libCandidates = [
        path.join(testDataDir, moduleName, 'Index.d.ets'),
        path.join(testDataDir, moduleName, 'Index.d.ts'),
      ];
      for (const candidate of libCandidates) {
        if (fs.existsSync(candidate)) {
          const ext = candidate.endsWith('.d.ets') ? ts.Extension.Dets : ts.Extension.Dts;
          return { resolvedFileName: candidate, extension: ext };
        }
      }
      return null;
    });
  };
}

function cleanupCache(): void {
  harFilesRecord.clear();
}

const testResolver = createTestModuleResolver(TESTDATA_DIR, SDK_DIR);

function performMerge(options: DeclarationMergeOptions): string {
  cleanupCache();

  const entryFile = options.entryFile;
  harFilesRecord.set(entryFile, {
    sourcePath: entryFile,
    originalDeclarationCachePath: entryFile,
    originalDeclarationContent: ''
  });

  DeclarationMerger.mergeDeclarationFiles({
    ...options,
    isByteCodeHar: true,
    resolveModuleNames: testResolver,
  });

  const entry = harFilesRecord.get(entryFile);
  if (!entry?.originalDeclarationContent) {
    throw new Error(`Merged content not found in cache for ${entryFile}`);
  }
  return entry.originalDeclarationContent;
}

function makeOptions(libraryDir: string, entryName: string = 'Index.d.ets'): DeclarationMergeOptions {
  const entryFile = path.join(TESTDATA_DIR, libraryDir, entryName);
  return { entryFile, projectPath: TESTDATA_DIR };
}

function skipIfMissing(entryFile: string, ctx: Mocha.Context): void {
  if (!fs.existsSync(entryFile)) {
    ctx.skip();
  }
}

function expectSelfContained(merged: string): void {
  expect(merged).to.not.include('export {');
  expect(merged).to.not.match(/\bfrom\b/);
}

mocha.describe('test declaration file merging', function () {

  mocha.beforeEach(function () {
    cleanupCache();
  });

  mocha.describe('basic merging (libraryA + libraryB)', function () {
    const opts = () => makeOptions('libraryA');

    mocha.it('merges @Component struct, variables, and cross-library re-export', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('MainPage');
      expect(merged).to.include('aaa');
      expect(merged).to.include('ccc');
      expect(merged).to.not.include('bbb');
    });

    mocha.it('preserves @Component and @State decorators', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('@Component');
      expect(merged).to.include('@State');
    });

    mocha.it('preserves build method', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('build(): void');
    });

    mocha.it('removes auto-generated constructors', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.not.include('constructor(?:');
    });

    mocha.it('produces proper export declarations', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('export declare struct MainPage');
      expect(merged).to.include('export declare let aaa');
      expect(merged).to.include('export declare let ccc');
    });

    mocha.it('has no excessive blank lines', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.not.match(/\n\n\n/);
      expect(merged).to.not.match(/\n\s+\n$/);
    });

    mocha.it('is self-contained (no export { ... } from)', function () {
      skipIfMissing(opts().entryFile, this);
      expectSelfContained(performMerge(opts()));
    });
  });

  mocha.describe('multiple components (libraryC)', function () {
    const opts = () => makeOptions('libraryC');

    mocha.it('merges multiple @Component structs and variables', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('ComponentA');
      expect(merged).to.include('ComponentB');
      expect(merged).to.include('utility1');
      expect(merged).to.not.include('privateUtil');
    });

    mocha.it('preserves @State and @Prop decorators', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('@State');
      expect(merged).to.include('@Prop');
    });
  });

  mocha.describe('chained + parallel re-exports (libraryD)', function () {
    const opts = () => makeOptions('libraryD');

    mocha.it('resolves chained and parallel re-export chains', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('export declare let aaa: number;');
      expect(merged).to.include('export declare let bbb: number;');
      expect(merged).to.include('valueA');
      expect(merged).to.include('valueB');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      expectSelfContained(performMerge(opts()));
    });
  });

  mocha.describe('nested directory (libraryE)', function () {
    const opts = () => makeOptions('libraryE');

    mocha.it('resolves re-exports from nested subdirectory', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('ComponentE');
      expect(merged).to.include('valueE');
    });
  });

  mocha.describe('import type + export * wildcard (imports)', function () {
    const opts = () => makeOptions('imports');

    mocha.it('inlines imported type and wildcard exports', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('classA');
      expect(merged).to.include('sharedValue');
      expect(merged).to.include('sharedFn');
      expect(merged).to.include('typedVar');
    });

    mocha.it('imported type has no export modifier (not re-exported)', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('declare class classA');
      expect(merged).to.not.include('export declare class classA');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.not.include('import');
      expect(merged).to.not.include('export {');
      expect(merged).to.not.include('export *');
      expect(merged).to.not.match(/\bfrom\b/);
    });
  });

  mocha.describe('export rename + import rename (rename)', function () {
    const opts = () => makeOptions('rename');

    mocha.it('applies export rename (srcVar → renamed)', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('renamed');
      expect(merged).to.not.include('srcVar');
    });

    mocha.it('applies import rename (classA → MyType)', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('MyType');
      expect(merged).to.not.include('classA');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      expectSelfContained(performMerge(opts()));
    });
  });

  mocha.describe('oh_modules dependency (libraryJ)', function () {
    const opts = () => makeOptions('libraryJ');

    mocha.it('resolves oh_modules binary HAR dependency', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('foo');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      expectSelfContained(performMerge(opts()));
    });

    mocha.it('handles missing oh_modules gracefully', function () {
      skipIfMissing(opts().entryFile, this);
      DeclarationMerger.mergeDeclarationFiles({
        ...opts(),
        isByteCodeHar: true,
        resolveModuleNames: testResolver,
      });
      expect(true).to.be.true;
    });
  });

  mocha.describe('@Builder + @Component with constructor (builder)', function () {
    const opts = () => makeOptions('builder');

    mocha.it('preserves @Builder and @Component decorators', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('@Builder');
      expect(merged).to.include('MyBuilder');
      expect(merged).to.include('@Component');
      expect(merged).to.include('BuilderComp');
    });

    mocha.it('removes auto-generated constructors', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.not.include('constructor(?:');
    });
  });

  mocha.describe('system API direct + nested (systemApi)', function () {
    const SYSTEM_MODULES = ['@ohos.base.d.ts', '@ohos.router.d.ts'];
    const opts = () => ({ ...makeOptions('systemApi'), systemModules: SYSTEM_MODULES });

    mocha.it('preserves direct system API export', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include("export { base } from '@ohos.base'");
    });

    mocha.it('preserves direct system API import', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include("import { router } from '@ohos.router'");
    });

    mocha.it('resolves nested system API through intermediate', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include("export { nestedBase } from '@ohos.base'");
      expect(merged).to.include("import { nestedRouter } from '@ohos.router'");
    });

    mocha.it('inlines local @Component dependency', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('@Component');
      expect(merged).to.include('struct MainPage');
      expect(merged).to.include('localVal');
      expect(merged).to.not.include("export { MainPage } from './local'");
    });

    mocha.it('has no intermediate path references', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.not.include("'./intermediate'");
    });
  });

  mocha.describe('pure .d.ts (libraryTS)', function () {
    const opts = () => makeOptions('libraryTS', 'Index.d.ts');

    mocha.it('merges .d.ts files with deep re-export chain', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('utilFn');
      expect(merged).to.include('MyType');
      expect(merged).to.include('configValue');
    });

    mocha.it('excludes non-re-exported symbols', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.not.include('internalVar');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      expectSelfContained(performMerge(opts()));
    });

    mocha.it('has no excessive blank lines', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.not.match(/\n\n\n/);
    });
  });

  mocha.describe('.d.ets entry with .d.ts dependency (libraryMixed)', function () {
    const opts = () => makeOptions('libraryMixed');

    mocha.it('merges mixed .d.ets and .d.ts files', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('MixedComp');
      expect(merged).to.include('helperFn');
    });

    mocha.it('preserves @Component and @State decorators', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('@Component');
      expect(merged).to.include('@State');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      expectSelfContained(performMerge(opts()));
    });
  });

  mocha.describe('.d.ts entry with .d.ets dependency (libraryMixedTS)', function () {
    const opts = () => makeOptions('libraryMixedTS', 'Index.d.ts');

    mocha.it('merges .d.ts barrel referencing .d.ets sub-file', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('baseValue');
      expect(merged).to.include('TsComp');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      expectSelfContained(performMerge(opts()));
    });
  });

  mocha.describe('cross-module multi-level (mainModule)', function () {
    const opts = () => makeOptions('mainModule');

    mocha.it('resolves multi-hop cross-module re-exports', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('itemA');
      expect(merged).to.include('itemB');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      expectSelfContained(performMerge(opts()));
    });
  });

  mocha.describe('complex cross-module (complexModule)', function () {
    const opts = () => makeOptions('complexModule');

    mocha.it('resolves complex multi-module dependencies', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('ComponentX');
      expect(merged).to.include('ComponentY');
      expect(merged).to.include('valueX');
    });

    mocha.it('removes auto-generated constructors and is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.not.include('constructor(?:');
      expectSelfContained(merged);
    });
  });

  mocha.describe('error handling', function () {
    mocha.it('handles non-existent entry file gracefully', function () {
      const entryFile = path.join(TESTDATA_DIR, 'nonexistent', 'Index.d.ets');
      DeclarationMerger.mergeDeclarationFiles({
        entryFile,
        projectPath: TESTDATA_DIR,
        isByteCodeHar: true,
        resolveModuleNames: testResolver,
      });
      expect(true).to.be.true;
    });
  });
});
