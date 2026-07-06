/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

import * as arkts from '@koalaui/libarkts';
import { AbstractVisitor, VisitorOptions } from './abstract-visitor';
import { matchPrefix } from './arkts-utils';
import { debugDumpAstNode, debugLog, getDumpFileName } from './debug';
import { PluginContext } from './plugin-context';
import { LegacyTransformer } from '../ui-plugins/interop/legacy-transformer';
import { ProgramSkipper } from './program-skipper';
import { FileManager } from './file-manager';
import { LANGUAGE_VERSION } from './predefines';
import { AstNodePointer } from './safe-types';
import { InsightIntentCollector } from '../ui-plugins/insight-intent/insight-intent-collector';
import { MetaDataCollector } from './metadata-collector';

export interface ProgramVisitorOptions extends VisitorOptions {
    pluginName: string;
    state: arkts.Es2pandaContextState;
    visitors: AbstractVisitor[];
    skipPrefixNames: (string | RegExp)[];
    hooks?: ProgramHooks;
    pluginContext?: PluginContext;
    isFrameworkMode?: boolean;
    shouldVisitExternal?: boolean;
}

export interface ProgramHookConfig {
    visitors: AbstractVisitor[];
    resetAfter?: arkts.Es2pandaContextState;
}

export type ProgramHookLifeCycle = Partial<Record<'pre' | 'post', ProgramHookConfig>>;

export interface ProgramHooks {
    external?: ProgramHookLifeCycle;
    source?: ProgramHookLifeCycle;
}

function flattenVisitorsInHooks(
    programHooks?: ProgramHooks,
    resetAfterValue?: arkts.Es2pandaContextState
): AbstractVisitor[] {
    if (!programHooks) return [];
    const flatMapInHook = (config: ProgramHookConfig): AbstractVisitor[] => {
        if (!resetAfterValue) return [];
        if (!config.resetAfter || resetAfterValue !== config.resetAfter) return [];
        return config.visitors;
    };
    return [
        ...Object.values(programHooks.external || {}).flatMap(flatMapInHook),
        ...Object.values(programHooks.source || {}).flatMap(flatMapInHook),
    ];
}

export class ProgramVisitor extends AbstractVisitor {
    private readonly pluginName: string;
    private readonly state: arkts.Es2pandaContextState;
    private readonly visitors: AbstractVisitor[];
    private readonly skipPrefixNames: (string | RegExp)[];
    private readonly hooks?: ProgramHooks;
    private filenames: Map<AstNodePointer, string>;
    private pluginContext?: PluginContext;
    private isFrameworkMode: boolean = false;
    private shouldVisitExternal: boolean = true;

    constructor(options: ProgramVisitorOptions) {
        super(options);
        this.pluginName = options.pluginName;
        this.state = options.state;
        this.visitors = options.visitors;
        this.skipPrefixNames = options.skipPrefixNames ?? [];
        this.hooks = options.hooks;
        this.filenames = new Map();
        this.pluginContext = options.pluginContext;

        if (this.pluginContext && 'getFileManager' in this.pluginContext) {
            FileManager.setInstance(this.pluginContext.getFileManager());
        }

        if (options.isFrameworkMode !== undefined) {
            this.isFrameworkMode = options.isFrameworkMode;
        }

        if (options.shouldVisitExternal !== undefined) {
            this.shouldVisitExternal = options.shouldVisitExternal;
        }
    }

    reset(): void {
        super.reset();
        this.filenames = new Map();
    }

    private dumpExternalSource(
        script: arkts.AstNode,
        name: string,
        cachePath: string | undefined,
        prefixName: string,
        extensionName: string
    ): void {
        debugDumpAstNode(script, getDumpFileName(this.state, prefixName, undefined, name), cachePath, extensionName);
    }

