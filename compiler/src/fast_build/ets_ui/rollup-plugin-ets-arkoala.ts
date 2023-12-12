/*
 * Copyright (c) 2023 Huawei Device Co., Ltd.
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

import path from 'path';
import fs from 'fs';
import cp from 'child_process';

import rollup from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

import {
  getResolveModules
} from '../../utils';

import {
  projectConfig,
  globalModulePaths
} from '../../../main';

// TODO replace console.log logging
// TODO better plugin integration

export function makeArkoalaPlugin() {
  const ARKOALA_ENTRY_STUB = '@koalaui/arkoala-app';
  const ARKOALA_RESOURCES_MODULE = '@koalaui/arkoala-app-resources';

  let arkoalaBuildPath = '';
  let arkoalaGeneratedPath = '';
  let arkoalaGeneratedJSPath = '';
  let arkoalaGeneratedMemoPath = '';
  let ohosTscPath = '';
  let tscPath = '';
  let arkoalaEtsPluginPath = '';
  let arkoalaTscPluginPath = '';
  let etsRoot = '';
  
  let arkoalaNativeEmitted = false;

  return {
    name: 'arkoalaEtsTransform',
    buildStart(options) {
      console.log('PC', projectConfig);
      arkoalaBuildPath = path.join(
        projectConfig.buildPath,
        '../../../arkoala_out'
      );
      arkoalaGeneratedPath = path.join(arkoalaBuildPath, 'generated');
      arkoalaGeneratedJSPath = path.join(arkoalaBuildPath, 'js_output');
      arkoalaGeneratedMemoPath = path.join(arkoalaBuildPath, 'generated_memo');
      arkoalaEtsPluginPath = require.resolve('@koalaui/ets-plugin');
      arkoalaTscPluginPath = require.resolve('@koalaui/compiler-plugin');
      tscPath = path.join(
        arkoalaTscPluginPath,
        '../../../../node_modules/typescript/lib/tsc.js'
      ); // TODO we need a single compatible tsc, currently we use arkoala bundled one
      ohosTscPath = require.resolve('ohos-typescript');
      if (ohosTscPath)
        ohosTscPath = path.join(path.dirname(ohosTscPath), 'tsc.js');

      etsRoot = projectConfig.projectPath;
      console.log('ARKOALA: ', {
        arkoalaEtsPluginPath,
        arkoalaTscPluginPath,
        arkoalaGeneratedPath,
        ohosTscPath,
        tscPath,
        etsRoot,
      });

      const ohosTsConfig = {
        extends: require.resolve(
          '@koalaui/arkui-common/config/tsconfig.base.json'
        ),
        exclude: ['node_modules', 'js_output', 'dependencies'],
        include: ['**/*.ets'],
        compilerOptions: {
          outDir: arkoalaGeneratedJSPath,
          plugins: [
            {
              transform: arkoalaEtsPluginPath,
              destination: arkoalaGeneratedPath,
              arkui: '@koalaui/arkoala-arkui',
            },
          ],
        },
      };
      const ohosTsConfigPath = path.join(etsRoot, 'arkoala.tsconfig.json'); // TODO generate in a build dir or do not generate at all
      fs.writeFileSync(ohosTsConfigPath, JSON.stringify(ohosTsConfig), 'utf-8');
      try {
        const nodeExe = process.argv0; // TODO get from config?
        console.log('ETS PREPROCESS');
        let ohosTscProc = cp.spawnSync(
          nodeExe,
          [ohosTscPath, '-p', ohosTsConfigPath],
          { stdio: 'inherit', cwd: etsRoot }
        );
        console.log('ETS PREPROCESS DONE');
      } finally {
        //TODO check status
        fs.rmSync(ohosTsConfigPath);
      }

      const sdkStubs = path.join(
        require.resolve('@koalaui/arkui-common'),
        '../../../../ohos-sdk-ets/openharmony/10/ets/'
      );
      const tsConfig = {
        compilerOptions: {
          target: 'es2017',
          module: 'ESNext',
          lib: ['ESNext', 'DOM', 'ESNext.WeakRef'],
          moduleResolution: 'node',
          composite: true,
          incremental: true,
          declarationMap: true,
          sourceMap: true,
          declaration: true,
          strict: true,
          skipLibCheck: true,
          removeComments: false,
          importsNotUsedAsValues: 'remove',
          plugins: [{ transform: arkoalaTscPluginPath, trace: false }],
          outDir: arkoalaGeneratedMemoPath,
        },
        files: [
          path.join(sdkStubs, 'component/index-full.d.ts'),
          path.join(sdkStubs, 'component/koala-extensions.d.ts'),
          path.join(sdkStubs, 'api/@internal/full/global.d.ts'),
        ],
        include: ['**/*'],
      };

      const tsConfigPath = path.join(
        arkoalaGeneratedPath,
        'memo.tsconfig.json'
      ); // TODO generate in a build dir or do not generate at all
      fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig), 'utf-8');
      try {
        const nodeExe = process.argv0; // TODO get from config?
        console.log('MEMO PREPROCESS');
        let tscProc = cp.spawnSync(nodeExe, [tscPath, '-p', tsConfigPath], {
          stdio: 'inherit',
          cwd: arkoalaGeneratedPath,
        });
        console.log('TSC', tscProc.status, tscProc.error);
        console.log('MEMO PREPROCESS DONE');
      } finally {
        //TODO check status
        fs.rmSync(tsConfigPath);
      }
    },

    resolveId(source, importer, options) {
      if (source === ARKOALA_ENTRY_STUB) {
        return { id: ARKOALA_ENTRY_STUB, external: true };
      }
      
      if (source === ARKOALA_RESOURCES_MODULE) {
        return { id: ARKOALA_RESOURCES_MODULE, external: true };
      }

      if (options.isEntry && source.endsWith('.ets')) {
        // TODO resolve with node-loader?
        console.log('RESOLVE' + source);
        return `${source}`;
      }
    },

    async load(id) {
      let cacheRoot = projectConfig.cachePath;
      let projectRoot = projectConfig.projectRootPath;

      if (id === ARKOALA_ENTRY_STUB) {
        return { code: 'export async function startArkoala() {}' };
      }

      console.log('LOADING ARKOALA BUNDLE', id);
      let generatedPath = id
        .replace(etsRoot, arkoalaGeneratedMemoPath)
        .replace(/\.ets$/, '.js');

      // TODO try to pick only a bindle wich imports entry point stub, other files are unnecessary
      // let loaded = await this.load(generatedPath);
      // console.log("LOADED JS", loaded)

      let bundle = await rollup.rollup({
        input: generatedPath,
        plugins: [
          nodeResolve({
            modulePaths: [
              path.resolve(projectConfig.projectPath),
              path.resolve('node_modules'),
              path.resolve(__dirname, 'node_modules'),
              ...globalModulePaths,
              ...(projectConfig.aceModuleJsonPath
                ? getResolveModules(
                    path.resolve(projectConfig.projectPath),
                    false
                  )
                : getResolveModules(
                    path.resolve(projectConfig.projectPath),
                    true
                  )),
            ],
            exportConditions: ['ark', 'node', 'main'],
          }),
          commonjs(),
          {
            name: 'arkoala-stub-plugin',
            async resolveId(source, importer, options) {
              if (source === ARKOALA_ENTRY_STUB) {
                return '\0' + ARKOALA_ENTRY_STUB;
              }
              if (source === ARKOALA_RESOURCES_MODULE) {
                return { id: '\0' + ARKOALA_RESOURCES_MODULE, moduleSideEffects: true };
              }
              if (!arkoalaNativeEmitted && source === '@koalaui/arkoala') {
                let resolved = await this.resolve(source, importer, options);
                if (resolved) {
                  let libPath = path.join(path.dirname(resolved.id), '../libArkoalaNative.so');
                  let buildPath = path.dirname(projectConfig.buildPath);
                  let libDir = path.join(buildPath, '../../libs', path.basename(buildPath), 'arm64-v8a');
                  try {
                    fs.mkdirSync(libDir, { recursive: true });
                    fs.copyFileSync(libPath, path.join(libDir, path.basename(libPath)));
                  } catch (e) {
                    console.warn("Failed to load native library: " + e)
                  }
                }
                arkoalaNativeEmitted = true;
              }
            },
            load(id) {
              if (id === '\0' + ARKOALA_RESOURCES_MODULE) {
                return { code: genResourceMapModule() }
              }

              if (id === '\0' + ARKOALA_ENTRY_STUB) {
                return {
                  code: `
import ${JSON.stringify(ARKOALA_RESOURCES_MODULE)}
import { startApplication } from "@koalaui/arkoala"
import { ArkRooted } from "@koalaui/arkoala-arkui"
import { __Entry } from ${JSON.stringify(
  path.join(arkoalaGeneratedMemoPath, 'pages/Index')
)}
import { registerRoutes } from ${JSON.stringify(
  path.join(arkoalaGeneratedMemoPath, '__router_initialization')
)}

export function startArkoala() {
    console.log("XXXX startArkoala");
    registerRoutes();
    console.log("XXXX registerRoutes::End");
    return startApplication({
        waitForVSync: undefined
    }, ArkRooted(__Entry))
}`,
                };
              }
            },
          },
        ],
      });

      // TODO check errors
      let { output } = await bundle.generate({
        format: 'esm',
        sourcemap: true,
      });

      for (const chunk of output) {
        if (chunk.type == 'chunk') {
          let code = chunk.code.replace(
            /\bLOAD_NATIVE\b/g,
            `globalThis.requireNapi("ArkoalaNative", true)`
          ); // TODO @rollup/plugin-inject
          let cachedPath = id
            .replace(projectRoot, cacheRoot)
            .replace(/\.ets$/, '.ts');
          console.log('CACHE', id, '->', cachedPath);
          fs.mkdirSync(path.dirname(cachedPath), { recursive: true });
          fs.writeFileSync(cachedPath, code, 'utf-8'); // TODO emit unmemoized ts?
          return chunk;
        }
      }

      console.log('NOT LOADED!');
      return { code: '' };
    },

    shouldInvalidCache(options) {
      return true;
    },
  };
}

