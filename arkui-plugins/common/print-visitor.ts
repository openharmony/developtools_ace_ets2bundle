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

import * as arkts from "@koalaui/libarkts"
import { AbstractVisitor } from "../common/abstract-visitor";

export class PrintVisitor extends AbstractVisitor {
    private result = ""

    private printNode(node: arkts.AstNode) {
        return `${" ".repeat(4 * this.indentation) + node.constructor.name} ${this.nameIfIdentifier(node)}`
    }

    private nameIfIdentifier(node: arkts.AstNode): string {
        return arkts.isIdentifier(node) ? `'${node.name}'` : ""
    }

    visitor(node: arkts.AstNode): arkts.AstNode {
        console.log(this.printNode(node))
        return this.visitEachChild(node)
    }
}
