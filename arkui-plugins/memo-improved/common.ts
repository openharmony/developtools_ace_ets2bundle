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

// Improve: no context.compute in sdk
const skipWrappingByDefault = true

export enum MemoFunctionKind {
    NONE = 0,
    MEMO = 1,
    MEMO_EXTENSION = 2,
    INTRINSIC = 4,
    INTRINSIC_EXTENSION = 8,
    ENTRY = 16,
    ENTRY_EXTENSION = 32,
    // A special memo kind to workaround Builder/ComponentBuilder overload mismatch
    // when resolving declaration from call expression. In this case the ComponentBuilder declaration
    // should be recognized as memo function, but neither signature, nor function body should be transformed
    // Improve: better handling for overloads is desired
    COMPONENT_BUILDER = 64,
    COMPONENT_BUILDER_EXTENSION = 128,
}

export function functionIsEntry(kind?: MemoFunctionKind) {
    switch (kind) {
        case MemoFunctionKind.ENTRY:
        case MemoFunctionKind.ENTRY_EXTENSION:
            return true
        default:
            return false
    }
}

export function functionIsComponentBuilder(kind?: MemoFunctionKind) {
    switch (kind) {
        case MemoFunctionKind.COMPONENT_BUILDER:
        case MemoFunctionKind.COMPONENT_BUILDER_EXTENSION:
            return true
        default:
            return false
    }
}

export function functionHasFullBodyTransformation(kind?: MemoFunctionKind) {
    switch (kind) {
        case MemoFunctionKind.MEMO:
        case MemoFunctionKind.MEMO_EXTENSION:
            return true
        default:
            return false
    }
}

export function functionIsExtension(kind?: MemoFunctionKind) {
    switch (kind) {
        case MemoFunctionKind.MEMO_EXTENSION:
        case MemoFunctionKind.INTRINSIC_EXTENSION:
        case MemoFunctionKind.ENTRY_EXTENSION:
            return true
        default:
            return false
    }
}

export enum RuntimeNames {
    __CONTEXT = "__context",
    __ID = "__id",
    __KEY = "__key",
    ANNOTATION = "memo",
    BUILDER = "Builder",
    COMPONENT_BUILDER = "ComponentBuilder",
    ANNOTATION_ENTRY = "memo_entry",
    ANNOTATION_INTRINSIC = "memo_intrinsic",
    ANNOTATION_SKIP = "memo_skip",
    ANNOTATION_STABLE = "memo_stable",
    ANNOTATION_WRAP = "memo_wrap",
    COMPUTE = "compute",
    CONTENT = "content",
    CONTEXT = "__memo_context",
    CONTEXT_TYPE = "__memo_context_type",
    GENSYM = "gensym%%_",
    HASH = "__hash",
    ID = "__memo_id",
    ID_TYPE = "__memo_id_type",
    INTERNAL_PARAMETER_STATE = "param",
    INTERNAL_SCOPE = "scope",
    INTERNAL_VALUE = "cached",
    INTERNAL_VALUE_NEW = "recache",
    INTERNAL_VALUE_OK = "unchanged",
    PARAMETER = "__memo_parameter",
    SCOPE = "__memo_scope",
    THIS = "this",
    VALUE = "value",
}

export enum DebugNames {
    BANNER_PARAMETER = "[MEMO PARAMETER DEBUG]",
    BANNER_UNCHANGED = "[MEMO UNCHANGED DEBUG]",
    CONSOLE = "console",
    LOG = "log",
}

export function unwrapTsAsExpression(node: arkts.Expression): arkts.Expression {
    if (arkts.isTSAsExpression(node)) {
        return unwrapTsAsExpression(node.expr!)
    }
    return node
}

export function isWrappableByDefault(node: arkts.Expression): boolean {
    if (skipWrappingByDefault) {
        return false;
    }
    const withoutAsExpression = unwrapTsAsExpression(node)
    if (arkts.isArrowFunctionExpression(withoutAsExpression) || arkts.isObjectExpression(withoutAsExpression)) {
        return true
    }
    return false
}