function genResourceMapModule(options: CodegenOptions = {}) {
  const moduleJsonPath = projectConfig.aceModuleJsonPath;
  const resourceTablePath = path.join(path.dirname(moduleJsonPath), 'ResourceTable.txt');
  const importString = options.arkoalaImport ?? "@koalaui/arkoala-arkui"
  
  const module = readModuleManifest(moduleJsonPath);
  const resourceTable = readResourceTable(resourceTablePath);
  const resourceMap = makeResourceMap(resourceTable)

  return [
    `import { __registerResources, _r, _rawfile } from ${JSON.stringify(importString)};\n\n`,
    `const bundleName = ${JSON.stringify(module.bundleName || "")};\n`,
    `const moduleName = ${JSON.stringify(module.moduleName || "")};\n`,
    `const resources = ${JSON.stringify(resourceMap || {}, null, 4)};\n\n`,
    `console.log("XXXXX registerResources")\n`,
    `__registerResources(bundleName, moduleName, resources);\n`,
    `export function $r(name, ...args) { return _r(name, ...args) };\n`,
    `export function $rawfile(name) { return _rawfile(name) };\n`,
    `Object.assign(globalThis, { $r: $r, $rawfile: $rawfile });\n`, // TODO: replace with plugin-inject
  ].join('');
}


