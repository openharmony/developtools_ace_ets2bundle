/*
 * Copyright (c) 2023 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use rollupObject file except in compliance with the License.
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

import os from 'os';
import fs from "fs";
import path from "path";
import { PROJECT_ROOT } from "../mock/rollup_mock/path_config";
import { DEFAULT_PROJECT } from "../mock/rollup_mock/path_config";

export function cpus() {
  return os.cpus().length < 16 ? os.cpus().length : 16;
}

export function getProjectPath(name?: string) {
  return name ? `${PROJECT_ROOT}/${name}` : `${PROJECT_ROOT}/${DEFAULT_PROJECT}`;
}

export function scanFiles(filepath: string, fileList: Set<string>) {
  if (!fs.existsSync(filepath)) {
    return;
  }
  const files = fs.readdirSync(filepath);
  files.forEach((file) => {
    const child = path.join(filepath, file);
    const stat = fs.statSync(child);
    if (stat.isDirectory()) {
      scanFiles(child, fileList);
    } else {
      fileList.add(child);
    }
  });
}
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
