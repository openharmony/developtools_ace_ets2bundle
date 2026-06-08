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
import {
    NO_TRACK_FLAG,
    ParamsInfo,
    RuntimeNames,
    TRACK_FLAG,
    TRACK_WRAP_FLAG
} from "../common"
import { castAnnotation, hasWrapAnnotation } from "./utils"

function hasMemoSkipAnnotation(node: arkts.ETSParameterExpression) {
    return node.annotations.some((it) => {
        const expr = it.expr
        return arkts.isIdentifier(expr) && castAnnotation(expr.name) === RuntimeNames.ANNOTATION_SKIP
    })
}

function isTrackableParam(node: arkts.ETSParameterExpression, isLast: boolean, trackContentParam: boolean) {
    return !hasMemoSkipAnnotation(node) && !(!trackContentParam && isLast && node.ident?.name == RuntimeNames.CONTENT)
}

export class ParamInfoBuilder {
    constructor(
        private trackContentParam: boolean,
    ) {

    }

    build(
        implicitThis: boolean,
        params: readonly arkts.ETSParameterExpression[],
    ): ParamsInfo {
        const flags = params.map((it, index) => {
            // Improve: diagnostics on invalid memo_wrap usage (with memo_skip or when wrap is by default)
            const isTrackable = isTrackableParam(it, index + 1 == params.length, this.trackContentParam)
            if (!isTrackable) {
                return NO_TRACK_FLAG
            }
            if (hasWrapAnnotation(it)) {
                return TRACK_WRAP_FLAG
            }
            return TRACK_FLAG
        })
        return { implicitThis, flags, params }
    }
}
