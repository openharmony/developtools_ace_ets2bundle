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

import { FileManager } from './interop_manager';
import { ResolveModuleInfo, getResolveModule, readDeaclareFiles } from '../../../ets_checker';
import { processInteropUI } from '../../../process_interop_ui';
import {
    mkdirsSync,
    readFile,
    toUnixPath
} from '../../../utils';
import { 
    ArkTSEvolutionModule,
    BuildType,
    DeclFilesConfig,
    Params,
    ProjectConfig,
    RunnerParms
} from './type';
import fs from 'fs';
import path from 'path';
import * as ts from 'typescript';
import { EXTNAME_D_ETS, EXTNAME_JS } from '../common/ark_define';
import { getRealModulePath } from '../../system_api/api_check_utils';
import { generateInteropDecls } from '../../../../node_modules/declgen/build/src/generateInteropDecls';

export function run(param: Params): boolean {
    FileManager.init(param.dependentModuleMap);
    DeclfileProductor.init(param);
    param.tasks.forEach(task => {
        const moduleInfo = FileManager.arkTSModuleMap.get(task.packageName);
        if (moduleInfo?.dynamicFiles.length <= 0) {
            return;
        }
        if (task.buildTask === BuildType.DECLGEN) {
            DeclfileProductor.getInstance().runDeclgen(moduleInfo);
        } else if (task.buildTask === BuildType.INTEROP_CONTEXT) {
            DeclfileProductor.getInstance().writeDeclFileInfo(moduleInfo, task.mainModuleName);
        } else if (task.buildTask === BuildType.BYTE_CODE_HAR) {
            //todo
        }
    });
    FileManager.cleanFileManagerObject();
    return true;
}

class DeclfileProductor {
    private static declFileProductor: DeclfileProductor;

    static compilerOptions: ts.CompilerOptions;
    static sdkConfigPrefix = 'ohos|system|kit|arkts';
    static sdkConfigs = [];
    static systemModules = [];
    static defaultSdkConfigs = [];
    static projectPath;
    private projectConfig;
    private pkgDeclFilesConfig: { [pkgName: string]: DeclFilesConfig } = {};

