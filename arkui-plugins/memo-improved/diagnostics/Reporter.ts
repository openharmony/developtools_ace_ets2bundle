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

export class Reporter {
    /*
        No diagnostics API from es2panda yet, so using `console.error` for now
     */
    static reportOutOfContextMemoCall(callName: string | undefined, contextName: string | undefined, position: arkts.SourcePosition): void {
        const call = !!callName
            ? `function ${callName}`
            : `anonymous function`
        const context = !!contextName
            ? `context ${contextName}`
            : `anonymous context`
        Reporter.reportError(`Calling @memo ${call} from non-@memo ${context}`, position)
    }

    static reportDefaultValueMemoCall(parameterName: string | undefined, position: arkts.SourcePosition): void {
        Reporter.reportError(`Can not call @memo function at parameter default value expression. Parameter: ${parameterName}`, position)
    }

    static reportMemoFunctionIsNotExplicitlyTyped(functionName: string | undefined, position: arkts.SourcePosition): void {
        const func = functionName ?? `anonymous function`
        Reporter.reportError(`@memo ${func} must have its return type explicitly specified`, position)
    }

    static reportParameterReassignment(parameterName: string, contextName: string | undefined, position: arkts.SourcePosition): void {
        const context = !!contextName
            ? contextName
            : `anonymous function`
        Reporter.reportError(
            `@memo function parameter reassignment is forbidden: parameter ${parameterName} at function ${context}`,
            position
        )
    }

    private static reportError(message: string, position: arkts.SourcePosition) {
        const diagnosticKind = arkts.createDiagnosticKind(message, arkts.Es2pandaPluginDiagnosticType.ES2PANDA_PLUGIN_ERROR);
        arkts.logDiagnostic(diagnosticKind, position)
    }
}