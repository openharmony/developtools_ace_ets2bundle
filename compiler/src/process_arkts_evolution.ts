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

import fs from 'fs';
import path from 'path';
import ts from 'typescript';

import {
  EXTNAME_ETS,
  EXTNAME_D_ETS,
  ARKTS_1_0,
  ARKTS_1_1,
  ARKTS_1_2,
  ARKTS_HYBRID,
  SUPER_ARGS
} from './pre_define';
import {
  toUnixPath,
  mkdirsSync,
  IFileLog,
  LogType
} from './utils';
import {
  red,
  reset
} from './fast_build/ark_compiler/common/ark_define';
import { getPkgInfo } from './ark_utils';
import createAstNodeUtils from './create_ast_node_utils';
import {
  LogData,
  LogDataFactory
} from './fast_build/ark_compiler/logger';
import {
  ArkTSErrorDescription,
  ErrorCode
} from './fast_build/ark_compiler/error_code';

interface DeclFileConfig {
  declPath: string;
  ohmUrl: string;
}

interface DeclFilesConfig {
  packageName: string;
  files: {
    [filePath: string]: DeclFileConfig;
  }
}

export interface ArkTSEvolutionModule {
  language: string; // "1.1" | "1.2"
  packageName: string;
  moduleName: string;
  modulePath: string;
  declgenV1OutPath?: string;
  declgenV2OutPath?: string;
  declgenBridgeCodePath?: string;
  declFilesPath?: string;
}

interface ResolvedFileInfo {
  moduleRequest: string;
  resolvedFileName: string;
}

export const interopTransformLog: IFileLog = new createAstNodeUtils.FileLog();

export let pkgDeclFilesConfig: { [pkgName: string]: DeclFilesConfig } = {};

export let arkTSModuleMap: Map<string, ArkTSEvolutionModule> = new Map();

export let arkTSEvolutionModuleMap: Map<string, ArkTSEvolutionModule> = new Map();

export let arkTSHybridModuleMap: Map<string, ArkTSEvolutionModule> = new Map();

let arkTSEvoFileOHMUrlMap: Map<string, string> = new Map();

let declaredClassVars: Set<string> = new Set();

export function addDeclFilesConfig(filePath: string, projectConfig: Object, logger: Object,
  pkgPath: string, pkgName: string): void {
  const { projectFilePath, pkgInfo } = getPkgInfo(filePath, projectConfig, logger, pkgPath, pkgName);
  const declgenV2OutPath: string = getDeclgenV2OutPath(pkgName);
  if (!declgenV2OutPath) {
    return;
  }
  if (!pkgDeclFilesConfig[pkgName]) {
    pkgDeclFilesConfig[pkgName] = { packageName: pkgName, files: {} };
  }
  if (pkgDeclFilesConfig[pkgName].files[projectFilePath]) {
    return;
  }
  const isSO: string = pkgInfo.isSO ? 'Y' : 'N';
  // The module name of the entry module of the project during the current compilation process.
  const mainModuleName: string = projectConfig.mainModuleName;
  const bundleName: string = projectConfig.bundleName;
  const normalizedFilePath: string = `${pkgName}/${projectFilePath}`;
  const declPath: string = path.join(toUnixPath(declgenV2OutPath), projectFilePath) + EXTNAME_D_ETS;
  const ohmUrl: string = `${isSO}&${mainModuleName}&${bundleName}&${normalizedFilePath}&${pkgInfo.version}`;
  pkgDeclFilesConfig[pkgName].files[projectFilePath] = { declPath, ohmUrl: `@normalized:${ohmUrl}` };
}

