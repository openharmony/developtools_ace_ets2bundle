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

import * as arkts from '@koalaui/libarkts';
import { debugLog } from './debug';
import path from 'path';

const LIB_SUFFIX = '.d.ets';
const ARKUI = 'arkui';

export class ProgramSkipper {
    private static _absName2programs: Map<string, arkts.Program[]> = new Map();
    private static _uiProgramSet: Set<number> = new Set();
    private static _edges: Map<number, arkts.Program[]> = new Map();
    private static _initedCanSkip: boolean = false;

    private static dfs(program: arkts.Program): void {
        if (this._uiProgramSet.has(program.peer)) {
            return;
        }
        this._uiProgramSet.add(program.peer);
        if (this._edges.has(program.peer)) {
            for (const to of this._edges.get(program.peer)!) {
                this.dfs(to);
            }
        }
    }

    private static addEdges(program: arkts.Program): void {
        for (const statement of program.astNode.statements) {
            if (arkts.isETSImportDeclaration(statement)) {
                const absName = statement.resolvedSource;
                if (!absName || !this._absName2programs.has(absName)) {
                    continue;
                }
                for (const importProg of this._absName2programs.get(absName)!) {
                    const edges = this._edges.get(importProg.peer) || [];
                    edges.push(program);
                    this._edges.set(importProg.peer, edges);
                }
            }
        }
    }

    private static addProgramToMap(program: arkts.Program): void {
        const absName = program.absName;
        const name2programs = this._absName2programs.get(absName) || [];
        name2programs.push(program);
        this._absName2programs.set(absName, name2programs);

        const folder = path.dirname(absName);
        const folder2programs = this._absName2programs.get(folder) || [];
        folder2programs.push(program);
        this._absName2programs.set(folder, folder2programs);
    }

    private static initCanSkip(programs: arkts.Program[] | undefined): void {
        if (!programs) {
            return;
        }
        const start = performance.now();
        programs.forEach(p => this.addProgramToMap(p));
        programs.forEach(p => this.addEdges(p));
        programs.forEach(p => {
            if (p.absName.endsWith(LIB_SUFFIX) && p.absName.includes(ARKUI)) {
                this.dfs(p);
            }
        });
        const end = performance.now();
        debugLog(`[program skipper] initialization duration ${(end - start).toFixed(2)} ms`);
    }

    public static clear(): void {
        this._uiProgramSet.clear();
        this._initedCanSkip = false;
    }

    public static canSkipProgram(program: arkts.Program | undefined): boolean {
        if (!arkts.arktsGlobal.configObj ||
            arkts.arktsGlobal.configObj.compilationMode !== arkts.Es2pandaCompilationMode.COMPILATION_MODE_GEN_ABC_FOR_EXTERNAL_SOURCE) {
            return false;
        }
        if (!program) {
            return false;
        }
        if (!this._initedCanSkip) {
            const programs = [...arkts.arktsGlobal.compilerContext?.program.externalSources.flatMap(s => s.programs)!, program];
            this.initCanSkip(programs);
            this._initedCanSkip = true;
            this._absName2programs.clear();
            this._edges.clear();
        }
        return !this._uiProgramSet.has(program.peer);
    }
}