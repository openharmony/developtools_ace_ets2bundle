/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as arkts from '@koalaui/libarkts';
import { Collector } from '../../collectors/collector';
import { LogCollector, LogInfo } from '../../common/log-collector';
import { MetaDataCollector } from '../../common/metadata-collector';
import { ProgramVisitor } from '../../common/program-visitor';
import { EXTERNAL_SOURCE_PREFIX_NAMES } from '../../common/predefines';
import { PluginContext } from '../../common/plugin-context';

type ShouldCapture = (logItem: LogInfo) => boolean;
type CaptureHandler = (logItem: LogInfo) => void;
type CollectLogInfo = (this: LogCollector, logItem: LogInfo) => void;
type EmitLogInfo = (this: LogCollector) => void;

let shouldCapture: ShouldCapture | undefined;
let captureHandler: CaptureHandler | undefined;
let originalCollectLogInfo: CollectLogInfo | undefined;
let originalEmitLogInfo: EmitLogInfo | undefined;

/** Swallows reports: the mock test driver cannot emit es2panda diagnostics; UTs stay capture-only. */
function noopEmitLogInfo(this: LogCollector): void {}

/** Stand-in for LogCollector.collectLogInfo that forwards matching reports to captureHandler. */
function capturingCollectLogInfo(this: LogCollector, logItem: LogInfo): void {
    if (shouldCapture!(logItem)) {
        captureHandler!(logItem);
    }
    originalCollectLogInfo!.call(this, logItem);
}

function stubLogCollector(filter: ShouldCapture, handler: CaptureHandler): void {
    shouldCapture = filter;
    captureHandler = handler;
    originalCollectLogInfo = LogCollector.prototype.collectLogInfo;
    originalEmitLogInfo = LogCollector.prototype.emitLogInfo;
    LogCollector.prototype.collectLogInfo = capturingCollectLogInfo;
    LogCollector.prototype.emitLogInfo = noopEmitLogInfo;
}

function restoreLogCollector(): void {
    if (!originalCollectLogInfo || !originalEmitLogInfo) {
        return;
    }
    LogCollector.prototype.collectLogInfo = originalCollectLogInfo;
    LogCollector.prototype.emitLogInfo = originalEmitLogInfo;
    shouldCapture = undefined;
    captureHandler = undefined;
    originalCollectLogInfo = undefined;
    originalEmitLogInfo = undefined;
}

/**
 * Runs the same Collector + ProgramVisitor flow as the ui-syntax linter
 * (ui-syntax-plugins/index.ts checkedProgramVisit) while capturing reports instead of
 * emitting them as es2panda diagnostics, so validator rules can be asserted at the
 * validator level in UTs.
 *
 * Reports matching `filter` are handed to `handler`; resolve any needed AST data
 * (e.g. dumpSrc) eagerly there — native nodes are freed after the compile job ends.
 */
export function runCheckedLinterCapture(
    pluginName: string,
    pluginContext: PluginContext,
    filter: ShouldCapture,
    handler: CaptureHandler
): arkts.ETSModule | undefined {
    const contextPtr = pluginContext.getContextPtr() ?? arkts.arktsGlobal.compilerContext?.peer;
    if (!contextPtr) {
        return undefined;
    }
    let program = arkts.getOrUpdateGlobalContext(contextPtr).program;
    MetaDataCollector.getInstance()
        .setProjectConfig(pluginContext.getProjectConfig())
        .setShouldHandleInsightIntent(false);
    stubLogCollector(filter, handler);
    try {
        const collector = new Collector({
            shouldCollectUI: true,
            shouldCheckUISyntax: true,
        });
        const programVisitor = new ProgramVisitor({
            pluginName,
            state: arkts.Es2pandaContextState.ES2PANDA_STATE_CHECKED,
            visitors: [collector],
            skipPrefixNames: EXTERNAL_SOURCE_PREFIX_NAMES,
            pluginContext,
            shouldVisitExternal: true,
        });
        program = programVisitor.programVisitor(program);
    } finally {
        restoreLogCollector();
    }
    MetaDataCollector.getInstance().reset();
    return program.ast as arkts.ETSModule;
}