export function getArkTSEvoDeclFilePath(resolvedFileInfo: ResolvedFileInfo): string {
  const { moduleRequest, resolvedFileName } = resolvedFileInfo;
  let arktsEvoDeclFilePath: string = moduleRequest;
  const combinedMap = new Map([...arkTSEvolutionModuleMap, ...arkTSHybridModuleMap]);
  for (const [pkgName, arkTSEvolutionModuleInfo] of combinedMap) {
    const declgenV1OutPath: string = toUnixPath(arkTSEvolutionModuleInfo.declgenV1OutPath);
    const modulePath: string = toUnixPath(arkTSEvolutionModuleInfo.modulePath);
    const declgenBridgeCodePath: string = toUnixPath(arkTSEvolutionModuleInfo.declgenBridgeCodePath);
    if (resolvedFileName && resolvedFileName.startsWith(modulePath + '/') &&
      !resolvedFileName.startsWith(declgenBridgeCodePath + '/')) {
      arktsEvoDeclFilePath = resolvedFileName
        .replace(modulePath, toUnixPath(path.join(declgenV1OutPath, pkgName)))
        .replace(EXTNAME_ETS, EXTNAME_D_ETS);
      break;
    }
    if (moduleRequest === pkgName) {
      arktsEvoDeclFilePath = path.join(declgenV1OutPath, pkgName, 'Index.d.ets');
      break;
    }
    if (moduleRequest.startsWith(pkgName + '/')) {
      arktsEvoDeclFilePath = moduleRequest.replace(
        pkgName,
        toUnixPath(path.join(declgenV1OutPath, pkgName, 'src/main/ets'))
      ) + EXTNAME_D_ETS;
      break;
    }
  }
  return arktsEvoDeclFilePath;
}

export function collectArkTSEvolutionModuleInfo(share: Object): void {
  if (!share.projectConfig.useNormalizedOHMUrl) {
    share.throwArkTsCompilerError(red, 'ArkTS:ERROR: Failed to compile mixed project.\n' +
          'Error Message: Failed to compile mixed project because useNormalizedOHMUrl is false.\n' +
          'Solutions: > Check whether useNormalizedOHMUrl is true.', reset);
  }
  // dependentModuleMap Contents eg.
  // 1.2 hap -> 1.1 har: It contains the information of 1.1 har
  // 1.1 hap -> 1.2 har -> 1.1 har : There is information about 3 modules.

  const throwCollectionError = (pkgName: string): void => {
    share.throwArkTsCompilerError(red, 'ArkTS:INTERNAL ERROR: Failed to collect arkTs evolution module info.\n' +
      `Error Message: Failed to collect arkTs evolution module "${pkgName}" info from rollup.`, reset);
  };

  for (const [pkgName, dependentModuleInfo] of share.projectConfig.dependentModuleMap) {
    switch (dependentModuleInfo.language) {
      case ARKTS_1_2:
        if (dependentModuleInfo.declgenV1OutPath && dependentModuleInfo.declgenBridgeCodePath) {
          arkTSEvolutionModuleMap.set(pkgName, dependentModuleInfo);
        } else {
          throwCollectionError(pkgName);
        }
        break;
      case ARKTS_HYBRID:
        if (dependentModuleInfo.declgenV2OutPath && dependentModuleInfo.declFilesPath && dependentModuleInfo.declgenBridgeCodePath) {
          arkTSHybridModuleMap.set(pkgName, dependentModuleInfo);
        } else {
          throwCollectionError(pkgName);
        }
        break;
      case ARKTS_1_1:
      case ARKTS_1_0:
        if (dependentModuleInfo.declgenV2OutPath && dependentModuleInfo.declFilesPath) {
          arkTSModuleMap.set(pkgName, dependentModuleInfo);
        } else {
          throwCollectionError(pkgName);
        }
        break;
    }
  }
}

export function cleanUpProcessArkTSEvolutionObj(): void {
  arkTSModuleMap = new Map();
  arkTSEvolutionModuleMap = new Map();
  arkTSHybridModuleMap = new Map();
  pkgDeclFilesConfig = {};
  arkTSEvoFileOHMUrlMap = new Map();
  interopTransformLog.cleanUp();
  declaredClassVars = new Set();
}

export async function writeBridgeCodeFileSyncByNode(node: ts.SourceFile, moduleId: string,
  metaInfo: Object): Promise<void> {
  const printer: ts.Printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const writer: ts.EmitTextWriter = ts.createTextWriter(
    // @ts-ignore
    ts.getNewLineCharacter({ newLine: ts.NewLineKind.LineFeed, removeComments: false }));
    printer.writeFile(node, writer, undefined);
  const cacheFilePath: string = genCachePathForBridgeCode(moduleId, metaInfo);
  mkdirsSync(path.dirname(cacheFilePath));
  fs.writeFileSync(cacheFilePath, writer.getText());
}

