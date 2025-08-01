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
import { ProgramVisitor } from '../../../common/program-visitor';
import { EXTERNAL_SOURCE_PREFIX_NAMES } from '../../../common/predefines';
import { ComponentTransformer } from '../../../ui-plugins/component-transformer';

/**
 * AfterParse transform struct to component.
 */
export const structToComponent: Plugins = {
    name: 'struct-to-component',
    parsed(this: PluginContext): arkts.EtsScript | undefined {
        let script: arkts.EtsScript | undefined;
        const contextPtr = arkts.arktsGlobal.compilerContext?.peer ?? this.getContextPtr();
        if (!!contextPtr) {
            let program = arkts.getOrUpdateGlobalContext(contextPtr).program;
            script = program.astNode;
            const componentTransformer = new ComponentTransformer();
            const programVisitor = new ProgramVisitor({
                pluginName: structToComponent.name,
                state: arkts.Es2pandaContextState.ES2PANDA_STATE_PARSED,
                visitors: [componentTransformer],
                skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES,
                pluginContext: this,
            });
            program = programVisitor.programVisitor(program);
            script = program.astNode;
            return script;
        }
        return script;
    },
};
