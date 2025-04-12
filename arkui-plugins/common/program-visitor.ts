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
import { ARKTS_1_1, ARKUI_COMPONENT_IMPORT_NAME } from './predefines';
import { PluginContext } from './plugin-context';
import { LegacyTransformer } from '../ui-plugins/legacy-transformer';
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

    getLegacyModule(): void {
        const moduleList = this.pluginContext?.getProjectConfig()?.dependentModuleList;
        if (moduleList === undefined) {
            return;
        }
        for (const module of moduleList) {
            const language = module.language;
            const moduleName = module.moduleName;
            if (language !== ARKTS_1_1) {
                continue;
            }
            if (!this.legacyStructMap.has(moduleName)) {
                this.legacyStructMap.set(moduleName, {});                
                this.legacyModuleList.push(moduleName);
            }
        }
    }

    dumpHeaders(
        currProgram: arkts.Program,
        name: string,
        cachePath: string | undefined,
        prefixName: string,
        extensionName: string
    ): void {
        debugDump(
            currProgram.astNode.dumpSrc(), 
            getDumpFileName(this.state, prefixName, undefined, name), 
            true,
            cachePath,
            extensionName
        );
    }

    programVisitor(program: arkts.Program): arkts.Program {
        const skipPrefixes: (string | RegExp)[] = this.skipPrefixNames;
        const visited = new Set();
        const queue: arkts.Program[] = [program];
        this.getLegacyModule();
        while (queue.length > 0) {
            const currProgram = queue.shift()!;
            if (visited.has(currProgram.peer)) {
                continue;
            }
            if (currProgram.peer !== program.peer) {
                const name: string = this.filenames.get(currProgram.peer)!;
                const cachePath: string | undefined = this.pluginContext?.getProjectConfig()?.cachePath;
                if (this.legacyModuleList && matchPrefix(this.legacyModuleList, name)) {
                    if (this.state === arkts.Es2pandaContextState.ES2PANDA_STATE_PARSED) {
                        const structList = this.visitorLegacy(currProgram.astNode, currProgram, name);
                        const moduleName = name.split('/')[0];
                        const structMap = this.legacyStructMap.get(moduleName)!;
                        for (const struct of structList) {
                            structMap[struct] = name;
                        }
                    }
                } else {
                    this.dumpHeaders(currProgram, name, cachePath, 'Ori', program.programFileNameWithExtension);
                    const script = this.visitor(currProgram.astNode, currProgram, name);
                    if (script) {
                        this.dumpHeaders(currProgram, name, cachePath, this.pluginName, program.programFileNameWithExtension);
                    }
                }
            }
            visited.add(currProgram.peer);
            for (const externalSource of sortExternalSources(currProgram.externalSources)) {
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
        const hasLegacy = this.legacyStructMap.size ? true : false;
        let programScript = program.astNode;
        programScript = this.visitor(programScript, program, this.externalSourceName, hasLegacy);
        const visitorsToReset = flattenVisitorsInHooks(this.hooks, this.state);
        visitorsToReset.forEach((visitor) => visitor.reset());
        return program;
    }

    preVisitor(
        node: arkts.AstNode,
        program?: arkts.Program,
        externalSourceName?: string
    ): void {
        const isExternal: boolean = !!externalSourceName;
        let hook: ProgramHookLifeCycle | undefined = isExternal ? this.hooks?.external : this.hooks?.source;
        let script: arkts.EtsScript = node as arkts.EtsScript;

        const preVisitors = hook?.pre?.visitors ?? [];
        for (const transformer of preVisitors) {
            transformer.isExternal = isExternal;
            transformer.externalSourceName = externalSourceName;
            transformer.program = program;
            transformer.visitor(script);
            if (!this.hooks?.external?.pre?.resetAfter) {
                transformer.reset();
            }
        }
    }

    postVisitor(
        node: arkts.AstNode,
        program?: arkts.Program,
        externalSourceName?: string
    ): void {
        const isExternal: boolean = !!externalSourceName;
        let hook: ProgramHookLifeCycle | undefined = isExternal ? this.hooks?.external : this.hooks?.source;
        let script: arkts.EtsScript = node as arkts.EtsScript;

        const postVisitors = hook?.post?.visitors ?? [];
        for (const transformer of postVisitors) {
            transformer.isExternal = isExternal;
            transformer.externalSourceName = externalSourceName;
            transformer.program = program;
            transformer.visitor(script);
            if (!this.hooks?.external?.pre?.resetAfter) {
                transformer.reset();
            }
        }
    }

    visitor(
        node: arkts.AstNode,
        program?: arkts.Program,
        externalSourceName?: string,
        hasLegacy: boolean = false
    ): arkts.EtsScript {
        let script: arkts.EtsScript = node as arkts.EtsScript;
        let count: number = 0;
        const isExternal: boolean = !!externalSourceName;

        // pre-run visitors
        this.preVisitor(node, program, externalSourceName);

        for (const transformer of this.visitors) {
            transformer.isExternal = isExternal;
            transformer.externalSourceName = externalSourceName;
            transformer.program = program;
            if (hasLegacy && transformer instanceof ComponentTransformer) {
                transformer.registerMap(this.legacyStructMap);
            }
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
        this.postVisitor(node, program, externalSourceName);

        return script;
    }

    visitorLegacy(
        node: arkts.AstNode,
        program?: arkts.Program,
        externalSourceName?: string,
    ): string[] {
        const visitor = new LegacyTransformer();
        const script = visitor.visitor(node) as arkts.EtsScript;
        const structList = visitor.getList();
        return structList;
    }
}