export function genCachePathForBridgeCode(moduleId: string, metaInfo: Object, cachePath?: string): string {
  const bridgeCodePath: string = getDeclgenBridgeCodePath(metaInfo.pkgName);
  const filePath: string = toUnixPath(moduleId);
  const relativeFilePath: string = filePath.replace(
    toUnixPath(path.join(bridgeCodePath, metaInfo.pkgName)), metaInfo.moduleName);
  const cacheFilePath: string = path.join(cachePath ? cachePath : process.env.cachePath, relativeFilePath);
  return cacheFilePath;
}

export function getDeclgenBridgeCodePath(pkgName: string): string {
  const combinedMap = new Map([...arkTSEvolutionModuleMap, ...arkTSHybridModuleMap]);
  if (combinedMap.size && combinedMap.get(pkgName)) {
    const arkTSEvolutionModuleInfo: ArkTSEvolutionModule = combinedMap.get(pkgName);
    return arkTSEvolutionModuleInfo.declgenBridgeCodePath;
  }
  return '';
}

function getDeclgenV2OutPath(pkgName: string): string {
  const combinedMap = new Map([...arkTSModuleMap, ...arkTSHybridModuleMap]);
  if (combinedMap.size && combinedMap.get(pkgName)) {
    const arkTsModuleInfo: ArkTSEvolutionModule = combinedMap.get(pkgName);
    return arkTsModuleInfo.declgenV2OutPath;
  }
  return '';
}

export function isArkTSEvolutionFile(filePath: string, metaInfo: Object): boolean {
  if (metaInfo.language === ARKTS_1_0 || metaInfo.language === ARKTS_1_1) {
    return false;
  }

  if (metaInfo.language === ARKTS_1_2) {
    return true;
  }

  if (metaInfo.language === ARKTS_HYBRID || arkTSHybridModuleMap.has(metaInfo.pkgName)) {
    const hybridModule = arkTSHybridModuleMap.get(metaInfo.pkgName);
    if (!hybridModule) {
      return false;
    }

    const normalizedFilePath = toUnixPath(filePath);
    const staticFileList = hybridModule.staticFiles || [];
    
    return new Set(staticFileList.map(toUnixPath)).has(normalizedFilePath);
  }

  return false;
}

export function interopTransform(program: ts.Program, id: string, mixCompile: boolean): ts.TransformerFactory<ts.SourceFile> {
  if (!mixCompile || /\.ts$/.test(id)) {
    return () => sourceFile => sourceFile;
  }
  // For specific scenarios, please refer to the test file process_arkts_evolution.test.ts
  const typeChecker: ts.TypeChecker = program.getTypeChecker();
  return (context: ts.TransformationContext): ts.Transformer<ts.SourceFile> => {
    const scopeUsedNames: WeakMap<ts.Node, Set<string>> = new WeakMap<ts.Node, Set<string>>();
    const fullNameToTmpVar: Map<string, string> = new Map();
    const globalDeclarations: Map<string, ts.Statement> = new Map();
    return (rootNode: ts.SourceFile) => {
      interopTransformLog.sourceFile = rootNode;
      const classToInterfacesMap: Map<ts.ClassDeclaration, Set<string>> = collectInterfacesMap(rootNode, typeChecker);
      // Support for creating 1.2 type object literals in 1.1 modules
      const visitor: ts.Visitor =
        createObjectLiteralVisitor(rootNode, context, typeChecker, scopeUsedNames, fullNameToTmpVar, globalDeclarations);
      const processNode: ts.SourceFile = ts.visitEachChild(rootNode, visitor, context);
      // Support 1.1 classes to implement 1.2 interfaces
      const withHeritage: ts.SourceFile = classToInterfacesMap.size > 0 ?
        ts.visitEachChild(processNode, transformHeritage(context, classToInterfacesMap), context) : processNode;

      const importStmts: ts.ImportDeclaration[] = withHeritage.statements.filter(stmt => ts.isImportDeclaration(stmt));
      const otherStmts: ts.Statement[] = withHeritage.statements.filter(stmt => !ts.isImportDeclaration(stmt));
      const globalStmts: ts.Statement[] = Array.from(globalDeclarations.values());

      return ts.factory.updateSourceFile(
        withHeritage,
        [...importStmts, ...globalStmts, ...otherStmts],
        withHeritage.isDeclarationFile,
        withHeritage.referencedFiles,
        withHeritage.typeReferenceDirectives,
        withHeritage.hasNoDefaultLib,
        withHeritage.libReferenceDirectives
      );
    };
  };
}

