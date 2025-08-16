/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as commander from 'commander';

import processInteropUI from './process_interop_ui';

let outputPath = '';
let inputDir = '';
let exportFlag = false;

export default function start(): void {
  const program = new commander.Command();
  program
    .name('noninterop_global_import')
    .version('0.0.1');
  program
    .option('--input <string>', 'input path')
    .option('--output <string>', 'output path')
    .option('--export <string>', 'export flag', false)
    .action((opts) => {
      outputPath = opts.output;
      inputDir = opts.input;
      exportFlag = opts.export === 'true';
      processInteropUI(inputDir, exportFlag);
    });
  program.parse(process.argv);
}