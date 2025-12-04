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

import * as arkts from '@koalaui/libarkts';
import { PluginContext, Plugins } from '../../../common/plugin-context';

/**
 * Recheck the current AST. This plugin can ONLY be used at afterCheck.
 */
export const recheck: Plugins = {
    name: 'recheck',
    checked(this: PluginContext): arkts.ETSModule | undefined {
        let script: arkts.ETSModule | undefined;
        const contextPtr = this.getContextPtr() ?? arkts.arktsGlobal.compilerContext?.peer;
        if (!!contextPtr) {
            let program = arkts.getOrUpdateGlobalContext(contextPtr).program;
            script = program.ast as arkts.ETSModule;
            arkts.recheckSubtree(script);
            return script;
        }
        return script;
    },
};
