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
import { PluginContext, PluginHandler, Plugins } from '../common/plugin-context';
import {
    CheckedUISyntaxLinterTransformer,
    ParsedUISyntaxLinterTransformer,
} from './transformers/ui-syntax-linter-transformer';
import { createUISyntaxRuleProcessor, UISyntaxRuleProcessor } from './processor';
import { UISyntaxLinterVisitor } from './transformers/ui-syntax-linter-visitor';
import rules from './rules';
import { getConsistentResourceMap, getMainPages, getUIComponents, matchPrefix } from '../common/arkts-utils';
import { EXCLUDE_EXTERNAL_SOURCE_PREFIXES, tracePerformance } from './utils';
import { Debugger, debugLog, getDumpFileName } from '../common/debug';
import { UIVisitor } from '../collectors/ui-collectors/ui-visitor';
import { MemoVisitor } from '../collectors/memo-collectors/memo-visitor';
import { Collector } from '../collectors/collector';
import { ProgramVisitor } from '../common/program-visitor';
import { EXTERNAL_SOURCE_PREFIX_NAMES, NodeCacheNames } from '../common/predefines';
import { ProgramSkipper } from '../common/program-skipper';
import { MetaDataCollector } from '../common/metadata-collector';
import { NodeCacheFactory } from '../common/node-cache';

export function uiSyntaxLinterTransform(): Plugins {
    return {
        name: 'ui-syntax-plugin',
        // parsed: parsedTransform,
        checked: collectAndLint,
        clean(): void {
            ProgramSkipper.clear();
            NodeCacheFactory.getInstance().clear();
            visitedPrograms.clear();
            visitedExternalSources.clear();
        },
    };
}

function collectAndLint(this: PluginContext): arkts.ETSModule | undefined {
    Debugger.getInstance().phasesDebugLog('[UI LINTER PLUGIN] AFTER CHECKED ENTER');
    const contextPtr = this.getContextPtr() ?? arkts.arktsGlobal.compilerContext?.peer;
    const isCoding = this.isCoding?.() ?? false;
    if (!!contextPtr) {
        let program = arkts.getOrUpdateGlobalContext(contextPtr).program;
        let script = program.ast as arkts.ETSModule;
        debugLog('[BEFORE LINTER SCRIPT] script: ', script);
        arkts.Performance.getInstance().createEvent('ui-linter');
        program = checkedProgramVisit(program, this, isCoding);
        script = program.ast as arkts.ETSModule;
        arkts.Performance.getInstance().stopEvent('ui-linter', true);
        debugLog('[AFTER LINTER SCRIPT] script: ', script);
        this.setArkTSAst(script);
        arkts.Performance.getInstance().logDetailedEventInfos(true);
        Debugger.getInstance().phasesDebugLog('[UI LINTER PLUGIN] AFTER CHECKED EXIT');
        return script;
    }
    Debugger.getInstance().phasesDebugLog('[UI LINTER PLUGIN] AFTER CHECKED EXIT WITH NO TRANSFORM');
    return undefined;
}

function checkedProgramVisit(
    program: arkts.Program,
    context: PluginContext,
    isCoding: boolean = false
): arkts.Program {
    if (isCoding) {
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI).shouldCollect(false);
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).shouldCollect(false);
    } else {
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI).shouldCollectUpdate(true);
        NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).shouldCollectUpdate(true);
    }
    const projectConfig = context.getProjectConfig();
    arkts.Performance.getInstance().createDetailedEvent('[UI LINTER PLUGIN] MetadataCollector init');
    MetaDataCollector.getInstance()
        .setProjectConfig(projectConfig)
        .setComponentsInfo(getUIComponents(projectConfig, isCoding))
        .setConsistentResourceMap(getConsistentResourceMap())
        .setMainPages(getMainPages(projectConfig));
    arkts.Performance.getInstance().stopDetailedEvent('[UI LINTER PLUGIN] MetadataCollector init');
    const collector = new Collector({
        shouldCollectUI: true,
        shouldCollectMemo: true,
        shouldCheckUISyntax: projectConfig.uiSyntaxPluginEnabled ?? false
    });
    const programVisitor = new ProgramVisitor({
        pluginName: uiSyntaxLinterTransform.name,
        state: arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED,
        visitors: [collector],
        skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES,
        pluginContext: context,
        shouldVisitExternal: !isCoding,
    });
    program = programVisitor.programVisitor(program);
    MetaDataCollector.getInstance()
        .setComponentsInfo(undefined)
        .setConsistentResourceMap(undefined)
        .setMainPages(undefined);
    if (!isCoding) {
        NodeCacheFactory.getInstance().perfLog(NodeCacheNames.UI, true);
        NodeCacheFactory.getInstance().perfLog(NodeCacheNames.MEMO, true);
    }
    return program;
}


