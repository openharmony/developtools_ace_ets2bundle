import * as fs from 'fs';
import * as path from 'path';
import { logger } from './compile_info';
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
      const target = resolver.ensureHook(this.target);
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
  if (path.extname(file) !== '') {
    return file;
  }

  let extension: string = '.d.ts';
  if (fs.existsSync(file + '.ets') && fs.statSync(file + '.ets').isFile()) {
    extension = '.ets';
  }
  if (fs.existsSync(file + '.ts') && fs.statSync(file + '.ts').isFile()) {
    if (extension !== '.d.ts') {
      logger.error(red, `ETS:ERROR Failed to compile with files with same name ${srcPath} in the same directory`, reset);
    }
    extension = '.ts';
  }
  if (fs.existsSync(file + '.js') && fs.statSync(file + '.js').isFile()) {
    if (extension !== '.d.ts') {
      logger.error(red, `ETS:ERROR Failed to compile with files with same name ${srcPath} in the same directory`, reset);
    }
    extension = '.js';
  }
  return file + extension;
}

export function resolveSourceFile(ohmUrl: string): string {
  const result = ohmUrl.match(REG_OHM_URL);
  const moduleName = result[2];
  const srcKind = result[3];

  let file = '';

  if (projectConfig.aceBuildJson) {
    const buildJson = JSON.parse(fs.readFileSync(projectConfig.aceBuildJson).toString());
    const modulePath = buildJson.modulePathMap[moduleName];
    file = path.join(modulePath, 'src/main', srcKind, result[4]);
  } else {
    logger.error(red, `ETS:ERROR Failed to resolve OhmUrl because of aceBuildJson not existing `, reset);
  }

  file = addExtension(file, result[4]);

  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    logger.error(red, `ETS:ERROR Failed to resolve existed file by this ohm url ${ohmUrl} `, reset);
  }

  return file;
}
