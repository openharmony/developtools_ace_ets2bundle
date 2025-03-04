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

import { KPointer } from "@koalaui/interop";
import * as arkts from "@koalaui/libarkts";
import { AbstractVisitor } from "./abstract-visitor";
import { matchPrefix } from "./arkts-utils";

export interface ProgramVisitorOptions{
    skipPrefixNames: string[]
}

export class ProgramVisitor extends AbstractVisitor {
    constructor(
        private visitors: AbstractVisitor[],
        private options?: ProgramVisitorOptions
    ) {
        super();
    }

    programVisitor(program: arkts.Program): arkts.Program {
        const skipPrefixes: string[] = this.options?.skipPrefixNames ?? [];

        const visited: Set<KPointer> = new Set();
        const queue: arkts.Program[] = [program];

        while (queue.length > 0) {
            const currProgram = queue.shift()!;
            if (visited.has(currProgram.peer)) {
                continue;
            }
    
            if (currProgram.peer !== program.peer) {
                console.log("[BEFORE TRANSFORM EXTERNAL SOURCE] script: ", currProgram.astNode.dumpSrc());
                const script = this.visitor(currProgram.astNode);
                if (script) {
                    console.log("[AFTER TRANSFORM EXTERNAL SOURCE] script: ", script.dumpSrc());
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
                    if (!visited.has(nextProgram.peer)) {
                        queue.push(nextProgram);
                    }
                }
            }
        }

        let programScript = program.astNode;
        programScript = this.visitor(programScript) as arkts.EtsScript;

        return program;
    }

    visitor(node: arkts.AstNode): arkts.EtsScript {
        let script: arkts.EtsScript = node as arkts.EtsScript;
        for (const transformer of this.visitors) {
            script = transformer.visitor(script) as arkts.EtsScript;
        } 
        return script;
    }
}