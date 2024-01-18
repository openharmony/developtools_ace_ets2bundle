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

import { ESMODULE } from './common/ark_define';
import { ModuleBuildMode } from './module/module_build_mode';
import { ModuleHotfixMode } from './module/module_hotfix_mode';
import { ModuleHotreloadMode } from './module/module_hotreload_mode';
import { ModulePreviewMode } from './module/module_preview_mode';
import { ModuleSourceFile } from './module/module_source_file';
import {
  getHookEventFactory,
  createAndStartEvent,
  stopEvent
} from '../../ark_utils';
import type { ModuleMode } from './module/module_mode';

let moduleMode: ModuleMode = null;

export async function generateModuleAbc(error) {
  const hookEventFactory = getHookEventFactory(this.share, 'genAbc', 'buildEnd');
  if (error) {
    // When error thrown in previous plugins, rollup will catch and call buildEnd plugin.
    // Stop generate abc if error exists
    return;
  }
  if (this.share.projectConfig.compileMode === ESMODULE) {
    await ModuleSourceFile.processModuleSourceFiles(this, hookEventFactory);
    if (this.share.projectConfig.compileHar) {
      // compileHar: compile closed source har of project, which convert .ets to .d.ts and js, doesn't emit abc.
      return;
    }
    generateAbc(this, hookEventFactory);
  }
}

function generateAbc(rollupObject: Object, parentEvent: Object): void {
  const eventGenerateAbc = createAndStartEvent(parentEvent, 'generate abc');
  if (rollupObject.share.projectConfig.watchMode !== 'true') {
    const moduleBuildMode: ModuleBuildMode = new ModuleBuildMode(rollupObject);
    moduleBuildMode.generateAbc(rollupObject, eventGenerateAbc);
    moduleMode = moduleBuildMode;
  } else if (rollupObject.share.arkProjectConfig.hotReload) {
    const moduleHotreloadMode: ModuleHotreloadMode = new ModuleHotreloadMode(rollupObject);
    moduleHotreloadMode.generateAbc(rollupObject, eventGenerateAbc);
    moduleMode = moduleHotreloadMode;
  } else if (rollupObject.share.arkProjectConfig.hotFix) {
    const moduleHotfixMode: ModuleHotfixMode = new ModuleHotfixMode(rollupObject);
    moduleHotfixMode.generateAbc(rollupObject, eventGenerateAbc);
    moduleMode = moduleHotfixMode;
  } else {
    const modulePreviewMode: ModulePreviewMode = new ModulePreviewMode(rollupObject);
    modulePreviewMode.generateAbc(rollupObject, eventGenerateAbc);
    moduleMode = modulePreviewMode;
  }
  stopEvent(eventGenerateAbc);
}

export function cleanModuleMode():void {
  if (moduleMode) {
    moduleMode.triggerAsync = null;
    moduleMode.triggerEndSignal = null;
    moduleMode = null;
  }
}