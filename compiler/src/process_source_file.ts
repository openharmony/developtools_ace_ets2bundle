import { writeFileSyncByString } from './ark_utils';
import { projectConfig } from '../main';
import {
  ESMODULE,
  ARK
} from './pre_define';
import { logger } from './compile_info';

module.exports = function processSourcefile(source: string): string {
  if (projectConfig.compileMode === ESMODULE && process.env.compilerType
      && process.env.compilerType === ARK) {
    writeFileSyncByString(this.resourcePath, source, projectConfig, logger);
  }
  return source;
};
