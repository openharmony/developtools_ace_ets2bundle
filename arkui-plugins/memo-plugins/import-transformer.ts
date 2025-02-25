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
import { AbstractVisitor } from "../common/abstract-visitor"
import { 
    createContextTypeImportSpecifier, 
    createIdTypeImportSpecifier, 
    RuntimeNames
} from "./utils"

function createContextTypesImportDeclaration(): arkts.EtsImportDeclaration {
    return arkts.factory.createImportDeclaration(
        arkts.factory.createStringLiteral(RuntimeNames.CONTEXT_TYPE_DEFAULT_IMPORT),
        [createContextTypeImportSpecifier(), createIdTypeImportSpecifier()],
        arkts.Es2pandaImportKinds.IMPORT_KINDS_TYPE,
        true,
    )
}

export class ImportTransformer extends AbstractVisitor {
    visitor(node: arkts.AstNode): arkts.AstNode {
        if (node instanceof arkts.EtsScript) {
            return arkts.factory.updateEtsScript(
                node,
                [
                    ...node.getChildren().filter(it => it instanceof arkts.EtsImportDeclaration),
                    createContextTypesImportDeclaration(),
                    ...node.getChildren().filter(it => !(it instanceof arkts.EtsImportDeclaration)),
                ]
            )
        }
        return node
    }
}
