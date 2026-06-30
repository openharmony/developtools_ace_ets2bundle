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
    canSkipProgram,
    globalMemoPluginContextFromContext,
    MemoFunctionKind,
    MemoPluginContext,
    memoPluginOptionsFromContext,
} from "../common"
import { forceIgnoreThisInMemoTransformation } from "../../common/use-improved-memo-plugin"
import {
    hasMemoStableAnnotation,
    isMemoAnnotatable,
    maskToKind,
    MemoAnnotatable,
    readAnnotations,
} from "./utils"
import { ParamInfoBuilder } from "./ParamInfoBuilder"

function pushMemoFunctionKind(node: MemoAnnotatable, kind?: MemoFunctionKind) {
    if (!kind) {
        return readAnnotations(node)
    }
    return maskToKind(kind | readAnnotations(node))
}

function updateOptions(options: AnalysisVisitorOptions | undefined, node: MemoAnnotatable): AnalysisVisitorOptions | undefined {
    return {
        applyMemo: pushMemoFunctionKind(node, options?.applyMemo),
    }
}

class AnalysisVisitorOptions {
    applyMemo?: MemoFunctionKind
}

function computeImplicitThis(scriptFunction: arkts.ScriptFunction) {
    const functionExpression = scriptFunction.parent;
    if (!arkts.isFunctionExpression(functionExpression)) {
        return false;
    }
    const methodDefinition = functionExpression.parent;
    if (!arkts.isMethodDefinition(methodDefinition)) {
        return false;
    }
    if (methodDefinition.isStatic) {
        return false;
    }
    let parent = methodDefinition.parent;
    while (arkts.isMethodDefinition(parent)) {
        parent = parent.parent;
    }
    if (arkts.isClassDefinition(parent) && hasMemoStableAnnotation(parent)) {
        return false;
    }
    if (forceIgnoreThisInMemoTransformation) {
        return false;
    }
    return true;
}

class AnalysisPropagationVisitor extends arkts.AbstractVisitor {
    paramInfoBuilder: ParamInfoBuilder

    constructor(
        private memoPluginContext: MemoPluginContext,
        trackContentParam: boolean,
    ) {
        super()
        this.paramInfoBuilder = new ParamInfoBuilder(trackContentParam)
    }

    needDebug = false

    process(node: arkts.AstNode, options?: AnalysisVisitorOptions): arkts.AstNode {
        this.memoPluginContext.NativeFilteringResult = arkts.filterNodesByTypes(
            node,
            [
                arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ANNOTATION_USAGE,
                arkts.Es2pandaAstNodeType.AST_NODE_TYPE_CALL_EXPRESSION,
                arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ASSIGNMENT_EXPRESSION,
                arkts.Es2pandaAstNodeType.AST_NODE_TYPE_PROPERTY,
                arkts.Es2pandaAstNodeType.AST_NODE_TYPE_ETS_FUNCTION_TYPE,
                arkts.Es2pandaAstNodeType.AST_NODE_TYPE_SCRIPT_FUNCTION,
            ]
        )
        const memoNodes = this.memoPluginContext.NativeFilteringResult.filter(it => {
            if (arkts.isAnnotationUsage(it) && arkts.isIdentifier(it.expr)) {
                const name = it.expr.name
                return name.startsWith("memo") || name.startsWith("Memo") || name.startsWith("Builder") || name == "ComponentBuilder"
            }
            return false
        }).map(it => it.parent!)

        memoNodes.forEach(it => {
            this.visitor(this.findProperParent(it))
        })
        return node
    }

    private findProperParent(node: arkts.AstNode): arkts.AstNode {
        const current = node
        if (arkts.isETSFunctionType(current)) {
            const parent = current.parent
            if (arkts.isClassProperty(parent)) {
                return parent
            }
            if (arkts.isIdentifier(parent) && arkts.isVariableDeclarator(parent.parent)) {
                return parent.parent
            }
        }
        return current
    }

    visitor(node: arkts.AstNode, options?: AnalysisVisitorOptions) {
        if (arkts.isScriptFunction(node)) {
            // Setters and getters are not memo, but imply propagation
            if (node.isSetter) {
                const params = node.getParamsCasted()
                params.forEach(it => this.visitor(it, updateOptions(options, node)))
                return node
            }
            if (node.isGetter) {
                this.visitor(node.returnTypeAnnotation!, updateOptions(options, node))
                return node
            }
            const kind = pushMemoFunctionKind(node, options?.applyMemo) << (node.isExtensionMethod ? 1 : 0)
            const implicitThis = computeImplicitThis(node)
            const params = node.getParamsCasted()
            this.memoPluginContext.registerScriptFunction(node, kind, this.paramInfoBuilder.build(implicitThis, params))
            return node
        }
        if (arkts.isETSFunctionType(node)) {
            const kind = pushMemoFunctionKind(node, options?.applyMemo) << (node.isExtensionFunction ? 1 : 0)
            const params = node.getParamsCasted()
            this.memoPluginContext.registerETSFunctionType(node, kind, this.paramInfoBuilder.build(false, params))
            return node
        }

        // These nodes can have memo annotation and it should be propagated
        if (isMemoAnnotatable(node)) {
            // Special case, when annotation is propagated from one child node to another
            if (arkts.isClassProperty(node) && (readAnnotations(node) == MemoFunctionKind.NONE) && node.typeAnnotation && arkts.isETSFunctionType(node.typeAnnotation)) {
                return this.visitEachChild(node, updateOptions(options, node.typeAnnotation))
            }
            return this.visitEachChild(node, updateOptions(options, node))
        }
        
        // Special case, when annotation is propagated from one child node to another
        if (arkts.isVariableDeclarator(node) && arkts.isIdentifier(node.id) && node.id.typeAnnotation && arkts.isETSFunctionType(node.id.typeAnnotation)) {
            return this.visitEachChild(node, updateOptions(options, node.id.typeAnnotation))
        }
        // These nodes cannot have memo annotation, but should allow propagation
        if (arkts.isVariableDeclarator(node) || arkts.isIdentifier(node)) {
            return this.visitEachChild(node, options)
        }

        if (arkts.isConditionalExpression(node)) {
            this.visitor(node.consequent!, options)
            this.visitor(node.alternate!, options)
            return node
        }

        return node
    }
}

export function checkedAnalysisPropagationVisitor(): arkts.ProgramTransformer {
    return (program: arkts.Program, options: arkts.CompilationOptions, context: arkts.PluginContext) => {
        if (canSkipProgram(context, program)) {
            return
        }

        const globalMemoPluginContext = globalMemoPluginContextFromContext(context)
        const pluginOptions = memoPluginOptionsFromContext(context)

        const memoPluginContext = globalMemoPluginContext.getOrCreatePerProgramContext(program.absoluteName)
        new AnalysisPropagationVisitor(memoPluginContext, pluginOptions.trackContentParam).process(program.ast)
    }
}
