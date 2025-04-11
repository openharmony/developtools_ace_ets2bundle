/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

import { DeclTransformer } from './decl_transformer';
import { EmitTransformer } from './emit_transformer';

import { ProgramVisitor } from '../common/program-visitor';
import { EXTERNAL_SOURCE_PREFIX_NAMES } from '../common/predefines';
import { debugLog } from '../common/debug';
import { PluginContext, Plugins } from 'common/plugin-context';

export function interopTransform():Plugins {
  return {
    name: 'interop-plugin',
    parsed: parsedTransform,
    checked: checkedTransform,
    clean() {
        arkts.arktsGlobal.clearContext();
    },
  };
}

function parsedTransform(this: PluginContext): arkts.EtsScript | undefined {
    let script: arkts.EtsScript | undefined;
    debugLog('interopTransform:parsed');
    const contextPtr = arkts.arktsGlobal.compilerContext?.peer ?? this.getContextPtr();
    if (!!contextPtr) {
      let program = arkts.getOrUpdateGlobalContext(contextPtr).program;
      script = program.astNode;

      if (script) {
        const declTransformer = new DeclTransformer({
          arkui: '@koalaui.arkts-arkui.StructParse' as interop.TransfromerName
        });

        const programVisitor = new ProgramVisitor({
            pluginName: interopTransform().name,
            state: arkts.Es2pandaContextState.ES2PANDA_STATE_PARSED,
            visitors: [declTransformer],
            skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES,
            pluginContext: this as unknown as PluginContext
        });

        program = programVisitor.programVisitor(program);
        script = program.astNode;
        this.setArkTSAst(script);
        debugLog('interopTransform:parsed exit');
        return script;
      }
    }
    debugLog('interopTransform: parsed exit with no transform');
    return script;
}

function checkedTransform(this: PluginContext): arkts.EtsScript | undefined {
    let script: arkts.EtsScript | undefined;
    debugLog('interopTransform:checked');
    const contextPtr = arkts.arktsGlobal.compilerContext?.peer ?? this.getContextPtr();
    if (!!contextPtr) {
      let program = arkts.getOrUpdateGlobalContext(contextPtr).program;
      script = program.astNode;
      if (script) {
        const emitTransformer = new EmitTransformer({
          arkui: '@koalaui.arkts-arkui.EmitBase' as interop.TransfromerName
        });

        const programVisitor = new ProgramVisitor({
            pluginName: interopTransform().name,
            state: arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED,
            visitors: [emitTransformer],
            skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES,
            pluginContext: this as unknown as PluginContext
        });

        program = programVisitor.programVisitor(program);
        script = program.astNode;
        arkts.GlobalInfo.getInfoInstance()?.reset();
        arkts.recheckSubtree(script);
        this.setArkTSAst(script); 
        debugLog('interopTransform:checked exit');
        return script;
      }
    }
    debugLog('interopTransform:checked exit with no transform');
    return script;
}
