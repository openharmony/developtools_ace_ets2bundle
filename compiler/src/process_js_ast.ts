/*
 * Copyright (c) 2022 Huawei Device Co., Ltd.
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
import {
  BUILD_ON,
  ESMODULE
 } from './pre_define';
import { writeFileSyncByNode } from './utils';
import { projectConfig } from '../main';

export function processJs(program: ts.Program, ut = false): Function {
  return (context: ts.TransformationContext) => {
    return (node: ts.SourceFile) => {
      if (process.env.compiler === BUILD_ON) {
        if (projectConfig.compileMode === ESMODULE && projectConfig.processTs === false) {
          writeFileSyncByNode(node, false);
        }
        return node;
      } else {
        return node;
      }
    };
  };
}