function isFromArkTSEvolutionModule(node: ts.Node): boolean {
  const sourceFile: ts.SourceFile = node.getSourceFile();
  const filePath: string = toUnixPath(sourceFile.fileName);
  const combinedMap = new Map([...arkTSEvolutionModuleMap, ...arkTSHybridModuleMap]);
  for (const arkTSEvolutionModuleInfo of combinedMap.values()) {
    const declgenV1OutPath: string = toUnixPath(arkTSEvolutionModuleInfo.declgenV1OutPath);
    if (filePath.startsWith(declgenV1OutPath + '/')) {
      const relative: string = filePath.replace(declgenV1OutPath + '/', '').replace(/\.d\.ets$/, '');
      if (!arkTSEvoFileOHMUrlMap.has(filePath)) {
        arkTSEvoFileOHMUrlMap.set(filePath, relative);
      }
      return true;
    }
  }
  return false;
}

function createObjectLiteralVisitor(rootNode: ts.SourceFile, context: ts.TransformationContext, typeChecker: ts.TypeChecker,
  scopeUsedNames: WeakMap<ts.Node, Set<string>>, fullNameToTmpVar: Map<string, string>,
  globalDeclarations: Map<string, ts.Statement>): ts.Visitor {
  return function visitor(node: ts.SourceFile): ts.SourceFile {
    if (!ts.isObjectLiteralExpression(node)) {
      return ts.visitEachChild(node, visitor, context);
    }

    const contextualType: ts.Type | undefined = typeChecker.getContextualType(node);
    if (!contextualType) {
      return ts.visitEachChild(node, visitor, context);
    }
    const isRecordType: boolean = contextualType.aliasSymbol?.escapedName === 'Record' &&
      (typeof typeChecker.isStaticRecord === 'function' && typeChecker.isStaticRecord(contextualType));
    const finalType: ts.Type = unwrapType(node, contextualType);
    const decl : ts.Declaration = (finalType.symbol?.declarations || finalType.aliasSymbol?.declarations)?.[0];
    
    let className: string;
    let tmpObjName: string;
    if (!isRecordType) {
      if (!decl || !isFromArkTSEvolutionModule(decl)) {
        return ts.visitEachChild(node, visitor, context);
      }
      className = finalType.symbol?.name || finalType.aliasSymbol?.name;
      if (!className) {
        return ts.visitEachChild(node, visitor, context);
      }

      if (ts.isClassDeclaration(decl) && !hasZeroArgConstructor(decl, className)) {
        return ts.visitEachChild(node, visitor, context);
      }
      tmpObjName = getUniqueName(rootNode, 'tmpObj', scopeUsedNames);
      declareGlobalTemp(tmpObjName, globalDeclarations);
    }
    
    const fullName: string = buildFullClassName(decl, finalType, className, isRecordType);
    const getCtorExpr: ts.Expression = buildGetConstructorCall(fullName, isRecordType);
    let tmpClassName: string;
    if (fullNameToTmpVar.has(fullName)) {
      tmpClassName = fullNameToTmpVar.get(fullName)!;
    } else {
      tmpClassName = getUniqueName(rootNode, isRecordType ? 'tmpRecord' : 'tmpClass', scopeUsedNames);
      fullNameToTmpVar.set(fullName, tmpClassName);
      declareGlobalTemp(tmpClassName, globalDeclarations, getCtorExpr);
    }

    return ts.factory.createParenthesizedExpression(
      ts.factory.createCommaListExpression(buildCommaExpressions(node, isRecordType, tmpObjName, tmpClassName)));
  };
}

