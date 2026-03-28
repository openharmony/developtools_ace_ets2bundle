/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
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

import * as util from "../../test-util"
import * as arkts from "../../../src/arkts-api"
import { suite, test, assert } from "@koalaui/harness"

const PANDA_SDK_PATH = process.env.PANDA_SDK_PATH ?? '../../incremental/tools/panda/node_modules/@panda/sdk'

suite(util.basename(__filename), () => {
    test("sample-1", function() {
        util.initConfig()

        const sample_in =
        `
        `

        let script = arkts.createETSModuleFromSource(sample_in)

        script = arkts.factory.updateETSModule(
            script,
            [
                arkts.factory.createExpressionStatement(
                    arkts.factory.createIdentifier(
                        'abc'
                    )
                )
            ],
            script.ident,
            script.getNamespaceFlag(),
            script.program,
        )

        util.ARKTS_TEST_ASSERTION(
            script,
            `
            abc
            `,
            arkts.Es2pandaContextState.ES2PANDA_STATE_PARSED
        )
    })
    test("filter", function() {
        arkts.arktsGlobal.compilerContext = arkts.Context.createFromString(
`
@interface memo {}

struct Noo {}

class Foo {
    @memo
    foo1() {}

    bar: int = 42
    foo2() {}

    @memo
    foo3() {}
}

interface IFoo {
    @memo
    ifoo1() {}

    ifoo2() {}

    @memo
    ifoo3() {}
}

struct Moo {}
`
        )
        arkts.proceedToState(arkts.Es2pandaContextState.ES2PANDA_STATE_PARSED)
        const program = arkts.arktsGlobal.compilerContext!.program
        const memos = arkts.filterNodes(program.ast, "type=function;annotation=memo", false)
        assert.equal(memos.length, 4)
        assert.equal((memos[0] as arkts.MethodDefinition).id!.name, "foo1")
        const structs = arkts.filterNodes(program.ast, "type=struct", false)
        assert.equal(structs.length, 2)
        assert.equal((structs[0] as arkts.ETSStructDeclaration).definition.ident!.name, "Noo")

        arkts.arktsGlobal.compilerContext?.destroy();
        arkts.arktsGlobal.configObj?.destroy();
    })
})
