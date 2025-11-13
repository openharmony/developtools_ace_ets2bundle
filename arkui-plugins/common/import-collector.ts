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

import * as arkts from '@koalaui/libarkts';
import { createAndInsertImportDeclaration } from './arkts-utils';

interface ImportInfo {
    imported: string;
    local: string;
    source: string;
    kind: arkts.Es2pandaImportKinds;
}

function insertImport(importInfo: ImportInfo, program?: arkts.Program): void {
    const source: arkts.StringLiteral = arkts.factory.create1StringLiteral(importInfo.source);
    const imported: arkts.Identifier = arkts.factory.createIdentifier(importInfo.imported);
    const local: arkts.Identifier = arkts.factory.createIdentifier(importInfo.local);
    // Insert this import at the top of the script's statements.
    if (!program) {
        throw Error('Failed to insert import: Transformer has no program');
    }
    createAndInsertImportDeclaration(source, imported, local, importInfo.kind, program);
}

export class ImportCollector {
    public importInfos: ImportInfo[];
    public localMap: Map<string, string>;
    public sourceMap: Map<string, string>;
    private static instance: ImportCollector;

    /** this set is used for keeping the import sentence unique */
    private imported: Set<string>;

    private constructor() {
        this.importInfos = [];
        this.imported = new Set();
        this.localMap = new Map();
        this.sourceMap = new Map();
    }

    static getInstance(): ImportCollector {
        if (!this.instance) {
            this.instance = new ImportCollector();
        }
        return this.instance;
    }

    reset(): void {
        this.localMap.clear();
        this.sourceMap.clear();
        this.clearImports();
    }

    clearImports(): void {
        this.importInfos = [];
        this.imported.clear();
    }

    collectSource(imported: string, source: string): void {
        if (!this.sourceMap.has(imported)) {
            this.sourceMap.set(imported, source);
        }
    }

    collectImport(
        imported: string,
        local?: string,
        kind: arkts.Es2pandaImportKinds = arkts.Es2pandaImportKinds.IMPORT_KINDS_TYPE
    ): void {
        if (!this.sourceMap.has(imported)) {
            throw new Error(`ImportCollector: import ${imported}'s source haven't been collected yet.`);
        }
        if (this.imported.has(imported)) {
            return;
        }
        const source: string = this.sourceMap.get(imported)!;
        const _local: string = local ?? imported;
        this.importInfos.push({
            source,
            imported,
            local: _local,
            kind,
        });
        this.localMap.set(imported, _local);
        this.imported.add(imported);
    }

    getLocal(imported: string): string | undefined {
        return this.localMap.get(imported);
    }

    insertCurrentImports(program?: arkts.Program): void {
        this.importInfos.forEach((importInfo) => {
            insertImport(importInfo, program);
        });
    }
}
