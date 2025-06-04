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

import * as fs from 'fs';
import * as path from 'path';
import {
    ABC_SUFFIX,
    ARKTS_CONFIG_FILE_PATH,
    changeFileExtension,
    ensurePathExists,
    getFileName,
    getRootPath,
    MOCK_DEP_ANALYZER_PATH,
    MOCK_ENTRY_DIR_PATH,
    MOCK_ENTRY_FILE_NAME,
    MOCK_OUTPUT_CACHE_PATH,
    MOCK_OUTPUT_DIR_PATH,
    MOCK_OUTPUT_FILE_NAME,
    PANDA_SDK_STDLIB_PATH,
    STDLIB_ESCOMPAT_PATH,
    STDLIB_PATH,
    STDLIB_STD_PATH,
} from './path-config';
import { ArkTSConfigContextCache } from './cache';
import { BuildConfig, CompileFileInfo, DependentModule } from './shared-types';

export interface ArkTSConfigObject {
    compilerOptions: {
        package: string;
        baseUrl: string;
        paths: Record<string, string[]>;
        dependencies: string[] | undefined;
        entry: string;
    };
}

export interface ModuleInfo {
    isMainModule: boolean;
    packageName: string;
    moduleRootPath: string;
    sourceRoots: string[];
    entryFile: string;
    arktsConfigFile: string;
    compileFileInfos: CompileFileInfo[];
    dependencies?: string[];
}

export interface ArktsConfigBuilder {
    buildConfig: BuildConfig;
    entryFiles: Set<string>;
    compileFiles: Map<string, CompileFileInfo>;
    outputDir: string;
    cacheDir: string;
    pandaSdkPath: string;
    apiPath: string;
    kitsPath: string;
    packageName: string;
    sourceRoots: string[];
    moduleRootPath: string;
    dependentModuleList: DependentModule[];
    moduleInfos: Map<string, ModuleInfo>;
    mergedAbcFile: string;
    // logger: Logger; // TODO
    isDebug: boolean;

    clear(): void;
}

function writeArkTSConfigFile(
    moduleInfo: ModuleInfo,
    pathSection: Record<string, string[]>,
    dependenciesSection: string[]
): void {
    if (!moduleInfo.sourceRoots || moduleInfo.sourceRoots.length == 0) {
        throw new Error('Write Arkts config: does not have sourceRoots.');
    }

    const baseUrl: string = path.resolve(moduleInfo.moduleRootPath, moduleInfo.sourceRoots[0]);
    pathSection[moduleInfo.packageName] = [baseUrl];
    const arktsConfig: ArkTSConfigObject = {
        compilerOptions: {
            package: moduleInfo.packageName,
            baseUrl: baseUrl,
            paths: pathSection,
            dependencies: dependenciesSection.length === 0 ? undefined : dependenciesSection,
            entry: moduleInfo.entryFile,
        },
    };

    ensurePathExists(moduleInfo.arktsConfigFile);
    fs.writeFileSync(moduleInfo.arktsConfigFile, JSON.stringify(arktsConfig, null, 2), 'utf-8');
}

function getDependentModules(moduleInfo: ModuleInfo, moduleInfoMap: Map<string, ModuleInfo>): Map<string, ModuleInfo> {
    if (moduleInfo.isMainModule) {
        return moduleInfoMap;
    }

    const depModules: Map<string, ModuleInfo> = new Map<string, ModuleInfo>();
    if (moduleInfo.dependencies) {
        moduleInfo.dependencies.forEach((packageName: string) => {
            const depModuleInfo: ModuleInfo | undefined = moduleInfoMap.get(packageName);
            if (!depModuleInfo) {
                throw new Error(`Dependent Module: Module ${packageName} not found in moduleInfos`);
            } else {
                depModules.set(packageName, depModuleInfo);
            }
        });
    }
    return depModules;
}

