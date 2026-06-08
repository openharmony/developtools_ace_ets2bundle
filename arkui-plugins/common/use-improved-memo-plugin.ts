/*
 * Copyright (c) 2022-2026 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as arkts from '@koalaui/libarkts';
import * as memo from '../memo-improved';

export const useImprovedPlugin = true;
export const disableMemoNodeCache = true;
export const forceIgnoreThisInMemoTransformation: boolean = true; // Disable this argument transformation at the current stage until we need to handle it

export function pluginInit(context: arkts.PluginContextImpl) {
    arkts.extendPluginContext(context);
    if (!useImprovedPlugin) {
        return;
    }
    arkts.MemoNodeCache.disableMemoNodeCache = disableMemoNodeCache;
    memo.initPlugin(context);
    memo.memoPluginOptionsFromContext(context).skipDiagnostics = true;
}

