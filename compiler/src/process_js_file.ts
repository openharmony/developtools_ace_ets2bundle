import { writeFileSyncByString } from './utils';

module.exports = function processjs2file(source: string): string {
    if (process.env.compilerType && process.env.compilerType === 'ark'){
       writeFileSyncByString(this.resourcePath, source, false);
    }
    return source;
  }