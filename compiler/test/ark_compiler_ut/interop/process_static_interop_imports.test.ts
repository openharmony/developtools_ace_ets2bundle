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

import fs from 'fs';
import os from 'os';
import path from 'path';
import mocha from 'mocha';
import * as ts from 'typescript';
import { expect } from 'chai';

import { FileManager } from '../../../lib/fast_build/ark_compiler/interop/interop_manager';
import { ARKTS_HYBRID } from '../../../lib/fast_build/ark_compiler/interop/pre_define';

const etsChecker = require('../../../lib/ets_checker');

mocha.describe('process static interop imports tests', function() {
  const projectRootPath: string = fs.mkdtempSync(path.join(os.tmpdir(), 'static-interop-imports-'));
  const pagesPath: string = path.join(projectRootPath, 'entry/src/main/ets/pages');
  const importerId: string = path.join(pagesPath, 'index.ets');
  let originalResolveModuleName: Function;

  mocha.before(function() {
    fs.mkdirSync(pagesPath, { recursive: true });
    fs.writeFileSync(importerId, '');
    const testStaticFilePath: string = path.join(pagesPath, 'teststatic.ets');
    const customFilePath: string = path.join(pagesPath, 'custom.ets');
    const otherFilePath: string = path.join(pagesPath, 'other.ets');
    fs.writeFileSync(testStaticFilePath, 'export const test = 1;');
    fs.writeFileSync(customFilePath, 'export default function value() {}');
    fs.writeFileSync(otherFilePath, 'export const test = 1;');
    const metadataPath: string = path.join(projectRootPath, 'staticInteropMetadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify({
      files: {
        [testStaticFilePath.replace(/\\/g, '/')]: {
          root: {
            test: {
              kind: 'namespace',
              name: 'test',
              children: {
                aa: { kind: 'function', name: 'aa', runtimeName: 'Lentry/src/main/ets/pages/teststatic/ETSGLOBAL;' },
                message: { kind: 'property', name: 'message', runtimeName: 'Lentry/src/main/ets/pages/teststatic/ETSGLOBAL;' },
                bb: { kind: 'class', name: 'bb', runtimeName: 'Lentry/src/main/ets/pages/teststatic/ETSGLOBAL;' }
              }
            }
          }
        },
        [customFilePath.replace(/\\/g, '/')]: {
          root: {
            default: { kind: 'function', name: 'default', runtimeName: 'Lentry/src/main/ets/pages/custom/ETSGLOBAL;' }
          }
        }
      }
    }), 'utf-8');
    const dependentModuleMap = new Map();
    dependentModuleMap.set('staticTest', {
      language: ARKTS_HYBRID,
      packageName: 'staticTest',
      moduleName: 'staticTest',
      modulePath: projectRootPath,
      dynamicFiles: [otherFilePath],
      staticFiles: [testStaticFilePath, customFilePath],
      cachePath: path.join(projectRootPath, 'cache'),
      byteCodeHarInfo: {}
    });
    FileManager.initForTest(dependentModuleMap, undefined, undefined, undefined, undefined, projectRootPath);
    FileManager.initStaticInteropMetadata({
      projectConfig: {
        declgenBridgeConfigPath: metadataPath
      }
    } as any);
    originalResolveModuleName = etsChecker.resolveModuleName;
    etsChecker.resolveModuleName = resolveModuleNameForTest;
  });

  mocha.after(function() {
    etsChecker.resolveModuleName = originalResolveModuleName;
    FileManager.cleanFileManagerObject();
    fs.rmSync(projectRootPath, { recursive: true, force: true });
  });

  function resolveModuleNameForTest(moduleName: string): ts.ResolvedModuleWithFailedLookupLocations {
    const resolvedPaths: Map<string, string> = new Map([
      ['./teststatic', path.join(pagesPath, 'teststatic.ets')],
      ['./custom.ets', path.join(pagesPath, 'custom.ets')],
      ['./other', path.join(pagesPath, 'other.ets')],
      ['@static/test', path.join(pagesPath, 'teststatic.ets')]
    ]);
    const resolvedFileName: string | undefined = resolvedPaths.get(moduleName);
    return {
      resolvedModule: resolvedFileName ? {
        resolvedFileName,
        extension: ts.Extension.Ets,
        isExternalLibraryImport: false
      } as ts.ResolvedModuleFull : undefined
    } as ts.ResolvedModuleWithFailedLookupLocations;
  }

  function transform(code: string): string {
    const { processStaticInteropImports } = require(
      '../../../lib/fast_build/ark_compiler/interop/process_static_interop_imports');
    const sourceFile: ts.SourceFile = ts.createSourceFile(
      importerId, code, ts.ScriptTarget.ES2021, true, ts.ScriptKind.ETS);
    const transformer: ts.TransformerFactory<ts.SourceFile> = context => node =>
      processStaticInteropImports(node, importerId, context);
    const result: ts.TransformationResult<ts.SourceFile> = ts.transform(sourceFile, [transformer]);
    return ts.createPrinter({ newLine: ts.NewLineKind.LineFeed }).printFile(result.transformed[0]);
  }

  mocha.it('removes an import that resolves to the configured file', function() {
    const result: string = transform('import { test } from "./teststatic";\nconst value = 1;\n');
    expect(result).not.to.include('import { test } from "./teststatic";');
    expect(result).to.include('function __createLazy__<T>(loader: () => T, label?: string): T');
    expect(result).to.include('Panda.getFunction(\'Lentry/src/main/ets/pages/teststatic/ETSGLOBAL;\'');
    expect(result).to.include('function __createUnsupportedObject__(reason: unknown, label = \'object\'): any');
    expect(result).to.include('export const aa = __createLazy__(');
    expect(result).to.include('export const message = __createLazy__(');
    expect(result).to.include('export const bb = __createLazy__(');
    expect(result).to.include('const value = 1;');
  });

  mocha.it('supports a configurable target file', function() {
    const result: string = transform('import value from "./custom.ets";\nvalue();\n');
    expect(result).not.to.include('import value from "./custom.ets";');
    expect(result).to.include('function __createLazy__<T>');
    expect(result).to.include('custom/ETSGLOBAL');
    expect(result).to.include('value();');
  });

  mocha.it('does not match text outside an import declaration', function() {
    expect(transform('const value = "./teststatic";\n')).to.equal('const value = "./teststatic";\n');
  });

  mocha.it('keeps imports that resolve to another file', function() {
    expect(transform('import { test } from "./other";\n')).to.equal('import { test } from "./other";\n');
  });

  mocha.it('matches a package alias by its resolved reference path', function() {
    const result: string = transform('import { test } from "@static/test";\nconst value = 1;\n');
    expect(result).not.to.include('import { test } from "@static/test";');
    expect(result).to.include('function __createLazy__<T>');
    expect(result).to.include('const value = 1;');
  });

  mocha.it('drops type-only imports that resolve to a static target', function() {
    const result: string = transform('import type { test } from "./teststatic";\nconst value = 1;\n');
    expect(result).not.to.include('import type { test } from "./teststatic";');
    expect(result).not.to.include('function __createLazy__<T>');
    expect(result).to.include('const value = 1;');
  });

  mocha.it('drops named type-only imports that resolve to a static target', function() {
    const result: string = transform('import { type test } from "./teststatic";\nconst value = 1;\n');
    expect(result).not.to.include('import { type test } from "./teststatic";');
    expect(result).not.to.include('function __createLazy__<T>');
    expect(result).to.include('const value = 1;');
  });

  mocha.it('keeps type-only imports that do not resolve to a static target', function() {
    expect(transform('import type { test } from "./other";\n'))
      .to.equal('import type { test } from "./other";\n');
  });

  mocha.it('adds the replacement only once when multiple imports resolve to the target', function() {
    const result: string = transform(
      'import { test } from "./teststatic";\nimport { test as alias } from "@static/test";\n');
    expect(result).not.to.include('import ');
    expect(result.match(/function __createLazy__<T>/g)).to.have.lengthOf(1);
  });

  mocha.it('keeps unresolved imports even when their text resembles the target path', function() {
    expect(transform('import value from "entry/src/main/ets/pages/teststatic.ets";\n'))
      .to.equal('import value from "entry/src/main/ets/pages/teststatic.ets";\n');
  });

  mocha.it('replaces await import from a static target with a cached module promise', function() {
    const code: string = 'async function load() { return await import("./teststatic"); }\n';
    FileManager.setStaticInteropDynamicImport(importerId);
    const result: string = transform(code);
    expect(result).not.to.include('import("./teststatic")');
    expect(result).to.include('await Promise.resolve(__loadStaticInteropModule__(');
    expect(result).to.include('const __staticInteropModuleCache__ = new Map<string, object>();');
    expect(result).to.include('Object.freeze({');
    expect(result).to.match(/Object\.freeze\(\{\n\s+['"]test['"]:/);
    expect(result).to.include('Panda.getFunction(');
    const { staticInteropTransformLog } = require(
      '../../../lib/fast_build/ark_compiler/interop/process_static_interop_imports');
    expect(staticInteropTransformLog.errors).to.be.empty;
  });

  mocha.it('replaces a non-awaited dynamic import from a static target', function() {
    const code: string = 'function load() { return import("./teststatic").then(value => value.test); }\n';
    FileManager.setStaticInteropDynamicImport(importerId);
    const result: string = transform(code);
    expect(result).not.to.include('import("./teststatic")');
    expect(result).to.include('Promise.resolve(__loadStaticInteropModule__(');
  });

  mocha.it('does not replace dynamic import from a dynamic target', function() {
    const code: string = 'async function load() { return await import("./other"); }\n';
    FileManager.setStaticInteropDynamicImport(importerId);
    expect(transform(code)).to.equal(code);
  });
});
