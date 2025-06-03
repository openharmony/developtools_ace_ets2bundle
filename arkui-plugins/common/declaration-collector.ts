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

export class DeclarationCollector {
    public fromExternalSourceNames: Set<string>;
    static instance: DeclarationCollector;

    private constructor() {
        this.fromExternalSourceNames = new Set();
    }

    static getInstance(): DeclarationCollector {
        if (!this.instance) {
            this.instance = new DeclarationCollector();
        }
        return this.instance;
    }

    collect(decl: arkts.AstNode | undefined): void {
        if (!decl) {
            return;
        }
        const moduleName: string = arkts.getProgramFromAstNode(decl).moduleName;
        this.fromExternalSourceNames.add(moduleName);
    }

    reset(): void {
        this.fromExternalSourceNames.clear();
    }
}