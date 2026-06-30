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
import { isVoidReturn } from "./common"

export function checkReturnTypeAnnotation(scriptFunction: arkts.ScriptFunction) {
    if (scriptFunction.returnTypeAnnotation) {
        return true
    }
    if (scriptFunction.getSignaturePointer() && arkts.signatureReturnType(scriptFunction.getSignaturePointer())) {
        return true
    }
    if (scriptFunction.getPreferredReturnTypePointer()) {
        return true
    }
    return false
}

export function getReturnTypeAnnotation(scriptFunction: arkts.ScriptFunction) {
    const returnTypeAnnotation = scriptFunction.returnTypeAnnotation
    if (returnTypeAnnotation && isVoidReturn(returnTypeAnnotation)) {
        return undefined
    }
    if (returnTypeAnnotation) {
        return returnTypeAnnotation
    }

    const signaturePointer = scriptFunction.getSignaturePointer()
    if (signaturePointer) {
        const signatureReturnTypePointer = arkts.signatureReturnType(signaturePointer)
        if (arkts.unpackString(arkts.global.generatedEs2panda._TypeToStringConst(arkts.global.context, signatureReturnTypePointer)) == "void") {
            return undefined
        }
        const signatureReturnType = arkts.convertCheckerTypeToTypeNode(signatureReturnTypePointer)
        if (signatureReturnType) {
            if (scriptFunction.id) {
                arkts.trace(
                    `Use inferred type of script function`,
                    () => `Using inferred return type ${signatureReturnType.dumpSrc()} for @memo function ${scriptFunction.id?.name} ${arkts.originalSourcePositionString(scriptFunction.parent)}`
                )
            } else {
                arkts.trace(
                    `Use inferred type of script function`,
                    () => `Using inferred return type ${signatureReturnType.dumpSrc()} for anonymous @memo function ${arkts.originalSourcePositionString(scriptFunction.parent)}`
                )
            }
            return signatureReturnType
        }
    }

    const preferredReturnTypePointer = scriptFunction.getPreferredReturnTypePointer()
    if (preferredReturnTypePointer && arkts.unpackString(arkts.global.generatedEs2panda._TypeToStringConst(arkts.global.context, preferredReturnTypePointer)) == "void") {
        return undefined
    }
    const preferredReturnType = arkts.convertCheckerTypeToTypeNode(preferredReturnTypePointer)
    if (preferredReturnType) {
        if (scriptFunction.id) {
            arkts.trace(
                `Use inferred type of script function`,
                () => `Using inferred return type ${preferredReturnType.dumpSrc()} for @memo function ${scriptFunction.id?.name} ${arkts.originalSourcePositionString(scriptFunction.parent)}`
            )
        } else {
            arkts.trace(
                `Use inferred type of script function`,
                () => `Using inferred return type ${preferredReturnType.dumpSrc()} for anonymous @memo function ${arkts.originalSourcePositionString(scriptFunction.parent)}`
            )
        }
        return preferredReturnType
    }
    return undefined
}
