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
    functionHasFullBodyTransformation,
    functionIsEntry,
    GlobalMemoPluginContext,
    globalMemoPluginContextFromContext,
    isWrappableByDefault,
    MemoFunctionDescriptor,
    MemoFunctionKind,
    MemoPluginContext,
    memoPluginOptionsFromContext,
    NO_TRACK_FLAG,
    RuntimeNames,
    selectTrackableParams,
    TRACK_WRAP_FLAG,
    unwrapTsAsExpression,
} from "../common"
import { factory } from "../MemoFactory"
import {
    getDeclResolveGensym,
    hasBuilderAnnotation,
    isMemoizable,
    resolveType
} from "./utils"
import { ParamInfoBuilder } from "./ParamInfoBuilder"

// Ugly hack for setters
// Improve: rethink
// See panda issue 29305
interface SearchPreferenceOptions {
    preferSettersToGetters: boolean,
}

function findScriptFunctionFromDecl(
    node: arkts.MethodDefinition | arkts.Identifier | arkts.ClassProperty | arkts.AstNode | undefined,
    preferenceOptions: SearchPreferenceOptions,
): arkts.ScriptFunction | undefined {
    if (arkts.isMethodDefinition(node)) {
        if (preferenceOptions.preferSettersToGetters) {
            if (node.isGetter) {
                return node.overloads.filter(it => it.isSetter)[0]?.function
            }
            return node.function
        }
        if (node.isSetter) {
            return node.overloads.filter(it => !it.isSetter)[0]?.function
        }
        return node.function
    }
    if (arkts.isIdentifier(node)) {
        const parent = node.parent
        if (arkts.isVariableDeclarator(parent)) {
            const init = parent.init
            if (arkts.isArrowFunctionExpression(init)) {
                return init.function
            }
            if (arkts.isIdentifier(init) || arkts.isMemberExpression(init)) {
                const decl = arkts.getDecl(init)
                if (isMemoizable(decl)) {
                    return findScriptFunctionFromDecl(decl, preferenceOptions)
                }
            }
        }
    }
    if (arkts.isClassProperty(node)) {
        const value = node.value
        if (arkts.isArrowFunctionExpression(value)) {
            return value.function
        }
        if (value) {
            const decl = getDeclResolveGensym(value)
            if (isMemoizable(decl)) {
                return findScriptFunctionFromDecl(decl, preferenceOptions)
            }
        }
    }
    return undefined
}

function findETSFunctionTypesFromDecl(
    node: arkts.MethodDefinition | arkts.ETSParameterExpression | arkts.ClassProperty | arkts.Identifier | arkts.AstNode | undefined,
    preferenceOptions: SearchPreferenceOptions,
): arkts.ETSFunctionType[] {
    if (arkts.isMethodDefinition(node)) {
        if (!preferenceOptions.preferSettersToGetters) {
            if (node.isSetter) {
                return resolveType(node.overloads.filter(it => !it.isSetter)[0]?.function.returnTypeAnnotation)
            }
            if (node.isGetter) {
                return resolveType(node.function.returnTypeAnnotation)
            }
        }
    }
    if (arkts.isETSParameterExpression(node)) {
        return resolveType(node.typeAnnotation)
    }
    if (arkts.isClassProperty(node)) {
        return resolveType(node.typeAnnotation)
    }
    if (arkts.isIdentifier(node)) {
        const parent = node.parent
        if (arkts.isVariableDeclarator(parent)) {
            const init = parent.init
            if (arkts.isCallExpression(init)) {
                const callee = init.callee!
                const decl = getDeclResolveGensym(callee)
                const declFunction = findScriptFunctionFromDecl(decl, preferenceOptions)
                if (arkts.isScriptFunction(declFunction)) {
                    return resolveType(declFunction.returnTypeAnnotation)
                }
            }
            if (arkts.isIdentifier(init) || arkts.isMemberExpression(init)) {
                const decl = arkts.getDecl(init)
                if (isMemoizable(decl)) {
                    return findETSFunctionTypesFromDecl(decl, preferenceOptions)
                }
            }
            const fromGensym = arkts.resolveGensymVariableDeclaratorForDefaultParam(parent)
            if (fromGensym) {
                const decl = arkts.getDecl(fromGensym)
                if (isMemoizable(decl)) {
                    return findETSFunctionTypesFromDecl(arkts.getDecl(fromGensym), preferenceOptions)
                }
            }
        }
        return resolveType(node.typeAnnotation)
    }
    return []
}

