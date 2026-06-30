/*
 * Copyright (c) 2022-2026 Huawei Device Co., Ltd.
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
import * as fs from "node:fs"
import * as path from "node:path"
import { RuntimeNames } from "../common"
import { getCommonPath } from "../../path";
const common = require(getCommonPath());
const UniqueId = common.UniqueId;

export class PositionalIdTracker {
    // Global for the whole program.
    static callCount: number = 0

    // Set `stable` to true if you want to have more predictable values.
    // For example for tests.
    // Don't use it in production!
    constructor(public filename: string, public stableForTests: boolean = false) {
        if (stableForTests) {
            PositionalIdTracker.callCount = 0;
        }
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
        if (this.stableForTests) {
            return `id_${callName}_${fileName}`
        }
        return `${PositionalIdTracker.callCount++}_${callName}_${fileName}`
    }

    id(callName: string = ""): arkts.Expression {

        const positionId = (this.stableForTests) ?
            this.stringId(callName, this.filename) :
            this.sha1Id(callName, this.filename)


        return this.stableForTests
            ? arkts.factory.createCallExpression(
                arkts.factory.createIdentifier(RuntimeNames.HASH),
                [arkts.factory.createStringLiteral(positionId)],
                undefined,
                false,
                false,
                undefined
            )
            : arkts.factory.createNumberLiteral(parseInt(positionId, 16))
    }
}

function filterGensym(value: string): string {
    return value.replaceAll(/gensym%%_[0-9]*/g, "gensym_XXX")
}

export function dumpAstToFile(node: arkts.AstNode, keepTransformed: string, stableForTests: boolean) {
    const relativeFromRoot = path.relative(arkts.global.arktsconfig!.baseUrl, arkts.global.filePath)
    const fileName = path.isAbsolute(keepTransformed) ?
        path.join(keepTransformed, relativeFromRoot) : path.join(__dirname, keepTransformed, relativeFromRoot)
    fs.mkdirSync(path.dirname(fileName), { recursive: true })
    const astDump = node.dumpSrc()
    fs.writeFileSync(fileName, stableForTests ? filterGensym(astDump) : astDump )
}

export function moveToFront<T>(arr: T[], idx: number): T[] {
    if (idx >= arr.length) {
        throw new Error(`Invalid argument, size of array: ${arr.length}, idx: ${idx}`)
    }
    return [arr[idx], ...arr.slice(0, idx), ...arr.slice(idx + 1)]
}

export function parametersBlockHasReceiver(parameters: readonly arkts.ETSParameterExpression[]) {
    return parameters[0]?.ident?.isReceiver
}

