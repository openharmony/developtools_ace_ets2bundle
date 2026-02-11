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
import path from 'path';
import fs from 'fs';

const CLASS_DECLARATION_KEYWORDS = [
  /\bpackage\b/,
  /\bclass\b/,
  /\binterface\b/,
  /\benum\b/,
  /\btype\b/,
  /\bnamespace\b/,
  /\brecord\b/,
  /\bextends\b/,
  /\bimplements\b/,
  /\bfinal\b/,
  /\babstract\b/,
  /\binternal\b/
];

interface ObfuscationErrorCodeInfo {
  code: string;
  description: string;
  cause: string;
  position: string;
  solutions: string[];
}

interface RuleOptions {
  enable: boolean;
  rules: string[];
}

interface SelfConfig {
  ruleOptions: RuleOptions;
}

interface ObfuscationOptions {
  obfuscationCacheDir?: string;
  selfConfig: SelfConfig;
}

interface ProjectConfig {
  obfuscationOptions?: ObfuscationOptions;
}

interface ProcessContext {
  skipUntilDirective: boolean;
  pendingNameCacheLine: string;
  inKeepDirective: boolean;
  keepDirectiveLines: string[];
}

interface ProcessResult {
  output?: string;
  context: ProcessContext;
}

type PrintObfLogger = (errorInfo: string, errorCodeInfo: ObfuscationErrorCodeInfo, level: string) => void;

export function filterStaticObfuscationConfig(projectConfig: ProjectConfig, 
    printObfLogger: PrintObfLogger): void {
    const obfuscationOptions = projectConfig.obfuscationOptions;
    if (!obfuscationOptions) {
      return;
    }
    const selfConfig = obfuscationOptions?.selfConfig;
    const ruleOptions = selfConfig.ruleOptions;
    const enableObfuscation: boolean = ruleOptions.enable;
    if (!enableObfuscation) {
      return;
    }
    const obfuscationCacheDir = obfuscationOptions.obfuscationCacheDir;
    if (!obfuscationCacheDir) {
      return;
    }
    if (!fs.existsSync(obfuscationCacheDir)) {
      fs.mkdirSync(obfuscationCacheDir, { recursive: true });
    }
    projectConfig.obfuscationOptions.selfConfig.ruleOptions.rules = ruleOptions.rules.map((configPath: string) =>
      filterStaticConfigByPath(configPath, obfuscationCacheDir, printObfLogger)
    );
}

function hasKeepDts(content: string): boolean {
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.includes('-keep-dts')) {
      if (!trimmedLine.startsWith('#')) {
        return true;
      }
    }
  }
  return false;
}

function filterStaticConfigByPath(configPath: string, obfuscationCacheDir: string,
  printObfLogger: PrintObfLogger): string {
  const newPath = path.join(obfuscationCacheDir, path.basename(configPath));
  try {
    const fileContent = fs.readFileSync(configPath, 'utf-8');
    if (!hasKeepDts(fileContent)) {
      return configPath;
    }
    const cleanedContent = cleanObfuscationRules(fileContent, configPath);
    fs.writeFileSync(newPath, cleanedContent);
  } catch (err) {
    const errorInfo = `Failed to open ${configPath}. Error message: ${err}`;
    const errorCodeInfo = {
      code: '10804001',
      description: 'ArkTS compiler Error',
      cause: `Failed to open obfuscation config file from ${configPath}. Error message: ${err}`,
      position: configPath,
      solutions: [`Please check whether ${configPath} exists.`],
    };
    printObfLogger(errorInfo, errorCodeInfo, 'error');
  }
  return newPath;
}

function cleanObfuscationRules(content: string, configPath: string): string {
  const lines = content.split(/\r?\n/);
  const result: string[] = [];
  const configDir = path.dirname(configPath);
  let skipUntilDirective = false;
  let pendingNameCacheLine = '';
  let pendingKeepLine = '';

  for (const line of lines) {
    const processedLine = processObfuscationRuleLine(line, configDir, skipUntilDirective, pendingNameCacheLine, pendingKeepLine);
    skipUntilDirective = processedLine.skipUntilDirective;
    pendingNameCacheLine = processedLine.pendingNameCacheLine;
    pendingKeepLine = processedLine.pendingKeepLine;
    if (processedLine.output) {
      result.push(processedLine.output);
    }
  }
  return result.join('\n');
}

interface ProcessLineResult {
  output?: string;
  skipUntilDirective: boolean;
  pendingNameCacheLine: string;
  pendingKeepLine: string;
}

function createProcessLineResult(
  skipUntilDirective: boolean,
  pendingNameCacheLine: string = '',
  pendingKeepLine: string = '',
  output?: string
): ProcessLineResult {
  return { skipUntilDirective, pendingNameCacheLine, pendingKeepLine, output };
}

