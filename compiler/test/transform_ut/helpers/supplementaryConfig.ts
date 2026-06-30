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

const PROJECT_ROOT: string = path.resolve(__dirname, '../../../test/transform_ut');
const TEST_CASES_PATH: string = path.resolve(PROJECT_ROOT, 'application', 'entry/src/main/ets/pages');
const SUPPLEMENTARY_FS_DIR: string = path.resolve(TEST_CASES_PATH, 'utForValidate/Decorators/supplementary_validation_V2');
const SUPPLEMENTARY_PAGE_PREFIX: string = 'Decorators/supplementary_validation_V2';
const ERROR_CONFIG_FILENAME: string = '_error_config.json';

interface LogInfo {
  type?: string;
  message: string;
  code?: string;
  solutions?: string[];
}

interface BatchInfo {
  name: string;
  pages: string[];
  errors: Record<string, LogInfo[]>;
}

function scanBatches(): BatchInfo[] {
  const batches: BatchInfo[] = [];
  if (!fs.existsSync(SUPPLEMENTARY_FS_DIR)) {
    return batches;
  }

  const entries = fs.readdirSync(SUPPLEMENTARY_FS_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const batchName: string = entry.name;
    const batchDir: string = path.join(SUPPLEMENTARY_FS_DIR, batchName);

    const etsFiles: string[] = fs.readdirSync(batchDir)
      .filter(f => f.endsWith('.ets'))
      .sort();

    if (etsFiles.length === 0) continue;

    const pages: string[] = etsFiles.map(f => {
      const baseName: string = f.replace(/\.ets$/, '');
      return `${SUPPLEMENTARY_PAGE_PREFIX}/${batchName}/${baseName}`;
    });

    let errors: Record<string, LogInfo[]> = {};
    const errorConfigPath: string = path.join(batchDir, ERROR_CONFIG_FILENAME);
    if (fs.existsSync(errorConfigPath)) {
      errors = JSON.parse(fs.readFileSync(errorConfigPath, 'utf-8'));
    }

    batches.push({ name: batchName, pages, errors });
  }

  return batches;
}

const batchData: BatchInfo[] = scanBatches();

const SUPPLEMENTARY_PAGES: string[] = batchData.flatMap(b => b.pages);

const supplementaryErrorLookup: Map<string, LogInfo[]> = new Map();
batchData.forEach(batch => {
  batch.pages.forEach(page => {
    const fileName: string = path.basename(page);
    supplementaryErrorLookup.set(page, batch.errors[fileName] ?? []);
  });
});

function getSupplementaryErrors(pagePath: string): LogInfo[] | undefined {
  return supplementaryErrorLookup.get(pagePath);
}

export {
  SUPPLEMENTARY_PAGES,
  getSupplementaryErrors,
};
