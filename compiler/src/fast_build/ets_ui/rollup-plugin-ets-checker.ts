/*
 * Copyright (c) 2023 Huawei Device Co., Ltd.
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

import path from 'path';
import { EventEmitter } from 'events';
import * as ts from 'typescript';

import {
  projectConfig,
  globalProgram
} from '../../../main';
import {
  serviceChecker,
  languageService,
  printDiagnostic,
  fastBuildLogger,
  emitBuildInfo
} from '../../ets_checker';
import { TS_WATCH_END_MSG } from '../../pre_define';
import {
  setChecker,
  startTimeStatisticsLocation,
  stopTimeStatisticsLocation,
  CompilationTimeStatistics
} from '../../utils';
import { configureSyscapInfo } from "../system_api/api_check_utils";

export let tsWatchEmitter: EventEmitter | undefined = undefined;
export let tsWatchEndPromise: Promise<void>;

export function etsChecker() {
  let executedOnce: boolean = false;
  return {
    name: 'etsChecker',
    buildStart() {
      if (projectConfig.useArkoala) {
        return;
      }
      const compilationTime: CompilationTimeStatistics = new CompilationTimeStatistics(this.share, 'etsChecker', 'buildStart');
      if (process.env.watchMode === 'true' && process.env.triggerTsWatch === 'true') {
        tsWatchEmitter = new EventEmitter();
        tsWatchEndPromise = new Promise<void>(resolve => {
          tsWatchEmitter.on(TS_WATCH_END_MSG, () => {
            resolve();
          });
        });
      }
      if (this.share.projectConfig.deviceTypes) {
        configureSyscapInfo(this.share.projectConfig);
      }
      Object.assign(projectConfig, this.share.projectConfig);
      Object.assign(this.share.projectConfig, {
        compileHar: projectConfig.compileHar,
        compileShared: projectConfig.compileShared,
        moduleRootPath: projectConfig.moduleRootPath,
        buildPath: projectConfig.buildPath,
        isCrossplatform: projectConfig.isCrossplatform,
        syscapIntersectionSet: projectConfig.syscapIntersectionSet,
        syscapUnionSet: projectConfig.syscapUnionSet,
        deviceTypesMessage: projectConfig.deviceTypesMessage,
      });
      const logger = this.share.getLogger('etsChecker');
      const rootFileNames: string[] = [];
      const resolveModulePaths: string[] = [];
      Object.values(projectConfig.entryObj).forEach((fileName: string) => {
        rootFileNames.push(path.resolve(fileName));
      });
      if (this.share && this.share.projectConfig && this.share.projectConfig.resolveModulePaths &&
        Array.isArray(this.share.projectConfig.resolveModulePaths)) {
        resolveModulePaths.push(...this.share.projectConfig.resolveModulePaths);
      }
      if (process.env.watchMode === 'true') {
        !executedOnce && serviceChecker(rootFileNames, logger, resolveModulePaths, compilationTime);
        startTimeStatisticsLocation(compilationTime ? compilationTime.diagnosticTime : undefined);
        if (executedOnce) {
          globalProgram.builderProgram = languageService.getBuilderProgram();
          globalProgram.program = globalProgram.builderProgram.getProgram();
        }
        executedOnce = true;
        const allDiagnostics: ts.Diagnostic[] = globalProgram.builderProgram
          .getSyntacticDiagnostics()
          .concat(globalProgram.builderProgram.getSemanticDiagnostics());
        stopTimeStatisticsLocation(compilationTime ? compilationTime.diagnosticTime : undefined);
        emitBuildInfo();
        allDiagnostics.forEach((diagnostic: ts.Diagnostic) => {
          printDiagnostic(diagnostic);
        });
        fastBuildLogger.debug(TS_WATCH_END_MSG);
        tsWatchEmitter.emit(TS_WATCH_END_MSG);
      } else {
        serviceChecker(rootFileNames, logger, resolveModulePaths, compilationTime, this.share);
      }
      setChecker();
    }
  };
}
