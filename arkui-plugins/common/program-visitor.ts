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
import { AbstractVisitor, VisitorOptions } from "./abstract-visitor";
import { matchPrefix } from "./arkts-utils";
import { debugDump, getEnumName, getDumpFileName } from "./debug";

export interface ProgramVisitorOptions extends VisitorOptions {
    pluginName: string;
    state: arkts.Es2pandaContextState;
    visitors: AbstractVisitor[];
    skipPrefixNames: string[];
}

export class ProgramVisitor extends AbstractVisitor {
    private readonly pluginName: string;
    private readonly state: arkts.Es2pandaContextState;
    private readonly visitors: AbstractVisitor[];
    private readonly skipPrefixNames: string[];
    private filenames: Map<number, string>;

    constructor(options: ProgramVisitorOptions) {
        super(options);
        this.pluginName = options.pluginName
        this.state = options.state;
        this.visitors = options.visitors;
        this.skipPrefixNames = options.skipPrefixNames ?? [];
        this.filenames = new Map();
    }

    reset(): void {
        super.reset();
        this.filenames = new Map();
    }

    programVisitor(program: arkts.Program): arkts.Program {
        const skipPrefixes: string[] = this.skipPrefixNames;

        const visited = new Set();
        const queue: arkts.Program[] = [program];

        while (queue.length > 0) {
            const currProgram = queue.shift()!;
            if (visited.has(currProgram.peer)) {
                continue;
            }
    
            if (currProgram.peer !== program.peer) {
                const name: string = this.filenames.get(currProgram.peer)!;
                debugDump(
                    currProgram.astNode.dumpSrc(), 
                    getDumpFileName(this.state, "ORI", undefined, name), 
                    true
                );
                const script = this.visitor(currProgram.astNode, currProgram, name);
                if (script) {
                    debugDump(
                        script.dumpSrc(), 
                        getDumpFileName(this.state, this.pluginName, undefined, name),
                        true
                    );
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
                    this.filenames.set(nextProgram.peer, externalSource.getName());
                    if (!visited.has(nextProgram.peer)) {
                        queue.push(nextProgram);
                    }
                }
            }
        }

        let programScript = program.astNode;
        programScript = this.visitor(programScript, program, this.externalSourceName);

        return program;
    }

    visitor(node: arkts.AstNode, program?: arkts.Program, externalSourceName?: string): arkts.EtsScript {
        let script: arkts.EtsScript = node as arkts.EtsScript;
        let count: number = 0;
        for (const transformer of this.visitors) {
            transformer.isExternal = !!externalSourceName;
            transformer.externalSourceName = externalSourceName;
            transformer.program = program;
            script = transformer.visitor(script) as arkts.EtsScript;
            transformer.reset();
            arkts.setAllParents(script);
            if (!transformer.isExternal) {
                debugDump(
                    script.dumpSrc(), 
                    getDumpFileName(this.state, this.pluginName, count, transformer.constructor.name), 
                    true
                );
                count += 1;
            }
        }
        return script;
    }
}