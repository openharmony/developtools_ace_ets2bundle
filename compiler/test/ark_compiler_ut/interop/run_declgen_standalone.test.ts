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

import { expect } from 'chai';
import fs from 'fs';
import mocha from 'mocha';
import os from 'os';
import path from 'path';
import * as ts from 'typescript';

import { DeclfileProductor } from '../../../lib/fast_build/ark_compiler/interop/run_declgen_standalone';
import { toUnixPath } from '../../../lib/utils';

mocha.describe('run_declgen_standalone module name resolver', function () {
  let tempDir: string;
  let containingFile: string;
  let resolver: (moduleNames: string[], containingFile: string) => (ts.ResolvedModuleFull | undefined)[];

  function createFile(relativePath: string, content: string = ''): string {
    const filePath = path.join(tempDir, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf-8');
    return filePath;
  }

  mocha.beforeEach(function () {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'declgen-resolver-'));
    containingFile = createFile('src/main/ets/index.ets', '');
    // @ts-ignore
    DeclfileProductor.projectPath = tempDir;
    // @ts-ignore
    DeclfileProductor.compilerOptions = {
      allowJs: true,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      noEmit: true,
      target: ts.ScriptTarget.ES2021
    } as ts.CompilerOptions;
    resolver = DeclfileProductor.getInstance({
      dependentModuleMap: new Map(),
      projectConfig: {
        cachePath: path.join(tempDir, 'cache'),
        bundleName: 'com.test.demo',
        mainModuleName: 'entry',
        projectRootPath: tempDir
      }
    })!.getModuleNamesResolver(new Map());
  });

  mocha.afterEach(function () {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  mocha.it('1-1: resolves explicit ets and ts module names', function () {
    const etsFile = createFile('src/main/ets/feature.ets');
    const tsFile = createFile('src/main/ets/model.ts');

    const resolvedModules = resolver(['./feature.ets', './model.ts'], containingFile);

    expect(toUnixPath(resolvedModules[0]!.resolvedFileName)).to.equal(toUnixPath(etsFile));
    expect(resolvedModules[0]!.extension).to.equal('.ets');
    expect(toUnixPath(resolvedModules[1]!.resolvedFileName)).to.equal(toUnixPath(tsFile));
    expect(resolvedModules[1]!.extension).to.equal('.ts');
  });

  mocha.it('1-2: prefers paired d.ets when a js module is resolved by default', function () {
    createFile('src/main/ets/runtime.js');
    const declarationFile = createFile('src/main/ets/runtime.d.ets');

    const resolvedModules = resolver(['./runtime.js'], containingFile);

    expect(toUnixPath(resolvedModules[0]!.resolvedFileName)).to.equal(toUnixPath(declarationFile));
    expect(resolvedModules[0]!.extension).to.equal('.d.ets');
  });

  mocha.it('1-3: caches resolved module results for repeated lookups', function () {
    const cachedFile = createFile('src/main/ets/cached.ets');

    const firstResolvedModules = resolver(['./cached.ets'], containingFile);
    fs.unlinkSync(cachedFile);
    const secondResolvedModules = resolver(['./cached.ets'], containingFile);

    expect(toUnixPath(firstResolvedModules[0]!.resolvedFileName)).to.equal(toUnixPath(cachedFile));
    expect(toUnixPath(secondResolvedModules[0]!.resolvedFileName)).to.equal(toUnixPath(cachedFile));
  });

  mocha.it('1-4: returns undefined for unresolved module names', function () {
    const resolvedModules = resolver(['./missing.ets'], containingFile);

    expect(resolvedModules[0]).to.be.undefined;
  });
});
