/*
 * Copyright (c) 2022 Huawei Device Co., Ltd.
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
import path from 'path';
import * as ts from 'typescript';

import {
  projectConfig,
  systemModules,
  globalProgram
} from '../main';
import {
  preprocessExtend,
  preprocessNewExtend
} from './validate_ui_syntax';
import {
  INNER_COMPONENT_MEMBER_DECORATORS,
  COMPONENT_DECORATORS_PARAMS,
  COMPONENT_BUILD_FUNCTION,
  STYLE_ADD_DOUBLE_DOLLAR,
  $$,
  PROPERTIES_ADD_DOUBLE_DOLLAR,
  $$_BLOCK_INTERFACE,
  COMPONENT_EXTEND_DECORATOR,
  COMPONENT_BUILDER_DECORATOR,
  ESMODULE,
  EXTNAME_D_ETS,
  EXTNAME_JS,
  FOREACH_LAZYFOREACH,
  TS_WATCH_END_MSG
} from './pre_define';
import { getName } from './process_component_build';
import { INNER_COMPONENT_NAMES } from './component_map';
import {
  props,
  logger
} from './compile_info';
import { hasDecorator } from './utils';
import { generateSourceFilesInHar } from './utils';
import { isExtendFunction, isOriginalExtend } from './process_ui_syntax';
import { visualTransform } from './process_visual';
import { tsWatchEmitter } from './fast_build/ets_ui/rollup-plugin-ets-checker';

export function readDeaclareFiles(): string[] {
  const declarationsFileNames: string[] = [];
  fs.readdirSync(path.resolve(__dirname, '../declarations'))
    .forEach((fileName: string) => {
      if (/\.d\.ts$/.test(fileName)) {
        declarationsFileNames.push(path.resolve(__dirname, '../declarations', fileName));
      }
    });
  return declarationsFileNames;
}

export const compilerOptions: ts.CompilerOptions = ts.readConfigFile(
  path.resolve(__dirname, '../tsconfig.json'), ts.sys.readFile).config.compilerOptions;
function setCompilerOptions() {
  const allPath: Array<string> = [
    '*'
  ];
  if (!projectConfig.aceModuleJsonPath) {
    allPath.push('../../../../../*');
    allPath.push('../../*');
  } else {
    allPath.push('../../../../*');
    allPath.push('../*');
  }
  Object.assign(compilerOptions, {
    'allowJs': false,
    'emitNodeModulesFiles': true,
    'importsNotUsedAsValues': ts.ImportsNotUsedAsValues.Preserve,
    'module': ts.ModuleKind.CommonJS,
    'moduleResolution': ts.ModuleResolutionKind.NodeJs,
    'noEmit': true,
    'target': ts.ScriptTarget.ES2017,
    'baseUrl': path.resolve(projectConfig.projectPath),
    'paths': {
      '*': allPath
    },
    'lib': [
      'lib.es2020.d.ts'
    ]
  });
  if (projectConfig.compileMode === ESMODULE) {
    Object.assign(compilerOptions, {
      'importsNotUsedAsValues': ts.ImportsNotUsedAsValues.Remove,
      'module': ts.ModuleKind.ES2020
    });
  }
  if (projectConfig.packageDir === 'oh_modules') {
    Object.assign(compilerOptions, {
      'packageManagerType': 'ohpm'
    });
  }
}

interface extendInfo {
  start: number,
  end: number,
  compName: string
}

export function createLanguageService(rootFileNames: string[]): ts.LanguageService {
  setCompilerOptions();
  const files: ts.MapLike<{ version: number }> = {};
  const servicesHost: ts.LanguageServiceHost = {
    getScriptFileNames: () => [...rootFileNames, ...readDeaclareFiles()],
    getScriptVersion: fileName =>
      files[fileName] && files[fileName].version.toString(),
    getScriptSnapshot: fileName => {
      if (!fs.existsSync(fileName)) {
        return undefined;
      }
      if (/(?<!\.d)\.(ets|ts)$/.test(fileName)) {
        let content: string = processContent(fs.readFileSync(fileName).toString(), fileName);
        const extendFunctionInfo: extendInfo[] = [];
        content = instanceInsteadThis(content, fileName, extendFunctionInfo);
        return ts.ScriptSnapshot.fromString(content);
      }
      return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
    },
    getCurrentDirectory: () => process.cwd(),
    getCompilationSettings: () => compilerOptions,
    getDefaultLibFileName: options => ts.getDefaultLibFilePath(options),
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
    resolveModuleNames: resolveModuleNames,
    directoryExists: ts.sys.directoryExists,
    getDirectories: ts.sys.getDirectories,
    getTagNameNeededCheckByFile: (fileName, sourceFileName) => {
      let needCheckResult: boolean = false;
      if ((/compiler\/declarations/.test(sourceFileName) || /ets-loader\/declarations/.test(sourceFileName)) &&
        isCardFile(fileName)) {
        needCheckResult = true;
      }
      return {
        needCheck: needCheckResult,
        checkConfig: [{
          tagName: "form",
          message: "'{0}' can't support form application.",
          needConditionCheck: false,
          type: ts.DiagnosticCategory.Error,
          specifyCheckConditionFuncName: '',
          tagNameShouldExisted: true
        }]
      }
    }
  };
  return ts.createLanguageService(servicesHost, ts.createDocumentRegistry());
}

interface CacheFileName {
  mtimeMs: number,
  children: string[],
  parent: string[],
  error: boolean
}
interface NeedUpdateFlag {
  flag: boolean;
}
interface CheckerResult {
  count: number
}

interface WarnCheckerResult {
  count: number
}

interface WholeCache {
  runtimeOS: string,
  sdkInfo: string,
  fileList: Cache
}
type Cache = Record<string, CacheFileName>;
export let cache: Cache = {};
export const hotReloadSupportFiles: Set<string> = new Set();
export const shouldResolvedFiles: Set<string> = new Set();
const allResolvedModules: Set<string> = new Set();

let fastBuildLogger = null;

export const checkerResult: CheckerResult = {count: 0};
export const warnCheckerResult: WarnCheckerResult = {count: 0};
export function serviceChecker(rootFileNames: string[], newLogger: any = null): void {
  fastBuildLogger = newLogger;
  let languageService: ts.LanguageService = null;
  let cacheFile: string = null;
  if (projectConfig.xtsMode) {
    languageService = createLanguageService(rootFileNames);
  } else {
    cacheFile = path.resolve(projectConfig.cachePath, '../.ts_checker_cache');
    const wholeCache: WholeCache = fs.existsSync(cacheFile) ?
      JSON.parse(fs.readFileSync(cacheFile).toString()) :
      {'runtimeOS': projectConfig.runtimeOS, 'sdkInfo': projectConfig.sdkInfo, 'fileList': {}};
    if (wholeCache.runtimeOS === projectConfig.runtimeOS && wholeCache.sdkInfo === projectConfig.sdkInfo) {
      cache = wholeCache.fileList;
    } else {
      cache = {};
    }
    const filterFiles: string[] = filterInput(rootFileNames);
    languageService = createLanguageService(filterFiles);
  }
  globalProgram.program = languageService.getProgram();
  const allDiagnostics: ts.Diagnostic[] = globalProgram.program
    .getSyntacticDiagnostics()
    .concat(globalProgram.program.getSemanticDiagnostics())
    .concat(globalProgram.program.getDeclarationDiagnostics());
  allDiagnostics.forEach((diagnostic: ts.Diagnostic) => {
    printDiagnostic(diagnostic);
  });
  if (process.env.watchMode !== 'true' && !projectConfig.xtsMode) {
    fs.writeFileSync(cacheFile, JSON.stringify({
      'runtimeOS': projectConfig.runtimeOS,
      'sdkInfo': projectConfig.sdkInfo,
      'fileList': cache
    }, null, 2));
  }
  if (projectConfig.compileHar || projectConfig.compileShared) {
    [...allResolvedModules, ...rootFileNames].forEach(moduleFile => {
      if (!(moduleFile.match(new RegExp(projectConfig.packageDir)) && projectConfig.compileHar)) {
        try {
          const emit: any = languageService.getEmitOutput(moduleFile, true, true);
          if (emit.outputFiles[0]) {
            generateSourceFilesInHar(moduleFile, emit.outputFiles[0].text, '.d' + path.extname(moduleFile),
              projectConfig);
          } else {
            console.warn(this.yellow,
              "ArkTS:WARN doesn't generate .d" + path.extname(moduleFile) + ' for ' + moduleFile, this.reset);
          }
        } catch (err) {}
      }
    });
  }
}

function isCardFile(file: string): boolean {
  for (const key in projectConfig.cardEntryObj) {
    if (path.normalize(projectConfig.cardEntryObj[key]) === path.normalize(file)) {
      return true;
    }
  }
  return false;
}

function containFormError(message: string): boolean {
  if (/can't support form application./.test(message)) {
    return true;
  }
  return false;
}

export function printDiagnostic(diagnostic: ts.Diagnostic): void {
  const message: string = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
  if (validateError(message)) {
    if (process.env.watchMode !== 'true' && !projectConfig.xtsMode) {
      updateErrorFileCache(diagnostic);
    }

    if (containFormError(message) && !isCardFile(diagnostic.file.fileName)) {
        return;
    }

    const logPrefix: string = diagnostic.category === ts.DiagnosticCategory.Error ? 'ERROR' : 'WARN';
    const etsCheckerLogger = fastBuildLogger ? fastBuildLogger : logger;
    let logMessage: string;
    if (logPrefix === 'ERROR') {
      checkerResult.count += 1;
    } else {
      warnCheckerResult.count += 1;
    }
    if (diagnostic.file) {
      const { line, character }: ts.LineAndCharacter =
        diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!);
      logMessage = `ArkTS:${logPrefix} File: ${diagnostic.file.fileName}:${line + 1}:${character + 1}\n ${message}\n`;
    } else {
      logMessage = `ArkTS:${logPrefix}: ${message}`;
    }

    if (diagnostic.category === ts.DiagnosticCategory.Error) {
      etsCheckerLogger.error('\u001b[31m' + logMessage);
    } else {
      etsCheckerLogger.warn('\u001b[33m' + logMessage);
    }
  }
}

function validateError(message: string): boolean {
  const propInfoReg: RegExp = /Cannot find name\s*'(\$?\$?[_a-zA-Z0-9]+)'/;
  const stateInfoReg: RegExp = /Property\s*'(\$?[_a-zA-Z0-9]+)' does not exist on type/;
  if (matchMessage(message, props, propInfoReg) ||
    matchMessage(message, props, stateInfoReg)) {
    return false;
  }
  return true;
}
function matchMessage(message: string, nameArr: any, reg: RegExp): boolean {
  if (reg.test(message)) {
    const match: string[] = message.match(reg);
    if (match[1] && nameArr.includes(match[1])) {
      return true;
    }
  }
  return false;
}

function updateErrorFileCache(diagnostic: ts.Diagnostic): void {
  if (diagnostic.file && cache[path.resolve(diagnostic.file.fileName)]) {
    cache[path.resolve(diagnostic.file.fileName)].error = true;
  }
}

function filterInput(rootFileNames: string[]): string[] {
  return rootFileNames.filter((file: string) => {
    const needUpdate: NeedUpdateFlag = { flag: false };
    const alreadyCheckedFiles: Set<string> = new Set();
    checkNeedUpdateFiles(path.resolve(file), needUpdate, alreadyCheckedFiles);
    return needUpdate.flag;
  });
}

function checkNeedUpdateFiles(file: string, needUpdate: NeedUpdateFlag, alreadyCheckedFiles: Set<string>): void {
  if (alreadyCheckedFiles.has(file)) {
    return;
  } else {
    alreadyCheckedFiles.add(file);
  }

  if (needUpdate.flag) {
    return;
  }

  const value: CacheFileName = cache[file];
  const mtimeMs: number = fs.statSync(file).mtimeMs;
  if (value) {
    if (value.error || value.mtimeMs !== mtimeMs) {
      needUpdate.flag = true;
      return;
    }
    for (let i = 0; i < value.children.length; ++i) {
      if (fs.existsSync(value.children[i])) {
        checkNeedUpdateFiles(value.children[i], needUpdate, alreadyCheckedFiles);
      } else {
        needUpdate.flag = true;
      }
    }
  } else {
    cache[file] = { mtimeMs, children: [], parent: [], error: false };
    needUpdate.flag = true;
  }
}

const resolvedModulesCache: Map<string, ts.ResolvedModuleFull[]> = new Map();

export function resolveModuleNames(moduleNames: string[], containingFile: string): ts.ResolvedModuleFull[] {
  const resolvedModules: ts.ResolvedModuleFull[] = [];
  if (![...shouldResolvedFiles].length || shouldResolvedFiles.has(path.resolve(containingFile))
    || !(resolvedModulesCache[path.resolve(containingFile)] &&
      resolvedModulesCache[path.resolve(containingFile)].length === moduleNames.length)) {
    for (const moduleName of moduleNames) {
      const result = ts.resolveModuleName(moduleName, containingFile, compilerOptions, {
        fileExists(fileName: string): boolean {
          return ts.sys.fileExists(fileName);
        },
        readFile(fileName: string): string | undefined {
          return ts.sys.readFile(fileName);
        },
        realpath(path: string): string {
          return ts.sys.realpath(path);
        }
      });
      if (result.resolvedModule) {
        if (result.resolvedModule.resolvedFileName &&
          path.extname(result.resolvedModule.resolvedFileName) === EXTNAME_JS) {
          const resultDETSPath: string =
            result.resolvedModule.resolvedFileName.replace(EXTNAME_JS, EXTNAME_D_ETS);
          if (ts.sys.fileExists(resultDETSPath)) {
            resolvedModules.push(getResolveModule(resultDETSPath, EXTNAME_D_ETS));
          } else {
            resolvedModules.push(result.resolvedModule);
          }
        } else {
          resolvedModules.push(result.resolvedModule);
        }
      } else if (/^@(system|ohos)\./i.test(moduleName.trim())) {
        const modulePath: string = path.resolve(__dirname, '../../../api', moduleName + '.d.ts');
        if (systemModules.includes(moduleName + '.d.ts') && ts.sys.fileExists(modulePath)) {
          resolvedModules.push(getResolveModule(modulePath, '.d.ts'));
        } else {
          resolvedModules.push(null);
        }
      } else if (/\.ets$/.test(moduleName) && !/\.d\.ets$/.test(moduleName)) {
        const modulePath: string = path.resolve(path.dirname(containingFile), moduleName);
        if (ts.sys.fileExists(modulePath)) {
          resolvedModules.push(getResolveModule(modulePath, '.ets'));
        } else {
          resolvedModules.push(null);
        }
      } else if (/\.ts$/.test(moduleName)) {
        const modulePath: string = path.resolve(path.dirname(containingFile), moduleName);
        if (ts.sys.fileExists(modulePath)) {
          resolvedModules.push(getResolveModule(modulePath, '.ts'));
        } else {
          resolvedModules.push(null);
        }
      } else {
        const modulePath: string = path.resolve(__dirname, '../../../api', moduleName + '.d.ts');
        const suffix: string = /\.js$/.test(moduleName) ? '' : '.js';
        const jsModulePath: string = path.resolve(__dirname, '../node_modules', moduleName + suffix);
        const fileModulePath: string =
          path.resolve(__dirname, '../node_modules', moduleName + '/index.js');
        const DETSModulePath: string = path.resolve(path.dirname(containingFile),
          /\.d\.ets$/.test(moduleName) ? moduleName : moduleName + EXTNAME_D_ETS);
        if (ts.sys.fileExists(modulePath)) {
          resolvedModules.push(getResolveModule(modulePath, '.d.ts'));
        } else if (ts.sys.fileExists(jsModulePath)) {
          resolvedModules.push(getResolveModule(jsModulePath, '.js'));
        } else if (ts.sys.fileExists(fileModulePath)) {
          resolvedModules.push(getResolveModule(fileModulePath, '.js'));
        } else if (ts.sys.fileExists(DETSModulePath)) {
          resolvedModules.push(getResolveModule(DETSModulePath, '.d.ets'));
        } else {
          const srcIndex: number = projectConfig.projectPath.indexOf('src' + path.sep + 'main');
          let DETSModulePathFromModule: string;
          if (srcIndex > 0) {
            DETSModulePathFromModule = path.resolve(
              projectConfig.projectPath.substring(0, srcIndex), moduleName + path.sep + 'index' + EXTNAME_D_ETS);
            if (DETSModulePathFromModule && ts.sys.fileExists(DETSModulePathFromModule)) {
              resolvedModules.push(getResolveModule(DETSModulePathFromModule, '.d.ets'));
            } else {
              resolvedModules.push(null);
            }
          } else {
            resolvedModules.push(null);
          }
        }
      }
      if (projectConfig.hotReload && resolvedModules.length &&
        resolvedModules[resolvedModules.length - 1]) {
        hotReloadSupportFiles.add(path.resolve(resolvedModules[resolvedModules.length - 1].resolvedFileName));
      }
      if ((projectConfig.compileHar || projectConfig.compileShared) && resolvedModules[resolvedModules.length - 1] &&
        path.resolve(resolvedModules[resolvedModules.length - 1].resolvedFileName).match(/(\.[^d]|[^\.]d|[^\.][^d])\.e?ts$/)) {
        allResolvedModules.add(resolvedModules[resolvedModules.length - 1].resolvedFileName);
      }
    }
    if (!projectConfig.xtsMode) {
      createOrUpdateCache(resolvedModules, path.resolve(containingFile));
    }
    resolvedModulesCache[path.resolve(containingFile)] = resolvedModules;
    return resolvedModules;
  }
  return resolvedModulesCache[path.resolve(containingFile)];
}

function createOrUpdateCache(resolvedModules: ts.ResolvedModuleFull[], containingFile: string): void {
  const children: string[] = [];
  const error: boolean = false;
  resolvedModules.forEach(moduleObj => {
    if (moduleObj && moduleObj.resolvedFileName && /(?<!\.d)\.(ets|ts)$/.test(moduleObj.resolvedFileName)) {
      const file: string = path.resolve(moduleObj.resolvedFileName);
      const mtimeMs: number = fs.statSync(file).mtimeMs;
      children.push(file);
      const value: CacheFileName = cache[file];
      if (value) {
        value.mtimeMs = mtimeMs;
        value.error = error;
        value.parent = value.parent || [];
        value.parent.push(path.resolve(containingFile));
        value.parent = [...new Set(value.parent)];
      } else {
        cache[file] = { mtimeMs, children: [], parent: [containingFile], error };
      }
    }
  });
  cache[path.resolve(containingFile)] = { mtimeMs: fs.statSync(containingFile).mtimeMs, children,
    parent: cache[path.resolve(containingFile)] && cache[path.resolve(containingFile)].parent ?
      cache[path.resolve(containingFile)].parent : [], error };
}

export function createWatchCompilerHost(rootFileNames: string[],
  reportDiagnostic: ts.DiagnosticReporter, delayPrintLogCount: Function, resetErrorCount: Function,
  isPipe: boolean = false): ts.WatchCompilerHostOfFilesAndCompilerOptions<ts.BuilderProgram> {
  if (projectConfig.hotReload) {
    rootFileNames.forEach(fileName => {
      hotReloadSupportFiles.add(fileName);
    });
  }
  setCompilerOptions();
  const createProgram = ts.createSemanticDiagnosticsBuilderProgram;
  const host = ts.createWatchCompilerHost(
    [...rootFileNames, ...readDeaclareFiles()], compilerOptions,
    ts.sys, createProgram, reportDiagnostic,
    (diagnostic: ts.Diagnostic) => {
      if ([6031, 6032].includes(diagnostic.code)) {
        if (!isPipe) {
          process.env.watchTs = 'start';
          resetErrorCount();
        }
      }
      // End of compilation in watch mode flag.
      if ([6193, 6194].includes(diagnostic.code)) {
        if (!isPipe) {
          process.env.watchTs = 'end';
          if (fastBuildLogger) {
            fastBuildLogger.debug(TS_WATCH_END_MSG);
            tsWatchEmitter.emit(TS_WATCH_END_MSG);
          }
        }
        delayPrintLogCount();
      }
    });
  host.readFile = (fileName: string) => {
    if (!fs.existsSync(fileName)) {
      return undefined;
    }
    if (/(?<!\.d)\.(ets|ts)$/.test(fileName)) {
      let content: string = processContent(fs.readFileSync(fileName).toString(), fileName);
      const extendFunctionInfo: extendInfo[] = [];
      content = instanceInsteadThis(content, fileName, extendFunctionInfo);
      return content;
    }
    return fs.readFileSync(fileName).toString();
  };
  host.resolveModuleNames = resolveModuleNames;
  return host;
}

export function watchChecker(rootFileNames: string[], newLogger: any = null): void {
  fastBuildLogger = newLogger;
  globalProgram.watchProgram = ts.createWatchProgram(
    createWatchCompilerHost(rootFileNames, printDiagnostic, () => {}, () => {}));
}

export function instanceInsteadThis(content: string, fileName: string, extendFunctionInfo: extendInfo[]): string {
  checkUISyntax(content, fileName, extendFunctionInfo);
  extendFunctionInfo.reverse().forEach((item) => {
    const subStr: string = content.substring(item.start, item.end);
    const insert: string = subStr.replace(/(\s)\$(\.)/g, (origin, item1, item2) => {
      return item1 + item.compName + 'Instance' + item2;
    });
    content = content.slice(0, item.start) + insert + content.slice(item.end);
  });
  return content;
}

function getResolveModule(modulePath: string, type): ts.ResolvedModuleFull {
  return {
    resolvedFileName: modulePath,
    isExternalLibraryImport: false,
    extension: type
  };
}

export const dollarCollection: Set<string> = new Set();
export const decoratorParamsCollection: Set<string> = new Set();
export const extendCollection: Set<string> = new Set();
export const importModuleCollection: Set<string> = new Set();

function checkUISyntax(source: string, fileName: string, extendFunctionInfo: extendInfo[]): void {
  if (/\.ets$/.test(fileName)) {
    if (process.env.compileMode === 'moduleJson' ||
      path.resolve(fileName) !== path.resolve(projectConfig.projectPath, 'app.ets')) {
      const sourceFile: ts.SourceFile = ts.createSourceFile(fileName, source,
        ts.ScriptTarget.Latest, true, ts.ScriptKind.ETS);
      parseAllNode(sourceFile, sourceFile, extendFunctionInfo);
      props.push(...dollarCollection, ...decoratorParamsCollection, ...extendCollection);
    }
  }
}

function parseAllNode(node: ts.Node, sourceFileNode: ts.SourceFile, extendFunctionInfo: extendInfo[]): void {
  if (ts.isStructDeclaration(node)) {
    if (node.members) {
      node.members.forEach(item => {
        if (ts.isPropertyDeclaration(item) && ts.isIdentifier(item.name)) {
          const propertyName: string = item.name.getText();
          if (item.decorators && item.decorators.length) {
            for (let i = 0; i < item.decorators.length; i++) {
              const decoratorName: string = item.decorators[i].getText().replace(/\(.*\)$/, '').trim();
              if (INNER_COMPONENT_MEMBER_DECORATORS.has(decoratorName)) {
                dollarCollection.add('$' + propertyName);
              }
              if (isDecoratorCollection(item.decorators[i], decoratorName)) {
                decoratorParamsCollection.add(item.decorators[i].expression.arguments[0].getText());
              }
            }
          }
        }
      });
    }
  }
  if (ts.isMethodDeclaration(node) && node.name.getText() === COMPONENT_BUILD_FUNCTION ||
    (ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node)) &&
    hasDecorator(node, COMPONENT_BUILDER_DECORATOR)) {
    if (node.body && node.body.statements && node.body.statements.length) {
      const checkProp: ts.NodeArray<ts.Statement> = node.body.statements;
      checkProp.forEach((item, index) => {
        traverseBuild(item, index);
      });
    }
  }
  if (ts.isFunctionDeclaration(node) && hasDecorator(node, COMPONENT_EXTEND_DECORATOR)) {
    if (node.body && node.body.statements && node.body.statements.length &&
      !isOriginalExtend(node.body)) {
      extendFunctionInfo.push({start: node.pos, end: node.end, compName: isExtendFunction(node)});
    }
  }
  node.getChildren().forEach((item: ts.Node) => parseAllNode(item, sourceFileNode, extendFunctionInfo));
}

function isForeachAndLzayForEach(node: ts.Node): boolean {
  return ts.isCallExpression(node) && node.expression && ts.isIdentifier(node.expression) &&
    FOREACH_LAZYFOREACH.has(node.expression.escapedText.toString()) && node.arguments && node.arguments[1] &&
    ts.isArrowFunction(node.arguments[1]) && node.arguments[1].body && ts.isBlock(node.arguments[1].body);
}

function traverseBuild(node: ts.Node, index: number): void {
  if (ts.isExpressionStatement(node)) {
    let parentComponentName: string = getName(node);
    if (!INNER_COMPONENT_NAMES.has(parentComponentName) && node.parent && node.parent.statements && index >= 1 &&
      node.parent.statements[index - 1].expression && node.parent.statements[index - 1].expression.expression) {
      parentComponentName = node.parent.statements[index - 1].expression.expression.escapedText;
    }
    node = node.expression;
    if (ts.isEtsComponentExpression(node) && node.body && ts.isBlock(node.body) &&
      ts.isIdentifier(node.expression) && !$$_BLOCK_INTERFACE.has(node.expression.escapedText.toString())) {
      node.body.statements.forEach((item: ts.Statement, indexBlock: number) => {
        traverseBuild(item, indexBlock);
      });
    } else if (isForeachAndLzayForEach(node)) {
      node.arguments[1].body.statements.forEach((item: ts.Statement, indexBlock: number) => {
        traverseBuild(item, indexBlock);
      });
    } else {
      loopNodeFindDoubleDollar(node, parentComponentName);
    }
  } else if (ts.isIfStatement(node)) {
    if (node.thenStatement && ts.isBlock(node.thenStatement) && node.thenStatement.statements) {
      node.thenStatement.statements.forEach((item, indexIfBlock) => {
        traverseBuild(item, indexIfBlock);
      });
    }
    if (node.elseStatement && ts.isBlock(node.elseStatement) && node.elseStatement.statements) {
      node.elseStatement.statements.forEach((item, indexElseBlock) => {
        traverseBuild(item, indexElseBlock);
      });
    }
  }
}

function isPropertiesAddDoubleDollar(node: ts.Node): boolean {
  if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.arguments && node.arguments.length) {
    return true;
  } else if (ts.isEtsComponentExpression(node) && node.body && ts.isBlock(node.body) &&
    ts.isIdentifier(node.expression) && $$_BLOCK_INTERFACE.has(node.expression.escapedText.toString())) {
    return true;
  } else {
    return false;
  }
}
function loopNodeFindDoubleDollar(node: ts.Node, parentComponentName: string): void {
  while (node) {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const argument: ts.NodeArray<ts.Node> = node.arguments;
      const propertyName: ts.Identifier | ts.PrivateIdentifier = node.expression.name;
      if (isCanAddDoubleDollar(propertyName.getText(), parentComponentName)) {
        argument.forEach((item: ts.Node) => {
          doubleDollarCollection(item);
        });
      }
    } else if (isPropertiesAddDoubleDollar(node)) {
      node.arguments.forEach((item: ts.Node) => {
        if (ts.isObjectLiteralExpression(item) && item.properties && item.properties.length) {
          item.properties.forEach((param: ts.Node) => {
            if (isObjectPram(param, parentComponentName)) {
              doubleDollarCollection(param.initializer);
            }
          });
        }
        if (STYLE_ADD_DOUBLE_DOLLAR.has(node.expression.getText()) && ts.isPropertyAccessExpression(item)) {
          doubleDollarCollection(item);
        }
      });
    }
    node = node.expression;
  }
}

function doubleDollarCollection(item: ts.Node): void {
  if (item.getText().startsWith($$)) {
    while (item.expression) {
      item = item.expression;
    }
    dollarCollection.add(item.getText());
  }
}

function isObjectPram(param: ts.Node, parentComponentName:string): boolean {
  return ts.isPropertyAssignment(param) && param.name && ts.isIdentifier(param.name) &&
    param.initializer && PROPERTIES_ADD_DOUBLE_DOLLAR.has(parentComponentName) &&
    PROPERTIES_ADD_DOUBLE_DOLLAR.get(parentComponentName).has(param.name.getText());
}

function isCanAddDoubleDollar(propertyName: string, parentComponentName: string): boolean {
  return PROPERTIES_ADD_DOUBLE_DOLLAR.has(parentComponentName) &&
    PROPERTIES_ADD_DOUBLE_DOLLAR.get(parentComponentName).has(propertyName) ||
    STYLE_ADD_DOUBLE_DOLLAR.has(propertyName);
}

function isDecoratorCollection(item: ts.Decorator, decoratorName: string): boolean {
  return COMPONENT_DECORATORS_PARAMS.has(decoratorName) &&
    // @ts-ignore
    item.expression.arguments && item.expression.arguments.length &&
    // @ts-ignore
    ts.isIdentifier(item.expression.arguments[0]);
}

function processContent(source: string, id: string): string {
  if (fastBuildLogger) {
    source = visualTransform(source, id, fastBuildLogger);
  }
  source = preprocessExtend(source, extendCollection);
  source = preprocessNewExtend(source, extendCollection);
  return source;
}

function judgeFileShouldResolved(file: string, shouldResolvedFiles: Set<string>): void {
  if (shouldResolvedFiles.has(file)) {
    return;
  }
  shouldResolvedFiles.add(file);
  if (cache && cache[file] && cache[file].parent) {
    cache[file].parent.forEach((item) => {
      judgeFileShouldResolved(item, shouldResolvedFiles);
    });
    cache[file].parent = [];
  }
  if (cache && cache[file] && cache[file].children) {
    cache[file].children.forEach((item) => {
      judgeFileShouldResolved(item, shouldResolvedFiles);
    });
    cache[file].children = [];
  }
}

export function incrementWatchFile(watchModifiedFiles: string[],
  watchRemovedFiles: string[]): void {
  const changedFiles: string[] = [...watchModifiedFiles, ...watchRemovedFiles];
  if (changedFiles.length) {
    shouldResolvedFiles.clear();
  }
  changedFiles.forEach((file) => {
    judgeFileShouldResolved(file, shouldResolvedFiles);
  });
}
