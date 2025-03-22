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
import { KPointer } from "@koalaui/interop"
import { AbstractVisitor, VisitorOptions } from "./abstract-visitor";
import { matchPrefix } from "./arkts-utils";
import { DEBUG_DUMP, getEnumName } from "./utils";

export interface ProgramVisitorOptions extends VisitorOptions {
    pluginName: string;
    state: arkts.Es2pandaContextState;
    visitors: AbstractVisitor[];
    skipPrefixNames: string[];
}

export class ProgramVisitor extends AbstractVisitor {
    private pluginName: string;
    private state: arkts.Es2pandaContextState;
    private visitors: AbstractVisitor[];
    private skipPrefixNames: string[];
    private filenames: Map<arkts.Program, string> = new Map<arkts.Program, string>;
    constructor(options: ProgramVisitorOptions) {
        super(options);
        this.pluginName = options.pluginName
        this.state = options.state;
        this.visitors = options.visitors;
        this.skipPrefixNames = options.skipPrefixNames ?? [];
    }

    programVisitor(program: arkts.Program): arkts.Program {
        const skipPrefixes: string[] = this.skipPrefixNames;

        const visited: Set<KPointer> = new Set();
        const queue: arkts.Program[] = [program];

        while (queue.length > 0) {
            const currProgram = queue.shift()!;
            if (visited.has(currProgram.peer)) {
                continue;
            }
    
            if (currProgram.peer !== program.peer) {
                // console.log(`[BEFORE TRANSFORM EXTERNAL SOURCE] ${this.state} script: `, currProgram.astNode.dumpSrc());
                if (this.state === arkts.Es2pandaContextState.ES2PANDA_STATE_PARSED) {
                    DEBUG_DUMP(currProgram.astNode.dumpSrc(), "0_ORI_" + this.filenames.get(currProgram), true)
                    // DEBUG_DUMP(currProgram.astNode.dumpJson(), "0_ORI_" + this.filenames.get(currProgram)+ ".ets", false)
                }
                const script = this.visitor(currProgram.astNode, true);
                if (script) {
                    // console.log(`[AFTER TRANSFORM EXTERNAL SOURCE] ${this.state} script: `, script.dumpSrc());
                    DEBUG_DUMP(script.dumpSrc(), this.state + "_" + getEnumName(arkts.Es2pandaContextState, this.state) + "_" + this.pluginName + "_" + this.filenames.get(currProgram), true)
                    // DEBUG_DUMP(script.dumpJson(), this.state + "_" + getEnumName(arkts.Es2pandaContextState, this.state) + "_" + this.pluginName + "_" +this.filenames.get(currProgram)+ ".ets", false)
                }

                if (this.pluginName === "2_Memo") {
                    DEBUG_DUMP(currProgram.astNode.dumpSrc(), this.filenames.get(currProgram)+ ".ets", true)
                    // DEBUG_DUMP(currProgram.astNode.dumpJson(), this.filenames.get(currProgram)+ ".ets", false)
                }
            }

            visited.add(currProgram.peer);

            for (const externalSource of currProgram.externalSources) {
                // TODO: this is very time-consuming...
                if (matchPrefix(skipPrefixes, externalSource.getName())) {
                    continue;
                }
    
                const nextProgramArr: arkts.Program[] = externalSource.programs ?? [];
                for (const nextProgram of nextProgramArr) {
                    this.filenames.set(nextProgram, externalSource.getName());
                    if (!visited.has(nextProgram.peer)) {
                        queue.push(nextProgram);
                    }
                }
            }
        }

        let programScript = program.astNode;
        programScript = this.visitor(programScript, this.isExternal) as arkts.EtsScript;

        return program;
    }

    visitor(node: arkts.AstNode, isExternal?: boolean): arkts.EtsScript {
        let script: arkts.EtsScript = node as arkts.EtsScript;
        let count = 0;
        for (const transformer of this.visitors) {
            // script = new Importer().visitor(script) as arkts.EtsScript;
            transformer.isExternal = isExternal ?? false;
            script = transformer.visitor(script) as arkts.EtsScript;
            arkts.setAllParents(script);
        }

        // if (this.state === arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED) {
        //     console.log(`[AFTER ${count} TRANSFORMER] rechecking...`)
        //     arkts.recheckSubtree(script);
        //     console.log(`[AFTER ${count} TRANSFORMER] rechecking PASS`)
        // }

        // console.log(`[AFTER ${count} TRANSFORMER] script: dumpSrc: `, script.dumpSrc());
        // console.log(`[AFTER ${count} TRANSFORMER] script: dumpJson: `, script.dumpJson());
        return script;
    }
}