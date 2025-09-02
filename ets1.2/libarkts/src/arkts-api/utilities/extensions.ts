/*
 * Copyright (c) 2022-2023 Huawei Device Co., Ltd.
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

import { KNativePointer, KUInt } from "@koalaui/interop"
import type {
    ClassDefinition,
    ETSFunctionType,
    ETSModule,
    ETSParameterExpression,
    Expression,
    MethodDefinition,
    NumberLiteral,
    Program,
    ScriptFunction,
    SourcePosition,
} from "../../../generated"
import { ExternalSource } from "../peers/ExternalSource"
import { Es2pandaAstNodeType, Es2pandaModuleFlag } from "../../../generated/Es2pandaEnums"
import { global } from "../static/global"
import { acceptNativeObjectArrayResult, passNodeArray, unpackNodeArray, unpackNonNullableNode } from "./private"
import type { AstNode } from "../peers/AstNode"

export function extension_ETSModuleGetNamespaceFlag(this: ETSModule): Es2pandaModuleFlag {
    return (this.isETSScript ? Es2pandaModuleFlag.MODULE_FLAG_ETSSCRIPT : 0)
        + (this.isNamespace ? Es2pandaModuleFlag.MODULE_FLAG_NAMESPACE : 0)
        + (this.isNamespaceChainLastNode ? Es2pandaModuleFlag.MODULE_FLAG_NAMESPACE_CHAIN_LAST_NODE : 0)
}

// this is a workaround for overloads not included in children list
export function extension_MethodDefinitionSetChildrenParentPtr(this: MethodDefinition) {
    global.es2panda._AstNodeSetChildrenParentPtr(global.context, this.peer)
    const overloads = this.overloads
    for (const overload of overloads) {
        overload.setBaseOverloadMethod(this)
        overload.parent = this // overloads are not listed as children in native
    }
}

export function extension_MethodDefinitionOnUpdate(this: MethodDefinition, original: MethodDefinition): void {
    this.setChildrenParentPtr()
    global.es2panda._AstNodeOnUpdate(global.context, this.peer, original.peer)
    const originalBase = original.baseOverloadMethod
    if (originalBase) {
        this.setBaseOverloadMethod(originalBase)
    }
}

// Improve: generate checker related stuff
export function extension_ScriptFunctionGetSignaturePointer(this: ScriptFunction): KNativePointer {
    return global.es2panda._Checker_ScriptFunctionSignature(global.context, this.peer)
}

export function extension_ScriptFunctionSetSignaturePointer(this: ScriptFunction, signaturePointer: KNativePointer): void {
    global.es2panda._Checker_ScriptFunctionSetSignature(global.context, this.peer, signaturePointer)
}

// Improve: weird API
export function extension_ScriptFunctionGetParamsCasted(this: ScriptFunction): readonly ETSParameterExpression[] {
    return unpackNodeArray<ETSParameterExpression>(global.generatedEs2panda._ScriptFunctionParams(global.context, this.peer), Es2pandaAstNodeType.AST_NODE_TYPE_ETS_PARAMETER_EXPRESSION)
}

// Improve: perhaps "preferredReturnType" stuff can be removed later if "signature" is always enough
export function extension_ScriptFunctionGetPreferredReturnTypePointer(this: ScriptFunction): KNativePointer {
    return global.es2panda._Checker_ScriptFunctionGetPreferredReturnType(global.context, this.peer)
}

export function extension_ScriptFunctionSetPreferredReturnTypePointer(this: ScriptFunction, typePointer: KNativePointer): void {
    global.es2panda._Checker_ScriptFunctionSetPreferredReturnType(global.context, this.peer, typePointer)
}

// Improve: generate checker related stuff
export function extension_ExpressionGetPreferredTypePointer(this: Expression): KNativePointer {
    return global.es2panda._Checker_ExpressionGetPreferredType(global.context, this.peer)
}

export function extension_ExpressionSetPreferredTypePointer(this: Expression, typePointer: KNativePointer): void {
    global.es2panda._Checker_ExpressionSetPreferredType(global.context, this.peer, typePointer)
}

// Improve: weird API
export function extension_ProgramGetAstCasted(this: Program): ETSModule {
    return unpackNonNullableNode<ETSModule>(global.generatedEs2panda._ProgramAst(global.context, this.peer), Es2pandaAstNodeType.AST_NODE_TYPE_ETS_MODULE)
}

// Improve: generate methods with string[] args or return type
export function extension_ProgramGetExternalSources(this: Program): ExternalSource[] {
    return acceptNativeObjectArrayResult<ExternalSource>(
        global.es2panda._ProgramExternalSources(global.context, this.peer),
        ExternalSource.instantiate,
    )
}

// Improve: SourcePositionLine is global in idl
export function extension_SourcePositionGetLine(this: SourcePosition): KUInt {
    return global.generatedEs2panda._SourcePositionLine(global.context, this.peer)
}

// Improve: SourcePositionCol is not described in idl
export function extension_SourcePositionGetCol(this: SourcePosition): KUInt {
    return global.es2panda._SourcePositionCol(global.context, this.peer)
}

// Improve: SourcePositionIndex is global in idl
export function extension_SourcePositionGetIndex(this: SourcePosition): KUInt {
    return global.generatedEs2panda._SourcePositionIndex(global.context, this.peer)
}

export function extension_SourcePositionToString(this: SourcePosition): string {
    return `:${this.getLine() + 1}:${this.getCol()}`
}

// Improve: weird API
export function extension_NumberLiteralValue(this: NumberLiteral): number {
    return +this.dumpSrc()
}

// Improve: weird API
export function extension_ClassDefinitionSetBody(this: ClassDefinition, body: readonly AstNode[]): void {
    global.es2panda._ClassDefinitionSetBody(global.context, this.peer, passNodeArray(body), body.length)
}

// Improve: weird API
export function extension_ETSFunctionTypeGetParamsCasted(this: ETSFunctionType): readonly ETSParameterExpression[] {
    return unpackNodeArray<ETSParameterExpression>(global.generatedEs2panda._ETSFunctionTypeParamsConst(global.context, this.peer), Es2pandaAstNodeType.AST_NODE_TYPE_ETS_PARAMETER_EXPRESSION)
}
