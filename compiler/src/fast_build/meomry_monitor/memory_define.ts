/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
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

export const WRITE_OBFUSCATED_SOURCE_CODE = 'ark_utils(writeObfuscatedSourceCode: writeArkguardObfuscatedSourceCode)';
export const ETS_CHECKER_CREATE_LANGUAGE_SERVICE = 'ets_checker(createLanguageService: tscreateLanguageService)';
export const CREATE_LANGUAGE_SERVICE = 'ets_checker(serviceChecker: create-languageService)';
export const GET_BUILDER_PROGRAM = 'ets_checker(serviceChecker: getBuilderProgram)';
export const RUN_ARK_TS_LINTER = 'ets_checker(serviceChecker: runArkTSLinter)';
export const PROCESS_BUILD_HAP = 'ets_checker(serviceChecker: processBuildHap)';
export const COLLECT_TSC_FILES_ALL_RESOLVED_MODULES = 'ets_checker(collectTscFiles: allResolvedModules)';
export const MERGE_ROLL_UP_FILES_LOCAL_PACKAGE_SET = 'ets_checker(mergeRollUpFiles: localPackageSet)';
export const PROCESS_BUILD_HAP_GET_SEMANTIC_DIAGNOSTICS = 'ets_checker(processBuildHap: getSemanticDiagnostics)';
export const PROCESS_BUILD_HAP_EMIT_BUILD_INFO = 'ets_checker(processBuildHap: emitBuildInfo)';
export const FILE_TO_IGNORE_DIAGNOSTICS = 'ets_checker(collectFileToIgnoreDiagnostics: fileToIgnoreDiagnostics)';
export const NEW_SOURCE_FILE = 'process_kit_import(processKitImport: ModuleSourceFile.newSourceFile)';
export const UPDATE_SOURCE_MAPS = 'generate_sourcemap(buildModuleSourceMapInfo: SourceMapGenerator-updateSourceMaps)';
export const MODULE_SOURCE_FILE_NEW_SOURCE_FILE = 'transform(transformForModule: ModuleSourceFile-newSourceFile)';
export const INIT_ARK_PROJECT_CONFIG = 'process_ark_config(initArkProjectConfig: initObfuscationConfig)';
export const PKG_ENTRY_INFOS_MODULE_INFOS = 'module_mode(collectModuleFileList: pkgEntryInfos-moduleInfos';
export const SOURCE_PROJECT_CONFIG = 'module_source_file(processModuleSourceFiles: sourceProjectConfig)';
export const ALL_FILES_OBFUSCATION = 'module_source_file(processModuleSourceFiles: Allfilesobfuscation)';
export const FILES_FOR_EACH = 'module_source_file(processModuleSourceFiles: ModuleSourceFile-sourceFiles-forEach)';
export const ROLLUP_PLUGIN_BUILD_START = 'rollup-plugin-ets-checker(etsChecker: buildStart)';
export const BUILDER_PROGRAM = 'rollup-plugin-ets-checker(etsChecker: buildStart-builderProgram)';
export const COLLECT_FILE_TO_IGNORE = 'rollup-plugin-ets-checker(etsChecker: buildStart-collectFileToIgnoreDiagnostics)';
export const SET_INCREMENTAL_FILE_IN_HAR = 'rollup-plugin-ets-typescript(load: setIncrementalFileInHar)';
export const STORED_FILE_INFO_TRANSFORM = 'rollup-plugin-ets-typescript(transform: storedFileInfo-transform)';
export const GLOBAL_PROGRAM_GET_CHECKER = 'rollup-plugin-ets-typescript(transform: globalProgram-getChecker)';
export const GLOBAL_PROGRAM_UI_KIT = 'rollup-plugin-ets-typescript(transform: globalProgram-ui/kit)';