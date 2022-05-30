import { writeFileSyncByString } from './utils';
import { projectConfig } from '../main';
module.exports = function processjs2file(source: string): string {
  if (projectConfig.compileMode === 'esmodule'
      && process.env.compilerType && process.env.compilerType === 'ark') {
    writeFileSyncByString(this.resourcePath, source, false);
  }
  return source;
};