function processObfuscationRuleLine(line: string, configDir: string, skipUntilDirective: boolean, pendingNameCacheLine: string, pendingKeepLine: string): ProcessLineResult {
  const effectiveLine = line.trimStart();
  const isNewDirective = effectiveLine.startsWith('-');
  const combinedLine = pendingNameCacheLine ? `${pendingNameCacheLine} ${effectiveLine}` : effectiveLine;

  if (skipUntilDirective) {
    if (isNewDirective) {
      skipUntilDirective = false;
    } else {
      return createProcessLineResult(true, '', '', undefined);
    }
  }

  if (pendingNameCacheLine) {
    const processed = processNameCacheLine(combinedLine, configDir, line);
    return createProcessLineResult(false, '', '', processed);
  }

  const emptyLineResult = handleEmptyLine(effectiveLine, line, pendingKeepLine);
  if (emptyLineResult !== null) {
    return emptyLineResult;
  }

  if (pendingKeepLine) {
    return handlePendingKeepLineWithNewDirective(effectiveLine, pendingKeepLine, isNewDirective, configDir, line);
  }

  return handleNormalDirective(effectiveLine, configDir, line);
}

function handleEmptyLine(effectiveLine: string, originalLine: string, pendingKeepLine: string): ProcessLineResult | null {
  if (!effectiveLine) {
    if (pendingKeepLine) {
      const output = processKeepDirectiveContent(pendingKeepLine);
      return createProcessLineResult(false, '', '', output ? output + '\n' + originalLine : originalLine);
    }
    return createProcessLineResult(false, '', '', originalLine);
  }
  return null;
}

function handlePendingKeepLineWithNewDirective(effectiveLine: string, pendingKeepLine: string, isNewDirective: boolean, configDir: string, originalLine: string): ProcessLineResult {
  const result = handlePendingKeepLine(effectiveLine, pendingKeepLine, isNewDirective);
  
  if (isNewDirective && !result.pendingKeepLine) {
    const keepOutput = result.output || '';
    return handleNewDirectiveAfterKeep(effectiveLine, keepOutput, configDir, originalLine);
  }
  
  return result;
}

function handleNewDirectiveAfterKeep(effectiveLine: string, keepOutput: string, configDir: string, originalLine: string): ProcessLineResult {
  if (shouldSkipDirective(effectiveLine)) {
    return createProcessLineResult(true, '', '', keepOutput);
  }
  
  if (isNameCacheDirective(effectiveLine)) {
    const nameCacheResult = handleNameCacheDirective(effectiveLine, configDir, originalLine);
    return createProcessLineResult(nameCacheResult.skipUntilDirective, nameCacheResult.pendingNameCacheLine, '', 
      keepOutput ? keepOutput + '\n' + (nameCacheResult.output || '') : nameCacheResult.output);
  }
  
  if (isKeepDirective(effectiveLine)) {
    return handleKeepDirectiveAfterKeep(effectiveLine, originalLine, keepOutput);
  }
  
  return createProcessLineResult(false, '', '', keepOutput ? keepOutput + '\n' + originalLine : originalLine);
}

function handleKeepDirectiveAfterKeep(effectiveLine: string, originalLine: string, keepOutput: string): ProcessLineResult {
  const keepResult = handleKeepDirective(effectiveLine, originalLine);
  const combinedOutput = keepResult.output
    ? (keepOutput ? keepOutput + '\n' + keepResult.output : keepResult.output)
    : keepOutput;

  return createProcessLineResult(keepResult.skipUntilDirective, '', keepResult.pendingKeepLine, combinedOutput);
}

function handleNormalDirective(effectiveLine: string, configDir: string, originalLine: string): ProcessLineResult {
  if (shouldSkipDirective(effectiveLine)) {
    return createProcessLineResult(true, '', '', undefined);
  }
  
  if (isNameCacheDirective(effectiveLine)) {
    return handleNameCacheDirective(effectiveLine, configDir, originalLine);
  }
  
  if (isKeepDirective(effectiveLine)) {
    return handleKeepDirective(effectiveLine, originalLine);
  }
  
  return createProcessLineResult(false, '', '', originalLine);
}

function handlePendingKeepLine(effectiveLine: string, pendingKeepLine: string, isNewDirective: boolean): ProcessLineResult {
  if (isNewDirective) {
    const output = processKeepDirectiveContent(pendingKeepLine);
    return createProcessLineResult(false, '', '', output);
  }
  
  if (isKeepClassDeclarationContent(effectiveLine)) {
    const output = processKeepDirectiveContent(pendingKeepLine);
    if (!effectiveLine.includes('}')) { 
      return createProcessLineResult(true, '', '', output);
    }
    return createProcessLineResult(false, '', '', output);
  }
  
  const trimmedEffectiveLine = effectiveLine.trim();
  if (isRelativePath(trimmedEffectiveLine)) {
    const newPendingKeepLine = pendingKeepLine + '\n' + trimmedEffectiveLine;
    return createProcessLineResult(false, '', newPendingKeepLine, undefined);
  }
  
  const output = processKeepDirectiveContent(pendingKeepLine);
  return createProcessLineResult(false, '', '', output ? output + '\n' + trimmedEffectiveLine : trimmedEffectiveLine);
}

