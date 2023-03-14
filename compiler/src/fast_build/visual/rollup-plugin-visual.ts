import { createFilter } from '@rollup/pluginutils';
import { visualTransform as processVisual } from '../../process_visual';
import MagicString from 'magic-string';

const filter: any = createFilter(/(?<!\.d)\.ets$/);

export function visualTransform() {
  return {
    name: 'visualTransform',
    transform(code: string, id: string) {
      if (!filter(id)) {
        return null;
      }
      const logger = this.share.getLogger('visualTransform');
      code = processVisual(code, id, logger);
      const magicString = new MagicString(code);
      return {
        code,
        map: magicString.generateMap({ hires: true })
      };
    }
  }
}