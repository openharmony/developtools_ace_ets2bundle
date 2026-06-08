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
import { Reporter } from "./Reporter"
import { ScopedVisitor } from "./ScopedVisitor"
import { toArray } from "./ToArrayVisitor"
import {
    getDeclResolveGensym,
    isMemoizable,
    Memoizable
} from "../analysis/utils"
import {
    functionIsEntry,
    GlobalMemoPluginContext,
    MEMO_PLUGIN_CONTEXT_PARAMETER_NAME,
    MemoPluginContext,
    RuntimeNames
} from "../common"
import { checkReturnTypeAnnotation } from "../inference-helpers"

export function assertIsNever(isNever: never): never {
    throw new Error("Unreachable")
}

export function getName(node: Memoizable): string {
    if (arkts.isMethodDefinition(node)) {
        return node.id!.name
    }
    if (arkts.isETSParameterExpression(node)) {
        return node.ident!.name
    }
    if (arkts.isIdentifier(node)) {
        return node.name
    }
    if (arkts.isClassProperty(node)) {
        return node.id!.name
    }
    assertIsNever(node)
}

export class DiagnosticVisitor extends ScopedVisitor {
    constructor(
        memoPluginContext: MemoPluginContext,
    ) {
        super(memoPluginContext)
    }

    visitor(beforeChildren: arkts.AstNode): arkts.AstNode {
        this.enterScope(beforeChildren)
        const node = this.visitEachChild(beforeChildren)

        // Improve: check state mutation, panda issue 26718
        this.checkDefaultValueMemoCall(node)
        this.checkOutOfMemoContextMemoCall(node)
        this.checkMemoDeclarationIsExplicitlyTyped(node)
        this.checkParameterMutation(node)

        this.exitScope(beforeChildren)
        return node
    }

    private checkOutOfMemoContextMemoCall(node: arkts.AstNode): void {
        if (!arkts.isCallExpression(node)) {
            return;
        }
        if (this.isCurrentScopeMemo()) {
            return;
        }
        const kind = this.memoPluginContext.CallExpressionDescriptors?.get(node.peer)?.kind
        if (!kind || functionIsEntry(kind)) {
            return;
        }
        // The logic below is done only in exceptional cases
        // Improve: move it to separate file not to have imported getDeclResolveGensym here
        const callee = node.callee ?? arkts.throwError(`call expression has no callee`)
        const decl = getDeclResolveGensym(callee)
        if (!isMemoizable(decl)) {
            return;
        }
        const callName = getName(decl)
        const scopeName = this.currentScopeName()
        Reporter.reportOutOfContextMemoCall(callName, scopeName, (node.callee ?? node).startPosition)
    }

    private checkDefaultValueMemoCall(node: arkts.AstNode): void {
        if (!arkts.isVariableDeclarator(node)) {
            return;
        }
        if (!arkts.isIdentifier(node.id)) {
            return;
        }
        if (!arkts.isConditionalExpression(node.init)) {
            return;
        }
        if (node.init.test === undefined) {
            return;
        }
        if (node.init.alternate === undefined) {
            return;
        }
        const isGensym = (it: arkts.AstNode) =>
            arkts.isIdentifier(it) && it.name.includes(RuntimeNames.GENSYM)
        if (toArray(node.init.test).some(isGensym) && toArray(node.init.alternate).some((node) =>
            arkts.isCallExpression(node) && this.memoPluginContext.CallExpressionDescriptors?.has(node.peer)
        )) {
            Reporter.reportDefaultValueMemoCall(node.id.name, node.id.startPosition)
        }
    }

    private checkMemoDeclarationIsExplicitlyTyped(node: arkts.AstNode): void {
        if (!arkts.isScriptFunction(node)) {
            return;
        }
        const kind = this.memoPluginContext.ScriptFunctionDescriptors?.get(node.peer)?.kind
        if (kind === undefined) {
            return;
        }
        if (checkReturnTypeAnnotation(node)) {
            return;
        }
        Reporter.reportMemoFunctionIsNotExplicitlyTyped(node?.id?.name, (node.id ?? node).startPosition)
    }

    private checkParameterMutation(node: arkts.AstNode): void {
        if (!arkts.isAssignmentExpression(node)) {
            return;
        }
        if (!arkts.isIdentifier(node.left)) {
            return;
        }
        const decl = arkts.getDecl(node.left)
        if (!arkts.isETSParameterExpression(decl)) {
            return;
        }
        if (!this.isCurrentScopeMemo()) {
            return;
        }

        Reporter.reportParameterReassignment(node.left.name, this.currentScopeName(), node.left.startPosition)
    }
}

export function checkedDiagnostics() {
    return (program: arkts.Program, options: arkts.CompilationOptions, context: arkts.PluginContext) => {
        // Skip external programs on diagnostics visitor
        if (!options.isProgramForCodegeneration) {
            return
        }

        const globalMemoPluginContext = context.parameter<GlobalMemoPluginContext>(MEMO_PLUGIN_CONTEXT_PARAMETER_NAME)
        if (!globalMemoPluginContext) {
            throw new Error("Memo diagnostic called without memo table")
        }
        const memoPluginContext = globalMemoPluginContext.PerProgramContexts.get(program.absoluteName)
        if (!memoPluginContext) {
            return
        }
        new DiagnosticVisitor(memoPluginContext).visitor(program.ast)
    }
}
