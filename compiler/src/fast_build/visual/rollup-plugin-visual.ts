import fs from 'fs';
import { createFilter } from '@rollup/pluginutils';
import { 
  findVisualFile, 
  visualTransform as processVisual 
} from '../../process_visual';
import MagicString from 'magic-string';
import { PluginContext } from 'rollup';
import { projectConfig } from '../../../main';

const filter: any = createFilter(/(?<!\.d)\.ets$/);

export function visualTransform() {
  return {
    name: 'visualTransform',
    transform(code: string, id: string) {
      if (!filter(id)) {
        return null;
      }
      if (process.env.watchMode !== 'true' && 'esmodule' === projectConfig.compileMode) {
        return null;
      }
      const logger = this.share.getLogger('visualTransform');
      code = processVisual(code, id, logger);
      const magicString = new MagicString(code);
      return {
        code,
        map: magicString.generateMap({ hires: true })
      };
    },
    shouldInvalidCache(this: PluginContext, options: any): boolean {
      const moduleId: string = options.id;
      if (!filter(moduleId) || !moduleId) {
        return false;
      }
      const visualId: string = findVisualFile(moduleId);
      if (!visualId || !fs.existsSync(visualId)) {
        if (this.cache.has(visualId)) {
          this.cache.delete(visualId);
        }
        return false;
      }
      const stat: fs.Stats = fs.statSync(visualId);
      const currentTimestamp: number = stat.mtime.getTime();
      if (!this.cache.has(visualId)) {
        this.cache.set(visualId, currentTimestamp);
        return !(process.env.watchMode !== 'true' && 'esmodule' === projectConfig.compileMode);
      }
      const lastTimestamp: number = this.cache.get(visualId);
      this.cache.set(visualId, currentTimestamp);
      if (currentTimestamp === lastTimestamp) {
        return false;
      }
      return true;
    }
  }
}