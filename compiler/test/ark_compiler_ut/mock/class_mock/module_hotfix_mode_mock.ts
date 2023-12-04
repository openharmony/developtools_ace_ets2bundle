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

import { ModuleHotfixMode } from '../../../../lib/fast_build/ark_compiler/module/module_hotfix_mode';

class ModuleHotfixModeMock extends ModuleHotfixMode {
  generateEs2AbcCmdForHotfixMock() {
    this.generateEs2AbcCmdForHotfix();
  }
}

export default ModuleHotfixModeMock;
