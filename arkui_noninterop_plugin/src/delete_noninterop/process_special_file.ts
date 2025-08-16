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

import * as path from 'path';

import {
  ALERT_DIALOG,
  ALERT_DIALOG_TEXT_STYLE,
  COMMON,
  COMMON_LINEAR_GRADIENT,
  EXTNAME_TS,
} from './pre_define';

import { specialFileList } from './white_management';

function processSpecialFileContext(fileName: string, context: string): string {
  fileName = path.basename(fileName, EXTNAME_TS);
  if (fileName === ALERT_DIALOG) {
    context = context.replace(/\bTextStyle\b/g, ALERT_DIALOG_TEXT_STYLE);
  }
  if (fileName === COMMON) {
    context = context.replace(/\bLinearGradient\b/g, COMMON_LINEAR_GRADIENT);
  }
  return context;
}

function isSpecialFile(url: string): boolean {
  return specialFileList.includes(path.basename(url, EXTNAME_TS));
}

export {
  isSpecialFile,
  processSpecialFileContext,
};
