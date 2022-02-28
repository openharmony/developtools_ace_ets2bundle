import * as process from 'child_process';
import * as fs from 'fs';
import { logger } from './compile_info';

const {workerData, threadId} = require('worker_threads');

interface File {
  path: string,
  size: number
}
const red: string = '\u001b[31m';
const reset: string = '\u001b[39m';

function js2abcByWorkers(inputPaths: File[], cmd: string): Promise<void> {
  for (let i = 0; i < inputPaths.length; ++i) {
    let input = inputPaths[i].path;
    let singleCmd = `${cmd} "${input}"`;
    logger.debug("gen abc cmd is: ", singleCmd);
    try {
      process.execSync(singleCmd);
    } catch (e) {
      logger.error(red, `ETS:ERROR Failed to convert file ${input} to abc `, reset);
      return;
    }

    if (fs.existsSync(input)) {
      fs.unlinkSync(input);
    }

    const abcFile: string = input.replace(/\.js$/, '.abc');
    if (fs.existsSync(abcFile)) {
      const abcFileNew: string = abcFile.replace(/_.abc$/, '.abc');
      fs.renameSync(abcFile, abcFileNew);
    } else {
      logger.error(red, `ETS:ERROR ${abcFile} is lost`, reset);
    }
  }
}

logger.debug("worker data is: ", JSON.stringify(workerData));
if (JSON.stringify(workerData) !== 'null') {
  logger.debug("==>worker #", threadId, "started!");
  js2abcByWorkers(workerData.input, workerData.cmd);
}
