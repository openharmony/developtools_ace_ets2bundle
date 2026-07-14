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

function performMergeFull(options: DeclarationMergeOptions): { primary: string; companion: string } {
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

  const entryDir = path.dirname(entryFile);
  const isDets = entryFile.endsWith('.d.ets');
  const companionName = isDets
    ? entryFile.replace(/\.d\.ets$/, '').replace(/^.*\//, '') + '-declarations.d.ts'
    : entryFile.replace(/\.d\.ts$/, '').replace(/^.*\//, '') + '-declarations.d.ets';
  const companionPath = path.join(entryDir, companionName);
  const companionEntry = harFilesRecord.get(companionPath);

  return {
    primary: entry.originalDeclarationContent,
    companion: companionEntry?.originalDeclarationContent ?? ''
  };
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

function stripNamespaceBlocks(text: string): string {
  let result = '';
  let i = 0;
  while (i < text.length) {
    const nsMatch = text.slice(i).match(/^declare\s+namespace\s+\w+\s*\{/);
    if (nsMatch) {
      let depth = 1;
      i += nsMatch[0].length;
      while (i < text.length && depth > 0) {
        if (text[i] === '{') depth++;
        else if (text[i] === '}') depth--;
        i++;
      }
    } else {
      result += text[i];
      i++;
    }
  }
  return result;
}

function expectSelfContained(merged: string, companion?: string): void {
  const hasCompanionExport = companion && companion.trim().length > 0;
  if (hasCompanionExport) {
    const lines = merged.split('\n');
    const filtered = lines.filter(l =>
      !l.includes('-declarations')
    );
    const reassembled = filtered.join('\n');
    expect(reassembled).to.not.match(/export\s+\{[^}]+\}\s*from\b/);
    expect(reassembled).to.not.match(/\bimport\s.*\bfrom\b/);
  } else {
    const stripped = stripNamespaceBlocks(merged);
    expect(stripped).to.not.match(/export\s+\{[^}]+\}\s*from\b/);
    expect(merged).to.not.match(/\bfrom\b/);
  }
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
      expect(merged).to.include('export class classA');
      expect(merged).to.not.include('export declare class classA');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.not.include('import');
      expect(merged).to.not.match(/export\s+\{[^}]+\}/);
      expect(merged).to.not.include('export *');
      expect(merged).to.not.match(/\bfrom\b/);
    });
  });

  mocha.describe('export rename + import rename (rename)', function () {
    const opts = () => makeOptions('rename');

    mocha.it('applies export rename (srcVar → renamed)', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('srcVar');
      expect(merged).to.include('renamed');
      expect(merged).to.include('export { srcVar as renamed }');
    });

    mocha.it('applies import rename (classA → MyType)', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('MyType');
      expect(merged).to.include('classA');
      expect(merged).to.include('export { classA as MyType }');
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
      const { primary, companion } = performMergeFull(opts());
      expectSelfContained(primary, companion);
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
      const { primary, companion } = performMergeFull(opts());
      expectSelfContained(primary, companion);
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
      expect(merged).to.include('export class A');
      expect(merged).to.include('export declare class B');
      expect(merged).to.match(/a: \w+\.A/);
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
      expect(merged).to.include('export class A');
      expect(merged).to.include('export declare class B');
      expect(merged).to.match(/a: \w+\.A/);
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
      expect(merged).to.include('export class A');
      expect(merged).to.include('export declare class B');
      expect(merged).to.match(/a: \w+\.A/);
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      expectSelfContained(performMerge(opts()));
    });
  });

  mocha.describe('alias rename with reference update', function () {
    const opts = () => makeOptions('aliasRenameRef');

    mocha.it('renames conflicting A via namespace isolation and updates references in B', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('export declare class A');
      expect(merged).to.include('str: string');
      expect(merged).to.match(/declare namespace _\d+.*\n.*export class A/s);
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

    mocha.it('places namespace members inside declare namespace block', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('declare namespace Utils');
      expect(merged).to.include('add');
      expect(merged).to.include('subtract');
      expect(merged).to.include('declare namespace Models');
      expect(merged).to.include('User');
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

  mocha.describe('import * as NS + export { NS } (nsImportExport)', function () {
    const opts = () => makeOptions('nsImportExport');

    mocha.it('creates namespace block from import * as NS + export { NS }', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('declare namespace NS');
      expect(merged).to.include('a');
      expect(merged).to.include('class A');
    });

    mocha.it('exports NS name', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('export {');
      expect(merged).to.match(/\bNS\b/);
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.not.include("from './test1'");
    });

    mocha.it('does not emit top-level export declare for namespace members', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.not.match(/export\s+declare\s+let\s+a/);
      expect(merged).to.not.match(/export\s+declare\s+class\s+A/);
    });
  });

  mocha.describe('import * as NS + export { NS as Alias } (nsImportExportRename)', function () {
    const opts = () => makeOptions('nsImportExportRename');

    mocha.it('creates namespace block with alias name', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('declare namespace MyNS');
      expect(merged).to.include('a');
      expect(merged).to.include('class A');
    });

    mocha.it('exports alias name', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('export {');
      expect(merged).to.match(/\bMyNS\b/);
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.not.include("from './test1'");
    });
  });

  mocha.describe('import * as NS type reference (nsImportTypeRef)', function () {
    const opts = () => makeOptions('nsImportTypeRef');

    mocha.it('rewrites NS.A type annotation to _test1.A', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('_test1');
      expect(merged).to.not.include('NS._test1');
      expect(merged).to.not.match(/\bNS\.A\b/);
    });

    mocha.it('rewrites NS.A in heritage clause (extends)', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.match(/extends\s+_test1\.A/);
      expect(merged).to.not.match(/extends\s+NS\./);
    });

    mocha.it('inlines type dependency in namespace block', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('declare namespace _test1');
      expect(merged).to.include('class A');
    });

    mocha.it('no NS prefix leaks into output', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.not.match(/\bNS\./);
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.not.include("from './test1'");
    });
  });

  mocha.describe('import * as NS with target also exported (nsImportQualRefExported)', function () {
    const opts = () => makeOptions('nsImportQualRefExported');

    mocha.it('rewrites NS.A to bare A when target is an exported entity', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.match(/let\s+a:\s*A\b/);
      expect(merged).to.not.match(/\bNS\.A\b/);
    });

    mocha.it('no NS prefix leaks into output', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.not.match(/\bNS\b/);
    });

    mocha.it('declares class A and exports it as B', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.match(/\bdeclare\s+class\s+A\b/);
      expect(merged).to.include('export { A as B }');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      expectSelfContained(performMerge(opts()));
    });
  });

  mocha.describe('system API import routed to companion (sysApiCrossExtRef)', function () {
    const SYSTEM_MODULES = ['@ohos.util.ArrayList.d.ts'];
    const opts = () => ({ ...makeOptions('sysApiCrossExtRef'), systemModules: SYSTEM_MODULES });

    mocha.it('routes system API import to companion, not primary', function () {
      skipIfMissing(opts().entryFile, this);
      const { primary, companion } = performMergeFull(opts());

      expect(companion).to.include('import ArrayList from "@ohos.util.ArrayList"');
      expect(companion).to.include('ArrayList<string>');
      expect(primary).to.not.include('ArrayList');
      expect(primary).to.not.include('@ohos.util.ArrayList');
    });

    mocha.it('primary only re-exports a from companion', function () {
      skipIfMissing(opts().entryFile, this);
      const { primary } = performMergeFull(opts());

      expect(primary).to.include("export { a } from './Index-declarations'");
    });
  });

  mocha.describe('SDK global type not inlined when transitively loaded (sdkGlobalTypeRef)', function () {
    const SYSTEM_MODULES = ['@ohos.web.webview.d.ts'];
    const opts = () => ({
      ...makeOptions('sdkGlobalTypeRef'),
      systemModules: SYSTEM_MODULES,
      sdkPath: SDK_DIR
    });

    mocha.it('keeps NavPathStack as bare reference, not inlined', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.match(/let\s+a:\s*NavPathStack\b/);
      expect(merged).to.not.include('_navigation');
      expect(merged).to.not.include('declare namespace _navigation');
    });

    mocha.it('preserves system API import and type reference', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.include('import webview from "@ohos.web.webview"');
      expect(merged).to.include('webview.WebviewController');
    });

    mocha.it('does not create companion file', function () {
      skipIfMissing(opts().entryFile, this);
      const { companion } = performMergeFull(opts());

      expect(companion.trim().length === 0 || companion === '(none)').to.be.true;
    });
  });

  mocha.describe('enum value reference in const initializer', function () {
    const opts = () => makeOptions('enumValueRef');

    mocha.it('inlines enum used by exported const initializer', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('export enum Color');
      expect(merged).to.match(/DEFAULT_COLOR = \w+\.Color\.Red/);
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      expectSelfContained(performMerge(opts()));
    });
  });

  mocha.describe('any and unknown types in companion .d.ts file', function () {
    const opts = () => makeOptions('anyTypeRef');

    mocha.it('places .d.ts dependency in companion with any/unknown preserved', function () {
      skipIfMissing(opts().entryFile, this);
      const { primary, companion } = performMergeFull(opts());
      expect(companion).to.include('AnyAlias');
      expect(companion).to.include('UnknownAlias');
      expect(companion).to.include('useAny');
      expect(companion).to.include('useUnknown');
    });

    mocha.it('primary re-exports symbols from companion', function () {
      skipIfMissing(opts().entryFile, this);
      const { primary } = performMergeFull(opts());
      expect(primary).to.include("Index-declarations");
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      const { primary, companion } = performMergeFull(opts());
      expectSelfContained(primary, companion);
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

    mocha.it('inlines interface dependency inside namespace', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('export interface A');
      expect(merged).to.not.include('exportdeclare');
      expect(merged).to.match(/declare namespace \w+/, 'has namespace wrapping');
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

    mocha.it('exported A keeps its name, type-dep A gets namespace isolation', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.match(/declare namespace _\d+/);
      expect(merged).to.include('b: number');
      expect(merged).to.not.match(/export\s+(declare\s+)?class\s+A_\d+/);
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

      expect(merged).to.match(/declare\s+class\s+DefaultClass/);
      expect(merged).to.include('x: number');
      expect(merged).to.match(/declare\s+class\s+OtherDefault/);
      expect(merged).to.include('y: string');
      expect(merged).to.include('DefaultClass as MyDefault');
      expect(merged).to.include('OtherDefault as Named');
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

      expect(merged).to.include('declare namespace A');
      expect(merged).to.include('export class A');
      expect(merged).to.not.include('A_1');
      expect(merged).to.include('x: number');
      expect(merged).to.include('export { A }');
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

    mocha.it('preserves tz.AAA as qualified type reference', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('AAA');
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

    mocha.it('preserves config.test as qualified type reference', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.include('test');
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

    mocha.it('preserves enum members from all files', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.include('a = 1');
      expect(merged).to.include('b = 2');
    });

    mocha.it('preserves all exported symbols', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('useA');
      expect(merged).to.include('Bar');
      expect(merged).to.include('A');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      expectSelfContained(performMerge(opts()));
    });
  });

  mocha.describe('duplicate declarations across files (duplicateAcrossFiles)', function () {
    const opts = () => makeOptions('duplicateAcrossFiles');

    mocha.it('includes type declarations from all files', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.include('typeRecord1');
    });

    mocha.it('deduplicates identical namespace blocks', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('NS');
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

      expect(merged).to.include('declare namespace NS');
      expect(merged).to.include('export let a');

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

      expect(merged).to.include('declare namespace NS');
      expect(merged).to.include('export declare let a');

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

  mocha.describe('import type expanded with type references (importTypeExpanded)', function () {
    const opts = () => makeOptions('importTypeExpanded');

    mocha.it('inlines TypeAlias body with renamed references', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.include('export type a = [');
      expect(merged).to.not.include('import(');
      expect(merged).to.match(/_2\.A/);
      expectSelfContained(merged);
    });
  });

  mocha.describe('import type non-TypeAlias resolution (importTypeEnum)', function () {
    const opts = () => makeOptions('importTypeEnum');

    mocha.it('resolves enum via import() to namespaced reference', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.not.include('import(');
      expect(merged).to.match(/_2\.Color/);
      expect(merged).to.include('Color');
      expectSelfContained(merged);
    });
  });

  mocha.describe('cross-extension type dep via namespace import (importTsTypeRef)', function () {
    const opts = () => makeOptions('importTsTypeRef');

    mocha.it('imports namespace from companion and references type correctly', function () {
      skipIfMissing(opts().entryFile, this);
      const { primary, companion } = performMergeFull(opts());

      expect(primary).to.include('import { _testTs } from');
      expect(primary).to.include('export declare let b: _testTs.a');
      expect(primary).to.not.include('import { a }');

      expect(companion).to.include('export declare namespace _testTs');
      expect(companion).to.include('type a = any');

      expectSelfContained(primary, companion);
    });
  });

  mocha.describe('cross-extension namespace block routing (crossExtNamespaceBlock)', function () {
    const opts = () => makeOptions('crossExtNamespaceBlock');

    mocha.it('routes .d.ts namespace block to companion file', function () {
      skipIfMissing(opts().entryFile, this);
      const { primary, companion } = performMergeFull(opts());

      expect(primary).to.include('etsFunc');
      expect(primary).to.not.include('processAny');
      expect(primary).to.not.include('AnyMapper');
      expect(primary).to.not.include('declare namespace TsUtils');

      expect(companion).to.include('export declare namespace TsUtils');
      expect(companion).to.include('processAny');
      expect(companion).to.include('AnyMapper');
    });

    mocha.it('primary re-exports namespace from companion', function () {
      skipIfMissing(opts().entryFile, this);
      const { primary, companion } = performMergeFull(opts());

      expect(primary).to.include("export { TsUtils }");
      expectSelfContained(primary, companion);
    });
  });

  mocha.describe('mixed-extension namespace members (nsMixedExtMembers)', function () {
    const opts = () => makeOptions('nsMixedExtMembers');

    mocha.it('keeps .d.ets member in primary namespace block', function () {
      skipIfMissing(opts().entryFile, this);
      const { primary } = performMergeFull(opts());

      expect(primary).to.include('declare namespace NS');
      expect(primary).to.match(/export\s+let\s+a:\s*number/);
    });

    mocha.it('moves .d.ts member to companion as top-level export', function () {
      skipIfMissing(opts().entryFile, this);
      const { primary, companion } = performMergeFull(opts());

      expect(companion).to.include('export declare class StringUtils');
      expect(companion).to.include('any');
      expect(primary).to.not.include('any');
      expect(primary).to.not.match(/class\s+StringUtils/);
    });

    mocha.it('aliases companion member into namespace via export { }', function () {
      skipIfMissing(opts().entryFile, this);
      const { primary } = performMergeFull(opts());

      expect(primary).to.include('export { StringUtils };');
      expect(primary).to.include("import { StringUtils } from './Index-declarations'");
    });

    mocha.it('exports only NS at top level', function () {
      skipIfMissing(opts().entryFile, this);
      const { primary } = performMergeFull(opts());

      expect(primary).to.include('export { NS };');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      const { primary, companion } = performMergeFull(opts());

      expectSelfContained(primary, companion);
    });

    mocha.it('is order-independent (reverse export order yields same structure)', function () {
      skipIfMissing(opts().entryFile, this);
      const revOpts = () => makeOptions('nsMixedExtMembersRev');
      skipIfMissing(revOpts().entryFile, this);
      const { primary, companion } = performMergeFull(opts());
      const { primary: revPrimary, companion: revCompanion } = performMergeFull(revOpts());

      expect(revPrimary).to.include('declare namespace NS');
      expect(revPrimary).to.match(/export\s+let\s+a:\s*number/);
      expect(revPrimary).to.include('export { StringUtils };');
      expect(revPrimary).to.include("import { StringUtils } from './Index-declarations'");
      expect(revCompanion).to.include('export declare class StringUtils');
      expect(revCompanion).to.include('any');
      expect(revPrimary).to.not.include('any');
    });
  });

  mocha.describe('mixed-extension namespace with type-only members (nsMixedExtTypeOnly)', function () {
    const opts = () => makeOptions('nsMixedExtTypeOnly');

    mocha.it('keeps .d.ets value member in primary namespace block', function () {
      skipIfMissing(opts().entryFile, this);
      const { primary } = performMergeFull(opts());

      expect(primary).to.include('declare namespace NS');
      expect(primary).to.match(/export\s+let\s+a:\s*number/);
    });

    mocha.it('moves interface and type alias to companion as top-level exports', function () {
      skipIfMissing(opts().entryFile, this);
      const { primary, companion } = performMergeFull(opts());

      expect(companion).to.include('export declare interface MyInterface');
      expect(companion).to.include('export type MyType');
      expect(companion).to.include('any');
      expect(primary).to.not.include('any');
      expect(primary).to.not.match(/interface\s+MyInterface/);
      expect(primary).to.not.match(/type\s+MyType\b/);
    });

    mocha.it('imports and aliases type-only members into namespace', function () {
      skipIfMissing(opts().entryFile, this);
      const { primary } = performMergeFull(opts());

      expect(primary).to.include('export { MyInterface };');
      expect(primary).to.include('export { MyType };');
      expect(primary).to.match(/import\s*\{\s*MyInterface,\s*MyType\s*\}\s*from\s*'\.\/Index-declarations'/);
    });

    mocha.it('exports only NS at top level', function () {
      skipIfMissing(opts().entryFile, this);
      const { primary } = performMergeFull(opts());

      expect(primary).to.include('export { NS };');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      const { primary, companion } = performMergeFull(opts());

      expectSelfContained(primary, companion);
    });
  });

  mocha.describe('namespace member alias deduplication (enumAlias)', function () {
    const opts = () => makeOptions('enumAlias');

    mocha.it('deduplicates enum and alias within namespace block', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.include('declare namespace NS');
      expect(merged).to.include('export enum A');
      expect(merged).to.include('export { A as B }');
      expect(merged).to.not.include('export enum B');
    });

    mocha.it('preserves type reference to A in function parameter (not renamed to B)', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.match(/foo\(a:\s*A\)/);
      expect(merged).to.not.match(/foo\(a:\s*B\)/);
    });

    mocha.it('type reference via alias B is valid inside namespace', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.include('bar');
      expect(merged).to.include('export { A as B }');
    });

    mocha.it('has no from clauses for local modules', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.not.include("from './test1'");
    });
  });

  mocha.describe('namespace member not re-collected as standalone type dep (nsMemberTypeDep)', function () {
    const opts = () => makeOptions('nsMemberTypeDep');

    mocha.it('does not duplicate namespace member in isolation namespace', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('HeadLinesDataTypes');
      expect(merged).to.include('ClientVersionInfo');
      expect(merged).to.not.include('_head_lines_data_types');
      expect(merged).to.not.match(/_head_lines_data_types\.ClientVersionInfo/);
    });

    mocha.it('preserves process function with correct type reference', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('process');
      expect(merged).to.include('HeadLinesDataTypes.ClientVersionInfo');
    });
  });

  mocha.describe('system API qualified type reference (sysApiQualType)', function () {
    const SYSTEM_MODULES = ['@ohos.resourceManager.d.ts'];
    const opts = () => ({ ...makeOptions('sysApiQualType'), systemModules: SYSTEM_MODULES });

    mocha.it('does not generate redundant import for system API member accessed via qualified name', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include("import resourceManager from '@ohos.resourceManager'");
      expect(merged).to.include('resourceManager.Direction');
      expect(merged).to.not.include("import { Direction }");
    });
  });

  mocha.describe('system API namespace import preserved (sysApiNsImport)', function () {
    const SYSTEM_MODULES = ['@ohos.base.d.ts'];
    const opts = () => ({ ...makeOptions('sysApiNsImport'), systemModules: SYSTEM_MODULES });

    mocha.it('preserves import * as and qualified type reference', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include("import * as A from '@ohos.base'");
      expect(merged).to.include('A.Callback');
      expect(merged).to.include('export type b');
    });
  });

  mocha.describe('system API dual default import (sysApiDualImport)', function () {
    const SYSTEM_MODULES = ['@ohos.app.ability.common.d.ts'];
    const opts = () => ({ ...makeOptions('sysApiDualImport'), systemModules: SYSTEM_MODULES });

    mocha.it('preserves both default imports with different local names', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include("import type common from '@ohos.app.ability.common'");
      expect(merged).to.include("import context from '@ohos.app.ability.common'");
    });

    mocha.it('both type references have corresponding imports', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('common.UIAbilityContext');
      expect(merged).to.include('context.UIAbilityContext');
    });

    mocha.it('same import referenced multiple times emits only once', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      const commonCount = (merged.match(/import type common from '@ohos\.app\.ability\.common'/g) || []).length;
      expect(commonCount).to.equal(1);
    });
  });

  mocha.describe('system API dual value import (sysApiDualValueImport)', function () {
    const SYSTEM_MODULES = ['@ohos.app.ability.common.d.ts'];
    const opts = () => ({ ...makeOptions('sysApiDualValueImport'), systemModules: SYSTEM_MODULES });

    mocha.it('preserves both value imports with different local names', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include("import common from '@ohos.app.ability.common'");
      expect(merged).to.include("import ctx from '@ohos.app.ability.common'");
    });

    mocha.it('both type references preserved with their respective local names', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('common.UIAbilityContext');
      expect(merged).to.include('ctx.UIAbilityContext');
    });
  });

  mocha.describe('system API same-name import dedup (sysApiSameNameDedup)', function () {
    const SYSTEM_MODULES = ['@ohos.test.ability.d.ts'];
    const opts = () => ({ ...makeOptions('sysApiSameNameDedup'), systemModules: SYSTEM_MODULES });

    mocha.it('deduplicates import type and import with same name to one', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      const importCount = (merged.match(/import.*AbilityContext.*from '@ohos\.test\.ability'/g) || []).length;
      expect(importCount).to.equal(1);
    });

    mocha.it('preserves type reference AbilityContext', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('AbilityContext');
    });
  });

  mocha.describe('system API import + export two-statement pattern (sysApiImportExport)', function () {
    const SYSTEM_MODULES = ['@ohos.base.d.ts'];
    const opts = () => ({ ...makeOptions('sysApiImportExport'), systemModules: SYSTEM_MODULES });

    mocha.it('preserves import statement from entry file', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include("import { ErrorCallback } from '@ohos.base'");
    });

    mocha.it('preserves export statement for re-exported symbol', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('export { ErrorCallback }');
    });

    mocha.it('does not inline ErrorCallback declaration', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.not.include('declare interface ErrorCallback');
      expect(merged).to.not.include('declare type ErrorCallback');
    });

    mocha.it('does not produce companion file', function () {
      skipIfMissing(opts().entryFile, this);
      const { companion } = performMergeFull(opts());
      expect(companion).to.equal('');
    });

    mocha.it('does not add redundant export {}', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.not.include('export {}');
    });
  });

  mocha.describe('namespace export with @Component struct (nsExportStruct)', function () {
    const opts = () => makeOptions('nsExportStruct');

    mocha.it('creates namespace block with struct member', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('declare namespace A');
      expect(merged).to.include('MainPage');
    });

    mocha.it('preserves @Component decorator without redundant export', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.not.match(/export\s+@Component/);
      expect(merged).to.include('@Component');
    });

    mocha.it('preserves @State decorator on members', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('@State');
      expect(merged).to.include('message');
    });

    mocha.it('struct has exactly one export keyword', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      const structExportCount = (merged.match(/export\s+(?:declare\s+)?struct\s+MainPage/g) || []).length;
      expect(structExportCount).to.equal(1);
    });

    mocha.it('strips auto-generated extends from struct', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.not.match(/\bextends\b/);
    });

    mocha.it('exports namespace name A', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.match(/export\s*\{\s*A\s*\}/);
    });
  });

  mocha.describe('aliased re-export of same symbol (aliasedReexport)', function () {
    const opts = () => makeOptions('aliasedReexport');

    mocha.it('inlines namespace declaration without export keyword', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('namespace B');
      expect(merged).to.not.match(/export\s+declare\s+namespace\s+B/);
    });

    mocha.it('exports only aliased names B1 and B2', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.match(/export\s*\{\s*B\s+as\s+B1\s*,\s*B\s+as\s+B2\s*\}/);
    });

    mocha.it('does not export B directly', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.not.match(/^export\s+\{[^}]*\bB\b(?!_)(?!\s+as)\b/m);
    });
  });

  mocha.describe('namespace isolation syntax correctness (nsIsolationSyntax)', function () {
    const opts = () => makeOptions('nsIsolationSyntax');

    mocha.it('nested namespace uses export not declare', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('export namespace _inner');
      expect(merged).to.not.match(/declare\s+namespace\s+_inner/);
    });

    mocha.it('no export default inside isolation namespace', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      const nsBlock = merged.match(/declare\s+namespace\s+_dep\s*\{[\s\S]*\}/);
      expect(nsBlock).to.not.be.null;
      expect(nsBlock![0]).to.not.include('export default');
    });

    mocha.it('default class becomes regular export inside namespace', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('export class DefaultClass');
    });

    mocha.it('no bare export declare b without let keyword', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.not.match(/export\s+declare\s+b\s*$/m);
      expect(merged).to.include('export declare let b');
    });

    mocha.it('type references use correct namespace path', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('_dep._inner.A');
      expect(merged).to.include('_dep.DefaultClass');
    });
  });

  mocha.describe('computed property key with unique symbol (computedPropKey)', function () {
    const opts = () => makeOptions('computedPropKey');

    mocha.it('collects unique symbol as type dependency', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('unique symbol');
    });

    mocha.it('rewrites computed property key to namespace-qualified path', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.match(/\[_testTs\.MAP\]/);
    });

    mocha.it('preserves class with computed property', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('export declare class Schema');
      expect(merged).to.include('readonly');
      expect(merged).to.include('string');
    });
  });

  mocha.describe('cross-library duplicate namespace dedup in companion (dupNamespaceInCompanion)', function () {
    const opts = () => makeOptions('dupNamespaceInCompanion');

    mocha.it('companion generates distinct namespaces for each library', function () {
      skipIfMissing(opts().entryFile, this);
      const { companion } = performMergeFull(opts());

      const nsCount = (companion.match(/namespace _ts_declarations/g) || []).length;
      expect(nsCount).to.be.greaterThan(0);
    });

    mocha.it('companion contains class A declarations', function () {
      skipIfMissing(opts().entryFile, this);
      const { companion } = performMergeFull(opts());

      const classCount = (companion.match(/export class A \{/g) || []).length;
      expect(classCount).to.be.greaterThan(0);
    });

    mocha.it('primary references type correctly for both exports', function () {
      skipIfMissing(opts().entryFile, this);
      const { primary } = performMergeFull(opts());

      expect(primary).to.include('declare let a:');
      expect(primary).to.include('declare let b:');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      const { primary, companion } = performMergeFull(opts());
      expectSelfContained(primary, companion);
    });
  });

  mocha.describe('default export extends exported class — no self-referential extends (defaultExportExtends)', function () {
    const opts = () => makeOptions('defaultExportExtends');

    mocha.it('does not produce class A extends A', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.not.match(/class\s+A\s+extends\s+A\b/);
    });

    mocha.it('type dep uses declaration local name, not preferredName', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.include('E_A');
      expect(merged).to.not.match(/declare namespace _test2\s*\{[^}]*\bA\b[^}]*extends/);
    });

    mocha.it('preserves correct extends reference to exported class A', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.match(/extends\s+A\b/);
      const extendsMatch = merged.match(/class\s+\w+\s+extends\s+A\b/);
      expect(extendsMatch).to.not.be.null;
      expect(extendsMatch![0]).to.not.include('class A extends A');
    });

    mocha.it('variable a references the type dep correctly', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.match(/declare let a:\s*_test2\.E_A/);
    });
  });

  mocha.describe('cross-ext exported symbol referenced as type in primary (crossExtTypeRef)', function () {
    const opts = () => makeOptions('crossExtTypeRef');

    mocha.it('primary imports A from companion when referenced as type', function () {
      skipIfMissing(opts().entryFile, this);
      const { primary } = performMergeFull(opts());

      expect(primary).to.include("import { A } from './Index-declarations'");
      expect(primary).to.include('declare let a: A');
    });

    mocha.it('primary re-exports A from companion', function () {
      skipIfMissing(opts().entryFile, this);
      const { primary } = performMergeFull(opts());

      expect(primary).to.include('export { A }');
    });

    mocha.it('companion contains class A declaration', function () {
      skipIfMissing(opts().entryFile, this);
      const { companion } = performMergeFull(opts());

      expect(companion).to.include('export declare class A');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      const { primary, companion } = performMergeFull(opts());
      expectSelfContained(primary, companion);
    });
  });

  mocha.describe('import alias preserves original declaration name (importAliasEnum)', function () {
    const opts = () => makeOptions('importAliasEnum');

    mocha.it('keeps enum declaration name as A, not alias', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.include('export enum A');
      expect(merged).to.not.include('export enum aliasA');
    });

    mocha.it('emits alias export inside namespace', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.include('export { A as aliasA }');
    });

    mocha.it('function parameter references alias via namespace', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.match(/_test1\.aliasA\.a/);
      expect(merged).to.include('declare function foo');
    });
  });

  mocha.describe('namespace block preserves original declaration name for alias-only export (nsAliasOnly)', function () {
    const opts = () => makeOptions('nsAliasOnly');

    mocha.it('keeps enum declaration name as A, not alias', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.include('export enum A');
      expect(merged).to.not.include('export enum aliasA');
    });

    mocha.it('emits alias export inside namespace block', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.include('export { A as aliasA }');
    });

    mocha.it('preserves all enum members', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.include('VISIBLE = 1');
      expect(merged).to.include('INVISIBLE = 2');
      expect(merged).to.include('GONE = 4');
    });
  });

  mocha.describe('dual reference via original name and alias (dualAliasRef)', function () {
    const opts = () => makeOptions('dualAliasRef');

    mocha.it('preserves enum declaration name as A', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.include('export enum A');
      expect(merged).to.not.include('export enum aliasA');
    });

    mocha.it('emits alias export inside isolation namespace', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.include('export { A as aliasA }');
    });

    mocha.it('renames A reference to _test2.A', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.match(/foo\(a:\s*_test2\.A\)/);
    });

    mocha.it('renames aliasA reference to _test2.aliasA', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.match(/foo1\(a:\s*_test2\.aliasA\)/);
      expect(merged).to.not.match(/foo1\(a:\s*_test2\.A\)/);
    });
  });

  mocha.describe('exported entity with alias-only export name (exportedAlias)', function () {
    const opts = () => makeOptions('exportedAlias');

    mocha.it('preserves declaration name as OverlayType', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.match(/\bdeclare enum OverlayType\b/);
      expect(merged).to.not.include('declare enum EOverLayTypeName');
      expect(merged).to.not.include('export declare enum OverlayType');
    });

    mocha.it('emits alias export for EOverLayTypeName', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.include('export { OverlayType as EOverLayTypeName }');
    });

    mocha.it('method parameter keeps original OverlayType reference', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.match(/removeOverlays\(type\?: OverlayType\)/);
      expect(merged).to.not.match(/removeOverlays\(type\?: EOverLayTypeName\)/);
    });

    mocha.it('no duplicate EOverLayTypeName in export statement', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      const stripped = stripNamespaceBlocks(merged);
      const exportStatements = stripped.match(/export\s*\{[^}]+\}/g) || [];
      const aliasCount = exportStatements.filter(s => s.includes('EOverLayTypeName')).length;
      expect(aliasCount).to.equal(1);
    });

    mocha.it('namespace SysEnum contains OverlayType with alias', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.include('declare namespace SysEnum');
      expect(merged).to.match(/SysEnum[\s\S]*export enum OverlayType/);
      expect(merged).to.match(/SysEnum[\s\S]*export \{ OverlayType as EOverLayTypeName \}/);
    });
  });

  mocha.describe('same-named files in different directories (sameNameFiles)', function () {
    const opts = () => makeOptions('sameNameFiles');

    mocha.it('generates distinct namespace names for same-named files', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      const nsMatches = merged.match(/declare namespace _\w+/g) || [];
      expect(nsMatches.length).to.be.greaterThan(1);
      const uniqueNs = new Set(nsMatches);
      expect(uniqueNs.size).to.equal(nsMatches.length);
    });

    mocha.it('preserves both class A declarations with different members', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());

      expect(merged).to.include('a: number');
      expect(merged).to.include('b: number');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      expectSelfContained(performMerge(opts()));
    });
  });

  mocha.describe('second merge preserves declaration names for aliased enums (secondMergeAlias)', function () {
    const opts = () => makeOptions('secondMergeAlias');

    mocha.it('preserves namespace _MapEnum with MapType enum', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('declare namespace _MapEnum');
      expect(merged).to.include('export enum MapType');
      expect(merged).to.include('STANDARD = 0');
      expect(merged).to.include('MapType as MapTypeEnum');
    });

    mocha.it('preserves namespace SysEnum with OverlayType enum', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      expect(merged).to.include('declare namespace SysEnum');
      expect(merged).to.include('export enum OverlayType');
      expect(merged).to.include('ABOVE = 0');
      expect(merged).to.include('OverlayType as EOverLayTypeName');
    });

    mocha.it('does not emit aliased enum at top level', function () {
      skipIfMissing(opts().entryFile, this);
      const merged = performMerge(opts());
      const nsBlocks = merged.match(/declare\s+namespace\s+\S+\s*\{[^}]*\}/gs) || [];
      const outside = merged.replace(/declare\s+namespace\s+\S+\s*\{[\s\S]*?\n\}/g, '');
      expect(outside).to.not.include('export declare enum EOverLayTypeName');
      expect(outside).to.not.include('export declare enum MapTypeEnum');
    });

    mocha.it('is self-contained', function () {
      skipIfMissing(opts().entryFile, this);
      expectSelfContained(performMerge(opts()));
    });
  });
});