function searchForDescriptors(
    globalMemoPluginContext: GlobalMemoPluginContext,
    decl: arkts.AstNode,
    preferenceOptions: SearchPreferenceOptions,
) {
    const id = [findScriptFunctionFromDecl(decl, preferenceOptions), ...findETSFunctionTypesFromDecl(decl, preferenceOptions)]
    const descriptors = id.flatMap(it => {
        if (it) {
            let descriptor = globalMemoPluginContext.getDescriptor(it)
            // check whether script function relates to overloaded method like
            // Button(label, options); Button(options) => ButtonImpl(style, content)
            if (!descriptor && arkts.isScriptFunction(it) && arkts.isMethodDefinition(it.parent?.parent) &&
                it.parent!.parent!.isMethod && arkts.isMethodDefinition(it.parent!.parent!.baseOverloadMethod)) {
                descriptor = globalMemoPluginContext.getDescriptor(it.parent!.parent!.baseOverloadMethod!.function)
            }
            if (descriptor) {
                return descriptor
            }
        }
        return []
    })
    return descriptors
}

function doMemoInference(
    globalMemoPluginContext: GlobalMemoPluginContext,
    memoPluginContext: MemoPluginContext,
    paramInfoBuilder: ParamInfoBuilder,
    inferenceInfo: (arkts.ETSFunctionType | undefined),
    arg: arkts.Expression,
) {
    if (!arkts.isArrowFunctionExpression(arg)) {
        return
    }
    const explicitKind = globalMemoPluginContext.ScriptFunctionDescriptors?.get(arg.function.peer)?.kind
    // Improve: diagnostics should be thrown if memo signatures does not match
    if (explicitKind) {
        return
    }
    const ETSFunctionTypeFromTable = inferenceInfo
    const inferredKind = ETSFunctionTypeFromTable ? globalMemoPluginContext.ETSFunctionTypeDescriptors?.get(ETSFunctionTypeFromTable.peer)?.kind : undefined
    if (inferredKind) {
        const newParamInfo = paramInfoBuilder.build(false, arg.function.getParamsCasted())
        // Improve: diagnostics should be thrown if memo signatures does not match
        memoPluginContext.registerScriptFunction(arg.function, inferredKind, newParamInfo)
    }
}

function descriptorFromCallee(
    globalMemoPluginContext: GlobalMemoPluginContext,
    memoPluginContext: MemoPluginContext,
    node: arkts.CallExpression,
    callee: arkts.Expression,
) {
    // Special case, when callee is lambda
    if (arkts.isArrowFunctionExpression(callee)) {
        return globalMemoPluginContext.getDescriptor(callee.function)
    }
    const decl = getDeclResolveGensym(callee)
    if (!isMemoizable(decl)) {
        return undefined
    }

    // hack for property 'builder: T' of class 'WrappedBuilder<T>'
    // makes a 'weak' rewrite, so that all parameters of 'builder' function
    // are supposed to have no extra annotations (no memo inference, memo skip, ...)
    if ((arkts.isClassProperty(decl) && hasBuilderAnnotation(decl))) {
        memoPluginContext.registerCallExpression(node, { kind: MemoFunctionKind.MEMO, argumentsInfo:
            node.arguments.map((arg) => {
                return isWrappableByDefault(arg)
            })
        })
        return undefined
    }

    const descriptors = searchForDescriptors(globalMemoPluginContext, decl, { preferSettersToGetters: false })

    // Improve: it is possible that several descriptors were found,
    // it should be ok if they match memo signatures, but diagnostics should be thrown
    // if they have different memo signatures
    if (descriptors.length == 0) {
        return undefined
    }

    return descriptors[0]
}

