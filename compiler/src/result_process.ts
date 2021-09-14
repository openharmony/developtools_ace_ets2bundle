/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
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

import ts from 'typescript';
import path from 'path';

import { BUILD_OFF } from './pre_define';
import {
  resetLog,
  transformLog
} from './process_ui_syntax';
import {
  propertyCollection,
  linkCollection
} from './validate_ui_syntax';
import {
  LogInfo,
  emitLogInfo,
  componentInfo
} from './utils';
import { resetComponentCollection } from './validate_ui_syntax';
import { abilityConfig } from '../main';

module.exports = function resultProcess(source: string, map: any): void {
  process.env.compiler = BUILD_OFF;
  if (/\.ets$/.test(this.resourcePath)) {
    componentInfo.id = 0;
    propertyCollection.clear();
    linkCollection.clear();
    resetComponentCollection();
    if (transformLog && transformLog.errors.length) {
      const sourceFile: ts.SourceFile = transformLog.sourceFile;
      const logInfos: LogInfo[] = transformLog.errors.map((item) => {
        if (item.pos) {
          const posOfNode: ts.LineAndCharacter = sourceFile.getLineAndCharacterOfPosition(item.pos);
          item.line = posOfNode.line + 1;
          item.column = posOfNode.character + 1;
        } else {
          item.line = undefined;
          item.column = undefined;
        }
        item.fileName = sourceFile.fileName.replace(/.ts$/, '');
        return item;
      });
      emitLogInfo(this, logInfos);
      resetLog();
    }
  }
  const resourcePath: string = path.basename(this.resourcePath);
  if (['app.ets', abilityConfig.abilityEntryFile].includes(resourcePath)) {
    source = source.replace(/exports\.default/, 'globalThis.exports.default');
  }

  this.callback(null, source, map);
};
