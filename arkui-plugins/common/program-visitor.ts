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
import { debugDump, getDumpFileName } from './debug';
import { InteroperAbilityNames } from '../ui-plugins/interop/predefines';
import { PluginContext } from './plugin-context';
import { LegacyTransformer } from '../ui-plugins/interop/legacy-transformer';
import { ComponentTransformer } from '../ui-plugins/component-transformer';

export interface ProgramVisitorOptions extends VisitorOptions {
    pluginName: string;
    state: arkts.Es2pandaContextState;
    visitors: AbstractVisitor[];
    skipPrefixNames: (string | RegExp)[];
    hooks?: ProgramHooks;
    pluginContext?: PluginContext;
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

export interface StructMap {
    [key: string]: string;
}

export class ProgramVisitor extends AbstractVisitor {
    private readonly pluginName: string;
    private readonly state: arkts.Es2pandaContextState;
    private readonly visitors: AbstractVisitor[];
    private readonly skipPrefixNames: (string | RegExp)[];
    private readonly hooks?: ProgramHooks;
    private filenames: Map<number, string>;
    private pluginContext?: PluginContext;
    private legacyModuleList: string[] = [];
    private legacyStructMap: Map<string, StructMap>;

    constructor(options: ProgramVisitorOptions) {
        super(options);
        this.pluginName = options.pluginName;
        this.state = options.state;
        this.visitors = options.visitors;
        this.skipPrefixNames = options.skipPrefixNames ?? [];
        this.hooks = options.hooks;
        this.filenames = new Map();
        this.pluginContext = options.pluginContext;
        this.legacyModuleList = [];
        this.legacyStructMap = new Map();
    }

    reset(): void {
        super.reset();
        this.filenames = new Map();
        this.legacyStructMap = new Map();
        this.legacyModuleList = [];
    }

    private getLegacyModule(): void {
        const moduleList = this.pluginContext?.getProjectConfig()?.dependentModuleList;
        if (moduleList === undefined) {
            return;
        }
        for (const module of moduleList) {
            const language = module.language;
            const moduleName = module.moduleName;
            if (language !== InteroperAbilityNames.ARKTS_1_1) {
                continue;
            }
            if (!this.legacyStructMap.has(moduleName)) {
                this.legacyStructMap.set(moduleName, {});
                this.legacyModuleList.push(moduleName);
            }
        }
    }

    private dumpExternalSource(
        script: arkts.AstNode,
        name: string,
        cachePath: string | undefined,
        prefixName: string,
        extensionName: string
    ): void {
        debugDump(
            script.dumpSrc(),
            getDumpFileName(this.state, prefixName, undefined, name),
            true,
            cachePath,
            extensionName
        );
    }

    private visitLegacyInExternalSource(currProgram: arkts.Program, name: string): void {
        if (this.state === arkts.Es2pandaContextState.ES2PANDA_STATE_PARSED) {
            const structList = this.visitorLegacy(currProgram.astNode, currProgram, name);
            const moduleName = name.split('/')[0];
            const structMap = this.legacyStructMap.get(moduleName)!;
            for (const struct of structList) {
                structMap[struct] = name;
            }
        }
    }

    private visitNonLegacyInExternalSource(
        program: arkts.Program,
        currProgram: arkts.Program,
        name: string,
        cachePath?: string
    ): void {
        const extensionName: string = program.fileNameWithExtension;
        this.dumpExternalSource(currProgram.astNode, name, cachePath, 'ORI', extensionName);
        const script = this.visitor(currProgram.astNode, currProgram, name);
        if (script) {
            this.dumpExternalSource(script, name, cachePath, this.pluginName, extensionName);
        }
    }

    private visitNextProgramInQueue(
        queue: arkts.Program[],
        visited: Set<unknown>,
        externalSource: arkts.ExternalSource
    ): void {
        const nextProgramArr: arkts.Program[] = externalSource.programs ?? [];
        for (const nextProgram of nextProgramArr) {
            this.filenames.set(nextProgram.peer, externalSource.getName());
            if (!visited.has(nextProgram.peer)) {
                queue.push(nextProgram);
            }
        }
    }