function unwrapType(node: ts.SourceFile, type: ts.Type): ts.Type {
  // Unwrap parenthesized types recursively
  if ((type.flags & ts.TypeFlags.Parenthesized) && 'type' in type) {
    return unwrapType(node, (type as ts.ParenthesizedType).type);
  }

  // If union, pick the unique viable type
  if (type.isUnion()) {
    const arkTSEvolutionTypes: ts.Type[] = [];

    for (const tpye of type.types) {
      const symbol: ts.Symbol = tpye.aliasSymbol || tpye.getSymbol();
      const decls: ts.Declaration[] = symbol?.declarations;
      if (!decls || decls.length === 0) {
        continue;
      }

      const isArkTSEvolution: boolean = decls.some(decl => isFromArkTSEvolutionModule(decl));
      if (isArkTSEvolution) {
        arkTSEvolutionTypes.push(tpye);
      }
    }
    if (arkTSEvolutionTypes.length === 0) {
      return type;
    }
    if (arkTSEvolutionTypes.length !== 1 || type.types.length > 1) {
      const candidates: string = arkTSEvolutionTypes.map(tpye => tpye.symbol?.name || '(anonymous)').join(', ');
      const errInfo: LogData = LogDataFactory.newInstance(
        ErrorCode.ETS2BUNDLE_EXTERNAL_UNION_TYPE_AMBIGUITY,
        ArkTSErrorDescription,
        `Ambiguous union type: multiple valid ArkTSEvolution types found: [${candidates}].`,
        '',
        ['Please use type assertion as to disambiguate.']
      );
      interopTransformLog.errors.push({
        type: LogType.ERROR,
        message: errInfo.toString(),
        pos: node.getStart()
      });
      return type;
    }
    return unwrapType(node, arkTSEvolutionTypes[0]);
  }
  return type;
}

function hasZeroArgConstructor(decl: ts.ClassDeclaration, className: string): boolean {
  const ctors = decl.members.filter(member =>
    ts.isConstructorDeclaration(member) || ts.isConstructSignatureDeclaration(member));
  const hasZeroArgCtor: boolean = ctors.length === 0 || ctors.some(ctor => ctor.parameters.length === 0);
  if (!hasZeroArgCtor) {
    const errInfo: LogData = LogDataFactory.newInstance(
      ErrorCode.ETS2BUNDLE_EXTERNAL_CLASS_HAS_NO_CONSTRUCTOR_WITHOUT_ARGS,
      ArkTSErrorDescription,
      `The class "${className}" does not has no no-argument constructor.`,
      '',
      [
        'Please confirm whether there is a no-argument constructor ' +
        `in the ArkTS Evolution class "${className}" type in the object literal.`
      ]
    );
    interopTransformLog.errors.push({
      type: LogType.ERROR,
      message: errInfo.toString(),
      pos: decl.name?.getStart() ?? decl.getStart()
    });
    return false;
  }
  return hasZeroArgCtor;
}

function buildFullClassName(decl: ts.Declaration, finalType: ts.Type, className: string, isRecordType: boolean): string {
  if (isRecordType) {
    return 'Lescompat/Record;';
  }
  const basePath: string = getArkTSEvoFileOHMUrl(finalType);
  return ts.isInterfaceDeclaration(decl) ? 
    `L${basePath}/${basePath.split('/').join('$')}$${className}$ObjectLiteral;` :
    `L${basePath}/${className};`;
}

function buildGetConstructorCall(fullName: string, isRecord: boolean): ts.Expression {
  return ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('globalThis'),
      isRecord ? 'Panda.getInstance' : 'Panda.getClass'),
    undefined,
    [ts.factory.createStringLiteral(fullName)]
  );
}

