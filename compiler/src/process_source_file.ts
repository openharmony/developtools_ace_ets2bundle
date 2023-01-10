import { writeFileSyncByString } from './utils';
import { projectConfig } from '../main';
import {
  ESMODULE,
  ARK
} from './pre_define';

module.exports = function processSourcefile(source: string): string {
  if (projectConfig.compileMode === ESMODULE && process.env.compilerType
      && process.env.compilerType === ARK) {
    writeFileSyncByString(this.resourcePath, source);
  }
  return source;
};
