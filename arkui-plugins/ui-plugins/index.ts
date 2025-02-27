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

export function uiTransform() {
    return {
        name: 'ui-plugin',
        parsed(this: PluginContext) {
            const node = this.getArkTSAst();
            if (node) {
                let script: arkts.EtsScript = node;

                const componentTransformer = new ComponentTransformer({ arkui: "@koalaui.arkts-arkui.StructBase" });

                script = componentTransformer.visitor(node) as arkts.EtsScript;

                arkts.setAllParents(script);
                this.setArkTSAst(script);
                return script;
            }
        },
        checked(this: PluginContext) {
            const node = this.getArkTSAst();
            if (node) {
                let script: arkts.EtsScript = node;

                const builderLambdaTransformer = new BuilderLambdaTransformer();
                const structTransformer = new StructTransformer();

                script = builderLambdaTransformer.visitor(script) as arkts.EtsScript;
                script = structTransformer.visitor(script) as arkts.EtsScript;

                arkts.setAllParents(script);
                this.setArkTSAst(script);

                console.log("[AFTER STRUCT SCRIPT] script: ", script.dumpSrc());

                return script;
            }
        }
    }
}