export function selectTrackableParams(paramsInfo: ParamsInfo) {
    const result: arkts.ETSParameterExpression[] = []
    paramsInfo.flags.forEach((flag, index) => {
        if (flag !== NO_TRACK_FLAG) {
            result.push(paramsInfo.params[index])
        }
    })
    return result
}

export const NO_TRACK_FLAG = 0
export const TRACK_FLAG = 1
export const TRACK_WRAP_FLAG = 2

export type FlagsArray = readonly number[]
export type MemoInferenceInfo = readonly (arkts.ETSFunctionType | undefined)[]
export type ParamsInfo = {
    /**
     * Receiver should be tracked, but is not presented in parameters block
     */
    readonly implicitThis: boolean,
    /**
     * NO_TRACK_FLAG = not tracked, should not wrap
     * TRACK_FLAG = tracked, no memo_wrap annotation
     * TRACK_WRAP_FLAG = tracked, has memo_wrap annotation
     */
    readonly flags: FlagsArray,
    /**
     * Cached result of node.params call
     */
    readonly params: readonly arkts.ETSParameterExpression[]
}
// For memo functions, both params info and inference are stored
export type MemoFunctionDescriptor = {
    readonly kind: MemoFunctionKind
    readonly paramsInfo: ParamsInfo
    memoInferenceInfo?: MemoInferenceInfo
}
// For non memo function, only inference info is stored
export type FunctionDescriptor = MemoInferenceInfo
// This is used during memo inference, adapter for memo and non-memo descriptors
export type ShortFunctionDescriptor = {
    readonly kind: MemoFunctionKind,
    readonly paramsInfo?: ParamsInfo
    readonly memoInferenceInfo?: MemoInferenceInfo
}

export type ArgumentsToWrapInfo = boolean[]
export type MemoCallsiteDescriptor = {
    readonly kind: MemoFunctionKind
    readonly argumentsInfo: ArgumentsToWrapInfo
}

export interface GlobalMemoPluginContext {
    /** This global table of script functions should be used to resolve callsite kind in post analysis */
    ScriptFunctionDescriptors?: Map<arkts.KNativePointer, MemoFunctionDescriptor>
    /** This global table of script functions should be used to do memo inference for callsites in post analysis */
    NonMemoScriptFunctionDescriptors?: Map<arkts.KNativePointer, FunctionDescriptor>
    /** This global table of ets function types should be used to resolve callsite kind in post analysis */
    ETSFunctionTypeDescriptors?: Map<arkts.KNativePointer, MemoFunctionDescriptor>
    /** This global table of ets function types should be used to do memo inference for callsites in post analysis */
    NonMemoETSFunctionTypeDescriptors?: Map<arkts.KNativePointer, FunctionDescriptor>
    /** Stores per program memo contexts with the keys of absolute names of programs */
    PerProgramContexts: Map<string, MemoPluginContext>
    /** If declaration is resolved to some key in this map, resolve it to the corresponding value from map */
    AdditionalDeclarationRedirects: Map<arkts.KNativePointer, arkts.KNativePointer>

    get ScriptFunctionsCount(): number
    get NonMemoScriptFunctionsCount(): number
    get ETSFunctionTypesCount(): number
    get NonMemoETSFunctionTypesCount(): number
    get UnmarkedCallExpressionsCount(): number
    get UnmarkedAssignmentExpressionsCount(): number
    get UnmarkedPropertiesCount(): number
    get CallExpressionsCount(): number
    get ParamRewritesCount(): number

    getOrCreatePerProgramContext(name: string): MemoPluginContext
    collectMemoInfoFromPerProgramContexts(): void
    collectNonMemoInfoFromPerProgramContexts(): void
    getDescriptor(node: arkts.ScriptFunction | arkts.ETSFunctionType): ShortFunctionDescriptor | undefined
    registerAdditionalDeclarationRedirect(from: arkts.KNativePointer, to: arkts.KNativePointer): void
}

