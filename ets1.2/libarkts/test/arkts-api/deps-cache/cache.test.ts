/*
 * Copyright (c) 2024-2025 Huawei Device Co., Ltd.
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

import * as fs from "node:fs"
import * as path from "node:path"
import * as util from "../../test-util"
import * as arkts from "../../../src"
import { suite, test } from "@koalaui/harness"

const DIR = './test/arkts-api/deps-cache'
const PANDA_SDK_PATH = process.env.PANDA_SDK_PATH ?? '../../incremental/tools/panda/node_modules/@panda/sdk'

suite(util.basename(__filename), () => {
    test('basic', () => {
        fs.mkdirSync(`${DIR}/build/deps`, { recursive: true })
        fs.mkdirSync(`${DIR}/build/user`, { recursive: true })

        const file1 = path.join(process.cwd(), DIR, './deps/library.ets')
        const file2 = path.join(process.cwd(), DIR, './deps/headers.ets')
        const file3 = path.join(process.cwd(), DIR, './user/main.ets')

        arkts.arktsGlobal.filePath = file1
        const cmd1 = [
            '_',
            '--arktsconfig',
            `${DIR}/arktsconfig-deps.json`,
            '--extension',
            'ets',
            '--stdlib',
            `${PANDA_SDK_PATH}/ets/stdlib`,
            '--output',
            `${DIR}/build/deps/library.abc`,
            file1,
        ]
        arkts.arktsGlobal.config = arkts.Config.create(cmd1).peer
        arkts.arktsGlobal.compilerContext = arkts.Context.createFromFile(file1)
        arkts.proceedToState(arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED)
        arkts.arktsGlobal.generatedEs2panda._GenerateStaticDeclarationsFromContext(arkts.arktsGlobal.context, `${DIR}/build/deps/library.etscache`)
        arkts.proceedToState(arkts.Es2pandaContextState.ES2PANDA_STATE_BIN_GENERATED)

        arkts.arktsGlobal.filePath = file2
        const cmd2 = [
            '_',
            '--arktsconfig',
            `${DIR}/arktsconfig-deps.json`,
            '--extension',
            'ets',
            '--stdlib',
            `${PANDA_SDK_PATH}/ets/stdlib`,
            '--output',
            `${DIR}/build/deps/headers.abc`,
            file2,
        ]
        arkts.arktsGlobal.config = arkts.Config.create(cmd2).peer
        arkts.arktsGlobal.compilerContext = arkts.Context.createFromFile(file2)
        arkts.proceedToState(arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED)
        arkts.arktsGlobal.generatedEs2panda._GenerateStaticDeclarationsFromContext(arkts.arktsGlobal.context, `${DIR}/build/deps/headers.etscache`)
        arkts.proceedToState(arkts.Es2pandaContextState.ES2PANDA_STATE_BIN_GENERATED)

        arkts.arktsGlobal.filePath = file3
        const cmd3 = [
            '_',
            '--arktsconfig',
            `${DIR}/arktsconfig-user.json`,
            '--extension',
            'ets',
            '--stdlib',
            `${PANDA_SDK_PATH}/ets/stdlib`,
            '--output',
            `${DIR}/build/user/main.abc`,
            file3,
        ]
        arkts.arktsGlobal.config = arkts.Config.create(cmd3).peer
        arkts.arktsGlobal.compilerContext = arkts.Context.createFromFile(file3)
        arkts.proceedToState(arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED)
        arkts.proceedToState(arkts.Es2pandaContextState.ES2PANDA_STATE_BIN_GENERATED)

        arkts.arktsGlobal.compilerContext?.destroy();
        arkts.arktsGlobal.configObj?.destroy();
    })
})
