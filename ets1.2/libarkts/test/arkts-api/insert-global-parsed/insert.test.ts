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

const DIR = './test/arkts-api/insert-global-parsed'
const PANDA_SDK_PATH = process.env.PANDA_SDK_PATH ?? '../../incremental/tools/panda/node_modules/@panda/sdk'

suite(util.basename(__filename), () => {
    test('basic', () => {
        util.initConfig()

        fs.mkdirSync(`${DIR}/build`, { recursive: true })

        const file1 = path.join(process.cwd(), DIR, './src/main.ets')

        arkts.arktsGlobal.filePath = file1
        const cmd1 = [
            '_',
            '--arktsconfig',
            `${DIR}/arktsconfig.json`,
            '--extension',
            'ets',
            '--stdlib',
            `${PANDA_SDK_PATH}/ets/stdlib`,
            '--output',
            `${DIR}/build/main.abc`,
            file1,
        ]
        arkts.arktsGlobal.config = arkts.Config.create(cmd1).peer
        arkts.arktsGlobal.compilerContext = arkts.Context.createFromFile(file1)
        arkts.proceedToState(arkts.Es2pandaContextState.ES2PANDA_STATE_PARSED)

        const ast = arkts.arktsGlobal.compilerContext.program.ast
        ast.setStatements([
            ...ast.statements,
            arkts.factory.createVariableDeclaration(
                arkts.Es2pandaVariableDeclarationKind.VARIABLE_DECLARATION_KIND_LET,
                [
                    arkts.factory.createVariableDeclarator(
                        arkts.Es2pandaVariableDeclaratorFlag.VARIABLE_DECLARATOR_FLAG_LET,
                        arkts.factory.createIdentifier(
                            "moreItems",
                            arkts.factory.createETSUnionType(
                            [
                                arkts.factory.createETSTypeReference(
                                    arkts.factory.createETSTypeReferencePart(
                                        arkts.factory.createIdentifier("FixedArray"),
                                        arkts.factory.createTSTypeParameterInstantiation(
                                            [
                                                arkts.factory.createETSTypeReference(
                                                    arkts.factory.createETSTypeReferencePart(
                                                        arkts.factory.createIdentifier("Int"),
                                                    )
                                                ),
                                            ]
                                        ),
                                    )
                                ),
                                arkts.factory.createETSUndefinedType(),
                            ])
                        ),
                        arkts.factory.createUndefinedLiteral(),
                    )
                ],
                undefined,
                arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_PUBLIC | arkts.Es2pandaModifierFlags.MODIFIER_FLAGS_STATIC,
            )
        ])

        arkts.proceedToState(arkts.Es2pandaContextState.ES2PANDA_STATE_BIN_GENERATED)
        arkts.arktsGlobal.compilerContext?.destroy();
        arkts.arktsGlobal.configObj?.destroy();
    })
})
