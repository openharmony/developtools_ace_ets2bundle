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

import { UniqueId } from "@koalaui/common"
import * as arkts from "@koalaui/libarkts"

export enum RuntimeNames {
    __CONTEXT = "__context",
    __ID = "__id",
    ANNOTATION = "memo",
    CONTEXT = "__memo_context",
    CONTEXT_TYPE = "__memo_context_type",
    CONTEXT_TYPE_DEFAULT_IMPORT = "@koalaui/runtime",
    ID = "__memo_id",
    ID_TYPE = "__memo_id_type",
    INTERNAL_SCOPE = "scope",
    INTERNAL_VALUE = "cached",
    INTERNAL_VALUE_NEW = "recache",
    INTERNAL_VALUE_OK = "unchanged",
    SCOPE = "__memo_scope",
}

export function createContextTypeImportSpecifier(): arkts.ImportSpecifier {
    return arkts.factory.createImportSpecifier(
        arkts.factory.createIdentifier(RuntimeNames.CONTEXT_TYPE),
        arkts.factory.createIdentifier(RuntimeNames.CONTEXT_TYPE),
    )
}

export function createIdTypeImportSpecifier(): arkts.ImportSpecifier {
    return arkts.factory.createImportSpecifier(
        arkts.factory.createIdentifier(RuntimeNames.ID_TYPE),
        arkts.factory.createIdentifier(RuntimeNames.ID_TYPE),
    )
}

export function createContextParameter(): arkts.ETSParameterExpression {
    return arkts.factory.createParameterDeclaration(
        arkts.factory.createIdentifier(RuntimeNames.CONTEXT,
            arkts.factory.createIdentifier(RuntimeNames.CONTEXT_TYPE)
        ),
        undefined
    )
}

export function createIdParameter(): arkts.ETSParameterExpression {
    return arkts.factory.createParameterDeclaration(
        arkts.factory.createIdentifier(RuntimeNames.ID,
            arkts.factory.createIdentifier(RuntimeNames.ID_TYPE)
        ),
        undefined
    )
}

export function createContextArgument(): arkts.AstNode {
    return arkts.factory.createIdentifier(RuntimeNames.CONTEXT)
}

export function createIdArgument(hash: arkts.NumberLiteral | arkts.StringLiteral): arkts.AstNode {
    return arkts.factory.createBinaryExpression(
        arkts.factory.createIdentifier(RuntimeNames.ID),
        arkts.Es2pandaTokenType.TOKEN_TYPE_PUNCTUATOR_PLUS,
        hash
    )
}

function baseName(path: string): string {
    return path.replace(/^.*\/(.*)$/, "$1")
}

export class PositionalIdTracker {
    // Global for the whole program.
    static callCount: number = 0

    // Set `stable` to true if you want to have more predictable values.
    // For example for tests.
    // Don't use it in production!
    constructor(public filename: string, public stableForTests: boolean = false) {
        if (stableForTests) PositionalIdTracker.callCount = 0
    }

    sha1Id(callName: string, fileName: string): string {
        const uniqId = new UniqueId()
        uniqId.addString("memo call uniqid")
        uniqId.addString(fileName)
        uniqId.addString(callName)
        uniqId.addI32(PositionalIdTracker.callCount++)
        return uniqId.compute().substring(0, 7)
    }

    stringId(callName: string, fileName: string): string {
        return `${PositionalIdTracker.callCount++}_${callName}_id_DIRNAME/${fileName}`
    }

    id(callName: string): arkts.NumberLiteral | arkts.StringLiteral {

        const fileName = this.stableForTests ?
            baseName(this.filename) :
            this.filename

        const positionId = (this.stableForTests) ?
            this.stringId(callName, fileName) :
            this.sha1Id(callName, fileName)


        return this.stableForTests
            ? arkts.factory.createStringLiteral(positionId)
            : arkts.factory.createNumericLiteral(parseInt(positionId, 16))
    }
}
