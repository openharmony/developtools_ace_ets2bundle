/*
 * Copyright (c) 2022-2025 Huawei Device Co., Ltd.
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

import * as arkts from "@koalaui/libarkts"
import { factory } from "./memo-factory"
import { AbstractVisitor } from "../common/abstract-visitor"
import { isSyntheticReturnStatement } from "./utils"

export class ReturnTransformer extends AbstractVisitor {
    private skipNode?: arkts.ReturnStatement

    skip(syntheticReturnStatement?: arkts.ReturnStatement): ReturnTransformer {
        this.skipNode = syntheticReturnStatement
        return this
    }

    visitor(beforeChildren: arkts.AstNode): arkts.AstNode {
        // TODO: temporary checking skip nodes by comparison with expected skip nodes
        // Should be fixed when update procedure implemented properly
        if (/* beforeChildren === this.skipNode */ beforeChildren instanceof arkts.ReturnStatement && isSyntheticReturnStatement(beforeChildren)) {
            return arkts.factory.createBlock(
                [
                    factory.createRecacheCall(beforeChildren.argument),
                    arkts.factory.createReturnStatement()
                ]
            )
        }
        if (beforeChildren instanceof arkts.ScriptFunction) {
            return beforeChildren
        }
        const node = this.visitEachChild(beforeChildren)
        if (node instanceof arkts.ReturnStatement) {
            // const argument = node.argument;
            return arkts.factory.createBlock(
                [
                    factory.createRecacheCall(node.argument),
                    arkts.factory.createReturnStatement()
                ]
            )
            // return arkts.factory.updateReturnStatement(node, factory.createRecacheCall(node.argument))
        }
        return node
    }
}