function traverseSDK(currentDir: string, pathSection: Record<string, string[]>, prefix?: string) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
        const itemPath = path.join(currentDir, item);
        const stat = fs.statSync(itemPath);

        if (stat.isFile() && !itemPath.endsWith('.d.ets')) {
            continue;
        }

        if (stat.isFile() && itemPath.endsWith('.d.ets')) {
            const basename = path.basename(item, '.d.ets');
            const name = prefix && prefix !== 'arkui.runtime-api' ? `${prefix}.${basename}` : basename;
            pathSection[name] = [changeFileExtension(itemPath, '', '.d.ets')];
        } else if (stat.isDirectory()) {
            const basename = path.basename(itemPath);
            const name = prefix && prefix !== 'arkui.runtime-api' ? `${prefix}.${basename}` : basename;
            traverseSDK(itemPath, pathSection, name);
        }
    }
}

function mockBuildConfig(): BuildConfig {
    return {
        packageName: 'mock',
        compileFiles: [path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, MOCK_ENTRY_FILE_NAME)],
        loaderOutPath: path.resolve(getRootPath(), MOCK_OUTPUT_DIR_PATH),
        cachePath: path.resolve(getRootPath(), MOCK_OUTPUT_CACHE_PATH),
        pandaSdkPath: global.PANDA_SDK_PATH,
        apiPath: global.API_PATH,
        kitsPath: global.KIT_PATH,
        depAnalyzerPath: path.resolve(global.PANDA_SDK_PATH, MOCK_DEP_ANALYZER_PATH),
        sourceRoots: [getRootPath()],
        moduleRootPath: path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH),
        dependentModuleList: [],
    };
}

class MockArktsConfigBuilder implements ArktsConfigBuilder {
    hashId: string;
    buildConfig: BuildConfig;
    entryFiles: Set<string>;
    compileFiles: Map<string, CompileFileInfo>;
    outputDir: string;
    cacheDir: string;
    pandaSdkPath: string;
    apiPath: string;
    kitsPath: string;
    packageName: string;
    sourceRoots: string[];
    moduleRootPath: string;
    dependentModuleList: DependentModule[];
    moduleInfos: Map<string, ModuleInfo>;
    mergedAbcFile: string;
    isDebug: boolean;

    constructor(hashId: string, buildConfig?: BuildConfig) {
        this.hashId = hashId;

        const _buildConfig: BuildConfig = buildConfig ?? mockBuildConfig();
        this.buildConfig = _buildConfig;
        this.entryFiles = new Set<string>(_buildConfig.compileFiles as string[]);
        this.outputDir = _buildConfig.loaderOutPath as string;
        this.cacheDir = _buildConfig.cachePath as string;
        this.pandaSdkPath = path.resolve(_buildConfig.pandaSdkPath as string);
        this.apiPath = path.resolve(_buildConfig.apiPath as string);
        this.kitsPath = path.resolve(_buildConfig.kitsPath as string);
        this.packageName = _buildConfig.packageName as string;
        this.sourceRoots = _buildConfig.sourceRoots as string[];
        this.moduleRootPath = path.resolve(_buildConfig.moduleRootPath as string);
        this.dependentModuleList = _buildConfig.dependentModuleList as DependentModule[];
        this.isDebug = true;

        this.compileFiles = new Map<string, CompileFileInfo>();
        this.moduleInfos = new Map<string, ModuleInfo>();
        this.mergedAbcFile = path.resolve(this.outputDir, MOCK_OUTPUT_FILE_NAME);

        this.generateModuleInfos();
        this.generateArkTSConfigForModules();
        this.cacheArkTSConfig();
    }

    private cacheArkTSConfig(): void {
        const mainModuleInfo: ModuleInfo = this.moduleInfos.get(this.moduleRootPath)!;
        const arktsConfigFile: string = mainModuleInfo.arktsConfigFile;
        const compileFiles: Map<string, CompileFileInfo> = this.compileFiles;
        ArkTSConfigContextCache.getInstance().set(this.hashId, { arktsConfigFile, compileFiles });
    }

