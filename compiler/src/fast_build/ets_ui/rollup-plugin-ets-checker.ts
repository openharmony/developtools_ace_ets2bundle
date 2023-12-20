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
  fastBuildLogger
} from '../../ets_checker';
import { TS_WATCH_END_MSG } from '../../pre_define';
import {
  setChecker,
  createAndStartEvent,
  stopEvent,
  startTimeStatisticsLocation,
  stopTimeStatisticsLocation,
  CompilationTimeStatistics,
  getHookEventFactory
} from '../../utils';

export let tsWatchEmitter: EventEmitter | undefined = undefined;
export let tsWatchEndPromise: Promise<void>;

export function etsChecker() {
  let executedOnce: boolean = false;
  return {
    name: 'etsChecker',
    buildStart() {
      const hookEventFactory = getHookEventFactory(this.share, 'etsChecker', 'buildStart');
      const compilationTime: CompilationTimeStatistics = new CompilationTimeStatistics(this.share, 'etsChecker', 'buildStart');
      if (process.env.watchMode === 'true' && process.env.triggerTsWatch === 'true') {
        tsWatchEmitter = new EventEmitter();
        tsWatchEndPromise = new Promise<void>(resolve => {
          tsWatchEmitter.on(TS_WATCH_END_MSG, () => {
            resolve();
          });
        });
      }
      Object.assign(projectConfig, this.share.projectConfig);
      Object.assign(this.share.projectConfig, {
        compileHar: projectConfig.compileHar,
        compileShared: projectConfig.compileShared,
        moduleRootPath: projectConfig.moduleRootPath,
        buildPath: projectConfig.buildPath,
        isCrossplatform: projectConfig.isCrossplatform
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
      const eventServiceChecker = createAndStartEvent(hookEventFactory, 'check Ets code syntax');
      if (process.env.watchMode === 'true') {
        !executedOnce && serviceChecker(rootFileNames, logger, resolveModulePaths, eventServiceChecker,
          compilationTime);
        executedOnce = true;
        startTimeStatisticsLocation(compilationTime ? compilationTime.diagnosticTime : undefined);
        globalProgram.program = languageService.getProgram();
        const allDiagnostics: ts.Diagnostic[] = globalProgram.program
          .getSyntacticDiagnostics()
          .concat(globalProgram.program.getSemanticDiagnostics())
          .concat(globalProgram.program.getDeclarationDiagnostics());
        stopTimeStatisticsLocation(compilationTime ? compilationTime.diagnosticTime : undefined);
        allDiagnostics.forEach((diagnostic: ts.Diagnostic) => {
          printDiagnostic(diagnostic);
        });
        fastBuildLogger.debug(TS_WATCH_END_MSG);
        tsWatchEmitter.emit(TS_WATCH_END_MSG);
      } else {
        serviceChecker(rootFileNames, logger, resolveModulePaths, eventServiceChecker,
          compilationTime, this.share);
      }
      stopEvent(eventServiceChecker);
      setChecker();
    }
  };
}

