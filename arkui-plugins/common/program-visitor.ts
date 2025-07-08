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
import { ARKUI_COMPONENT_IMPORT_NAME } from './predefines';
import { PluginContext } from './plugin-context';

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

function sortExternalSources(externalSources: arkts.ExternalSource[]): arkts.ExternalSource[] {
    return externalSources.sort((a, b) => {
        const prefix = ARKUI_COMPONENT_IMPORT_NAME;
        const hasPrefixA = a.getName().startsWith(prefix);
        const hasPrefixB = b.getName().startsWith(prefix);

        // If both have the prefix, maintain their original order
        if (hasPrefixA && hasPrefixB) {
            return 0;
        }
        // If neither has the prefix, maintain their original order
        if (!hasPrefixA && !hasPrefixB) {
            return 0;
        }
        // If only one has the prefix, the one with the prefix comes first
        return hasPrefixA ? -1 : 1;
    });
}

export class ProgramVisitor extends AbstractVisitor {
    private readonly pluginName: string;
    private readonly state: arkts.Es2pandaContextState;
    private readonly visitors: AbstractVisitor[];
    private readonly skipPrefixNames: (string | RegExp)[];
    private readonly hooks?: ProgramHooks;
    private filenames: Map<number, string>;
    private pluginContext?: PluginContext;

    constructor(options: ProgramVisitorOptions) {
        super(options);
        this.pluginName = options.pluginName;
        this.state = options.state;
        this.visitors = options.visitors;
        this.skipPrefixNames = options.skipPrefixNames ?? [];
        this.hooks = options.hooks;
        this.filenames = new Map();
        this.pluginContext = options.pluginContext;
    }

    reset(): void {
        super.reset();
        this.filenames = new Map();
    }

    programVisitor(program: arkts.Program): arkts.Program {
        const skipPrefixes: (string | RegExp)[] = this.skipPrefixNames;

        const visited = new Set();
        const queue: arkts.Program[] = [program];

        while (queue.length > 0) {
            const currProgram = queue.shift()!;
            if (visited.has(currProgram.peer)) {
                continue;
            }

            if (currProgram.peer !== program.peer) {
                const name: string = this.filenames.get(currProgram.peer)!;
                const cachePath: string | undefined = this.pluginContext?.getProjectConfig()?.cachePath;
                debugDump(
                    currProgram.astNode.dumpSrc(),
                    getDumpFileName(this.state, 'ORI', undefined, name),
                    true,
                    cachePath,
                    program.programFileNameWithExtension
                );
                const script = this.visitor(currProgram.astNode, currProgram, name);
                if (script) {
                    debugDump(
                        script.dumpSrc(),
                        getDumpFileName(this.state, this.pluginName, undefined, name),
                        true,
                        cachePath,
                        program.programFileNameWithExtension
                    );
                }
            }

            visited.add(currProgram.peer);

            for (const externalSource of sortExternalSources(currProgram.externalSources)) {
                // TODO: this is very time-consuming...
                if (matchPrefix(skipPrefixes, externalSource.getName())) {
                    continue;
                }

                const nextProgramArr: arkts.Program[] = externalSource.programs ?? [];
                for (const nextProgram of nextProgramArr) {
                    this.filenames.set(nextProgram.peer, externalSource.getName());
                    if (!visited.has(nextProgram.peer)) {
                        queue.push(nextProgram);
                    }
                }
            }
        }

        let programScript = program.astNode;
        programScript = this.visitor(programScript, program, this.externalSourceName);

        const visitorsToReset = flattenVisitorsInHooks(this.hooks, this.state);
        visitorsToReset.forEach((visitor) => visitor.reset());

        return program;
    }

    visitor(node: arkts.AstNode, program?: arkts.Program, externalSourceName?: string): arkts.EtsScript {
        let hook: ProgramHookLifeCycle | undefined;

        let script: arkts.EtsScript = node as arkts.EtsScript;
        let count: number = 0;
        const isExternal: boolean = !!externalSourceName;

        // pre-run visitors
        hook = isExternal ? this.hooks?.external : this.hooks?.source;
        const preVisitors = hook?.pre?.visitors ?? [];
        for (const transformer of preVisitors) {
            transformer.isExternal = isExternal;
            transformer.externalSourceName = externalSourceName;
            transformer.program = program;
            transformer.visitor(script);
            if (!this.hooks?.external?.pre?.resetAfter) transformer.reset();
        }

        for (const transformer of this.visitors) {
            transformer.isExternal = isExternal;
            transformer.externalSourceName = externalSourceName;
            transformer.program = program;
            script = transformer.visitor(script) as arkts.EtsScript;
            transformer.reset();
            arkts.setAllParents(script);
            if (!transformer.isExternal) {
                debugDump(
                    script.dumpSrc(),
                    getDumpFileName(this.state, this.pluginName, count, transformer.constructor.name),
                    true,
                    this.pluginContext?.getProjectConfig()?.cachePath,
                    program!.programFileNameWithExtension
                );
                count += 1;
            }
        }

        // post-run visitors
        hook = isExternal ? this.hooks?.external : this.hooks?.source;
        const postVisitors = hook?.post?.visitors ?? [];
        for (const transformer of postVisitors) {
            transformer.isExternal = isExternal;
            transformer.externalSourceName = externalSourceName;
            transformer.program = program;
            transformer.visitor(script);
            if (!this.hooks?.external?.pre?.resetAfter) transformer.reset();
        }

        return script;
    }
}
