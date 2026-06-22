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
  if (!entry || entry.originalDeclarationContent === undefined || entry.originalDeclarationContent === null) {
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
  expect(merged).to.not.match(/export\s+\{[^}]+\}/);
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

    mocha.it('does not preserve unused system API import', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.not.include("import { router } from '@ohos.router'");
    });

    mocha.it('resolves nested system API through intermediate', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include("export { nestedBase } from '@ohos.base'");
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

  mocha.describe('sibling type: import reference (example 1)', function () {
    const opts = () => makeOptions('siblingImportRef');

    mocha.it('inlines imported type A used by exported B', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('declare class A');
      expect(merged).to.include('export declare class B');
      expect(merged).to.include('a: A');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      expectSelfContained(performMerge(opts()));
    });
  });

  mocha.describe('sibling type: co-exported reference (example 2)', function () {
    const opts = () => makeOptions('siblingExportRef');

    mocha.it('inlines co-exported type A used by exported B', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('declare class A');
      expect(merged).to.include('export declare class B');
      expect(merged).to.include('a: A');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      expectSelfContained(performMerge(opts()));
    });
  });

  mocha.describe('sibling type: local reference (example 3)', function () {
    const opts = () => makeOptions('siblingLocalRef');

    mocha.it('inlines non-exported type A used by exported B', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('declare class A');
      expect(merged).to.include('export declare class B');
      expect(merged).to.include('a: A');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      expectSelfContained(performMerge(opts()));
    });
  });

  mocha.describe('alias rename with reference update', function () {
    const opts = () => makeOptions('aliasRenameRef');

    mocha.it('renames conflicting A and updates references in B', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('export declare class A');
      expect(merged).to.include('str: string');
      expect(merged).to.include('declare class A_1');
      expect(merged).to.include('a: A_1');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      expectSelfContained(performMerge(opts()));
    });
  });

  mocha.describe('export after dependency inline', function () {
    const opts = () => makeOptions('exportAfterDependency');

    mocha.it('preserves export for symbol first inlined as dependency', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('declare class A');
      expect(merged).to.include('export declare class B');
      expect(merged).to.include('a: A');
      const exportCount = (merged.match(/export\s+(?:declare\s+)?class A/g) || []).length;
      expect(exportCount).to.be.at.least(1, 'A should have export modifier');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.not.match(/\bfrom\b/);
    });
  });

  mocha.describe('export * as namespace re-export (namespaceReexport)', function () {
    const opts = () => makeOptions('namespaceReexport');

    mocha.it('handles export * as without crashing', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('Utils');
      expect(merged).to.include('Models');
    });

    mocha.it('inlines namespace members at top level without export', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('declare function add');
      expect(merged).to.include('declare function subtract');
      expect(merged).to.include('declare class User');
      expect(merged).to.not.match(/export\s+declare\s+function\s+add/);
      expect(merged).to.not.match(/export\s+declare\s+function\s+subtract/);
      expect(merged).to.not.match(/export\s+declare\s+class\s+User/);
    });

    mocha.it('generates declare namespace with export references', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('declare namespace Utils');
      expect(merged).to.include('declare namespace Models');
      expect(merged).to.include('add');
      expect(merged).to.include('subtract');
      expect(merged).to.include('User');
    });

    mocha.it('exports namespace names', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('export {');
      expect(merged).to.match(/Utils/);
      expect(merged).to.match(/Models/);
    });

    mocha.it('is self-contained (no from clauses for local modules)', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.not.include("from './utils'");
      expect(merged).to.not.include("from './models'");
    });
  });

  mocha.describe('enum value reference in const initializer', function () {
    const opts = () => makeOptions('enumValueRef');

    mocha.it('inlines enum used by exported const initializer', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('declare enum Color');
      expect(merged).to.include('export declare const DEFAULT_COLOR = Color.Red');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      expectSelfContained(performMerge(opts()));
    });
  });

  mocha.describe('any and unknown type replacement for ArkTS declarations', function () {
    const opts = () => makeOptions('anyTypeRef');

    mocha.it('replaces any and unknown from .d.ts dependency with ESObject in .d.ets output', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('export type AnyAlias = ESObject');
      expect(merged).to.include('export type UnknownAlias = ESObject');
      expect(merged).to.include('export declare function useAny(value: ESObject): ESObject');
      expect(merged).to.include('export declare function useUnknown(value: ESObject): ESObject');
      expect(merged).to.not.match(/\bany\b/);
      expect(merged).to.not.match(/\bunknown\b/);
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      expectSelfContained(performMerge(opts()));
    });
  });

  mocha.describe('explicit re-export shadows export star conflicts', function () {
    const opts = () => makeOptions('exportConflict');

    mocha.it('keeps named-export namespace implementation and drops export-star body', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('declare namespace SharedNamespace');
      expect(merged).to.include('export const namedOnlyConst: number');
      expect(merged).to.include('export function namedOnlyFn(): void');
      expect(merged).to.not.include('starOnlyConst');
      expect(merged).to.not.include('starOnlyFn');
    });

    mocha.it('keeps named-export class implementation and drops export-star body', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('declare class SharedClass');
      expect(merged).to.include('namedOnlyField: string');
      expect(merged).to.include('namedOnlyMethod(): void');
      expect(merged).to.not.include('starOnlyField');
      expect(merged).to.not.include('starOnlyMethod');
    });

    mocha.it('keeps named-export function implementation and drops export-star signature', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('declare function sharedFunction(value: string): string');
      expect(merged).to.not.include('declare function sharedFunction(value: number): number');
    });
  });

  mocha.describe('aliased re-export keeps export star namespace with same local name', function () {
    const opts = () => makeOptions('exportAliasConflict');

    mocha.it('keeps both aliased namespace and export-star namespace', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('namespace b');
      expect(merged).to.include('fromNamedAlias');
      expect(merged).to.include('namespace a');
      expect(merged).to.include('fromExportStar');
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

  mocha.describe('cross-module fallback via harFilesRecord mapping (crossLibFallback)', function () {
    const LIB_DIR = 'crossLibFallback';
    const opts = () => makeOptions(LIB_DIR);
    const intermediateDeclPath = path.join(TESTDATA_DIR, 'crossLibFallback1', 'Index.d.ets');
    const deepestDeclPath = path.join(TESTDATA_DIR, 'crossLibFallback2', 'Index.d.ets');

    mocha.beforeEach(function () {
      const dirs = [
        path.join(TESTDATA_DIR, 'crossLibFallback'),
        path.join(TESTDATA_DIR, 'crossLibFallback1'),
        path.join(TESTDATA_DIR, 'crossLibFallback2'),
      ];
      for (const dir of dirs) {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      }
      if (!fs.existsSync(opts().entryFile)) {
        fs.writeFileSync(opts().entryFile, "export { A } from 'crossLibFallback1'\n");
      }
      if (!fs.existsSync(intermediateDeclPath)) {
        fs.writeFileSync(intermediateDeclPath, "export { A } from 'crossLibFallback2'\n");
      }
      if (!fs.existsSync(deepestDeclPath)) {
        fs.writeFileSync(deepestDeclPath, 'export declare const A: string = "aaaa";\n');
      }
    });

    function createFallbackResolver(
      testDataDir: string,
      declToSourceMap: Map<string, string>
    ): (moduleNames: string[], containingFile: string) => (ts.ResolvedModuleFull | null)[] {
      const blockedDeclPaths: Set<string> = new Set();
      for (const declPath of declToSourceMap.keys()) {
        blockedDeclPaths.add(declPath);
      }
      return (moduleNames: string[], containingFile: string): (ts.ResolvedModuleFull | null)[] => {
        return moduleNames.map(moduleName => {
          const resolveFrom = (fromFile: string): ts.ResolvedModuleFull | null => {
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
          };
          if (blockedDeclPaths.has(containingFile)) {
            const sourcePath = declToSourceMap.get(containingFile);
            if (sourcePath) {
              return resolveFrom(sourcePath);
            }
            return null;
          }
          const resolved = resolveFrom(containingFile);
          if (resolved) {
            return resolved;
          }
          const sourcePath = declToSourceMap.get(containingFile);
          if (sourcePath) {
            return resolveFrom(sourcePath);
          }
          return null;
        });
      };
    }

    function setupAndMerge(entryFile: string): string {
      const sourcePath = entryFile.replace(/\.d\.ets$/, '.ets');
      const intermediateSourcePath = path.join(TESTDATA_DIR, 'crossLibFallback1', 'Index.ets');
      const virtualCachePath = path.join(TESTDATA_DIR, '.cache', 'crossLibFallback1', 'Index.d.ets');

      const declToSourceMap: Map<string, string> = new Map();
      declToSourceMap.set(intermediateDeclPath, intermediateSourcePath);

      harFilesRecord.set(sourcePath, {
        sourcePath: sourcePath,
        originalDeclarationCachePath: entryFile,
        originalDeclarationContent: ''
      });
      harFilesRecord.set(virtualCachePath, {
        sourcePath: intermediateSourcePath,
        originalDeclarationCachePath: virtualCachePath,
        originalDeclarationContent: ''
      });

      DeclarationMerger.mergeDeclarationFiles({
        entryFile: entryFile,
        projectPath: TESTDATA_DIR,
        isByteCodeHar: true,
        resolveModuleNames: createFallbackResolver(TESTDATA_DIR, declToSourceMap),
      });

      const entry = harFilesRecord.get(sourcePath);
      return entry?.originalDeclarationContent ?? '';
    }

    mocha.it('resolves 3-hop re-export via declToSource fallback', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = setupAndMerge(opts().entryFile);
      expect(merged).to.include('export declare const A');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = setupAndMerge(opts().entryFile);
      expectSelfContained(merged);
    });
  });

  mocha.describe('keyof type reference dependency (keyofType)', function () {
    const opts = () => makeOptions('keyofType');

    mocha.it('inlines dependency type used with keyof', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('Config');
      expect(merged).to.include('keyof');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      expectSelfContained(performMerge(opts()));
    });
  });

  mocha.describe('conditional type reference dependency (conditionalType)', function () {
    const opts = () => makeOptions('conditionalType');

    mocha.it('inlines conditional type dependency', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('Result');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      expectSelfContained(performMerge(opts()));
    });
  });

  mocha.describe('namespace-qualified type reference (namespaceQualified)', function () {
    const opts = () => makeOptions('namespaceQualified');

    mocha.it('inlines namespace-qualified type dependency', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('NS');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      expectSelfContained(performMerge(opts()));
    });
  });

  mocha.describe('multiple decorators on single declaration (multiDecorator)', function () {
    const opts = () => makeOptions('multiDecorator');

    mocha.it('preserves all decorators', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('@Component');
      expect(merged).to.include('@Reusable');
    });

    mocha.it('preserves struct members', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('@State');
      expect(merged).to.include('count');
      expect(merged).to.include('build');
    });
  });

  mocha.describe('component struct no duplicate members (componentStruct)', function () {
    const opts = () => makeOptions('componentStruct');

    mocha.it('does not duplicate @State members', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      const stateCount = (merged.match(/@State/g) || []).length;
      expect(stateCount).to.equal(1, 'should have exactly one @State, got: ' + stateCount);
    });

    mocha.it('does not duplicate property declarations', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      const messageCount = (merged.match(/\bmessage\s*:\s*string/g) || []).length;
      expect(messageCount).to.equal(1, 'should have exactly one message property, got: ' + messageCount);
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      expectSelfContained(performMerge(opts()));
    });
  });

  mocha.describe('system API as type dependency (systemApiTypeDep)', function () {
    const SYSTEM_MODULES = ['@ohos.base.d.ts', '@ohos.router.d.ts'];
    const opts = () => ({ ...makeOptions('systemApiTypeDep'), systemModules: SYSTEM_MODULES });

    mocha.it('uses import (not export) for system API used only as type', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include("import { ErrorCallback } from '@ohos.base'");
      expect(merged).to.not.include("export { ErrorCallback } from '@ohos.base'");
    });

    mocha.it('preserves the variable that references the system API type', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('ErrorCallback');
      expect(merged).to.include('export declare let a');
    });

    mocha.it('preserves system API import', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include("import { ErrorCallback } from '@ohos.base'");
      expect(merged).to.not.include("from './");
    });
  });

  mocha.describe('interface as type dependency (interfaceTypeDep)', function () {
    const opts = () => makeOptions('interfaceTypeDep');

    mocha.it('strips export and adds declare for interface dependency', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('declare interface A');
      expect(merged).to.not.include('exportdeclare');
      expect(merged).to.not.include('export interface');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      expectSelfContained(performMerge(opts()));
    });
  });

  mocha.describe('name collision scenarios', function () {

    mocha.it('collisionClass: both renamed class exports are present', function () {
      const opts = () => makeOptions('collisionClass');
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('A');
      expect(merged).to.include('B');
      expect(merged).to.include('x: number');
      expect(merged).to.include('y: string');
    });

    mocha.it('collisionTypeDepPreferredName: Bar and Baz are present with valid output', function () {
      const opts = () => makeOptions('collisionTypeDepPreferredName');
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('Bar');
      expect(merged).to.include('Baz');
      expect(merged).to.be.a('string');
    });

    mocha.it('collisionNamespaceInterface: both N declarations are present', function () {
      const opts = () => makeOptions('collisionNamespaceInterface');
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('f(): void');
      expect(merged).to.include('g(): void');
      expect(merged).to.include('N');
    });

    mocha.it('collisionMultiDecl: all 3 N declarations are present', function () {
      const opts = () => makeOptions('collisionMultiDecl');
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('f(): void');
      expect(merged).to.include('g(): void');
      expect(merged).to.include('h(): void');
      expect(merged).to.include('N');
    });

    mocha.it('collisionPreferredNameOnly: both Helper declarations are present', function () {
      const opts = () => makeOptions('collisionPreferredNameOnly');
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('x: number');
      expect(merged).to.include('y: string');
      expect(merged).to.include('Helper');
    });
  });

  mocha.describe('exported name priority over type dep (exportedNamePriority)', function () {
    const opts = () => makeOptions('exportedNamePriority');

    mocha.it('exported A keeps its name, type-dep A gets renamed', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.include('declare class A_1');
      expect(merged).to.include('b: number');
      expect(merged).to.include('a: A_1');
      expect(merged).to.not.match(/export\s+(declare\s+)?class\s+A_1/);
      expect(merged).to.match(/export\s+(declare\s+)?class\s+A\s*\{/);
      expectSelfContained(merged);
    });
  });

  mocha.describe('export default handling (defaultExport)', function () {
    const opts = () => makeOptions('defaultExport');

    mocha.it('no duplicate export default in merged output', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      const defaultCount = (merged.match(/export\s+default\b/g) || []).length;
      expect(defaultCount).to.equal(0, 'merged output should have no export default since entry re-exports with names');

      expect(merged).to.match(/export\s+declare\s+class\s+MyDefault/);
      expect(merged).to.include('x: number');
      expect(merged).to.match(/export\s+declare\s+class\s+Named/);
      expect(merged).to.include('y: string');
    });
  });

  mocha.describe('entry default export preserved (defaultExportEntry)', function () {
    const opts = () => makeOptions('defaultExportEntry');

    mocha.it('entry default export is preserved, other default stripped', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      const defaultCount = (merged.match(/export\s+default\b/g) || []).length;
      expect(defaultCount).to.equal(1, 'should have exactly one export default (from entry)');

      expect(merged).to.include('DefaultClass');
      expect(merged).to.include('x: number');
      expect(merged).to.match(/declare\s+class\s+Other/);
      expect(merged).to.include('y: string');
      expect(merged).to.not.include('export default OtherClass');
    });
  });

  mocha.describe('namespace member keeps name when same as namespace (namespaceMemberSameName)', function () {
    const opts = () => makeOptions('namespaceMemberSameName');

    mocha.it('member class A is not renamed when namespace is also A', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.include('declare class A');
      expect(merged).to.not.include('A_1');
      expect(merged).to.include('declare namespace A');
      expect(merged).to.include('x: number');
      expect(merged).to.match(/export\s+\{\s*A\s*\}/);
    });
  });

  mocha.describe('getter and accessor formatting (getterTest)', () => {
    const opts = () => makeOptions('getterTest');

    mocha.it('preserves getter syntax correctly', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.include('get mapStatus(): MapStatus');
      expect(merged).to.not.include('get;\n');
      expect(merged).to.not.match(/^mapStatus\(\);/m);
    });

    mocha.it('preserves constructor parameter formatting', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      if (merged.includes('constructor')) {
        expect(merged).to.not.match(/constructor\s*\(\s*opt\s*\?\s*:\s*/);
      }
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expectSelfContained(merged);
    });
  });

  mocha.describe('generic extends preserved (genericExtends)', () => {
    const opts = () => makeOptions('genericExtends', 'Index.d.ts');

    mocha.it('preserves extends keyword in generic constraints', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.include('T extends {}');
      expect(merged).to.include('WeakMap<object, any>');
      expect(merged).to.include('T & U');
    });

    mocha.it('preserves method signatures with generics', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.include('deepClone');
      expect(merged).to.include('shallowClone');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expectSelfContained(merged);
    });
  });

  mocha.describe('namespace qualified type reference (nsQualifiedType)', () => {
    const opts = () => makeOptions('nsQualifiedType');

    mocha.it('simplifies tz.AAA to AAA', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.include('AAA');
      expect(merged).to.not.match(/tz\.AAA/);
    });

    mocha.it('does not produce double declare', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.not.match(/declare\s+declare/);
    });

    mocha.it('does not duplicate enum', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      const count = (merged.match(/enum\s+AAA/g) || []).length;
      expect(count).to.equal(1);
    });
  });

  mocha.describe('namespace qualified via import (nsQualifiedIndirect)', () => {
    const opts = () => makeOptions('nsQualifiedIndirect');

    mocha.it('simplifies config.test to test', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.include('test');
      expect(merged).to.not.match(/config\.test/);
    });

    mocha.it('inlines interface test', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.match(/interface\s+test/);
      expect(merged).to.not.match(/from\s+/);
    });
  });

  mocha.describe('enum member merging (enumMergeMembers)', function () {
    const opts = () => makeOptions('enumMergeMembers');

    mocha.it('merges overlapping enum members into one enum', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.include('a = 1');
      expect(merged).to.include('b = 2');
    });

    mocha.it('deduplicates identical members (a = 1 appears only once)', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      const aCount = (merged.match(/a\s*=\s*1/g) || []).length;
      expect(aCount).to.equal(1, 'a = 1 should appear exactly once');
    });

    mocha.it('produces exactly one enum A declaration', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      const enumCount = (merged.match(/enum\s+A/g) || []).length;
      expect(enumCount).to.equal(1, 'should have exactly one enum A');
    });

    mocha.it('preserves all exported symbols', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('useA');
      expect(merged).to.include('Bar');
      expect(merged).to.match(/field:\s*A/);
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      expectSelfContained(performMerge(opts()));
    });
  });

  mocha.describe('duplicate declarations across files (duplicateAcrossFiles)', function () {
    const opts = () => makeOptions('duplicateAcrossFiles');

    mocha.it('deduplicates identical type declarations from different files', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      const typeCount = (merged.match(/type\s+typeRecord1/g) || []).length;
      expect(typeCount).to.equal(1, 'typeRecord1 should appear exactly once');
    });

    mocha.it('deduplicates identical namespace blocks', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      const nsCount = (merged.match(/namespace\s+NS/g) || []).length;
      expect(nsCount).to.equal(1, 'NS namespace should appear exactly once');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      expectSelfContained(performMerge(opts()));
    });
  });

  mocha.describe('export * does not re-export default (starExportDefault)', function () {
    const opts = () => makeOptions('starExportDefault');

    mocha.it('does not export default via export *', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.not.include('default');
      expect(merged).to.include('export {}');
    });

    mocha.it('does not include the default-exported variable at all', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.not.match(/\bdeclare\s+let\s+a\b/);
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      expectSelfContained(performMerge(opts()));
    });
  });

  mocha.describe('enum members not emitted as separate entities (enumExtraMembers)', function () {
    const opts = () => makeOptions('enumExtraMembers');

    mocha.it('does not emit individual enum members', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.include('enum SIZE');
      expect(merged).to.include("a = '1'");
      expect(merged).to.include("b = '2'");
      expect(merged).to.not.match(/\bdeclare\s+(const\s+)?a\s*[=:]/);
      expect(merged).to.not.match(/\bdeclare\s+(const\s+)?b\s*[=:]/);
    });
  });

  mocha.describe('namespace/class member dedup (nsClassMemberDup)', function () {
    const opts = () => makeOptions('nsClassMemberDup');

    mocha.it('does not emit namespace type members as standalone entities', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.include('namespace Scalar');
      expect(merged).to.include('class Scalar');

      const lines = merged.split('\n');
      let insideBlock = 0;
      let standaloneBlockFolded = 0;
      for (const line of lines) {
        if (line.includes('{')) insideBlock++;
        if (line.includes('}')) insideBlock--;
        if (insideBlock === 0 && /^\s*type\s+BLOCK_FOLDED/.test(line)) {
          standaloneBlockFolded++;
        }
      }
      expect(standaloneBlockFolded).to.equal(0,
        'BLOCK_FOLDED type alias should not appear at top level');
    });

    mocha.it('does not emit class static properties as standalone entities', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      const lines = merged.split('\n');
      let insideBlock = 0;
      let standaloneStatic = 0;
      for (const line of lines) {
        if (line.includes('{')) insideBlock++;
        if (line.includes('}')) insideBlock--;
        if (insideBlock === 0 && /^\s*static\s+readonly/.test(line)) {
          standaloneStatic++;
        }
      }
      expect(standaloneStatic).to.equal(0,
        'static readonly properties should not appear at top level');
    });
  });

  mocha.describe('namespace-only export (nsOnlyExport)', function () {
    const opts = () => makeOptions('nsOnlyExport');

    mocha.it('does not export namespace members at top level', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      console.log('=== nsOnlyExport ===\n', merged);

      expect(merged).to.include('namespace NS');
      expect(merged).to.include('declare let a');

      const lines = merged.split('\n');
      let insideBlock = 0;
      let foundTopLevelExport: string | null = null;
      for (const line of lines) {
        if (line.includes('{')) insideBlock++;
        if (line.includes('}')) insideBlock--;
        if (insideBlock === 0) {
          const m = line.match(/^export\s*\{([^}]+)\}/);
          if (m) foundTopLevelExport = m[1];
        }
      }
      expect(foundTopLevelExport).to.not.be.null;
      expect(foundTopLevelExport!).to.include('NS');
      expect(foundTopLevelExport!).to.not.match(/\ba\b/);
    });
  });

  mocha.describe('namespace + direct export (nsAndDirectExport)', function () {
    const opts = () => makeOptions('nsAndDirectExport');

    mocha.it('exports member at both namespace and top level', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      console.log('=== nsAndDirectExport ===\n', merged);

      expect(merged).to.include('namespace NS');
      expect(merged).to.include('declare let a');

      const lines = merged.split('\n');
      let insideBlock = 0;
      let foundTopLevelExport: string | null = null;
      for (const line of lines) {
        if (line.includes('{')) insideBlock++;
        if (line.includes('}')) insideBlock--;
        if (insideBlock === 0) {
          const m = line.match(/^export\s*\{([^}]+)\}/);
          if (m) foundTopLevelExport = m[1];
        }
      }
      expect(foundTopLevelExport).to.not.be.null;
      expect(foundTopLevelExport!).to.include('NS');
      expect(foundTopLevelExport!).to.match(/\ba\b/);
    });
  });

  mocha.describe('import type reference resolution (importTypeRef)', function () {
    const opts = () => makeOptions('importTypeRef');

    mocha.it('replaces import type with resolved type text', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.include('export type name = string');
      expect(merged).to.not.include('import(');
      expect(merged).to.not.include('name_1');
      expectSelfContained(merged);
    });
  });
});