function buildPropertyAssignments(node: ts.ObjectLiteralExpression, tmpObjName: string,
  usePropertyAccess: boolean = true): ts.Expression[] {
  return node.properties.map(property => {
    if (!ts.isPropertyAssignment(property)) { 
      return undefined;
    }
    const key = property.name;
    const target = usePropertyAccess && ts.isIdentifier(key) ?
      ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(tmpObjName), key) :
      ts.factory.createElementAccessExpression(ts.factory.createIdentifier(tmpObjName),
        ts.isIdentifier(key) ? ts.factory.createStringLiteral(key.text) : key);
    return ts.factory.createAssignment(target, property.initializer);
  }).filter(Boolean) as ts.Expression[];
}

function buildCommaExpressions(node: ts.ObjectLiteralExpression, isRecordType: boolean,
  tmpObjName: string, tmpClassName: string): ts.Expression[] {
  const assignments: ts.Expression[] =
    buildPropertyAssignments(node, isRecordType ? tmpClassName : tmpObjName, !isRecordType);

  if (isRecordType) {
    return [...assignments, ts.factory.createIdentifier(tmpClassName)];
  }

  return [
    ts.factory.createAssignment(
      ts.factory.createIdentifier(tmpObjName),
      ts.factory.createNewExpression(ts.factory.createIdentifier(tmpClassName), undefined, [])
    ),
    ...assignments,
    ts.factory.createIdentifier(tmpObjName)
  ];
}

function getArkTSEvoFileOHMUrl(contextualType: ts.Type): string {
  const decl: ts.Declaration = (contextualType.symbol?.declarations || contextualType.aliasSymbol?.declarations)?.[0];
  if (!decl) {
    return '';
  }
  const sourceFilePath: string = toUnixPath(decl.getSourceFile().fileName);
  return arkTSEvoFileOHMUrlMap.get(sourceFilePath);
}

function getUniqueName(scope: ts.Node, base: string, usedNames: WeakMap<ts.Node, Set<string>>): string {
  if (!usedNames.has(scope)) {
    usedNames.set(scope, new Set());
  }
  const used: Set<string> = usedNames.get(scope)!;
  let name: string = base;
  let counter: number = 1;
  while (used.has(name)) {
    name = `${base}_${counter++}`;
  }
  used.add(name);
  return name;
}

function declareGlobalTemp(name: string, globalDeclarations: Map<string, ts.Statement>, initializer?: ts.Expression): ts.Statement {
  if (initializer && declaredClassVars.has(name)) {
    return globalDeclarations.get(name)!;
  }

  if (!globalDeclarations.has(name)) {
    const decl = ts.factory.createVariableStatement(undefined,
      ts.factory.createVariableDeclarationList(
        [ts.factory.createVariableDeclaration(name, undefined, undefined, initializer)], ts.NodeFlags.Let));
    globalDeclarations.set(name, decl);
    if (initializer) {
      declaredClassVars.add(name);
    }
  }

  return globalDeclarations.get(name)!;
}

function collectInterfacesMap(rootNode: ts.Node, checker: ts.TypeChecker): Map<ts.ClassDeclaration, Set<string>> {
  const classToInterfacesMap = new Map<ts.ClassDeclaration, Set<string>>();
  ts.forEachChild(rootNode, function visit(node) {
    if (ts.isClassDeclaration(node)) {
      const interfaces = new Set<string>();
      const visited = new Set<ts.Type>();
      collectDeepInheritedInterfaces(node, checker, visited, interfaces);
      if (interfaces.size > 0) {
        classToInterfacesMap.set(node, interfaces);
      }
    }
    ts.forEachChild(node, visit);
  });
  return classToInterfacesMap;
}

function collectDeepInheritedInterfaces(node: ts.ClassDeclaration | ts.InterfaceDeclaration,
  checker: ts.TypeChecker, visited: Set<ts.Type>, interfaces: Set<string>): void {
  const heritageClauses = node.heritageClauses;
  if (!heritageClauses) {
    return;
  }

  for (const clause of heritageClauses) {
    for (const exprWithTypeArgs of clause.types) {
      const type = checker.getTypeAtLocation(exprWithTypeArgs.expression);
      collectDeepInheritedInterfacesFromType(type, checker, visited, interfaces);
    }
  }
}

