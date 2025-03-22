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
import { Plugins, PluginContext } from "../common/plugin-context";
import { FunctionTransformer } from "./function-transformer";
import { PositionalIdTracker } from "./utils";
import { ReturnTransformer } from "./return-transformer";
import { ParameterTransformer } from "./parameter-transformer";
import { ProgramVisitor } from "../common/program-visitor";
import { EXTERNAL_SOURCE_PREFIX_NAMES } from "../common/predefines";
import { DEBUG_DUMP } from "../common/utils"
const DEBUG = process.argv.includes('--debug');

export function unmemoizeTransform(): Plugins {
    return {
        name: 'memo-plugin',
        bound(this: PluginContext) {
            console.log("[MEMO PLUGIN] AFTER CHECKED ENTER");
            let program = arkts.arktsGlobal.compilerContext.program;
            let script = program.astNode;
            if (script) {
                if (DEBUG) {
                    console.log('[BEFORE MEMO SCRIPT] script: ', script.dumpSrc());
                }

                DEBUG_DUMP(script.dumpSrc(), "0_SRC_Memo_1_AfterBound_Begin", true)
                // DEBUG_DUMP(script.dumpJson(), "0_SRC_Memo_1_AfterBound_Begin.ets", false)
                const positionalIdTracker = new PositionalIdTracker(arkts.getFileName(), false);
                const parameterTransformer = new ParameterTransformer({ positionalIdTracker });
                const returnTransformer = new ReturnTransformer();
                const functionTransformer = new FunctionTransformer({
                    positionalIdTracker, 
                    parameterTransformer, 
                    returnTransformer
                });

                const programVisitor = new ProgramVisitor({
                    pluginName: "2_Memo",
                    state: arkts.Es2pandaContextState.ES2PANDA_STATE_BOUND,
                    // visitors: [functionTransformer],
                    visitors: [],
                    skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES
                });

                program = programVisitor.programVisitor(program);
                script = program.astNode;
                DEBUG_DUMP(script.dumpSrc(), "0_SRC_Memo_2_FunctionTransformer.ets", true)
                // DEBUG_DUMP(script.dumpJson(), "0_SRC_Memo_2_FunctionTransformer.ets", false)
                if (DEBUG) {
                    console.log('[AFTER MEMO SCRIPT] script: ', script.dumpSrc());
                }

                arkts.rebindSubtree(script);
                this.setArkTSAst(script);
                console.log("[MEMO PLUGIN] AFTER CHECKED EXIT");
                return script;
            }
            console.log("[MEMO PLUGIN] AFTER CHECKED EXIT WITH NO TRANSFORM");
        },
        // checked(this: PluginContext) {
        //     console.log("[MEMO PLUGIN] AFTER CHECKED ENTER");
        //     // const node = this.getArkTSAst();
        //     let program = arkts.arktsGlobal.compilerContext.program;
        //     let script = program.astNode;
        //     if (script) {
        //         if (DEBUG) {
        //             console.log('[BEFORE MEMO SCRIPT] script: ', script.dumpSrc());
        //         }

        //         const positionalIdTracker = new PositionalIdTracker(arkts.getFileName(), false);
        //         const parameterTransformer = new ParameterTransformer({ positionalIdTracker });
        //         const returnTransformer = new ReturnTransformer();
        //         const functionTransformer = new FunctionTransformer({
        //             positionalIdTracker, 
        //             parameterTransformer, 
        //             returnTransformer
        //         });

        //         const programVisitor = new ProgramVisitor({
        //             state: arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED,
        //             visitors: [functionTransformer],
        //             skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES
        //         });

        //         program = programVisitor.programVisitor(program);
        //         script = program.astNode;

        //         if (DEBUG) {
        //             console.log('[AFTER MEMO SCRIPT] script: ', script.dumpSrc());
        //         }


        //         this.setArkTSAst(script);
        //         console.log("[MEMO PLUGIN] AFTER CHECKED EXIT");
        //         return script;
        //     }
        //     console.log("[MEMO PLUGIN] AFTER CHECKED EXIT WITH NO TRANSFORM");
        // }
    }
}