function markUpCallExpressions(
    globalMemoPluginContext: GlobalMemoPluginContext,
    memoPluginContext: MemoPluginContext,
    trackContentParam: boolean,
) {
    const paramInfoBuilder = new ParamInfoBuilder(trackContentParam)
    memoPluginContext.UnmarkedCallExpressions?.forEach((node: arkts.CallExpression) => {
        const callee = node.callee!
        const descriptor = descriptorFromCallee(globalMemoPluginContext, memoPluginContext, node, callee)
        if (!descriptor) {
            return
        }

        // This is about memo inference for lambdas
        node.arguments.forEach((arg, index) => {
            doMemoInference(
                globalMemoPluginContext,
                memoPluginContext,
                paramInfoBuilder,
                descriptor.memoInferenceInfo?.[index],
                arg,
            )
        })

        const kind = descriptor?.kind

        const argumentsToWrap: boolean[] = []
        if (kind && !functionIsEntry(kind)) {
            // This is about wrapping in compute
            argumentsToWrap.push(
                ...node.arguments.map((arg, index) => {
                    if (descriptor.paramsInfo!.flags[index] !== NO_TRACK_FLAG && isWrappableByDefault(arg)) {
                        return true
                    }
                    if (descriptor.paramsInfo!.flags[index] == TRACK_WRAP_FLAG) {
                        return true
                    }
                    return false
                })
            )
        }
        if (kind !== MemoFunctionKind.NONE) {
            memoPluginContext.registerCallExpression(node, { kind, argumentsInfo: argumentsToWrap })
            // Setting implicit memo on the target function type, when callee is explicitly casted,
            // is opinionated and violates type system, but such case exists in ace engine. So we need to handle this
            // See optional-builder-param.test.ts for the example
            // Consider to review this part
            if (arkts.isTSAsExpression(callee) && descriptor.paramsInfo) {
                let type = callee.typeAnnotation;
                if (arkts.isETSFunctionType(type)) {
                    memoPluginContext.registerETSFunctionType(type, kind, descriptor.paramsInfo)
                }
            }
        }
    })
}

function markUpAssignmentExpressions(
    globalMemoPluginContext: GlobalMemoPluginContext,
    memoPluginContext: MemoPluginContext,
    trackContentParam: boolean,
) {
    const paramInfoBuilder = new ParamInfoBuilder(trackContentParam)
    memoPluginContext.UnmarkedAssignmentExpressions?.forEach((node: arkts.AssignmentExpression) => {
        const left = node.left!
        const right = node.right!
        const decl = getDeclResolveGensym(left)
        if (!isMemoizable(decl)) {
            return
        }

        const descriptors = searchForDescriptors(globalMemoPluginContext, decl, { preferSettersToGetters: true })

        // Improve: it is possible that several descriptors were found,
        // it should be ok if they match memo signatures, but diagnostics should be thrown
        // if they have different memo signatures
        if (descriptors.length == 0) {
            return
        }

        const descriptor = descriptors[0]

        doMemoInference(
            globalMemoPluginContext,
            memoPluginContext,
            paramInfoBuilder,
            descriptor.memoInferenceInfo?.[0],
            unwrapTsAsExpression(right),
        )
        // Weird hack for properties assignment
        // Improve: rethink
        if (descriptor.kind && arkts.isArrowFunctionExpression(right)) {
            const params = right.function.getParamsCasted()
            const paramsInfo = paramInfoBuilder.build(false, params)
            memoPluginContext.registerScriptFunction(right.function, descriptor.kind, paramsInfo)
        }
    })
}

