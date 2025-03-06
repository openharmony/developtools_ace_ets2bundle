/*
 * Copyright (c) 2022-2025 Huawei Device Co., Ltd.
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

import * as arkts from "@koalaui/libarkts"
import { ComponentTransformer } from './component-transformer'
import { BuilderLambdaTransformer } from './builder-lambda-transformer'
import { StructTransformer } from './struct-transformer'
import { Plugins, PluginContext } from "../common/plugin-context"
import { ProgramVisitor } from "../common/program-visitor"
import { EXTERNAL_SOURCE_PREFIX_NAMES } from "../common/predefines"
import { debugDump, debugLog, getDumpFileName } from "../common/debug"

export function uiTransform(): Plugins {
    return {
        name: 'ui-plugin',
        parsed(this: PluginContext) {
            console.log("[UI PLUGIN] AFTER PARSED ENTER");
            let program = arkts.arktsGlobal.compilerContext.program;
            let script = program.astNode;
            if (script) {
                debugLog("[BEFORE PARSED SCRIPT] script: ", script.dumpSrc());
                debugDump(script.dumpSrc(), getDumpFileName(0, "SRC", 1, "UI_AfterParse_Begin"), true);

                const componentTransformer = new ComponentTransformer();
                const programVisitor = new ProgramVisitor({
                    pluginName: uiTransform.name,
                    state: arkts.Es2pandaContextState.ES2PANDA_STATE_PARSED,
                    visitors: [componentTransformer],
                    skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES
                });

                program = programVisitor.programVisitor(program);
                script = program.astNode;

                debugLog("[AFTER PARSED SCRIPT] script: ", script.dumpSrc());
                debugDump(script.dumpSrc(), getDumpFileName(0, "SRC", 2, "UI_AfterParse_End"), true);

                this.setArkTSAst(script);
                console.log("[UI PLUGIN] AFTER PARSED EXIT");
                return script;
            }
            console.log("[UI PLUGIN] AFTER PARSED EXIT WITH NO TRANSFORM");
        },
        checked(this: PluginContext) {
            console.log("[UI PLUGIN] AFTER CHECKED ENTER");
            let program = arkts.arktsGlobal.compilerContext.program;
            let script = program.astNode;
            if (script) {
                debugLog("[BEFORE STRUCT SCRIPT] script: ", script.dumpSrc());
                debugDump(script.dumpSrc(), getDumpFileName(0, "SRC", 3, "UI_AfterCheck_Begin"), true);

                const builderLambdaTransformer = new BuilderLambdaTransformer();
                const structTransformer = new StructTransformer();
                const programVisitor = new ProgramVisitor({
                    pluginName: uiTransform.name,
                    state: arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED,
                    visitors: [builderLambdaTransformer, structTransformer],
                    skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES
                });

                program = programVisitor.programVisitor(program);
                script = program.astNode;

                debugLog("[AFTER STRUCT SCRIPT] script: ", script.dumpSrc());
                debugDump(script.dumpSrc(), getDumpFileName(0, "SRC", 4, "UI_AfterCheck_End"), true);

                arkts.recheckSubtree(script);
                this.setArkTSAst(script);
                console.log("[UI PLUGIN] AFTER CHECKED EXIT");
                return script;
            }
            console.log("[UI PLUGIN] AFTER CHECKED EXIT WITH NO TRANSFORM");
        }
    }
}