    static init(param: Params): void {
        DeclfileProductor.declFileProductor = new DeclfileProductor(param);
        DeclfileProductor.compilerOptions = ts.readConfigFile(
            path.join(__dirname, '../../../../tsconfig.json'), ts.sys.readFile).config.compilerOptions;
        DeclfileProductor.initSdkConfig();
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
            skipPathsInKeyForCompilationSettings: true,
        });
        DeclfileProductor.projectPath = param.projectConfig.projectRootPath;
    }
    static getInstance(param?: Params): DeclfileProductor {
        if (!this.declFileProductor) {
            this.declFileProductor = new DeclfileProductor(param);
        }
        return this.declFileProductor;
    }

    private constructor(param: Params) {
        this.projectConfig = param.projectConfig as ProjectConfig;
    }

    runDeclgen(moduleInfo: ArkTSEvolutionModule): void {
        let inputList = [];
        moduleInfo.dynamicFiles.forEach(path => {
            inputList.push(toUnixPath(path));
        });
        readDeaclareFiles().forEach(path => {
            inputList.push(toUnixPath(path));
        });

        inputList = inputList.filter(filePath => !filePath.endsWith('.js'));
        const config: RunnerParms = {
            inputDirs: [],
            inputFiles: inputList,
            outDir: moduleInfo.declgenV2OutPath,
            // use package name as folder name
            rootDir: moduleInfo.modulePath,
            customResolveModuleNames: resolveModuleNames,
            customCompilerOptions: DeclfileProductor.compilerOptions,
            includePaths: [moduleInfo.modulePath]
        };
        if (fs.existsSync(config.outDir)) {
            fs.rmSync(config.outDir, { recursive: true, force: true });
        }
        fs.mkdirSync(config.outDir, { recursive: true });
        generateInteropDecls(config);
        processInteropUI(FileManager.arkTSModuleMap.get(moduleInfo.packageName)?.declgenV2OutPath);
    }

    writeDeclFileInfo(moduleInfo: ArkTSEvolutionModule, mainModuleName: string): void {
        moduleInfo.dynamicFiles.forEach(file => {
            this.addDeclFilesConfig(file, mainModuleName, this.projectConfig.bundleName, moduleInfo);
        });

        const declFilesConfigFile: string = toUnixPath(moduleInfo.declFilesPath);
        mkdirsSync(path.dirname(declFilesConfigFile));
        fs.writeFileSync(declFilesConfigFile, JSON.stringify(this.pkgDeclFilesConfig[moduleInfo.packageName], null, 2), 'utf-8');
    }

    addDeclFilesConfig(filePath: string, mainModuleName: string, bundleName: string, moduleInfo: ArkTSEvolutionModule): void {
        const projectFilePath = getRelativePath(filePath, moduleInfo.modulePath);

        const declgenV2OutPath: string = this.getDeclgenV2OutPath(moduleInfo.packageName);
        if (!declgenV2OutPath) {
            return;
        }
        if (!this.pkgDeclFilesConfig[moduleInfo.packageName]) {
            this.pkgDeclFilesConfig[moduleInfo.packageName] = { packageName: moduleInfo.packageName, files: {} };
        }
        if (this.pkgDeclFilesConfig[moduleInfo.packageName].files[projectFilePath]) {
            return;
        }
        // The module name of the entry module of the project during the current compilation process.
        const normalizedFilePath: string = `${moduleInfo.packageName}/${projectFilePath}`;
        const declPath: string = path.join(toUnixPath(declgenV2OutPath), projectFilePath) + EXTNAME_D_ETS;
        const ohmUrl: string = `N&${mainModuleName}&${bundleName}&${normalizedFilePath}&${moduleInfo.packageVersion}`;
        this.pkgDeclFilesConfig[moduleInfo.packageName].files[projectFilePath] = { declPath, ohmUrl: `@normalized:${ohmUrl}` };
    }

    getDeclgenV2OutPath(pkgName: string): string {
        if (FileManager.arkTSModuleMap.size && FileManager.arkTSModuleMap.get(pkgName)) {
            const arkTsModuleInfo: ArkTSEvolutionModule = FileManager.arkTSModuleMap.get(pkgName);
            return arkTsModuleInfo.declgenV2OutPath;
        }
        return '';
    }

    static initSdkConfig(): void {
        const apiDirPath = path.resolve(__dirname, '../../../../../api');
        const arktsDirPath = path.resolve(__dirname, '../../../../../arkts');
        const kitsDirPath = path.resolve(__dirname, '../../../../../kits');
        const systemModulePathArray = [apiDirPath];
        if (!process.env.isFaMode) {
            systemModulePathArray.push(arktsDirPath, kitsDirPath);
        }
        systemModulePathArray.forEach(systemModulesPath => {
            if (fs.existsSync(systemModulesPath)) {
                const modulePaths = [];
                readFile(systemModulesPath, modulePaths);
                DeclfileProductor.systemModules.push(...fs.readdirSync(systemModulesPath));
                const moduleSubdir = modulePaths.filter(filePath => {
                    const dirName = path.dirname(filePath);
                    return !(dirName === apiDirPath || dirName === arktsDirPath || dirName === kitsDirPath);
                }).map(filePath => {
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
                'apiPath': systemModulePathArray,
                'prefix': '@ohos'
            }, {
                'apiPath': systemModulePathArray,
                'prefix': '@system'
            }, {
                'apiPath': systemModulePathArray,
                'prefix': '@arkts'
            }
        ];
        DeclfileProductor.sdkConfigs = [...DeclfileProductor.defaultSdkConfigs];
    }
}

function resolveModuleNames(moduleNames: string[], containingFile: string): ts.ResolvedModuleFull[] {
    const resolvedModules: ts.ResolvedModuleFull[] = [];

    for (const moduleName of moduleNames) {
        let resolvedModule: ts.ResolvedModuleFull | null = null;

        resolvedModule = resolveWithDefault(moduleName, containingFile);
        if (resolvedModule) {
            resolvedModules.push(resolvedModule);
            continue;
        }

        resolvedModule = resolveSdkModule(moduleName);
        if (resolvedModule) {
            resolvedModules.push(resolvedModule);
            continue;
        }

        resolvedModule = resolveEtsModule(moduleName, containingFile);
        if (resolvedModule) {
            resolvedModules.push(resolvedModule);
            continue;
        }

        resolvedModule = resolveTsModule(moduleName, containingFile);
        if (resolvedModule) {
            resolvedModules.push(resolvedModule);
            continue;
        }

        resolvedModule = resolveOtherModule(moduleName, containingFile);
        resolvedModules.push(resolvedModule ?? null);
    }

    return resolvedModules;
}

function resolveWithDefault(
    moduleName: string,
    containingFile: string
): ts.ResolvedModuleFull | null {
    const result = ts.resolveModuleName(moduleName, containingFile, DeclfileProductor.compilerOptions, moduleResolutionHost);
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
    const jsModulePath = path.resolve(__dirname, '../node_modules', moduleName + (moduleName.endsWith('.js') ? '' : '.js'));
    const fileModulePath = path.resolve(__dirname, '../node_modules', moduleName + '/index.js');
    const DETSModulePath = path.resolve(path.dirname(containingFile),
        moduleName.endsWith('.d.ets') ? moduleName : moduleName + EXTNAME_D_ETS);

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
        return ts.sys.realpath(path);
    },
    trace(s: string): void {
        console.info(s);
    }
};