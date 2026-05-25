/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import fs from 'fs';
import path from 'path';

describe('ArkUI annotation imports', () => {
    it('inserts Builder and ComponentBuilder as non-type-only imports', () => {
        const factorySource = fs.readFileSync(
            path.resolve(__dirname, '../../../../ui-plugins/struct-translators/factory.ts'),
            'utf8'
        );

        expect(factorySource).toMatch(
            /collectImport\(\s*DecoratorNames\.BUILDER,\s*undefined,\s*arkts\.Es2pandaImportKinds\.IMPORT_KINDS_ALL\s*\)/
        );
        expect(factorySource).toMatch(
            /collectImport\(\s*BuilderLambdaNames\.ANNOTATION_NAME,\s*undefined,\s*arkts\.Es2pandaImportKinds\.IMPORT_KINDS_ALL\s*\)/
        );
    });

    it('defaults generated imports to value-kind so annotation imports are not type-only', () => {
        const importCollectorSource = fs.readFileSync(
            path.resolve(__dirname, '../../../../common/import-collector.ts'),
            'utf8'
        );

        expect(importCollectorSource).toMatch(
            /collectImport\([^)]*kind:\s*arkts\.Es2pandaImportKinds\s*=\s*arkts\.Es2pandaImportKinds\.IMPORT_KINDS_ALL/s
        );
        expect(importCollectorSource).toMatch(
            /collectLocalImport\([^)]*kind:\s*arkts\.Es2pandaImportKinds\s*=\s*arkts\.Es2pandaImportKinds\.IMPORT_KINDS_ALL/s
        );
    });
});
