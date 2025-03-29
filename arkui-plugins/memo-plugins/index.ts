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
import { debugDump, debugLog, getDumpFileName } from "../common/debug"
import { SignatureTransformer } from "./signature-transformer";

export function unmemoizeTransform(): Plugins {
    return {
        name: 'memo-plugin',
        checked(this: PluginContext) {
            console.log("[MEMO PLUGIN] AFTER CHECKED ENTER");
            let program = arkts.arktsGlobal.compilerContext.program;
            let script = program.astNode;
            if (script) {
                debugLog("[BEFORE MEMO SCRIPT] script: ", script.dumpSrc());
                debugDump(script.dumpSrc(), getDumpFileName(0, "SRC", 5, "MEMO_AfterCheck_Begin"), true);

                const positionalIdTracker = new PositionalIdTracker(arkts.getFileName(), false);
                const parameterTransformer = new ParameterTransformer({ positionalIdTracker });
                const returnTransformer = new ReturnTransformer();
                const signatureTransformer = new SignatureTransformer();
                const functionTransformer = new FunctionTransformer({
                    positionalIdTracker, 
                    parameterTransformer, 
                    returnTransformer,
                    signatureTransformer
                });

                const programVisitor = new ProgramVisitor({
                    pluginName: unmemoizeTransform.name,
                    state: arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED,
                    visitors: [functionTransformer],
                    skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES
                });

                program = programVisitor.programVisitor(program);
                script = program.astNode;

                debugLog('[AFTER MEMO SCRIPT] script: ', script.dumpSrc());
                debugDump(script.dumpSrc(), getDumpFileName(0, "SRC", 6, "MEMO_AfterCheck_End"), true);

                arkts.recheckSubtree(script);
                this.setArkTSAst(script);
                console.log("[MEMO PLUGIN] AFTER CHECKED EXIT");
                return script;
            }
            console.log("[MEMO PLUGIN] AFTER CHECKED EXIT WITH NO TRANSFORM");
        }
    }
}