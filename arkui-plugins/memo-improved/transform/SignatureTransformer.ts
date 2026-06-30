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
import { moveToFront } from "./utils"
import { factory } from "../MemoFactory"
import { 
    functionIsComponentBuilder,
    functionIsEntry,
    functionIsExtension,
    MemoFunctionDescriptor
} from "../common"

function extendParameters(params: readonly arkts.ETSParameterExpression[], isExtension: boolean) {
    let newParams = [...factory.createHiddenParameters(), ...params]
    if (isExtension) {
        newParams = moveToFront(newParams, 2)
    }
    return newParams
}

export function rewriteSignature(node: arkts.ScriptFunction | arkts.ETSFunctionType, descriptor: MemoFunctionDescriptor) {
    const kind = descriptor.kind
    if (!kind || functionIsEntry(kind) || functionIsComponentBuilder(kind)) {
        return node
    }
    const params = descriptor.paramsInfo.params
    node.setParams(
        extendParameters(
            params,
            functionIsExtension(kind),
        )
    )
}