export interface MemoPluginContext {
    /** Filtering result for program */
    NativeFilteringResult?: arkts.AstNode[]
    /** Memo script functions in program */
    ScriptFunctionDescriptors?: Map<arkts.KNativePointer, MemoFunctionDescriptor>
    /** Non-memo script functions in program */
    NonMemoScriptFunctionDescriptors?: Map<arkts.KNativePointer, FunctionDescriptor>
    /** Memo ets function types in program */
    ETSFunctionTypeDescriptors?: Map<arkts.KNativePointer, MemoFunctionDescriptor>
    /** Non-memo ets function types in program */
    NonMemoETSFunctionTypeDescriptors?: Map<arkts.KNativePointer, FunctionDescriptor>
    /** All call expressions in program (including non-memo) */
    UnmarkedCallExpressions?: arkts.CallExpression[]
    /** All assignment expressions in program, with right part that might have memo inference */
    UnmarkedAssignmentExpressions?: arkts.AssignmentExpression[]
    /** All properties in program, with right part that might have memo inference */
    UnmarkedProperties?: arkts.Property[]
    /** Memo call expressions in program, with info about arguments to wrap */
    CallExpressionDescriptors?: Map<arkts.KNativePointer, MemoCallsiteDescriptor>
    /** Params to rewrite in memo script functions in program */
    ParamRewrites?: Map<arkts.KNativePointer, () => arkts.MemberExpression>
    /** Additional identifiers to rewrite as memo parameters */
    AdditionalIdentifiersToRewrite?: Set<arkts.KNativePointer>

    /** Adds ScriptFunction to this context */
    registerScriptFunction(node: arkts.ScriptFunction, kind: MemoFunctionKind, paramsInfo: ParamsInfo): void
    /** Adds InferenceInfo of ScriptFunction to this context */
    updateScriptFunctionByInferenceInfo(node: arkts.ScriptFunction, memoInferenceInfo: MemoInferenceInfo): void
    /** Adds ETSFunctionType to this context */
    registerETSFunctionType(node: arkts.ETSFunctionType, kind: MemoFunctionKind, paramsInfo: ParamsInfo): void
    /** Adds InferenceInfo of ETSFunctionType to this context */
    updateETSFunctionTypeByInferenceInfo(node: arkts.ETSFunctionType, memoInferenceInfo: MemoInferenceInfo): void
    /** Adds unmarked CallExpression to this context */
    registerUnmarkedCallExpression(node: arkts.CallExpression): void
    /** Adds unmarked AssignmentExpression to this context */
    registerUnmarkedAssignmentExpression(node: arkts.AssignmentExpression): void
    /** Adds unmarked Property to this context */
    registerUnmarkedProperty(node: arkts.Property): void
    /** Adds CallExpression to this context */
    registerCallExpression(node: arkts.CallExpression, descriptor: MemoCallsiteDescriptor): void
    /** Adde Identifier to rewrite to this context */
    registerAdditionalIdentifier(node: arkts.Identifier): void
}

export class GlobalMemoPluginContextImpl implements GlobalMemoPluginContext {
    ScriptFunctionDescriptors?: Map<arkts.KNativePointer, MemoFunctionDescriptor>
    NonMemoScriptFunctionDescriptors?: Map<arkts.KNativePointer, FunctionDescriptor>
    ETSFunctionTypeDescriptors?: Map<arkts.KNativePointer, MemoFunctionDescriptor>
    NonMemoETSFunctionTypeDescriptors?: Map<arkts.KNativePointer, FunctionDescriptor>
    PerProgramContexts: Map<string, MemoPluginContext>
    AdditionalDeclarationRedirects: Map<arkts.KNativePointer, arkts.KNativePointer>
    private AdditionalDeclarationRedirectsInversed: Map<arkts.KNativePointer, arkts.KNativePointer>