interface ResourceTableEntry {
    type: string
    name: string
    id: number
}

interface ModuleInfo {
    bundleName: string
    moduleName: string
}

function readResourceTable(filepath: string): ResourceTableEntry[] {
    let content = fs.readFileSync(filepath, "utf-8").trim()
    let lines = content.split(/(\r?\n)+/gm)

    let entries: ResourceTableEntry[] = []
    for (const line of lines) {
        let items = line.trim().split(/\s+/g);
        if (items.length === 0 || items[0] === "") continue;

        if (items.length !== 3) {
            throw new Error(`Illegal resource table format (at line '${items}')`)
        }

        const [type, name, idStr] = items
        if (!/^0x[0-9A-Fa-f]{8}$/i.test(idStr)) { // int32 in hex, 0xFFFFFFFF
            throw new Error(`Illegal resource id: ${idStr}`)
        }

        const id = parseInt(idStr, 16)

        entries.push({ type, name, id })
    }

    return entries
}

function readModuleManifest(filepath: string): ModuleInfo {
    let json = fs.readFileSync(filepath, "utf-8").trim()
    let manifest = JSON.parse(json)
    let moduleName = manifest.module.name
    let bundleName = manifest.app?.bundleName ?? "com.huawei.arkoala" // TODO remove hardcoded constant

    return { moduleName, bundleName }
}

function makeResourceMap(resources: ResourceTableEntry[]): Record<string, number> {
    let output = {};
    for (const {type, name, id} of resources) {
        let key = type + "." + name
        if (key in output) {
            throw new Error(`Duplicated resource key: ${key}`)
        }
        output[key] = id
    }

    return output
}

interface CodegenOptions {
    arkoalaImport?: string
}