function markUpProperties(
    globalMemoPluginContext: GlobalMemoPluginContext,
    memoPluginContext: MemoPluginContext,
    trackContentParam: boolean,
) {
    const paramInfoBuilder = new ParamInfoBuilder(trackContentParam)
    memoPluginContext.UnmarkedProperties?.forEach((property: arkts.Property) => {
        const decl = getDeclResolveGensym(property.key!)
        if (!isMemoizable(decl)) {
            return
        }

        const descriptors = searchForDescriptors(globalMemoPluginContext, decl, { preferSettersToGetters: true })

        // Improve: it is possible that several descriptors were found,
        // it should be ok if they match memo signatures, but diagnostics should be thrown
        // if they have different memo signatures
        if (descriptors.length == 0) {
            return
        }

        const descriptor = descriptors[0]

        doMemoInference(
            globalMemoPluginContext,
            memoPluginContext,
            paramInfoBuilder,
            descriptor.memoInferenceInfo?.[0],
            unwrapTsAsExpression(property.value!),
        )
    })
}

function markUpParams(
    memoPluginContext: MemoPluginContext,
) {
    if (!memoPluginContext.ScriptFunctionDescriptors) {
        return
    }
    memoPluginContext.ScriptFunctionDescriptors.forEach((descriptor: MemoFunctionDescriptor, peer: arkts.KNativePointer) => {
        const node = new arkts.ScriptFunction(peer, arkts.Es2pandaAstNodeType.AST_NODE_TYPE_SCRIPT_FUNCTION)
        const body = node.body
        if (!arkts.isBlockStatement(body)) {
            return
        }
        // Additionally register params with @memo annotation and default value
        let statementId = 0
        descriptor.paramsInfo.params.forEach((param: arkts.ETSParameterExpression) => {
            if (!param.ident?.name.startsWith(RuntimeNames.GENSYM)) {
                return
            }
            statementId++
            const typeAnnotation = param.ident.typeAnnotation!
            const descriptor = memoPluginContext.ETSFunctionTypeDescriptors?.get(typeAnnotation.peer)
            if (!descriptor) {
                return
            }
            const declaration = body.statements[statementId - 1]
            if (!arkts.isVariableDeclaration(declaration)) {
                return
            }
            const declarator = declaration.declarators[0]
            // This looks weird, but these statements are synthetic (generated by compiler) so always match this form
            memoPluginContext.registerETSFunctionType(((declarator.id as arkts.Identifier).typeAnnotation) as arkts.ETSFunctionType, descriptor.kind, descriptor.paramsInfo)
            memoPluginContext.registerScriptFunction((((declarator.init as arkts.ConditionalExpression).alternate) as arkts.ArrowFunctionExpression).function, descriptor.kind, descriptor.paramsInfo)
        })
        if (!functionHasFullBodyTransformation(descriptor.kind)) {
            return
        }
        selectTrackableParams(descriptor.paramsInfo).forEach((it) => {
            if (!memoPluginContext.ParamRewrites) {
                memoPluginContext.ParamRewrites = new Map()
            }
            memoPluginContext.ParamRewrites.set(
                it.originalPeer,
                () => factory.createMemoParameterAccess(it.name),
            )
        })
    })
}

export function checkedPostAnalysis() {
    return (program: arkts.Program, options: arkts.CompilationOptions, context: arkts.PluginContext) => {
        if (canSkipProgram(context, program)) {
            return
        }

        const globalMemoPluginContext = globalMemoPluginContextFromContext(context)
        const memoPluginContext = globalMemoPluginContext.getOrCreatePerProgramContext(program.absoluteName)
        const pluginOptions = memoPluginOptionsFromContext(context)

        markUpCallExpressions(globalMemoPluginContext, memoPluginContext, pluginOptions.trackContentParam)
        markUpAssignmentExpressions(globalMemoPluginContext, memoPluginContext, pluginOptions.trackContentParam)
        markUpProperties(globalMemoPluginContext, memoPluginContext, pluginOptions.trackContentParam)
        markUpParams(memoPluginContext)
    }
}
