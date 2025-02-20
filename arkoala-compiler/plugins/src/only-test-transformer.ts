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
import { AbstractVisitor } from "./AbstractVisitor"

export class TestTransformer extends AbstractVisitor {
    visitor(beforeChildren: arkts.AstNode): arkts.AstNode {
        const node = this.visitEachChild(beforeChildren);

        // This is only for testing purpose. Now the .d.ets transformation is not ready,
        // there are @koalaui.arkui and @koalaui.arkts-arkui, the former one is for transformation before checked,
        // the later one is for transformation after checked.
        if (arkts.isEtsImportDeclaration(node) && node.importSource.str.startsWith("@koalaui.arkui")) {
            const source = node.importSource;
            return arkts.factory.updateImportDeclaration(
                node,
                arkts.factory.updateStringLiteral(
                    source,
                    node.importSource.str.replace("arkui", "arkts-arkui")
                ),
                node.importSpecifiers,
                node.importKind,
                node.hasDecl
            );
        }

        return node
    }
}
