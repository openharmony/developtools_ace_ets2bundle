import * as fs from 'fs';
import * as path from 'path';
import { logger } from './compile_info';
import { NODE_MODULES, ONE, ZERO } from './pre_define';
import { toUnixPath, getPackageInfo } from './utils';
const { projectConfig } = require('../main');

const red: string = '\u001b[31m';
const reset: string = '\u001b[39m';

const REG_OHM_URL: RegExp = /^@bundle:(\S+)\/(\S+)\/(ets|js)\/(\S+)$/;

export class OHMResolverPlugin {
  private source: any;
  private target: any;

  constructor(source = 'resolve', target = 'resolve') {
    this.source = source;
    this.target = target;
  }

  apply(resolver) {
    const target: any = resolver.ensureHook(this.target);
    resolver.getHook(this.source).tapAsync('OHMResolverPlugin', (request, resolveContext, callback) => {
      if (isOhmUrl(request.request)) {
        const resolvedSourceFile: string = resolveSourceFile(request.request);
        const obj = Object.assign({}, request, {
          request: resolvedSourceFile
        });
        return resolver.doResolve(target, obj, null, resolveContext, callback);
      }
      callback();
    });
  }
}

export function isOhmUrl(moduleRequest: string): boolean {
  return !!/^@(\S+):/.test(moduleRequest);
}

function addExtension(file: string, srcPath: string): string {
  let extension: string = '.d.ts';
  if (fs.existsSync(file + '.ets') && fs.statSync(file + '.ets').isFile()) {
    extension = '.ets';
  }
  if (fs.existsSync(file + '.ts') && fs.statSync(file + '.ts').isFile()) {
    if (extension !== '.d.ts') {
      logger.error(red, `ArkTS:ERROR Failed to compile with files with same name ${srcPath} in the same directory`, reset);
    }
    extension = '.ts';
  }
  if (fs.existsSync(file + '.js') && fs.statSync(file + '.js').isFile()) {
    if (extension !== '.d.ts') {
      logger.error(red, `ArkTS:ERROR Failed to compile with files with same name ${srcPath} in the same directory`, reset);
    }
    extension = '.js';
  }
  return file + extension;
}

export function resolveSourceFile(ohmUrl: string): string {
  if (!projectConfig.aceBuildJson) {
    logger.error(red, `ArkTS:ERROR Failed to resolve OhmUrl because of aceBuildJson not existing `, reset);
    return ohmUrl;
  }

  const result: RegExpMatchArray = ohmUrl.match(REG_OHM_URL);
  const moduleName: string = result[2];
  const srcKind: string = result[3];

  const modulePath: string = projectConfig.modulePathMap[moduleName];
  const srcRoot: string = projectConfig.isOhosTest ? 'src/ohosTest' : 'src/main';
  let file: string = path.join(modulePath, srcRoot, srcKind, result[4]);
  file = addExtension(file, result[4]);

  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    if (projectConfig.isOhosTest) {
      file = path.join(modulePath, 'src/main', srcKind, result[4]);
      file = addExtension(file, result[4]);

      if (fs.existsSync(file) && fs.statSync(file).isFile()) {
        return file;
      }
    }

    logger.error(red, `ArkTS:ERROR Failed to resolve existed file by this ohm url ${ohmUrl} `, reset);
  }

  return file;
}

export function getOhmUrlByFilepath(filePath: string): string {
  let unixFilePath: string = toUnixPath(filePath);
  unixFilePath = unixFilePath.substring(0, filePath.lastIndexOf('.')); // remove extension
  const REG_PROJECT_SRC: RegExp = /(\S+)\/src\/(?:main|ohosTest)\/(ets|js)\/(\S+)/;

  const packageInfo: string[] = getPackageInfo(projectConfig.aceModuleJsonPath);
  const moduleName: string = packageInfo[1];
  const moduleRootPath: string = toUnixPath(projectConfig.modulePathMap[moduleName]);
  const projectRootPath: string = toUnixPath(projectConfig.projectRootPath);
  // case1: /entry/src/main/ets/xxx/yyy
  // case2: /node_modules/xxx/yyy
  // case3: /entry/node_modules/xxx/yyy
  const projectFilePath: string = unixFilePath.replace(projectRootPath, '');

  const result: RegExpMatchArray | null = projectFilePath.match(REG_PROJECT_SRC);
  if (result && result[1].indexOf(NODE_MODULES) === -1) {
    return `${result[2]}/${result[3]}`;
  }

  if (projectFilePath.indexOf(NODE_MODULES) !== -1) {

    const tryProjectNPM: string = toUnixPath(path.join(projectRootPath, NODE_MODULES));
    if (unixFilePath.indexOf(tryProjectNPM) !== -1) {
      return unixFilePath.replace(tryProjectNPM, `${NODE_MODULES}/${ONE}`);
    }

    const tryModuleNPM: string = toUnixPath(path.join(moduleRootPath, NODE_MODULES));
    if (unixFilePath.indexOf(tryModuleNPM) !== -1) {
      return unixFilePath.replace(tryModuleNPM, `${NODE_MODULES}/${ZERO}`);
    }
  }

  logger.error(red, `ArkTS:ERROR Failed to get an resolved OhmUrl by filepath "${filePath}"`, reset);
  return filePath;
}