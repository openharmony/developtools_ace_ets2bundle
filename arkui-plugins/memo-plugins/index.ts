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

import { PluginContext } from "../common/plugin-context";
import { FunctionTransformer } from "./function-transformer";
import { PositionalIdTracker } from "./utils";
import { ReturnTransformer } from "./return-transformer";
import { ParameterTransformer } from "./parameter-transformer";
import { ProgramVisitor } from "../common/program-visitor";
import { EXTERNAL_SOURCE_PREFIX_NAMES } from "../common/predefines";

export function unmemoizeTransform() {
    return {
        name: 'memo-plugin',
        checked(this: PluginContext) {
            console.log("In ArkUI afterChecked")
            // const node = this.getArkTSAst();
            let program = this.getArkTSProgram();
            if (program) {
                let script: arkts.EtsScript = program.astNode;
                console.log('[BEFORE MEMO SCRIPT] script: ', script.dumpSrc());

                const positionalIdTracker = new PositionalIdTracker(arkts.getFileName(), false);
                const parameterTransformer = new ParameterTransformer(positionalIdTracker);
                const returnTransformer = new ReturnTransformer();
                const functionTransformer = new FunctionTransformer(
                    positionalIdTracker, 
                    parameterTransformer, 
                    returnTransformer
                );

                const programVisitor = new ProgramVisitor(
                    [functionTransformer],
                    { skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES }
                );

                // program = programVisitor.programVisitor(program);
                // script = program.astNode;

                script = programVisitor.visitor(script);

                console.log('[AFTER MEMO SCRIPT] script: ', script.dumpSrc());

                this.setArkTSAst(script);
                return script;
            }
        }
    }
}