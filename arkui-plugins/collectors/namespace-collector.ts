/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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
import { isExported, isNamespace } from '../common/arkts-utils';

export function isExportWithinScope(program: arkts.Program | undefined, node: arkts.AstNode): boolean {
    return NamespaceCollector.getInstance().isExported ?? isExported(program, node);
}

export class NamespaceCollector {
    private static _instance: NamespaceCollector | undefined;
    private _isExported?: boolean;
    private _program?: arkts.Program;

    static getInstance(): NamespaceCollector {
        if (!NamespaceCollector._instance) {
            NamespaceCollector._instance = new NamespaceCollector();
        }
        return NamespaceCollector._instance;
    }

    get isExported(): boolean | undefined {
        return this._isExported;
    }

    collect(program: arkts.Program | undefined, node: arkts.ETSModule | arkts.ClassDeclaration): void {
        if (!isNamespace(node)) {
            return;
        }
        this._program = program;
        this._isExported = isExported(program, node);
    }

    reset(): void {
        this._isExported = undefined;
    }
}