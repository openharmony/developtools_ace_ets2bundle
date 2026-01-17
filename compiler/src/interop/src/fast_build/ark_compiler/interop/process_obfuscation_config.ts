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

export function filterStaticObfuscationConfig(projectConfig: any, 
    printObfLogger: (errorInfo: string, errorCodeInfo: any, level: string) => void): void {
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

function filterStaticConfigByPath(configPath: string, obfuscationCacheDir: string,
  printObfLogger: (errorInfo: string, errorCodeInfo: any, level: string) => void): string {
  const newPath = path.join(obfuscationCacheDir, path.basename(configPath));
  try {
    const fileContent = fs.readFileSync(configPath, 'utf-8');
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

  for (const line of lines) {
    const processedLine = processObfuscationRuleLine(line, configDir, skipUntilDirective, pendingNameCacheLine);
    skipUntilDirective = processedLine.skipUntilDirective;
    pendingNameCacheLine = processedLine.pendingNameCacheLine;
    if (processedLine.output) {
      result.push(processedLine.output);
    }
  }
  return result.join('\n');
}

function processObfuscationRuleLine(line: string, configDir: string, skipUntilDirective: boolean, pendingNameCacheLine: string): {
  output?: string;
  skipUntilDirective: boolean;
  pendingNameCacheLine: string;
} {
  const trimmed = line.trimStart();
  const effectiveLine = trimmed.startsWith('#') ? trimmed.slice(1).trimStart() : trimmed;
  const isNewDirective = effectiveLine.startsWith('-');
  const combinedLine = pendingNameCacheLine ? `${pendingNameCacheLine} ${effectiveLine}` : effectiveLine;

  if (skipUntilDirective) {
    if (isNewDirective) {
      return { skipUntilDirective: false, pendingNameCacheLine: '', output: undefined };
    }
    return { skipUntilDirective: true, pendingNameCacheLine: '', output: undefined };
  }

  if (pendingNameCacheLine) {
    const processed = processNameCacheLine(combinedLine, configDir, line);
    return { skipUntilDirective: false, pendingNameCacheLine: '', output: processed };
  }

  if (!effectiveLine) {
    return { skipUntilDirective: false, pendingNameCacheLine: '', output: line };
  }

  if (shouldSkipDirective(effectiveLine)) {
    return { skipUntilDirective: true, pendingNameCacheLine: '', output: undefined };
  }

  if (isNameCacheDirective(effectiveLine)) {
    const processed = processNameCacheLine(effectiveLine, configDir, line);
    if (processed === null) {
      return { skipUntilDirective: false, pendingNameCacheLine: effectiveLine, output: undefined };
    }
    return { skipUntilDirective: false, pendingNameCacheLine: '', output: processed };
  }

  return { skipUntilDirective: false, pendingNameCacheLine: '', output: line };
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

function transformToAbsolutePath(relativePath: string, configDir: string): string {
  if (path.isAbsolute(relativePath)) {
    return relativePath;
  }
  return path.resolve(configDir, relativePath);
}

export const utProcessObfConfig = {
    filterStaticObfuscationConfig,
    filterStaticConfigByPath,
    cleanObfuscationRules,
    processNameCacheLine
 };