    constructor() {
        this.PerProgramContexts = new Map()
        this.AdditionalDeclarationRedirects = new Map()
        this.AdditionalDeclarationRedirectsInversed = new Map()
    }

    get ScriptFunctionsCount(): number {
        let result = 0
        this.PerProgramContexts.forEach((v) => {
            result += v.ScriptFunctionDescriptors?.size ?? 0
        })
        return result
    }

    get NonMemoScriptFunctionsCount(): number {
        let result = 0
        this.PerProgramContexts.forEach((v) => {
            result += v.NonMemoScriptFunctionDescriptors?.size ?? 0
        })
        return result
    }

    get ETSFunctionTypesCount(): number {
        let result = 0
        this.PerProgramContexts.forEach((v) => {
            result += v.ETSFunctionTypeDescriptors?.size ?? 0
        })
        return result
    }

    get NonMemoETSFunctionTypesCount(): number {
        let result = 0
        this.PerProgramContexts.forEach((v) => {
            result += v.NonMemoETSFunctionTypeDescriptors?.size ?? 0
        })
        return result
    }

    get UnmarkedCallExpressionsCount(): number {
        let result = 0
        this.PerProgramContexts.forEach((v) => {
            result += v.UnmarkedCallExpressions?.length ?? 0
        })
        return result
    }

    get UnmarkedAssignmentExpressionsCount(): number {
        let result = 0
        this.PerProgramContexts.forEach((v) => {
            result += v.UnmarkedAssignmentExpressions?.length ?? 0
        })
        return result
    }

    get UnmarkedPropertiesCount(): number {
        let result = 0
        this.PerProgramContexts.forEach((v) => {
            result += v.UnmarkedProperties?.length ?? 0
        })
        return result
    }

    get CallExpressionsCount(): number {
        let result = 0
        this.PerProgramContexts.forEach((v) => {
            result += v.CallExpressionDescriptors?.size ?? 0
        })
        return result
    }

    get ParamRewritesCount(): number {
        let result = 0
        this.PerProgramContexts.forEach((v) => {
            result += v.ParamRewrites?.size ?? 0
        })
        return result
    }

    getOrCreatePerProgramContext(name: string): MemoPluginContext {
        if (this.PerProgramContexts.has(name)) {
            return this.PerProgramContexts.get(name)!
        }
        const newContext = new MemoPluginContextImpl()
        this.PerProgramContexts.set(name, newContext)
        return newContext
    }

    collectMemoInfoFromPerProgramContexts(): void {
        this.ETSFunctionTypeDescriptors = new Map(
            [...this.PerProgramContexts.values()].flatMap((context: MemoPluginContext) => {
                if (!context.ETSFunctionTypeDescriptors) {
                    return []
                }
                return [...context.ETSFunctionTypeDescriptors]
            })
        )
        this.ScriptFunctionDescriptors = new Map(
            [...this.PerProgramContexts.values()].flatMap((context: MemoPluginContext) => {
                if (!context.ScriptFunctionDescriptors) {
                    return []
                }
                return [...context.ScriptFunctionDescriptors]
            })
        )
    }

    collectNonMemoInfoFromPerProgramContexts(): void {
        this.NonMemoETSFunctionTypeDescriptors = new Map(
            [...this.PerProgramContexts.values()].flatMap((context: MemoPluginContext) => {
                if (!context.NonMemoETSFunctionTypeDescriptors) {
                    return []
                }
                return [...context.NonMemoETSFunctionTypeDescriptors]
            })
        )
        this.NonMemoScriptFunctionDescriptors = new Map(
            [...this.PerProgramContexts.values()].flatMap((context: MemoPluginContext) => {
                if (!context.NonMemoScriptFunctionDescriptors) {
                    return []
                }
                return [...context.NonMemoScriptFunctionDescriptors]
            })
        )
    }

