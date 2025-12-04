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
import { EXTERNAL_SOURCE_PREFIX_NAMES, EXTERNAL_SOURCE_PREFIX_NAMES_FOR_FRAMEWORK, NodeCacheNames } from '../../../common/predefines';
import { PositionalIdTracker } from '../../../memo-plugins/utils';
import { ParameterTransformer } from '../../../memo-plugins/parameter-transformer';
import { ReturnTransformer } from '../../../memo-plugins/return-transformer';
import { SignatureTransformer } from '../../../memo-plugins/signature-transformer';
import { FunctionTransformer } from '../../../memo-plugins/function-transformer';
import { InternalsTransformer } from '../../../memo-plugins/internal-transformer';
import { NodeCacheFactory } from '../../../common/node-cache';

/**
 * AfterCheck unmemoizeTransform with no recheck AST.
 */
export const memoNoRecheck: Plugins = {
    name: 'memo-no-recheck',
    checked(this: PluginContext): arkts.ETSModule | undefined {
        const contextPtr = this.getContextPtr() ?? arkts.arktsGlobal.compilerContext?.peer;
        if (!!contextPtr) {
            const isFrameworkMode = !!this.getProjectConfig()?.frameworkMode;
            let program = arkts.getOrUpdateGlobalContext(contextPtr).program;
            let script = program.ast as arkts.ETSModule;
            const positionalIdTracker = new PositionalIdTracker(arkts.getFileName(), false);
            const parameterTransformer = new ParameterTransformer({
                positionalIdTracker,
            });
            const returnTransformer = new ReturnTransformer();
            const signatureTransformer = new SignatureTransformer();
            let internalsTransformer: InternalsTransformer | undefined;
            if (isFrameworkMode) {
                internalsTransformer = new InternalsTransformer({ positionalIdTracker });
            }
            const functionTransformer = new FunctionTransformer({
                positionalIdTracker,
                parameterTransformer,
                returnTransformer,
                signatureTransformer,
                internalsTransformer,
                useCache: NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).isCollected()
            });
            const skipPrefixNames = isFrameworkMode
                ? EXTERNAL_SOURCE_PREFIX_NAMES_FOR_FRAMEWORK
                : EXTERNAL_SOURCE_PREFIX_NAMES;
            const programVisitor = new ProgramVisitor({
                pluginName: memoNoRecheck.name,
                state: arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED,
                visitors: [functionTransformer],
                skipPrefixNames,
                pluginContext: this,
            });
            program = programVisitor.programVisitor(program);
            NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).clear();
            script = program.ast as arkts.ETSModule;
            return script;
        }
    },
};