    private visitLegacyInExternalSource(
        currProgram: arkts.Program,
        externalSourceName: string,
        extensionName: string,
        cachePath?: string
    ): void {
        const transformer = new LegacyTransformer();
        transformer.isExternal = !!externalSourceName;
        transformer.externalSourceName = externalSourceName;
        transformer.program = currProgram;
        this.dumpExternalSource(currProgram.ast, externalSourceName, `${cachePath}/BEFORE`, this.pluginName, extensionName);
        transformer.init();
        const importStorage = new arkts.ImportStorage(currProgram, true);
        const newScript = transformer.visitor(currProgram.ast) as arkts.ETSModule;
        importStorage.update();
        transformer.reset();
        this.dumpExternalSource(newScript, externalSourceName, `${cachePath}/AFTER`, this.pluginName, extensionName);
        currProgram?.setAst(newScript)
        arkts.setAllParents(newScript);
    }

    private visitNonLegacyInExternalSource(
        currProgram: arkts.Program,
        externalSourceName: string,
        extensionName: string,
        cachePath?: string
    ): void {
        this.dumpExternalSource(currProgram.ast, externalSourceName, `${cachePath}/BEFORE`, this.pluginName, extensionName);
        const newScript = this.visitor(currProgram.ast, currProgram, externalSourceName);
        this.dumpExternalSource(newScript, externalSourceName, `${cachePath}/AFTER`, this.pluginName, extensionName);
    }

    private visitNextProgramInQueue(
        queue: arkts.Program[],
        visited: Set<AstNodePointer>,
        externalSource: arkts.ExternalSource
    ): void {
        const nextProgramArr: readonly arkts.Program[] = externalSource.programs ?? [];
        for (const nextProgram of nextProgramArr) {
            this.filenames.set(nextProgram.peer, externalSource.getName());
            if (!visited.has(nextProgram.peer)) {
                queue.push(nextProgram);
            }
        }
    }

    private isLegacyFile(currProgram: arkts.Program): boolean {
        const path = currProgram.absoluteName;
        const fileManager = FileManager.getInstance();
        if (fileManager.getLanguageVersionByFilePath(path) === LANGUAGE_VERSION.ARKTS_1_1) {
            return true;
        }
        return false;
    }

    private visitExternalSources(program: arkts.Program, programQueue: arkts.Program[]): void {
        const extensionName: string = program.fileNameWithExtension;
        const visited: Set<AstNodePointer> = new Set();
        const queue: arkts.Program[] = programQueue;
        while (queue.length > 0) {
            const currProgram = queue.shift()!;
            if (visited.has(currProgram.peer) || currProgram.isASTLowered) {
                continue;
            }
            if (matchPrefix(this.skipPrefixNames, currProgram.moduleName)) {
                continue;
            }
            if (currProgram.peer !== program.peer) {
                const name: string = this.filenames.get(currProgram.peer)!;
                const cachePath: string | undefined = this.pluginContext?.getProjectConfig()?.cachePath;
                if (MetaDataCollector.getInstance().shouldHandleInsightIntent) {
                    InsightIntentCollector.getInstance().recordCompiledFile(
                        currProgram.absoluteName,
                        currProgram.relativeFilePath
                    );
                }
                if (
                    this.pluginContext &&
                    'getFileManager' in this.pluginContext &&
                    this.state === arkts.Es2pandaContextState.ES2PANDA_STATE_PARSED &&
                    this.pluginName === 'uiTransform' &&
                    this.isLegacyFile(currProgram)
                ) {
                    this.visitLegacyInExternalSource(currProgram, name, extensionName, cachePath);
                } else {
                    this.visitNonLegacyInExternalSource(currProgram, name, extensionName, cachePath);
                }
            }
            visited.add(currProgram.peer);
            for (const externalSource of currProgram.getExternalSources()) {
                this.visitNextProgramInQueue(queue, visited, externalSource);
            }
        }
    }