    getDescriptor(node: arkts.ScriptFunction | arkts.ETSFunctionType): ShortFunctionDescriptor | undefined {
        const peer = this.AdditionalDeclarationRedirects.get(node.peer) ?? node.peer
        if (arkts.isScriptFunction(node)) {
            const memo = this.ScriptFunctionDescriptors?.get(peer)
            if (memo) {
                return memo
            }
            const nonMemo = this.NonMemoScriptFunctionDescriptors?.get(peer)
            if (nonMemo) {
                return { kind: MemoFunctionKind.NONE, memoInferenceInfo: nonMemo }
            }
        }
        if (arkts.isETSFunctionType(node)) {
            const memo = this.ETSFunctionTypeDescriptors?.get(peer)
            if (memo) {
                return memo
            }
            const nonMemo = this.NonMemoETSFunctionTypeDescriptors?.get(peer)
            if (nonMemo) {
                return { kind: MemoFunctionKind.NONE, memoInferenceInfo: nonMemo }
            }
        }
    }

    registerAdditionalDeclarationRedirect(from: arkts.KNativePointer, to: arkts.KNativePointer): void {
        const prevSource = this.AdditionalDeclarationRedirectsInversed.get(from)
        if (!prevSource) {
            this.AdditionalDeclarationRedirects.set(from, to)
            this.AdditionalDeclarationRedirectsInversed.set(to, from)
        } else {
            this.AdditionalDeclarationRedirects.set(prevSource, to)
            this.AdditionalDeclarationRedirectsInversed.set(to, prevSource)
        }
    }
}

export class MemoPluginContextImpl implements MemoPluginContext {
    NativeFilteringResult?: arkts.AstNode[]
    ScriptFunctionDescriptors?: Map<arkts.KNativePointer, MemoFunctionDescriptor>
    NonMemoScriptFunctionDescriptors?: Map<arkts.KNativePointer, FunctionDescriptor>
    ETSFunctionTypeDescriptors?: Map<arkts.KNativePointer, MemoFunctionDescriptor>
    NonMemoETSFunctionTypeDescriptors?: Map<arkts.KNativePointer, FunctionDescriptor>
    UnmarkedCallExpressions?: arkts.CallExpression[]
    UnmarkedAssignmentExpressions?: arkts.AssignmentExpression[]
    UnmarkedProperties?: arkts.Property[]
    CallExpressionDescriptors?: Map<arkts.KNativePointer, MemoCallsiteDescriptor>
    ParamRewrites?: Map<arkts.KNativePointer, () => arkts.MemberExpression>
    AdditionalIdentifiersToRewrite?: Set<arkts.KNativePointer>

    registerScriptFunction(node: arkts.ScriptFunction, kind: MemoFunctionKind, paramsInfo: ParamsInfo): void {
        if (!kind) {
            return
        }
        if (!this.ScriptFunctionDescriptors) {
            this.ScriptFunctionDescriptors = new Map()
        }
        this.ScriptFunctionDescriptors.set(node.peer, { kind, paramsInfo })
    }

    updateScriptFunctionByInferenceInfo(node: arkts.ScriptFunction, memoInferenceInfo?: MemoInferenceInfo): void {
        if (!memoInferenceInfo) {
            return
        }
        const current = this.ScriptFunctionDescriptors?.get(node.peer)
        if (current) {
            if (!this.ScriptFunctionDescriptors) {
                this.ScriptFunctionDescriptors = new Map()
            }
            current.memoInferenceInfo = memoInferenceInfo
        } else {
            if (!this.NonMemoScriptFunctionDescriptors) {
                this.NonMemoScriptFunctionDescriptors = new Map()
            }
            this.NonMemoScriptFunctionDescriptors.set(node.peer, memoInferenceInfo)
        }
    }

    registerETSFunctionType(node: arkts.ETSFunctionType, kind: MemoFunctionKind, paramsInfo: ParamsInfo): void {
        if (!kind) {
            return
        }
        if (!this.ETSFunctionTypeDescriptors) {
            this.ETSFunctionTypeDescriptors = new Map()
        }
        this.ETSFunctionTypeDescriptors.set(node.peer, { kind, paramsInfo })
    }

