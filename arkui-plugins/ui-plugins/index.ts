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
import { PluginContext } from "../common/plugin-context"
import { ProgramVisitor } from "../common/program-visitor"
import { EXTERNAL_SOURCE_PREFIX_NAMES } from "../common/predefines"

const DEBUG = process.argv.includes('--debug');

export function uiTransform() {
    return {
        name: 'ui-plugin',
        parsed(this: PluginContext) {
            console.log("[UI PLUGIN] AFTER PARSED ENTER");
            let node = this.getArkTSAst();
            if (node) {
                let script: arkts.EtsScript = node;

                const componentTransformer = new ComponentTransformer({ arkui: "@koalaui.arkts-arkui.StructBase" });
                const programVisitor = new ProgramVisitor(
                    [componentTransformer],
                    { skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES }
                );

                // program = programVisitor.programVisitor(program);
                // script = program.astNode;

                script = programVisitor.visitor(script);

                if (DEBUG) {
                    console.log("[AFTER PARSED SCRIPT]: ", script.dumpSrc());   
                }

                this.setArkTSAst(script);
                console.log("[UI PLUGIN] AFTER PARSED EXIT");
                return script;
            }
            console.log("[UI PLUGIN] AFTER PARSED EXIT WITH NO TRANSFORM");
        },
        checked(this: PluginContext) {
            console.log("[UI PLUGIN] AFTER CHECKED ENTER");
            let node = this.getArkTSAst();
            if (node) {
                let script: arkts.EtsScript = node;

                const builderLambdaTransformer = new BuilderLambdaTransformer();
                const structTransformer = new StructTransformer();
                const programVisitor = new ProgramVisitor(
                    [builderLambdaTransformer, structTransformer],
                    { skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES }
                );

                // program = programVisitor.programVisitor(program);
                // script = program.astNode;

                script = programVisitor.visitor(script);

                if (DEBUG) {
                    console.log("[AFTER STRUCT SCRIPT] script: ", script.dumpSrc());
                }

                this.setArkTSAst(script);
                console.log("[UI PLUGIN] AFTER CHECKED EXIT");
                return script;
            }
            console.log("[UI PLUGIN] AFTER CHECKED EXIT WITH NO TRANSFORM");
        }
    }
}