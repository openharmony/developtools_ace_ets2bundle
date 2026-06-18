/*
 * Copyright (c) 2025-2026 Huawei Device Co., Ltd.
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

import { FileManager } from './interop_manager';
import { ResolveModuleInfo, getResolveModule, readDeaclareFiles } from '../../../ets_checker';
import { mkdirsSync, readFile, toUnixPath } from '../../../utils';
import {
  ArkTSEvolutionModule,
  BuildType,
  DeclFilesConfig,
  DeclgenParams,
  TaskInfo,
  Params,
  ProjectConfig,
  RunnerParms
} from './type';
import { DECLGEN_CACHE_FILE } from './pre_define';
import fs from 'fs';
import path from 'path';
import * as ts from 'typescript';
import { EXTNAME_D_ETS, EXTNAME_D_TS, EXTNAME_JS } from '../common/ark_define';
import { getRealModulePath } from '../../system_api/api_check_utils';
import * as declgenTs2Ets from 'declgen';
import { calculateFileHash } from '../utils';
import { HandleUIImports } from '../../../process_interop_ui';
import { run as runInteropContext } from './run_interop_context';
import { logger } from '../../../compile_info';

class UITraverser extends declgenTs2Ets.stages.Traverser<undefined, undefined> {
  uiHandler: HandleUIImports;
  constructor(
    context: ts.TransformationContext,
    typeChecker: ts.TypeChecker,
    state: declgenTs2Ets.stages.TraverserState<undefined, undefined>
  ) {
    super(context, typeChecker, state);
    this.uiHandler = new HandleUIImports(typeChecker, context);
  }

  traverse(node: ts.SourceFile): ts.SourceFile {
    return this.uiHandler.createCustomTransformer(node);
  }
}

class UIStage extends declgenTs2Ets.stages.TransformationStage<undefined, undefined, undefined> {
  override get name(): string { return 'ui-imports'; }
  constructor() {
    super(
      [UITraverser],
      () => undefined,
      () => undefined,
      false
    );
  }
}

const uiPlugin: declgenTs2Ets.DeclgenPlugin = {
  name: 'ui-imports',
  stages: (): declgenTs2Ets.PluginStageSpec[] => [{
    id: 'com.huawei.ui-imports',
    version: '0.0.0', // After the plugin update, please update the version.
    stage: new UIStage(),
    dependencyKind: 'local-write',
    anchor: 'after-declaration',
    requiresFreshChecker: false
  }]
};

interface FileUnit {
  moduleName: string,
  srcPath: string,
  outputPath: string
}

type FileUnitMap = Map<string, FileUnit>;

function buildFullFileMap(dependentModuleMap: Map<string, ArkTSEvolutionModule>): FileUnitMap {
  const fileMap = new Map<string, FileUnit>();
  dependentModuleMap.forEach((moduleInfo) => {
    if (moduleInfo.dynamicFiles.length <= 0) {
      return;
    }
    moduleInfo.dynamicFiles.forEach((file) => {
      const unixFilePath = toUnixPath(path.resolve(file));
      const outputPath = toUnixPath(removeExtension(path.resolve(moduleInfo.declgenV2OutPath || '', path.relative(moduleInfo.modulePath, file))) + EXTNAME_D_ETS);
      fileMap.set(unixFilePath, {
        moduleName: moduleInfo.moduleName,
        srcPath: unixFilePath,
        outputPath: outputPath
      });
    });
  });
  return fileMap;
}

type MaybeDeclgenParams = DeclgenParams & {
  tasks?: TaskInfo[];
}

function isInteropContextTask(param: MaybeDeclgenParams): boolean {
  if (param.tasks) {
    return param.tasks.some(task => task.buildTask === BuildType.INTEROP_CONTEXT);
  }
  return false;
}

export function run(param: MaybeDeclgenParams): boolean {
  if (isInteropContextTask(param)) {
    logger.warn('Please note that declgen is separated from the compile process now, please update the hvigor.');
    return runInteropContext(param as Params);
  }

  FileManager.init(param.dependentModuleMap, param.projectConfig.sdkAliasMap);
  DeclfileProductor.init(param);
  DeclfileProductor.getInstance().runDeclgen(param);
  FileManager.cleanFileManagerObject();
  return true;
}

interface SdkConfigItem {
  apiPath: string[];
  prefix: string;
}

function removeExtension(filePath: string): string {
  if (filePath.endsWith(EXTNAME_D_ETS)) {
    return filePath.slice(0, -EXTNAME_D_ETS.length);
  } else if (filePath.endsWith(EXTNAME_D_TS)) {
    return filePath.slice(0, -EXTNAME_D_TS.length);
  } else {
    return filePath.slice(0, -path.extname(filePath).length);
  }
}

export class DeclfileProductor {
  private static declFileProductor: DeclfileProductor;

  static compilerOptions: ts.CompilerOptions;
  static sdkConfigPrefix = 'ohos|system|kit|arkts';
  static sdkConfigs: SdkConfigItem[] = [];
  static interopSdkConfigs: SdkConfigItem[] = [];
  static systemModules: string[] = [];
  static defaultSdkConfigs: SdkConfigItem[] = [];
  static projectPath;
  private projectConfig;
  private pkgDeclFilesConfig: { [pkgName: string]: DeclFilesConfig } = {};

  static init(param: DeclgenParams): void {
    DeclfileProductor.declFileProductor = new DeclfileProductor(param);
    DeclfileProductor.compilerOptions = ts.readConfigFile(
      path.join(__dirname, '../../../../tsconfig.json'),
      ts.sys.readFile
    ).config.compilerOptions;
    DeclfileProductor.initSdkConfig();
    DeclfileProductor.initInteropSdkConfig();
    Object.assign(DeclfileProductor.compilerOptions, {
      emitNodeModulesFiles: true,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Preserve,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      noEmit: true,
      packageManagerType: 'ohpm',
      allowJs: true,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      noImplicitAny: false,
      noUnusedLocals: false,
      noUnusedParameters: false,
      experimentalDecorators: true,
      resolveJsonModule: true,
      skipLibCheck: false,
      sourceMap: true,
      target: 8,
      types: [],
      typeRoots: [],
      lib: ['lib.es2021.d.ts'],
      alwaysStrict: true,
      checkJs: false,
      maxFlowDepth: 2000,
      etsAnnotationsEnable: false,
      etsLoaderPath: path.join(__dirname, '../../../'),
      needDoArkTsLinter: true,
      isCompatibleVersion: false,
      skipTscOhModuleCheck: false,
      skipArkTSStaticBlocksCheck: false,
      incremental: true,
      tsImportSendableEnable: false,
      skipPathsInKeyForCompilationSettings: true
    });
    DeclfileProductor.compilerOptions.ets!.customComponent = undefined;
    DeclfileProductor.projectPath = param.projectConfig.projectRootPath;
  }
  static getInstance(param?: DeclgenParams): DeclfileProductor {
    if (!this.declFileProductor && param) {
      this.declFileProductor = new DeclfileProductor(param);
    } else if (!this.declFileProductor && !param) {
      throw new Error(
        'DeclfileProductor is not initialized. Please call DeclfileProductor.init(param) before using getInstance().'
      );
    }
    return this.declFileProductor;
  }

  private constructor(param: DeclgenParams) {
    this.projectConfig = param.projectConfig as ProjectConfig;
  }

  runDeclgen(param: DeclgenParams): void {
    const fileUnitsMap = buildFullFileMap(param.dependentModuleMap);
    declgenTs2Ets.logger.Logger.init(new declgenTs2Ets.logger.SilentLogger());
    const cacheDir = path.join(DeclfileProductor.projectPath, 'build', '.declgen-cache');
    const filesToProcess: string[] = [];

    fileUnitsMap.forEach((fileUnit, path) => {
      filesToProcess.push(path); 
    });

    const libFiles: string[] = [];
    readDeaclareFiles().forEach((path) => {
      libFiles.push(toUnixPath(path));
    });

    const moduleNamesResolver = this.getModuleNamesResolver(fileUnitsMap);

    const config: RunnerParms = {
      inputDirs: [],
      inputFiles: filesToProcess,
      outDir: DeclfileProductor.projectPath,
      // use package name as folder name
      rootDir: DeclfileProductor.projectPath,
      customResolveModuleNames: moduleNamesResolver,
      customCompilerOptions: DeclfileProductor.compilerOptions
    };
    if (!fs.existsSync(config.outDir)) {
      fs.mkdirSync(config.outDir, { recursive: true });
    }

    const declgen = new declgenTs2Ets.Declgen(
      {
        outDir: config.outDir,
        libFiles: libFiles,
        inputFiles: config.inputFiles,
        rootDir: config.rootDir,
        features: {
          enableInteropTypesFix: true
        },
        incremental: true,
        cacheDir: cacheDir,
        verifyOutputs: false,
        plugins: [uiPlugin],
      },
      config.customCompilerOptions,
      config.customResolveModuleNames
    );
    const result = declgen.run();
    result.emit((fileName, content, meta) => {
      const fileUnit = fileUnitsMap.get(toUnixPath(fileName));
      if (!fileUnit) {
        return undefined;
      }
      const outputPath = fileUnit.outputPath;
      const outDir = path.dirname(outputPath);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      fs.writeFileSync(outputPath, content, 'utf-8');
      return { artifactPath: outputPath };
    });
  }

  static initInteropSdkConfig(): void {
    const apiDirPath = path.resolve(__dirname, '../../../../../../../static/build-tools/interop/declaration/api');
    const arktsDirPath = path.resolve(__dirname, '../../../../../../../static/build-tools/interop/declaration/arkts');
    const kitsDirPath = path.resolve(__dirname, '../../../../../../../static/build-tools/interop/declaration/kits');
    const systemModulePathArray = [apiDirPath];
    if (!process.env.isFaMode) {
      systemModulePathArray.push(arktsDirPath, kitsDirPath);
    }
    systemModulePathArray.forEach((systemModulesPath) => {
      if (fs.existsSync(systemModulesPath)) {
        const modulePaths: string[] = [];
        readFile(systemModulesPath, modulePaths);
        DeclfileProductor.systemModules.push(...fs.readdirSync(systemModulesPath));
        const moduleSubdir = modulePaths
          .filter((filePath) => {
            const dirName = path.dirname(filePath);
            return !(dirName === apiDirPath || dirName === arktsDirPath || dirName === kitsDirPath);
          })
          .map((filePath) => {
            return filePath
              .replace(apiDirPath, '')
              .replace(arktsDirPath, '')
              .replace(kitsDirPath, '')
              .replace(/(^\\)|(.d.e?ts$)/g, '')
              .replace(/\\/g, '/');
          });
      }
    });
    DeclfileProductor.defaultSdkConfigs = [
      {
        apiPath: systemModulePathArray,
        prefix: '@ohos'
      },
      {
        apiPath: systemModulePathArray,
        prefix: '@system'
      },
      {
        apiPath: systemModulePathArray,
        prefix: '@arkts'
      }
    ];
    DeclfileProductor.interopSdkConfigs = [...DeclfileProductor.defaultSdkConfigs];
  }

  static initSdkConfig(): void {
    const apiDirPath = path.resolve(__dirname, '../../../../../../api');
    const arktsDirPath = path.resolve(__dirname, '../../../../../../arkts');
    const kitsDirPath = path.resolve(__dirname, '../../../../../../kits');
    const systemModulePathArray = [apiDirPath];
    if (!process.env.isFaMode) {
      systemModulePathArray.push(arktsDirPath, kitsDirPath);
    }
    systemModulePathArray.forEach((systemModulesPath) => {
      if (fs.existsSync(systemModulesPath)) {
        const modulePaths: string[] = [];
        readFile(systemModulesPath, modulePaths);
        DeclfileProductor.systemModules.push(...fs.readdirSync(systemModulesPath));
        const moduleSubdir = modulePaths
          .filter((filePath) => {
            const dirName = path.dirname(filePath);
            return !(dirName === apiDirPath || dirName === arktsDirPath || dirName === kitsDirPath);
          })
          .map((filePath) => {
            return filePath
              .replace(apiDirPath, '')
              .replace(arktsDirPath, '')
              .replace(kitsDirPath, '')
              .replace(/(^\\)|(.d.e?ts$)/g, '')
              .replace(/\\/g, '/');
          });
      }
    });
    DeclfileProductor.defaultSdkConfigs = [
      {
        apiPath: systemModulePathArray,
        prefix: '@ohos'
      },
      {
        apiPath: systemModulePathArray,
        prefix: '@system'
      },
      {
        apiPath: systemModulePathArray,
        prefix: '@arkts'
      }
    ];
    DeclfileProductor.sdkConfigs = [...DeclfileProductor.defaultSdkConfigs];
  }

  resolveSdkAliasModule(moduleName: string, containingFile: string, fileUnitMap: FileUnitMap): ts.ResolvedModuleFull | null {
    const packageName = fileUnitMap.get(toUnixPath(containingFile))?.moduleName;
    if (!packageName) {
      return null;
    }
    const alias = FileManager.aliasConfig.get(packageName);
    if (!alias) {
      return null;
    }
    const originalModuleAlias = alias.get(moduleName);
    if (!originalModuleAlias) {
      return null;
    }
    if (!originalModuleAlias.isStatic) {
      return null;
    }
    const originalModuleName = originalModuleAlias.originalAPIName;
    return resolveInteropSdkModule(originalModuleName);
  }

  getModuleNamesResolver(fileMap: FileUnitMap): (moduleName: string[], containingFile: string) => (ts.ResolvedModuleFull | undefined)[] {
    const self = this;
    const moduleResolutionCache = new Map<string, ts.ResolvedModuleFull | undefined>();

    function getModuleResolutionCacheKey(moduleName: string, containingFile: string): string {
      return `${toUnixPath(containingFile)}\x00${moduleName}`;
    }

    function resolveModuleName(moduleName: string, containingFile: string): ts.ResolvedModuleFull | undefined {
      let resolvedModule: ts.ResolvedModuleFull | null = null;

      resolvedModule = resolveWithDefault(moduleName, containingFile);
      if (resolvedModule) {
        return resolvedModule;
      }

      resolvedModule = resolveSdkModule(moduleName);
      if (resolvedModule) {
        return resolvedModule;
      }

      resolvedModule = self.resolveSdkAliasModule(moduleName, containingFile, fileMap);
      if (resolvedModule) {
        return resolvedModule;
      }

      resolvedModule = resolveStaticInteropSdkModule(moduleName);
      if (resolvedModule) {
        return resolvedModule;
      }

      resolvedModule = resolveEtsModule(moduleName, containingFile);
      if (resolvedModule) {
        return resolvedModule;
      }

      resolvedModule = resolveTsModule(moduleName, containingFile);
      if (resolvedModule) {
        return resolvedModule;
      }

      return resolveOtherModule(moduleName, containingFile) ?? undefined;
    }

    function resolveModuleNames(moduleNames: string[], containingFile: string): (ts.ResolvedModuleFull | undefined)[] {
      const resolvedModules: (ts.ResolvedModuleFull | undefined)[] = [];

      for (const moduleName of moduleNames) {
        const cacheKey = getModuleResolutionCacheKey(moduleName, containingFile);
        if (moduleResolutionCache.has(cacheKey)) {
          resolvedModules.push(moduleResolutionCache.get(cacheKey));
          continue;
        }

        const resolvedModule = resolveModuleName(moduleName, containingFile);
        moduleResolutionCache.set(cacheKey, resolvedModule);
        resolvedModules.push(resolvedModule);
      }

      return resolvedModules;
    }

    return resolveModuleNames;
  }
}

function resolveWithDefault(moduleName: string, containingFile: string): ts.ResolvedModuleFull | null {
  const result = ts.resolveModuleName(
    moduleName,
    containingFile,
    DeclfileProductor.compilerOptions,
    moduleResolutionHost
  );
  if (!result.resolvedModule) {
    return null;
  }

  const resolvedFileName = result.resolvedModule.resolvedFileName;
  if (resolvedFileName && path.extname(resolvedFileName) === EXTNAME_JS) {
    const resultDETSPath = resolvedFileName.replace(EXTNAME_JS, EXTNAME_D_ETS);
    if (ts.sys.fileExists(resultDETSPath)) {
      return getResolveModule(resultDETSPath, EXTNAME_D_ETS);
    }
  }

  return result.resolvedModule;
}

function resolveEtsModule(moduleName: string, containingFile: string): ts.ResolvedModuleFull | null {
  if (!/\.ets$/.test(moduleName) || /\.d\.ets$/.test(moduleName)) {
    return null;
  }

  const modulePath = path.resolve(path.dirname(containingFile), moduleName);
  return ts.sys.fileExists(modulePath) ? getResolveModule(modulePath, '.ets') : null;
}

function resolveStaticInteropSdkModule(moduleName: string): ts.ResolvedModuleFull | null {
  const prefixRegex = new RegExp(`^static@(${DeclfileProductor.sdkConfigPrefix})\\.`, 'i');
  if (!prefixRegex.test(moduleName.trim())) {
    return null;
  }

  const actualModuleName = moduleName.replace(/^static@/, '');

  for (const sdkConfig of DeclfileProductor.interopSdkConfigs) {
    const resolveModuleInfo: ResolveModuleInfo = getRealModulePath(sdkConfig.apiPath, actualModuleName, [
      '.d.ts',
      '.d.ets'
    ]);
    const modulePath: string = resolveModuleInfo.modulePath;
    const isDETS: boolean = resolveModuleInfo.isEts;

    const moduleKey = actualModuleName + (isDETS ? '.d.ets' : '.d.ts');
    if (DeclfileProductor.systemModules.includes(moduleKey) && ts.sys.fileExists(modulePath)) {
      return getResolveModule(modulePath, isDETS ? '.d.ets' : '.d.ts');
    }
  }

  return null;
}

function resolveInteropSdkModule(moduleName: string): ts.ResolvedModuleFull | null {
  const prefixRegex = new RegExp(`^@(${DeclfileProductor.sdkConfigPrefix})\\.`, 'i');
  if (!prefixRegex.test(moduleName.trim())) {
    return null;
  }

  for (const sdkConfig of DeclfileProductor.interopSdkConfigs) {
    const resolveModuleInfo: ResolveModuleInfo = getRealModulePath(sdkConfig.apiPath, moduleName, ['.d.ts', '.d.ets']);
    const modulePath: string = resolveModuleInfo.modulePath;
    const isDETS: boolean = resolveModuleInfo.isEts;

    const moduleKey = moduleName + (isDETS ? '.d.ets' : '.d.ts');
    if (DeclfileProductor.systemModules.includes(moduleKey) && ts.sys.fileExists(modulePath)) {
      return getResolveModule(modulePath, isDETS ? '.d.ets' : '.d.ts');
    }
  }

  return null;
}

function resolveSdkModule(moduleName: string): ts.ResolvedModuleFull | null {
  const prefixRegex = new RegExp(`^@(${DeclfileProductor.sdkConfigPrefix})\\.`, 'i');
  if (!prefixRegex.test(moduleName.trim())) {
    return null;
  }

  for (const sdkConfig of DeclfileProductor.sdkConfigs) {
    const resolveModuleInfo: ResolveModuleInfo = getRealModulePath(sdkConfig.apiPath, moduleName, ['.d.ts', '.d.ets']);
    const modulePath: string = resolveModuleInfo.modulePath;
    const isDETS: boolean = resolveModuleInfo.isEts;

    const moduleKey = moduleName + (isDETS ? '.d.ets' : '.d.ts');
    if (DeclfileProductor.systemModules.includes(moduleKey) && ts.sys.fileExists(modulePath)) {
      return getResolveModule(modulePath, isDETS ? '.d.ets' : '.d.ts');
    }
  }

  return null;
}

function resolveTsModule(moduleName: string, containingFile: string): ts.ResolvedModuleFull | null {
  if (!/\.ts$/.test(moduleName)) {
    return null;
  }

  const modulePath = path.resolve(path.dirname(containingFile), moduleName);
  return ts.sys.fileExists(modulePath) ? getResolveModule(modulePath, '.ts') : null;
}

function resolveOtherModule(moduleName: string, containingFile: string): ts.ResolvedModuleFull | null {
  const apiModulePath = path.resolve(__dirname, '../../../api', moduleName + '.d.ts');
  const systemDETSModulePath = path.resolve(__dirname, '../../../api', moduleName + '.d.ets');
  const kitModulePath = path.resolve(__dirname, '../../../kits', moduleName + '.d.ts');
  const kitSystemDETSModulePath = path.resolve(__dirname, '../../../kits', moduleName + '.d.ets');
  const jsModulePath = path.resolve(
    __dirname,
    '../node_modules',
    moduleName + (moduleName.endsWith('.js') ? '' : '.js')
  );
  const fileModulePath = path.resolve(__dirname, '../node_modules', moduleName + '/index.js');
  const DETSModulePath = path.resolve(
    path.dirname(containingFile),
    moduleName.endsWith('.d.ets') ? moduleName : moduleName + EXTNAME_D_ETS
  );

  if (ts.sys.fileExists(apiModulePath)) {
    return getResolveModule(apiModulePath, '.d.ts');
  } else if (ts.sys.fileExists(systemDETSModulePath)) {
    return getResolveModule(systemDETSModulePath, '.d.ets');
  } else if (ts.sys.fileExists(kitModulePath)) {
    return getResolveModule(kitModulePath, '.d.ts');
  } else if (ts.sys.fileExists(kitSystemDETSModulePath)) {
    return getResolveModule(kitSystemDETSModulePath, '.d.ets');
  } else if (ts.sys.fileExists(jsModulePath)) {
    return getResolveModule(jsModulePath, '.js');
  } else if (ts.sys.fileExists(fileModulePath)) {
    return getResolveModule(fileModulePath, '.js');
  } else if (ts.sys.fileExists(DETSModulePath)) {
    return getResolveModule(DETSModulePath, '.d.ets');
  } else {
    const srcIndex = DeclfileProductor.projectPath.indexOf('src' + path.sep + 'main');
    if (srcIndex > 0) {
      const DETSModulePathFromModule = path.resolve(
        DeclfileProductor.projectPath.substring(0, srcIndex),
        moduleName + path.sep + 'index' + EXTNAME_D_ETS
      );
      if (ts.sys.fileExists(DETSModulePathFromModule)) {
        return getResolveModule(DETSModulePathFromModule, '.d.ets');
      }
    }
    return null;
  }
}

function getRelativePath(filePath: string, pkgPath: string): string {
  // rollup uses commonjs plugin to handle commonjs files,
  // the commonjs files are prefixed with '\x00' and need to be removed.
  if (filePath.startsWith('\x00')) {
    filePath = filePath.replace('\x00', '');
  }
  let unixFilePath: string = toUnixPath(filePath);

  // Handle .d.ets and .d.ts extensions
  const dEtsIndex = unixFilePath.lastIndexOf('.d.ets');
  const dTsIndex = unixFilePath.lastIndexOf('.d.ts');

  if (dEtsIndex !== -1) {
    unixFilePath = unixFilePath.substring(0, dEtsIndex);
  } else if (dTsIndex !== -1) {
    unixFilePath = unixFilePath.substring(0, dTsIndex);
  } else {
    // Fallback to regular extension removal if not a .d file
    const lastDotIndex = unixFilePath.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      unixFilePath = unixFilePath.substring(0, lastDotIndex);
    }
  }

  const projectFilePath: string = unixFilePath.replace(toUnixPath(pkgPath) + '/', '');
  return projectFilePath;
}

const moduleResolutionHost: ts.ModuleResolutionHost = {
  fileExists: (fileName: string): boolean => {
    let exists = ts.sys.fileExists(fileName);
    if (exists === undefined) {
      exists = ts.sys.fileExists(fileName);
    }
    return exists;
  },

  readFile(fileName: string): string | undefined {
    return ts.sys.readFile(fileName);
  },
  realpath(path: string): string {
    return ts.sys.realpath!(path);
  },
  trace(s: string): void {
    console.info(s);
  }
};