    updateETSFunctionTypeByInferenceInfo(node: arkts.ETSFunctionType, memoInferenceInfo: MemoInferenceInfo): void {
        if (!memoInferenceInfo) {
            return
        }
        const current = this.ETSFunctionTypeDescriptors?.get(node.peer)
        if (current) {
            if (!this.ETSFunctionTypeDescriptors) {
                this.ETSFunctionTypeDescriptors = new Map()
            }
            current.memoInferenceInfo = memoInferenceInfo
        } else {
            if (!this.NonMemoETSFunctionTypeDescriptors) {
                this.NonMemoETSFunctionTypeDescriptors = new Map()
            }
            this.NonMemoETSFunctionTypeDescriptors.set(node.peer, memoInferenceInfo)
        }
    }

    registerUnmarkedCallExpression(node: arkts.CallExpression): void {
        if (!this.UnmarkedCallExpressions) {
            this.UnmarkedCallExpressions = []
        }
        this.UnmarkedCallExpressions.push(node)
    }

    registerUnmarkedAssignmentExpression(node: arkts.AssignmentExpression): void {
        if (!arkts.isArrowFunctionExpression(unwrapTsAsExpression(node.right!))) {
            return
        }
        if (!this.UnmarkedAssignmentExpressions) {
            this.UnmarkedAssignmentExpressions = []
        }
        this.UnmarkedAssignmentExpressions.push(node)
    }

    registerUnmarkedProperty(node: arkts.Property): void {
        if (!arkts.isArrowFunctionExpression(unwrapTsAsExpression(node.value!))) {
            return
        }
        if (!this.UnmarkedProperties) {
            this.UnmarkedProperties = []
        }
        this.UnmarkedProperties.push(node)
    }

    registerCallExpression(node: arkts.CallExpression, descriptor: MemoCallsiteDescriptor): void {
        if (!this.CallExpressionDescriptors) {
            this.CallExpressionDescriptors = new Map()
        }
        this.CallExpressionDescriptors.set(node.peer, descriptor)
    }

    registerAdditionalIdentifier(node: arkts.Identifier): void {
        if (!this.AdditionalIdentifiersToRewrite) {
            this.AdditionalIdentifiersToRewrite = new Set()
        }
        this.AdditionalIdentifiersToRewrite.add(node.peer)
    }
}

export const MEMO_PLUGIN_CONTEXT_PARAMETER_NAME = "GlobalMemoPluginContext"

export function globalMemoPluginContextFromContext(context: arkts.PluginContext) {
    return context.parameter<GlobalMemoPluginContext>(MEMO_PLUGIN_CONTEXT_PARAMETER_NAME) ?? 
        arkts.throwError("Invalid memo plugin API usage: no plugin global context to read")
}

export function registerGlobalMemoPluginContext(context: arkts.PluginContext) {
    if (!context.parameter<GlobalMemoPluginContext>(MEMO_PLUGIN_CONTEXT_PARAMETER_NAME)) {
        context.setParameter(MEMO_PLUGIN_CONTEXT_PARAMETER_NAME, new GlobalMemoPluginContextImpl())
    }
}