function collectDeepInheritedInterfacesFromType(type: ts.Type, checker: ts.TypeChecker,
  visited: Set<ts.Type>, interfaces: Set<string>): void {
  if (visited.has(type)) {
    return;
  }
  visited.add(type);
  const decls: ts.Declaration[] = type.symbol?.declarations;
  const isArkTSEvolution: boolean = decls?.some(decl => isFromArkTSEvolutionModule(decl));
  if (isArkTSEvolution) {
    const ifacePath: string = getArkTSEvoFileOHMUrl(type);
    interfaces.add(`L${ifacePath}/${type.symbol.name};`);
  }
  const baseTypes: ts.BaseType[] = checker.getBaseTypes(type as ts.InterfaceType) ?? [];
  for (const baseType of baseTypes) {
    collectDeepInheritedInterfacesFromType(baseType, checker, visited, interfaces);
  }

  if (decls) {
    for (const decl of decls) {
      if (ts.isClassDeclaration(decl) || ts.isInterfaceDeclaration(decl)) {
        collectDeepInheritedInterfaces(decl, checker, visited, interfaces);
      }
    }
  }
}

function transformHeritage(context: ts.TransformationContext,
  classToInterfacesMap: Map<ts.ClassDeclaration, Set<string>>): ts.Visitor {
  return function visitor(node: ts.SourceFile): ts.SourceFile {
    if (ts.isClassDeclaration(node) && classToInterfacesMap.has(node)) {
      const interfaceNames = classToInterfacesMap.get(node)!;
      const updatedMembers = injectImplementsInConstructor(node, interfaceNames);
      return ts.factory.updateClassDeclaration(node, node.modifiers, node.name, node.typeParameters,
        node.heritageClauses, updatedMembers);
    }
    return ts.visitEachChild(node, visitor, context);
  };
}

function injectImplementsInConstructor(node: ts.ClassDeclaration, interfaceNames: Set<string>): ts.ClassElement[] {
  const members: ts.ClassElement[] = [...node.members];
  const params: ts.ParameterDeclaration[] = [];
  const needSuper: boolean =
      node.heritageClauses?.some(clause => clause.token === ts.SyntaxKind.ExtendsKeyword) || false;
  const injectStatement: ts.ExpressionStatement[] = [
    ts.factory.createExpressionStatement(
      ts.factory.createStringLiteral(`implements static:${(Array.from(interfaceNames)).join(',')}`)
    )
  ];
  const ctorDecl: ts.ConstructorDeclaration | undefined =
    members.find(element => ts.isConstructorDeclaration(element)) as ts.ConstructorDeclaration | undefined;
  if (ctorDecl) {
    const newCtorDecl: ts.ConstructorDeclaration = ts.factory.updateConstructorDeclaration(
      ctorDecl, ctorDecl.modifiers, ctorDecl.parameters,
      ts.factory.updateBlock(
        ctorDecl.body ?? ts.factory.createBlock([], true),
        [...injectStatement, ...(ctorDecl.body?.statements ?? [])]
      )
    );
    const index: number = members.indexOf(ctorDecl);
    members.splice(index, 1, newCtorDecl);
  } else {
    addSuper(needSuper, injectStatement, params);
    const newCtorDecl: ts.ConstructorDeclaration = ts.factory.createConstructorDeclaration(
      undefined, params,
      ts.factory.createBlock([...injectStatement], true)
    );
    members.push(newCtorDecl);
  }
  return members;
}

function addSuper(needSuper: boolean, injectStatement: ts.ExpressionStatement[],
  params: ts.ParameterDeclaration[]): void {
  if (needSuper) {
    injectStatement.push(
          ts.factory.createExpressionStatement(
            ts.factory.createCallExpression(
              ts.factory.createSuper(), undefined, [ts.factory.createSpreadElement(ts.factory.createIdentifier(SUPER_ARGS))])
          )
        );
    params.push(
      ts.factory.createParameterDeclaration(
        undefined,
        ts.factory.createToken(ts.SyntaxKind.DotDotDotToken),
        ts.factory.createIdentifier(SUPER_ARGS),
        undefined,
        undefined,
        undefined)
    );
  }
}
