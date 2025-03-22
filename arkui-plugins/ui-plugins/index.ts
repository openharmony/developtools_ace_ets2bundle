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
import { DEBUG_DUMP } from "../common/utils"

const DEBUG = process.argv.includes('--debug');

export function uiTransform(): Plugins {
    return {
        name: 'ui-plugin',
        parsed(this: PluginContext) {
            console.log("------------- [UI PLUGIN] AFTER PARSED ENTER --------------");
            let program = arkts.arktsGlobal.compilerContext.program;
            let script = program.astNode;
            if (script) {
                console.log("[BEFORE TRANSFORMER] script: ", script.dumpSrc());
                DEBUG_DUMP(script.dumpSrc(), "0_SRC_1_AfterParse_Begin", true)
                // DEBUG_DUMP(script.dumpJson(), "0_SRC_1_AfterParse_Begin.ets", false)
                const componentTransformer = new ComponentTransformer();
                const programVisitor = new ProgramVisitor({
                    pluginName: "1_UI",
                    state: arkts.Es2pandaContextState.ES2PANDA_STATE_PARSED,
                    visitors: [componentTransformer],
                    skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES
                });
                program = programVisitor.programVisitor(program);
                script = program.astNode;
                console.log("[AFTER componentTransformer] script: ", script.dumpSrc());
                DEBUG_DUMP(script.dumpSrc(), "0_SRC_2_ComponentTransformer", true)
                // DEBUG_DUMP(script.dumpJson(), "0_SRC_2_ComponentTransformer.ets", false)
                const structTransformer = new StructTransformer();
                const programVisitor1 = new ProgramVisitor({
                    pluginName: "1_UI",
                    state: arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED,
                    visitors: [structTransformer],
                    skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES
                });
                program = programVisitor1.programVisitor(program);
                script = program.astNode;
                console.log("[AFTER structTransformer] script: ", script.dumpSrc());
                DEBUG_DUMP(script.dumpSrc(), "0_SRC_3_StructTransformer", true)
                // DEBUG_DUMP(script.dumpJson(), "0_SRC_3_StructTransformer.ets", false)
                // const builderLambdaTransformer = new BuilderLambdaTransformer();
                // const programVisitor2 = new ProgramVisitor({
                //     state: arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED,
                //     visitors: [builderLambdaTransformer],
                //     skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES
                // });
                // program = programVisitor2.programVisitor(program);
                // script = program.astNode;
                // console.log("[AFTER builderLambdaTransformer] script: ", script.dumpSrc());
                // DEBUG_DUMP(script.dumpSrc(), "0_SRC_2_BuilderLambdaTransformer.ets", true)
                // // DEBUG_DUMP(script.dumpJson(), "0_SRC_2_BuilderLambdaTransformer.ets", false)
                this.setArkTSAst(script);
                console.log("------------- [UI PLUGIN] AFTER PARSED EXIT ------------- ");

                return script;
            }
            console.log("!!!!!!![UI PLUGIN] AFTER PARSED EXIT WITH NO TRANSFORM!!!!!!!");
        },
        bound(this: PluginContext) {
            let program = arkts.arktsGlobal.compilerContext.program;
            let script = program.astNode;
            if (script) {
                console.log("------------- [UI PLUGIN] AFTER BOUND ENTER -------------");
                DEBUG_DUMP(script.dumpSrc(), "0_SRC_4_AfterBound_Begin", true)
                // DEBUG_DUMP(script.dumpJson(), "0_SRC_4_AfterBound_Begin.ets", false)
                const builderLambdaTransformer = new BuilderLambdaTransformer();
                const programVisitor2 = new ProgramVisitor({
                    pluginName: "1_UI",
                    state: arkts.Es2pandaContextState.ES2PANDA_STATE_BOUND,
                    visitors: [builderLambdaTransformer],
                    skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES
                });
                program = programVisitor2.programVisitor(program);
                script = program.astNode;
                arkts.rebindSubtree(script);
                DEBUG_DUMP(script.dumpSrc(), "0_SRC_5_BuilderLambdaTransformer", true)
                // DEBUG_DUMP(script.dumpJson(), "0_SRC_5_BuilderLambdaTransformer.ets", false)
                console.log("[AFTER builderLambdaTransformer] script: ", script.dumpSrc());
                console.log("------------- [UI PLUGIN] AFTER BOUND EXIT -------------");
                return;
            }
            console.log("!!!!!!![UI PLUGIN] AFTER PARSED EXIT WITH NO BOUND!!!!!!!");
        },
        checked(this: PluginContext) {
            console.log("[UI PLUGIN] AFTER CHECKED ENTER");
            let program = arkts.arktsGlobal.compilerContext.program;
            let script = program.astNode;
            if (script) {
                console.log("[BEFORE STRUCT SCRIPT] script: ", script.dumpSrc());
                DEBUG_DUMP(script.dumpSrc(), "0_SRC_6_AfterCheck_Begin.ets", true)
                // DEBUG_DUMP(script.dumpJson(), "0_SRC_6_AfterCheck_Begin.ets", false)
                this.setArkTSAst(script);
                console.log("[UI PLUGIN] AFTER CHECKED EXIT");
                return script;
            }
            console.log("!!!!!!![UI PLUGIN] AFTER CHECKED EXIT WITH NO TRANSFORM!!!!!!!");
        }
        // checked(this: PluginContext) {
        //     console.log("[UI PLUGIN] AFTER CHECKED ENTER");
        //     let program = arkts.arktsGlobal.compilerContext.program;
        //     let script = program.astNode;
        //     if (script) {
        //         console.log("[BEFORE STRUCT SCRIPT] script: ", script.dumpSrc());
        //         DEBUG_DUMP(script.dumpSrc(), "0_SRC_6_AfterCheck_Begin.ets", true)
        //         const builderLambdaTransformer = new BuilderLambdaTransformer();
        //         const structTransformer = new StructTransformer();
        //         const programVisitor = new ProgramVisitor({
        //             state: arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED,
        //             visitors: [builderLambdaTransformer, structTransformer],
        //             skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES
        //         });

        //         program = programVisitor.programVisitor(program);
        //         script = program.astNode;
        //         DEBUG_DUMP(script.dumpSrc(), "0_SRC_7_AfterBound_Begin.ets", true)
        //         if (DEBUG) {
        //             console.log("[AFTER STRUCT SCRIPT] script: ", script.dumpSrc());
        //         }

        //         this.setArkTSAst(script);
        //         console.log("[UI PLUGIN] AFTER CHECKED EXIT");
        //         return script;
        //     }
        //     console.log("!!!!!!![UI PLUGIN] AFTER CHECKED EXIT WITH NO TRANSFORM!!!!!!!");
        // }
    }
}