    private visitExternalSources(
        program: arkts.Program,
        programQueue: arkts.Program[]
    ): void {
        const visited = new Set();
        const queue: arkts.Program[] = programQueue;
        this.getLegacyModule();
        while (queue.length > 0) {
            const currProgram = queue.shift()!;
            if (visited.has(currProgram.peer) || currProgram.isASTLowered()) {
                continue;
            }
            if (currProgram.peer !== program.peer) {
                const name: string = this.filenames.get(currProgram.peer)!;
                const cachePath: string | undefined = this.pluginContext?.getProjectConfig()?.cachePath;
                if (this.legacyModuleList && matchPrefix(this.legacyModuleList, name)) {
                    this.visitLegacyInExternalSource(currProgram, name);
                } else {
                    this.visitNonLegacyInExternalSource(program, currProgram, name, cachePath);
                }
            }
            visited.add(currProgram.peer);
            for (const externalSource of currProgram.externalSources) {
                if (matchPrefix(this.skipPrefixNames, externalSource.getName())) {
                    continue;
                }
                this.visitNextProgramInQueue(queue, visited, externalSource);
            }
        }
    }

    programVisitor(program: arkts.Program): arkts.Program {
        this.visitExternalSources(program, [program]);

        let programScript = program.astNode;
        programScript = this.visitor(programScript, program, this.externalSourceName);

        const visitorsToReset = flattenVisitorsInHooks(this.hooks, this.state);
        visitorsToReset.forEach((visitor) => visitor.reset());

        return program;
    }

    private preVisitor(
        hook: ProgramHookLifeCycle | undefined,
        node: arkts.AstNode,
        program?: arkts.Program,
        externalSourceName?: string
    ): void {
        let script: arkts.EtsScript = node as arkts.EtsScript;
        const preVisitors = hook?.pre?.visitors ?? [];
        for (const transformer of preVisitors) {
            this.visitTransformer(transformer, script, externalSourceName, program);
            if (!this.hooks?.external?.pre?.resetAfter) {
                transformer.reset();
            }
        }
    }

    private postVisitor(
        hook: ProgramHookLifeCycle | undefined,
        node: arkts.AstNode,
        program?: arkts.Program,
        externalSourceName?: string
    ): void {
        let script: arkts.EtsScript = node as arkts.EtsScript;
        const postVisitors = hook?.post?.visitors ?? [];
        for (const transformer of postVisitors) {
            this.visitTransformer(transformer, script, externalSourceName, program);
            if (!this.hooks?.external?.pre?.resetAfter) {
                transformer.reset();
            }
        }
    }

    visitor(node: arkts.AstNode, program?: arkts.Program, externalSourceName?: string): arkts.EtsScript {
        let hook: ProgramHookLifeCycle | undefined;

        let script: arkts.EtsScript = node as arkts.EtsScript;
        let count: number = 0;
        const isExternal: boolean = !!externalSourceName;

        // pre-run visitors
        hook = isExternal ? this.hooks?.external : this.hooks?.source;
        this.preVisitor(hook, node, program, externalSourceName);

        for (const transformer of this.visitors) {
            if (this.legacyStructMap.size > 0 && transformer instanceof ComponentTransformer) {
                transformer.registerMap(this.legacyStructMap);
            }
            this.visitTransformer(transformer, script, externalSourceName, program);
            transformer.reset();
            arkts.setAllParents(script);
            if (!transformer.isExternal) {
                debugDump(
                    script.dumpSrc(),
                    getDumpFileName(this.state, this.pluginName, count, transformer.constructor.name),
                    true,
                    this.pluginContext?.getProjectConfig()?.cachePath,
                    program!.fileNameWithExtension
                );
                count += 1;
            }
        }

        // post-run visitors
        hook = isExternal ? this.hooks?.external : this.hooks?.source;
        this.postVisitor(hook, node, program, externalSourceName);
        return script;
    }

    private visitorLegacy(node: arkts.AstNode, program?: arkts.Program, externalSourceName?: string): string[] {
        const transformer = new LegacyTransformer();
        transformer.isExternal = !!externalSourceName;
        transformer.externalSourceName = externalSourceName;
        transformer.program = program;
        transformer.visitor(node);
        const structList = transformer.getList();
        return structList;
    }

    private visitTransformer(
        transformer: AbstractVisitor,
        script: arkts.EtsScript,
        externalSourceName?: string,
        program?: arkts.Program
    ): arkts.EtsScript {
        transformer.isExternal = !!externalSourceName;
        transformer.externalSourceName = externalSourceName;
        transformer.program = program;
        const newScript = transformer.visitor(script) as arkts.EtsScript;
        return newScript;
    }
}