function handleNameCacheDirective(effectiveLine: string, configDir: string, originalLine: string): ProcessLineResult {
  const processed = processNameCacheLine(effectiveLine, configDir, originalLine);
  if (processed === null) {
    return createProcessLineResult(false, effectiveLine, '', effectiveLine);
  }
  return createProcessLineResult(false, '', '', processed);
}

function handleKeepDirective(effectiveLine: string, originalLine: string): ProcessLineResult {
  const keepContent = effectiveLine.substring(6).trim();
  if (!keepContent) {
    return createProcessLineResult(false, '', '-keep', undefined);
  }
  if (isKeepClassDeclaration(effectiveLine)) {
    if (!effectiveLine.includes('}')) { 
      return createProcessLineResult(true, '', '', undefined);
    }
    return createProcessLineResult(false, '', '', undefined);
  }
  return createProcessLineResult(false, '', originalLine.trim(), undefined);
}

function shouldSkipDirective(line: string): boolean {
  const skipDirectives = ['-print-seeds', '-print-configuration', '-keep-class-members', '-keep-class-with-members'];
  return skipDirectives.some(directive => line.startsWith(directive));
}

function isNameCacheDirective(line: string): boolean {
  return line.startsWith('-apply-namecache') || line.startsWith('-print-namecache');
}

function processNameCacheLine(line: string, configDir: string, originalLine: string): string | null {
  const applyMatch = /-apply-namecache\s+(\S+)/.exec(line);
  if (applyMatch) {
    const nameCachePath = applyMatch[1];
    const absolutePath = transformToAbsolutePath(nameCachePath, configDir);
    return originalLine.replace(nameCachePath, absolutePath);
  }

  const printMatch = /-print-namecache\s+(\S+)/.exec(line);
  if (printMatch) {
    const nameCachePath = printMatch[1];
    const absolutePath = transformToAbsolutePath(nameCachePath, configDir);
    return originalLine.replace(nameCachePath, absolutePath);
  }

  return null;
}

function isKeepDirective(line: string): boolean {
  let res = /^-keep$/.test(line) || line.startsWith('-keep ');
  return res;
}

function hasClassDeclarationKeywords(content: string): boolean {
  const trimmedContent = content.trim();
  if (CLASS_DECLARATION_KEYWORDS.some(keyword => keyword.test(trimmedContent))) {
    return true;
  }
  if (trimmedContent.includes('{') || trimmedContent.includes('}')) {
    return true;
  }
  if (trimmedContent.includes('@')) {
    return true;
  }
  return false;
}

function isKeepClassDeclaration(line: string): boolean {
  const trimmedLine = line.trim();
  if (!trimmedLine.startsWith('-keep')) {
    return false;
  }
  const content = trimmedLine.substring(6).trim();
  return hasClassDeclarationKeywords(content);
}

function isKeepClassDeclarationContent(content: string): boolean {
  return hasClassDeclarationKeywords(content);
}

function transformToAbsolutePath(relativePath: string, configDir: string): string {
  if (path.isAbsolute(relativePath)) {
    return relativePath;
  }
  return path.resolve(configDir, relativePath);
}


function transformRelativePathToRelativePath(relativePath: string): string {
  const DEPTH = 8;
  const deepPrefix = '../'.repeat(DEPTH);  
  if (relativePath.startsWith('!')) {
    return '!' + deepPrefix + relativePath.substring(1).trim();
  }
  return deepPrefix + relativePath;
}


function processKeepDirectiveContent(content: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  const firstLine = lines[0].trim();
  const match = /^-keep\s+(.+)$/.exec(firstLine);
  if (!match) {
    if (isRelativePath(firstLine)) {
      const convertedPath = transformRelativePathToRelativePath(firstLine);
      result.push(`-keep ${convertedPath}`);
    } else {
      result.push(firstLine);
    }
  } else {
    const pathContent = match[1].trim();
    if (isRelativePath(pathContent)) {
      const convertedPath = transformRelativePathToRelativePath(pathContent);
      result.push(`-keep ${convertedPath}`);
    } else {
      result.push(firstLine);
    }
  }
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) {
      continue;
    }
    if (isRelativePath(line)) {
      const convertedPath = transformRelativePathToRelativePath(line);
      result.push(convertedPath);
    } else {
      result.push(line);
    }
  }
  
  return result.join('\n');
}

function isRelativePath(line: string): boolean {
  const trimmedLine = line.trim();
  if (trimmedLine.startsWith('#')) {
    return false;
  }
  let pathToCheck = trimmedLine;
  if (trimmedLine.startsWith('!')) {
    pathToCheck = trimmedLine.substring(1).trim();
  }
  
  if (path.isAbsolute(pathToCheck)) {
    return false;
  }
  if (pathToCheck.startsWith('./') || pathToCheck.startsWith('../') || pathToCheck.startsWith('.**')) {
    return true;
  }
  if (pathToCheck.includes('/') || pathToCheck.includes('\\')) {
    return true;
  }
  
  return false;
}

export const utProcessObfConfig = {
    filterStaticObfuscationConfig,
    filterStaticConfigByPath,
    cleanObfuscationRules,
    processNameCacheLine
 };