    private generateModuleInfosInEntryFile(file: string): void {
        const _file = path.resolve(file);
        for (const [modulePath, moduleInfo] of this.moduleInfos) {
            if (!_file.startsWith(modulePath)) {
                throw new Error('Entry File does not belong to any module in moduleInfos.');
            }
            const filePathFromModuleRoot: string = path.relative(modulePath, _file);
            const filePathInCache: string = path.join(
                this.cacheDir,
                this.hashId,
                moduleInfo.packageName,
                filePathFromModuleRoot
            );
            const abcFilePath: string = path.resolve(changeFileExtension(filePathInCache, ABC_SUFFIX));

            const fileInfo: CompileFileInfo = {
                fileName: getFileName(_file),
                filePath: _file,
                dependentFiles: [],
                abcFilePath: abcFilePath,
                arktsConfigFile: moduleInfo.arktsConfigFile,
                stdLibPath: path.resolve(this.pandaSdkPath, PANDA_SDK_STDLIB_PATH, STDLIB_PATH),
            };
            moduleInfo.compileFileInfos.push(fileInfo);
            if (!this.compileFiles.has(_file)) {
                this.compileFiles.set(_file, fileInfo);
            }
        }
    }

    private generateModuleInfos(): void {
        if (!this.packageName || !this.moduleRootPath || !this.sourceRoots) {
            throw new Error('Main module: packageName, moduleRootPath, and sourceRoots are required');
        }
        const mainModuleInfo: ModuleInfo = {
            isMainModule: true,
            packageName: this.packageName,
            moduleRootPath: this.moduleRootPath,
            sourceRoots: this.sourceRoots,
            entryFile: '',
            arktsConfigFile: path.resolve(this.cacheDir, this.hashId, this.packageName, ARKTS_CONFIG_FILE_PATH),
            compileFileInfos: [],
        };
        this.moduleInfos.set(this.moduleRootPath, mainModuleInfo);
        this.dependentModuleList.forEach((module: DependentModule) => {
            if (!module.packageName || !module.modulePath || !module.sourceRoots || !module.entryFile) {
                throw new Error('Dependent module: packageName, modulePath, sourceRoots, and entryFile are required');
            }
            const moduleInfo: ModuleInfo = {
                isMainModule: false,
                packageName: module.packageName,
                moduleRootPath: module.modulePath,
                sourceRoots: module.sourceRoots,
                entryFile: module.entryFile,
                arktsConfigFile: path.resolve(this.cacheDir, this.hashId, module.packageName, ARKTS_CONFIG_FILE_PATH),
                compileFileInfos: [],
            };
            this.moduleInfos.set(module.modulePath, moduleInfo);
        });
        this.entryFiles.forEach((file: string) => {
            this.generateModuleInfosInEntryFile(file);
        });
    }

    private generateArkTSConfigForModules(): void {
        const pathSection: Record<string, string[]> = {};
        pathSection['std'] = [path.resolve(this.pandaSdkPath, PANDA_SDK_STDLIB_PATH, STDLIB_STD_PATH)];
        pathSection['escompat'] = [path.resolve(this.pandaSdkPath, PANDA_SDK_STDLIB_PATH, STDLIB_ESCOMPAT_PATH)];
        traverseSDK(this.apiPath, pathSection);
        traverseSDK(this.kitsPath, pathSection);

        this.moduleInfos.forEach((moduleInfo: ModuleInfo, moduleRootPath: string) => {
            pathSection[moduleInfo.packageName] = [path.resolve(moduleRootPath, moduleInfo.sourceRoots[0])];
        });

        this.moduleInfos.forEach((moduleInfo: ModuleInfo, moduleRootPath: string) => {
            const dependenciesSection: string[] = [];
            this.generateDependenciesSection(moduleInfo, dependenciesSection);
            writeArkTSConfigFile(moduleInfo, pathSection, dependenciesSection);
        });
    }

    private generateDependenciesSection(moduleInfo: ModuleInfo, dependenciesSection: string[]): void {
        const depModules: Map<string, ModuleInfo> = getDependentModules(moduleInfo, this.moduleInfos);
        depModules.forEach((depModuleInfo: ModuleInfo) => {
            if (depModuleInfo.isMainModule) {
                return;
            }
            dependenciesSection.push(depModuleInfo.arktsConfigFile);
        });
    }

    clear(): void {
        ArkTSConfigContextCache.getInstance().delete(this.hashId);
    }
}

export { mockBuildConfig, MockArktsConfigBuilder };
