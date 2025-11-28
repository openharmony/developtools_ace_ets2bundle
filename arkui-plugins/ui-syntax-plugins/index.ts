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
import { PluginContext, Plugins } from '../common/plugin-context';
import {
    ParsedUISyntaxLinterTransformer,
} from './transformers/ui-syntax-linter-transformer';
import { createUISyntaxRuleProcessor } from './processor';
import { UISyntaxLinterVisitor } from './transformers/ui-syntax-linter-visitor';
import rules from './rules';
import { getConsistentResourceMap, getMainPages, getUIComponents } from '../common/arkts-utils';
import { debugLog } from '../common/debug';
import { Collector } from '../collectors/collector';
import { ProgramVisitor } from '../common/program-visitor';
import { EXTERNAL_SOURCE_PREFIX_NAMES, NodeCacheNames } from '../common/predefines';
import { MetaDataCollector } from '../common/metadata-collector';
import { ProgramSkipper } from '../common/program-skipper';


export function uiSyntaxLinterTransform(): Plugins {
    return {
        name: 'ui-syntax-plugin',
        parsed: parsedTransform,
        checked: collectAndLint,
        clean(): void {
            ProgramSkipper.clear();
            arkts.NodeCacheFactory.getInstance().clear();
        },
    };
}

function collectAndLint(this: PluginContext): arkts.EtsScript | undefined {
    let script: arkts.EtsScript | undefined;
    arkts.Debugger.getInstance().phasesDebugLog('[UI LINTER PLUGIN] AFTER CHECKED ENTER');
    const contextPtr = this.getContextPtr() ?? arkts.arktsGlobal.compilerContext?.peer;
    const isCoding = this.isCoding?.() ?? false;
    if (!isCoding && !!contextPtr) {
        let program = arkts.getOrUpdateGlobalContext(contextPtr, true).program;
        script = program.astNode;
        debugLog('[BEFORE LINTER SCRIPT] script: ', script);
        arkts.Performance.getInstance().createEvent('ui-linter');
        program = checkedProgramVisit(program, this, isCoding);
        script = program.astNode;
        arkts.Performance.getInstance().stopEvent('ui-linter', true);
        debugLog('[AFTER LINTER SCRIPT] script: ', script);
        this.setArkTSAst(script);
        arkts.Performance.getInstance().logDetailedEventInfos(true);
        arkts.Debugger.getInstance().phasesDebugLog('[UI LINTER PLUGIN] AFTER CHECKED EXIT');
        return script;
    }
    arkts.Debugger.getInstance().phasesDebugLog('[UI LINTER PLUGIN] AFTER CHECKED EXIT WITH NO TRANSFORM');
    return script;
}

function checkedProgramVisit(
    program: arkts.Program,
    context: PluginContext,
    isCoding: boolean = false
): arkts.Program {
    if (isCoding) {
        arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI).shouldCollect(false);
        arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).shouldCollect(false);
    } else {
        arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.UI).shouldCollectUpdate(true);
        arkts.NodeCacheFactory.getInstance().getCache(NodeCacheNames.MEMO).shouldCollectUpdate(true);
    }
    const projectConfig = context.getProjectConfig();
    arkts.Performance.getInstance().createDetailedEvent('[UI LINTER PLUGIN] MetadataCollector init');
    MetaDataCollector.getInstance()
        .setProjectConfig(projectConfig)
        .setComponentsInfo(getUIComponents())
        .setConsistentResourceMap(getConsistentResourceMap())
        .setMainPages(getMainPages(projectConfig));
    arkts.Performance.getInstance().stopDetailedEvent('[UI LINTER PLUGIN] MetadataCollector init');
    const collector = new Collector({
        shouldCollectUI: true,
        shouldCollectMemo: true,
        shouldCheckUISyntax: true
    });
    const programVisitor = new ProgramVisitor({
        pluginName: uiSyntaxLinterTransform.name,
        state: arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED,
        visitors: [collector],
        skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES,
        pluginContext: context,
    });
    program = programVisitor.programVisitor(program);
    MetaDataCollector.getInstance()
        .setComponentsInfo(undefined)
        .setConsistentResourceMap(undefined)
        .setMainPages(undefined);
    if (!isCoding) {
        arkts.NodeCacheFactory.getInstance().perfLog(NodeCacheNames.UI, true);
        arkts.NodeCacheFactory.getInstance().perfLog(NodeCacheNames.MEMO, true);
    }
    return program;
}


const visitedPrograms: Set<any> = new Set();
function parsedTransform(this: PluginContext): arkts.EtsScript | undefined {
    const isCoding = this.isCoding?.() ?? false;
    if (!isCoding) {
        return undefined;
    }
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
    const program = arkts.getOrUpdateGlobalContext(contextPtr, true).program;
    if (visitedPrograms.has(program.peer) || isHeaderFile(program.absName)) {
        return undefined;
    }
    const codingFilePath = this.getCodingFilePath();
    if (program.absName === codingFilePath) {
        return transformProgram.call(this, transformer, program);
    }
    visitedPrograms.add(program.peer);
    arkts.Performance.getInstance().stopEvent(`ui-syntax::parsed`, true);
    return undefined;
}

function transformProgram(
    this: PluginContext,
    transformer: UISyntaxLinterVisitor,
    program: arkts.Program
): arkts.EtsScript {
    const script = transformer.transform(program.astNode) as arkts.EtsScript;
    this.setArkTSAst(script);
    return script;
}

function isHeaderFile(fileName: string): boolean {
    return fileName.endsWith('.d.ets');
}