    programVisitor(program: arkts.Program): arkts.Program {
        if (this.shouldVisitExternal) {
            if (!this.isFrameworkMode && this.state === arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED) {
                ProgramSkipper.initialize(
                    program,
                    program.getExternalSources().flatMap((external) => external.programs)
                );
            }
            this.visitExternalSources(program, [program]);
        }

        let programScript = program.ast;
        programScript = this.visitor(programScript, program, program.moduleName);

        const visitorsToReset = flattenVisitorsInHooks(this.hooks, this.state);
        visitorsToReset.forEach((visitor) => visitor.reset());

        return program;
    }

    private preVisitor(
        hook: ProgramHookLifeCycle | undefined,
        node: arkts.AstNode,
        program?: arkts.Program,
        externalSourceName?: string
    ): arkts.ETSModule {
        let script: arkts.ETSModule = node as arkts.ETSModule;
        const preVisitors = hook?.pre?.visitors ?? [];
        for (const transformer of preVisitors) {
            script = this.visitTransformer(transformer, script, externalSourceName, program);
            if (!this.hooks?.external?.pre?.resetAfter) {
                transformer.reset();
            }
        }
        return script
    }

    private postVisitor(
        hook: ProgramHookLifeCycle | undefined,
        node: arkts.AstNode,
        program?: arkts.Program,
        externalSourceName?: string
    ): arkts.ETSModule {
        let script: arkts.ETSModule = node as arkts.ETSModule;
        const postVisitors = hook?.post?.visitors ?? [];
        for (const transformer of postVisitors) {
            script = this.visitTransformer(transformer, script, externalSourceName, program);
            if (!this.hooks?.external?.pre?.resetAfter) {
                transformer.reset();
            }
        }
        return script
    }

    visitor(node: arkts.AstNode, program?: arkts.Program, externalSourceName?: string): arkts.ETSModule {
        if (ProgramSkipper.canSkipProgram(program)) {
            debugLog('can skip file: ', program?.absoluteName);
            return node as arkts.ETSModule;
        }
        debugLog('cant skip file: ', program?.absoluteName);

        let hook: ProgramHookLifeCycle | undefined;

        let script: arkts.ETSModule = node as arkts.ETSModule;
        let count: number = 0;
        const isExternal: boolean = !!externalSourceName;

        // pre-run visitors
        hook = isExternal ? this.hooks?.external : this.hooks?.source;
        script = this.preVisitor(hook, script, program, externalSourceName);

        for (const transformer of this.visitors) {
            script = this.visitTransformer(transformer, script, externalSourceName, program);
            if (!transformer.isExternal) {
                debugDumpAstNode(
                    script,
                    getDumpFileName(this.state, this.pluginName, count, transformer.constructor.name),
                    this.pluginContext?.getProjectConfig()?.cachePath,
                    program!.fileNameWithExtension
                );
                count += 1;
            }
        }

        // post-run visitors
        hook = isExternal ? this.hooks?.external : this.hooks?.source;
        script = this.postVisitor(hook, script, program, externalSourceName);
        return script;
    }

    private visitTransformer(
        transformer: AbstractVisitor,
        script: arkts.ETSModule,
        externalSourceName?: string,
        program?: arkts.Program
    ): arkts.ETSModule {
        transformer.isDeclaration = !program?.isBuiltSimultaneously;
        transformer.isExternal = !!externalSourceName;
        transformer.externalSourceName = externalSourceName;
        transformer.program = program;
        transformer.init();
        const importStorage = new arkts.ImportStorage(program!, true)
        const newScript = transformer.visitor(script) as arkts.ETSModule;
        program?.setAst(newScript)
        arkts.setAllParents(newScript);
        importStorage.update();
        transformer.reset();
        return program!.ast as arkts.ETSModule;
    }
}

export class CanSkipPhasesCache {
    static resultCache = new Map<arkts.Program, boolean>()

    static check(program: arkts.Program) {
        if (!CanSkipPhasesCache.resultCache.has(program)) {
            const result = arkts.global.es2panda._ProgramCanSkipPhases(arkts.global.context, program.peer);
            CanSkipPhasesCache.resultCache.set(program, result);
        }
        return CanSkipPhasesCache.resultCache.get(program);
    }
}
