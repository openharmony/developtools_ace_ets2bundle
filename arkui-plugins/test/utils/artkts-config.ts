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

import * as fs from "fs";
import * as path from "path";
import { 
    ABC_SUFFIX,
    ARKTS_CONFIG_FILE_PATH,
    changeFileExtension,
    ensurePathExists,
    getFileName,
    getPandaSDKPath,
    getRootPath, 
    MOCK_ENTRY_DIR_PATH, 
    MOCK_ENTRY_FILE_NAME, 
    MOCK_LOCAL_SDK_DIR_PATH, 
    MOCK_OUTPUT_CACHE_PATH, 
    MOCK_OUTPUT_DIR_PATH,
    MOCK_OUTPUT_FILE_NAME,
    PANDA_SDK_STDLIB_PATH,
    RUNTIME_API_PATH,
    STDLIB_ESCOMPAT_PATH,
    STDLIB_PATH,
    STDLIB_STD_PATH
} from "./path-config";

export interface ArkTSConfigObject {
    compilerOptions: {
        package: string,
        baseUrl: string,
        paths: Record<string, string[]>;
        dependencies: string[] | undefined;
        entry: string;
    }
}

export interface CompileFileInfo {
    fileName: string,
    filePath: string,
    dependentFiles: string[],
    abcFilePath: string,
    arktsConfigFile: string,
    stdLibPath: string
}

export interface ModuleInfo {
    isMainModule: boolean,
    packageName: string,
    moduleRootPath: string,
    sourceRoots: string[],
    entryFile: string,
    arktsConfigFile: string,
    compileFileInfos: CompileFileInfo[],
    dependencies?: string[]
}

export interface DependentModule {
    packageName: string,
    moduleName: string,
    moduleType: string,
    modulePath: string,
    sourceRoots: string[],
    entryFile: string
}

export type ModuleType = "har" | string; // TODO: module type unclear

export interface DependentModule {
    packageName: string;
    moduleName: string;
    moduleType: ModuleType;
    modulePath: string;
    sourceRoots: string[];
    entryFile: string;
}

export interface BuildConfig {
    packageName: string;
    compileFiles: string[];
    loaderOutPath: string;
    cachePath: string;
    pandaSdkPath: string;
    buildSdkPath: string;
    sourceRoots: string[];
    moduleRootPath: string;
    dependentModuleList: DependentModule[];
}

export interface ArktsConfigBuilder {
    buildConfig: BuildConfig;
    entryFiles: Set<string>;
    outputDir: string;
    cacheDir: string;
    pandaSdkPath: string;
    buildSdkPath: string;
    packageName: string;
    sourceRoots: string[];
    moduleRootPath: string;
    dependentModuleList: DependentModule[];
    moduleInfos: Map<string, ModuleInfo>;
    mergedAbcFile: string;
    // logger: Logger; // TODO
    isDebug: boolean;
}

function writeArkTSConfigFile(
    moduleInfo: ModuleInfo, 
    pathSection: Record<string, string[]>, 
    dependenciesSection: string[]
): void {
    if (!moduleInfo.sourceRoots || moduleInfo.sourceRoots.length == 0) {
        throw new Error("Write Arkts config: does not have sourceRoots.");
    }

    const baseUrl: string = path.resolve(moduleInfo.moduleRootPath, moduleInfo.sourceRoots[0]);
    pathSection[moduleInfo.packageName] = [baseUrl];
    const arktsConfig: ArkTSConfigObject = {
        compilerOptions: {
            package: moduleInfo.packageName,
            baseUrl: baseUrl,
            paths: pathSection,
            dependencies: dependenciesSection.length === 0 ? undefined : dependenciesSection,
            entry: moduleInfo.entryFile
        }
    };

    ensurePathExists(moduleInfo.arktsConfigFile);
    fs.writeFileSync(moduleInfo.arktsConfigFile, JSON.stringify(arktsConfig, null, 2), 'utf-8');
}

function getDependentModules(
    moduleInfo: ModuleInfo,
    moduleInfoMap: Map<string, ModuleInfo>
): Map<string, ModuleInfo> {
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

function traverse(currentDir: string, pathSection: Record<string, string[]>) {
    const items = fs.readdirSync(currentDir);
    for (const item of items) {
        const itemPath = path.join(currentDir, item);
        const stat = fs.statSync(itemPath);

        if (stat.isFile()) {
            const basename = path.basename(item, '.d.ets');
            pathSection[basename] = [changeFileExtension(itemPath, '', '.d.ets')];
        } else if (stat.isDirectory()) {
            traverse(itemPath, pathSection);
        }
    }
}

function mockBuildConfig(): BuildConfig {
    return {
        packageName: "mock",
        compileFiles: [
            path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, MOCK_ENTRY_FILE_NAME)
        ],
        loaderOutPath: path.resolve(getRootPath(), MOCK_OUTPUT_DIR_PATH),
        cachePath: path.resolve(getRootPath(), MOCK_OUTPUT_CACHE_PATH),
        pandaSdkPath: getPandaSDKPath(),
        buildSdkPath: path.resolve(getRootPath(), MOCK_LOCAL_SDK_DIR_PATH),
        sourceRoots: [getRootPath()],
        moduleRootPath: path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH),
        dependentModuleList: [
            {
                packageName: "@koalaui/runtime",
                moduleName: "@koalaui/runtime",
                moduleType: "har",
                modulePath: path.resolve(getRootPath(), RUNTIME_API_PATH),
                sourceRoots: ["./"],
                entryFile: "index.sts"
            }
        ]
    };
}

