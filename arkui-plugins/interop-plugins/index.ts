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

import * as arkts from "@koalaui/libarkts"

import { DeclTransformer } from './decl-transformer';
import { EmitTransformer } from './emit-transformer';
import { ProgramVisitor } from "../common/program-visitor";
import { EXTERNAL_SOURCE_PREFIX_NAMES } from "../common/predefines";

export function interopTransform() {
  return {
    name: 'interop-plugin',
    parsed(this: interop.PluginContext) {
      console.log("interopTransform:parsed");
      let node = this.getArkTSAst();

      if (node) {
        // console.log("interopTransform:parsed:before:ast:", node.dumpSrc());
        // console.log("interopTransform:parsed:before:ast:", node.dumpJson());

        let script: arkts.EtsScript = node as arkts.EtsScript;

        const declTransformer = new DeclTransformer({ arkui: "@koalaui.arkts-arkui.DeclBase" });
        const programVisitor = new ProgramVisitor({
            pluginName: "decl",
            state: arkts.Es2pandaContextState.ES2PANDA_STATE_PARSED,
            visitors: [declTransformer],
            skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES
        });

        script = programVisitor.visitor(script);

        console.log("interopTransform:parsed:after:ast:", script.dumpSrc());
        // console.log("interopTransform:parsed:after:ast:", script.dumpJson());

        this.setArkTSAst(script);
        return script;
      }
    },
    checked(this: interop.PluginContext) {
      console.log("interopTransform:checked");
      let node = this.getArkTSAst();
      if (node) {
        // console.log("interopTransform:checked:before:ast:", node.dumpSrc());
        // console.log("interopTransform:parsed:before:ast:", node.dumpJson());

        let script: arkts.EtsScript = node as arkts.EtsScript;

        const emitTransformer = new EmitTransformer({ arkui: "@koalaui.arkts-arkui.EmitBase" });
        const programVisitor = new ProgramVisitor({
            pluginName: "emit",
            state: arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED,
            visitors: [emitTransformer],
            skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES
        });

        // script = programVisitor.visitor(script);

        // console.log("interopTransform:checked:after:ast:", script.dumpSrc());
        // console.log("interopTransform:checked:after:ast:", script.dumpJson());

        this.setArkTSAst(script);
        return script;
      }
    }
  }
}
