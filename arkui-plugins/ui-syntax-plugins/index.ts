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
import { matchPrefix } from '../common/arkts-utils';
import { EXCLUDE_EXTERNAL_SOURCE_PREFIXES, tracePerformance } from './utils';

export function uiSyntaxLinterTransform(): Plugins {
    const processor = createUISyntaxRuleProcessor(rules);
    const parsedTransformer = new ParsedUISyntaxLinterTransformer(processor);
    const checkedTransformer = new CheckedUISyntaxLinterTransformer(processor);
    return {
        name: 'ui-syntax-plugin',
        parsed: createTransformer('parsed', processor, parsedTransformer),
        checked: createTransformer('checked', processor, checkedTransformer),
    };
}

function createTransformer(
    phase: string,
    processor: UISyntaxRuleProcessor,
    transformer: UISyntaxLinterVisitor
): PluginHandler {
    const visitedPrograms: Set<any> = new Set();
    const visitedExternalSources: Set<any> = new Set();
    return tracePerformance(`UISyntaxPlugin::${phase}`, function (this: PluginContext): arkts.EtsScript | undefined {
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
        const isCoding = this.isCoding?.() ?? false;
        processor.setComponentsInfo(projectConfig, isCoding);
        if (isCoding) {
            const codingFilePath = this.getCodingFilePath();
            if (program.absName === codingFilePath) {
                return transformProgram.call(this, transformer, program);
            }
        } else {
            transformExternalSources.call(this, program, visitedExternalSources, visitedPrograms, transformer);
            if (program.absName) {
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
    visitedExternalSources: Set<any>,
    visitedPrograms: Set<any>,
    transformer: UISyntaxLinterVisitor
): void {
    const externalSources = program.externalSources;
    for (const externalSource of externalSources) {
        if (matchPrefix(EXCLUDE_EXTERNAL_SOURCE_PREFIXES, externalSource.getName())) {
            continue;
        }
        if (visitedExternalSources.has(externalSource)) {
            continue;
        }
        const programs = externalSource.programs;
        for (const program of programs) {
            if (visitedPrograms.has(program.peer) || isHeaderFile(program.absName)) {
                continue;
            }
            const script = transformer.transform(program.astNode) as arkts.EtsScript;
            this.setArkTSAst(script);
        }
        visitedExternalSources.add(externalSource.peer);
    }
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