class MockArktsConfigBuilder implements ArktsConfigBuilder {
    buildConfig: BuildConfig;
    entryFiles: Set<string>;
    outputDir: string;
    cacheDir: string;
    pandaSdkPath: string;
    buildSdkPath: string;
    packageName: string;
    sourceRoots: string[];
    moduleRootPath: string;
    dependentModuleList: DependentModule[];
    moduleInfos: Map<string, ModuleInfo>;
    mergedAbcFile: string;
    isDebug: boolean;

    constructor(buildConfig?: BuildConfig) {
        const _buildConfig: BuildConfig = buildConfig ?? mockBuildConfig();
        this.buildConfig = _buildConfig;
        this.entryFiles = new Set<string>(_buildConfig.compileFiles as string[]);
        this.outputDir = _buildConfig.loaderOutPath as string;
        this.cacheDir = _buildConfig.cachePath as string;
        this.pandaSdkPath = path.resolve(_buildConfig.pandaSdkPath as string);
        this.buildSdkPath = path.resolve(_buildConfig.buildSdkPath as string);
        this.packageName = _buildConfig.packageName as string;
        this.sourceRoots = _buildConfig.sourceRoots as string[];
        this.moduleRootPath = path.resolve(_buildConfig.moduleRootPath as string);
        this.dependentModuleList = _buildConfig.dependentModuleList as DependentModule[];
        this.isDebug = true;

        this.moduleInfos = new Map<string, ModuleInfo>();
        this.mergedAbcFile = path.resolve(this.outputDir, MOCK_OUTPUT_FILE_NAME);

        this.generateModuleInfos();
        this.generateArkTSConfigForModules();
    }

    private generateModuleInfos(): void {
        if (!this.packageName || !this.moduleRootPath || !this.sourceRoots) {
            throw new Error("Main module: packageName, moduleRootPath, and sourceRoots are required");
        }
        const mainModuleInfo: ModuleInfo = {
            isMainModule: true,
            packageName: this.packageName,
            moduleRootPath: this.moduleRootPath,
            sourceRoots: this.sourceRoots,
            entryFile: '',
            arktsConfigFile: path.resolve(this.cacheDir, this.packageName, ARKTS_CONFIG_FILE_PATH),
            compileFileInfos: []
        }
        this.moduleInfos.set(this.moduleRootPath, mainModuleInfo);
        this.dependentModuleList.forEach((module: DependentModule) => {
            if (!module.packageName || !module.modulePath || !module.sourceRoots || !module.entryFile) {
                throw new Error(
                    "Dependent module: packageName, modulePath, sourceRoots, and entryFile are required"
                );
            }
            const moduleInfo: ModuleInfo = {
                isMainModule: false,
                packageName: module.packageName,
                moduleRootPath: module.modulePath,
                sourceRoots: module.sourceRoots,
                entryFile: module.entryFile,
                arktsConfigFile: path.resolve(this.cacheDir, module.packageName, ARKTS_CONFIG_FILE_PATH),
                compileFileInfos: []
            }
            this.moduleInfos.set(module.modulePath, moduleInfo);
        });
        this.entryFiles.forEach((file: string) => {
            const _file = path.resolve(file);
            for (const [modulePath, moduleInfo] of this.moduleInfos) {
              if (_file.startsWith(modulePath)) {
                const filePathFromModuleRoot: string = path.relative(modulePath, _file);
                const filePathInCache: string = path.join(
                    this.cacheDir, moduleInfo.packageName, filePathFromModuleRoot);
                const abcFilePath: string = path.resolve(changeFileExtension(filePathInCache, ABC_SUFFIX));
      
                const fileInfo: CompileFileInfo = {
                    fileName: getFileName(_file),
                    filePath: _file,
                    dependentFiles: [],
                    abcFilePath: abcFilePath,
                    arktsConfigFile: moduleInfo.arktsConfigFile,
                    stdLibPath: path.resolve(this.pandaSdkPath, PANDA_SDK_STDLIB_PATH, STDLIB_PATH)
                };
                moduleInfo.compileFileInfos.push(fileInfo);
                return;
              }
            }
            throw new Error("Entry File does not belong to any module in moduleInfos.")
        });
    }

    private generateArkTSConfigForModules(): void {
        const pathSection: Record<string, string[]> = {};
        pathSection['std'] = [
            path.resolve(this.pandaSdkPath, PANDA_SDK_STDLIB_PATH, STDLIB_STD_PATH)
        ];
        pathSection['escompat'] = [
            path.resolve(this.pandaSdkPath, PANDA_SDK_STDLIB_PATH, STDLIB_ESCOMPAT_PATH)
        ];
        traverse(this.buildSdkPath, pathSection);

        this.moduleInfos.forEach((moduleInfo: ModuleInfo, moduleRootPath: string) => {
            pathSection[moduleInfo.packageName] = [
                path.resolve(moduleRootPath, moduleInfo.sourceRoots[0])
            ]
        });

        this.moduleInfos.forEach((moduleInfo: ModuleInfo, moduleRootPath: string)=> {
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
}

export {
    mockBuildConfig,
    MockArktsConfigBuilder
}