function createTransformer(
    phase: string,
    processor: UISyntaxRuleProcessor,
    transformer: UISyntaxLinterVisitor
): PluginHandler {
    const visitedPrograms: Set<arkts.KNativePointer> = new Set();
    const visitedExternalSources: Set<arkts.KNativePointer> = new Set();
    return tracePerformance(`UISyntaxPlugin::${phase}`, function (this: PluginContext): arkts.ETSModule | undefined {
        const contextPtr = this.getContextPtr() ?? arkts.arktsGlobal.compilerContext?.peer;
        if (!contextPtr) {
            return undefined;
        }
        const projectConfig = this.getProjectConfig();
        if (!projectConfig) {
            return undefined;
        }
        processor.setProjectConfig(projectConfig);
        if (projectConfig.frameworkMode) {
            return undefined;
        }
        const program = arkts.getOrUpdateGlobalContext(contextPtr).program;
        if (visitedPrograms.has(program.peer) || isHeaderFile(program.absoluteName)) {
            return undefined;
        }
        const isCoding = this.isCoding?.() ?? false;
        processor.setComponentsInfo(projectConfig, isCoding);
        if (isCoding) {
            const codingFilePath = this.getCodingFilePath();
            if (program.absoluteName === codingFilePath) {
                return transformProgram.call(this, transformer, program);
            }
        } else {
            transformExternalSources.call(this, program, visitedExternalSources, visitedPrograms, transformer);
            if (program.absoluteName) {
                return transformProgram.call(this, transformer, program);
            }
        }
        visitedPrograms.add(program.peer);
        return undefined;
    });
}

function transformExternalSources(
    this: PluginContext,
    program: arkts.Program,
    visitedExternalSources: Set<arkts.KNativePointer>,
    visitedPrograms: Set<arkts.KNativePointer>,
    transformer: UISyntaxLinterVisitor
): void {
    const externalSources = program.getExternalSources();
    for (const externalSource of externalSources) {
        if (matchPrefix(EXCLUDE_EXTERNAL_SOURCE_PREFIXES, externalSource.getName())) {
            continue;
        }
        if (visitedExternalSources.has(externalSource.peer)) {
            continue;
        }
        const programs = externalSource.programs;
        for (const program of programs) {
            if (visitedPrograms.has(program.peer) || isHeaderFile(program.absoluteName)) {
                continue;
            }
            const script = transformer.transform(program.ast) as arkts.ETSModule;
            this.setArkTSAst(script);
        }
        visitedExternalSources.add(externalSource.peer);
    }
}

const visitedPrograms: Set<any> = new Set();
const visitedExternalSources: Set<any> = new Set();
function parsedTransform(this: PluginContext): arkts.ETSModule | undefined {
    const isCoding = this.isCoding?.() ?? false;
    arkts.Performance.getInstance().createEvent(`ui-syntax::parsed`);
    const processor = createUISyntaxRuleProcessor(rules);
    const transformer = new ParsedUISyntaxLinterTransformer(processor);
    const contextPtr = this.getContextPtr() ?? arkts.arktsGlobal.compilerContext?.peer;
    if (!contextPtr) {
        return undefined;
    }
    const projectConfig = this.getProjectConfig();
    if (!projectConfig) {
        return undefined;
    }
    processor.setProjectConfig(projectConfig);
    if (projectConfig.frameworkMode) {
        return undefined;
    }
    const program = arkts.getOrUpdateGlobalContext(contextPtr).program;
    if (visitedPrograms.has(program.peer) || isHeaderFile(program.absoluteName)) {
        return undefined;
    }
    processor.setComponentsInfo(projectConfig, isCoding);
    if (isCoding) {
        const codingFilePath = this.getCodingFilePath();
        if (program.absoluteName === codingFilePath) {
            return transformProgram.call(this, transformer, program);
        }
    } else {
        transformExternalSources.call(this, program, visitedExternalSources, visitedPrograms, transformer);
        if (program.absoluteName) {
            return transformProgram.call(this, transformer, program);
        }
    }
    visitedPrograms.add(program.peer);
    arkts.Performance.getInstance().stopEvent(`ui-syntax::parsed`, true);
    return undefined;
}

function transformProgram(
    this: PluginContext,
    transformer: UISyntaxLinterVisitor,
    program: arkts.Program
): arkts.ETSModule {
    const script = transformer.transform(program.ast) as arkts.ETSModule;
    this.setArkTSAst(script);
    return script;
}

function isHeaderFile(fileName: string): boolean {
    return fileName.endsWith('.d.ets');
}