export interface PluginOptions {
    /**
     * If verbose is true, print some information about plugin application to console
     */
    verbose: boolean
    /**
     * If frawemorkMode is true, disable program skipper
     * 
     * In other words, not specifying it results in plugin applied to all programs
     * and specifying it results in plugin applied only to programs for which
     * `pluginContext.parameter("canSkipProgram")?.(program)` returns false
     */
    frameworkMode: boolean,
    /**
     * If skipParsed is true, do not apply parsed state memo plugin
     */
    skipParsed: boolean,
    /**
     * If skipDiagnostics is true, do not run memo plugin diagnostics
     */
    skipDiagnostics: boolean,
    /**
     * The import source of __memo_context_type and similar
     * 
     * Default value of import source is '@koalaui/runtime' if env var
     * KOALA_WORKSPACE is set to "1" and 'arkui.stateManagement.runtime'
     * otherwise
     * 
     * Makes no sense if skipParsed is true
     */
    contextImport: string,
    /**
     * If stableForTests is true, generate __hash("callsite") calls instead
     * of computed hashes
     * 
     * Only to be used for golden testing
     */
    stableForTests: boolean,
    /**
     * If keepTransformed is specified, dump test sources after memo transformation
     * to specified directory
     * 
     * Only to be used for golden testing
     */
    keepTransformed: string | undefined,
    /**
     * If addLogging is true, generate debugging constructions in memo functions
     */
    addLogging: boolean,
    /**
     * If trackContentParam is true, add parameter named content to the list
     * of trackable parameters even if it is the last parameter of the function
     */
    trackContentParam: boolean,
}

export const MEMO_PLUGIN_OPTIONS_PARAMETER_NAME = "MemoPluginOptions"

export function memoPluginOptionsFromContext(context: arkts.PluginContext) {
    return context.parameter<PluginOptions>(MEMO_PLUGIN_OPTIONS_PARAMETER_NAME) ?? 
        arkts.throwError("Invalid memo plugin API usage: no plugin options to read")
}

export function registerMemoPluginOptions(context: arkts.PluginContext) {
    if (!context.parameter<PluginOptions>(MEMO_PLUGIN_OPTIONS_PARAMETER_NAME)) {
        context.setParameter(MEMO_PLUGIN_OPTIONS_PARAMETER_NAME, {})
    }
}

export function fillMemoPluginOptionsWithDefaultValues(context: arkts.PluginContext) {
    const pluginOptions = context.parameter<Partial<PluginOptions>>(MEMO_PLUGIN_OPTIONS_PARAMETER_NAME)
    if (!pluginOptions) {
        throw new Error("Invalid memo plugin API usage: no plugin options to fill with default values")
    }
    pluginOptions.verbose ??= false
    pluginOptions.frameworkMode ??= false
    pluginOptions.skipParsed ??= false
    pluginOptions.skipDiagnostics ??= false
    pluginOptions.contextImport ??= getRuntimePackage()
    pluginOptions.stableForTests ??= false
    pluginOptions.addLogging ??= false
    pluginOptions.trackContentParam ??= false
}

export function isKoalaWorkspace() {
    return process.env.KOALA_WORKSPACE == "1"
}

export function getRuntimePackage(): string {
    if (isKoalaWorkspace()) {
        return '@koalaui/runtime'
    } else {
        return 'arkui.incremental.runtime.state'
    }
}

/**
 * Checks type node refers to void type
 *
 * Improve: remove when es2panda API allows to read return type
 * @deprecated
 */
export function isVoidType(node: arkts.TypeNode) {
    return node.dumpSrc() == "void"
}
/**
 * Checks type node refers to undefined type
 *
 * Improve: remove when es2panda API allows to read return type
 * @deprecated
 */
export function isUndefinedType(node: arkts.TypeNode) {
    return node.dumpSrc() == "undefined"
}

export function isVoidReturn(returnTypeAnnotation: arkts.TypeNode | undefined) {
    return !returnTypeAnnotation || isVoidType(returnTypeAnnotation) || isUndefinedType(returnTypeAnnotation)
}

export function canSkipProgram(pluginContext: arkts.PluginContext, program: arkts.Program) {
    const pluginOptions = pluginContext.parameter<PluginOptions>(MEMO_PLUGIN_OPTIONS_PARAMETER_NAME)!
    const isFrameworkMode = !!pluginOptions.frameworkMode
    const canSkipProgramFn = pluginContext.parameter<(program: arkts.Program | undefined) => boolean>("canSkipProgram")
    if (!isFrameworkMode && canSkipProgramFn) {
        return canSkipProgramFn(program)
    }
    return false
}

