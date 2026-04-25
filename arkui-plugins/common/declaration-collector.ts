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
import { IMPORT_SOURCE_MAP_V2, INTERMEDIATE_IMPORT_SOURCE } from './predefines';
import { ImportCollector } from './import-collector';

export class DeclarationCollector {
    private fromExternalSourceNameMap: Map<string, string>;
    private fromExternalSourceNodePeerMap: Map<unknown, string>;
    static instance: DeclarationCollector;

    private constructor() {
        this.fromExternalSourceNameMap = new Map();
        this.fromExternalSourceNodePeerMap = new Map();
    }

    static getInstance(): DeclarationCollector {
        if (!this.instance) {
            this.instance = new DeclarationCollector();
        }
        return this.instance;
    }

    private collectIntermediateImportSource(symbol: string, declSourceName: string): void {
        let sourceName: string;
        if (IMPORT_SOURCE_MAP_V2.has(symbol)) {
            sourceName = IMPORT_SOURCE_MAP_V2.get(symbol)!;
        } else {
            sourceName = declSourceName;
        }
        ImportCollector.getInstance().collectSource(symbol, sourceName);
    }

    collect(decl: arkts.AstNode | undefined): void {
        if (!decl) {
            return;
        }
        let declName: string | undefined;
        if (arkts.isAnnotationDeclaration(decl) && !!decl.expr && arkts.isIdentifier(decl.expr)) {
            declName = decl.expr.name;
        } else if (arkts.isMethodDefinition(decl)) {
            declName = decl.name.name;
        } else if (arkts.isIdentifier(decl)) {
            declName = decl.name;
        } else if (arkts.isClassProperty(decl) && !!decl.key && arkts.isIdentifier(decl.key)) {
            declName = decl.key.name;
        } else if (arkts.isEtsParameterExpression(decl)) {
            declName = decl.identifier.name;
        }
        if (!declName) {
            return;
        }
        let sourceName = arkts.getProgramFromAstNode(decl)?.moduleName;
        if (!sourceName) {
            return;
        }
        this.fromExternalSourceNameMap.set(declName, sourceName);
        this.fromExternalSourceNodePeerMap.set(decl.peer, sourceName);

        INTERMEDIATE_IMPORT_SOURCE.get(declName)?.forEach((symbol) => {
            this.collectIntermediateImportSource(symbol, sourceName);
        });
    }

    findExternalSourceFromName(declName: string): string | undefined {
        return this.fromExternalSourceNameMap.get(declName);
    }

    findExternalSourceFromNode(decl: arkts.AstNode): string | undefined {
        return this.fromExternalSourceNodePeerMap.get(decl.peer);
    }

    reset(): void {
        this.fromExternalSourceNameMap.clear();
        this.fromExternalSourceNodePeerMap.clear();
    }
}
