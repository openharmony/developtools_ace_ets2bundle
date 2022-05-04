import * as fs from 'fs';
import * as path from 'path';
import { logger } from './compile_info';
const { projectConfig } = require('../main');

const red: string = '\u001b[31m';
const reset: string = '\u001b[39m';

const REG_OHM_URL = /^@bundle:(\S+)\/(\S+)\/(ets|js)\/(\S+)$/;

export class OHMResolverPlugin {
    private source: any;
    private target: any;

    constructor(source = 'resolve', target = 'resolve') {
        this.source = source;
        this.target = target;
    }

    apply(resolver) {
        const target = resolver.ensureHook(this.target);
        resolver.getHook(this.source).tapAsync("OHMResolverPlugin", (request, resolveContext, callback) => {
            if (isOhmUrl(request.request)) {
                var resolvedSourceFile: string = resolveSourceFile(request.request);
                var obj = Object.assign({}, request, {
                    request: resolvedSourceFile
                });
                return resolver.doResolve(target, obj, null, resolveContext, callback);
            }
            callback();
        });
    }
}

export function isOhmUrl(moduleRequest: string) {
    return /^@(\S+):/.test(moduleRequest) ? true : false;
}

export function resolveSourceFile(ohmUrl: string): string {
    const result = ohmUrl.match(REG_OHM_URL);
    let moduleName = result[2];
    let srcKind = result[3];
    let file = path.join(projectConfig.projectPath, '../../../../../', moduleName, 'src/main', srcKind, result[4]);
    if (fs.existsSync(file + '.ets') && fs.statSync(file + '.ets').isFile()) {
        file += '.ets';
    } else if (fs.existsSync(file + '.ts') && fs.statSync(file + '.ts').isFile()) {
        file += '.ts';
    } else if (fs.existsSync(file + '.js') && fs.statSync(file + '.js').isFile()) {
        file += '.js';
    } else {
        file += '.d.ts';
    }

    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
        logger.error(red, `ETS:ERROR Failed to resolve existed file by this ohm url ${ohmUrl} `, reset);
    }

    return file;
}