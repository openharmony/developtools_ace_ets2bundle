import { writeFileSyncByString } from './utils';
import { projectConfig } from '../main';
import {
  ESMODULE,
  ARK
} from './pre_define';

module.exports = function processjs2file(source: string): string {
  if (projectConfig.compileMode === ESMODULE && projectConfig.processTs === false
      && process.env.compilerType && process.env.compilerType === ARK) {
    writeFileSyncByString(this.resourcePath, source);
  }
  return source;
};
