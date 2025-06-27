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
import { LogType } from './predefines';

export interface SuggestionOptions {
    code: string;
    range: [start: arkts.SourcePosition, end: arkts.SourcePosition];
    args?: string[];
}

export interface LogInfo {
    node: arkts.AstNode;
    level: LogType;
    message: string;
    args?: string[];
    position?: arkts.SourcePosition;
    suggestion?: SuggestionOptions;
    code?: string;
}

export function createSuggestion(
    code: string,
    rangeStart: arkts.SourcePosition,
    rangeEnd: arkts.SourcePosition,
    ...args: string[]
): SuggestionOptions {
    return { code, range: [rangeStart, rangeEnd], args };
}

export function getPositionRangeFromNode(node: arkts.AstNode): [arkts.SourcePosition, arkts.SourcePosition] {
    return [node.startPosition, node.endPosition];
}

export function generateDiagnosticKind(logItem: LogInfo): arkts.DiagnosticKind {
    const message: string = !!logItem.code ? `${logItem.code}: ${logItem.message}` : logItem.message;
    const level: arkts.PluginDiagnosticType =
        logItem.level === LogType.ERROR
            ? arkts.PluginDiagnosticType.ES2PANDA_PLUGIN_ERROR
            : arkts.PluginDiagnosticType.ES2PANDA_PLUGIN_WARNING;
    return arkts.DiagnosticKind.create(message, level);
}

export function generateDiagnosticInfo(logItem: LogInfo, pos: arkts.SourcePosition): arkts.DiagnosticInfo {
    const diagnosticArgs = logItem.args ?? [];
    const diagnosticKind = generateDiagnosticKind(logItem);
    return arkts.DiagnosticInfo.create(diagnosticKind, pos, ...diagnosticArgs);
}

export function generateSuggestionInfo(
    suggestion: SuggestionOptions,
    message: string,
    range: arkts.SourceRange
): arkts.SuggestionInfo {
    const suggestionArgs = suggestion.args ?? [];
    const suggestionKind = arkts.DiagnosticKind.create(message, arkts.PluginDiagnosticType.ES2PANDA_PLUGIN_SUGGESTION);
    return arkts.SuggestionInfo.create(suggestionKind, suggestion.code, message, range, ...suggestionArgs);
}

export function generateSuggestionRange(suggestion: SuggestionOptions): arkts.SourceRange {
    const [startPosition, endPosition] = suggestion.range;
    return arkts.SourceRange.create(startPosition, endPosition);
}

export class LogCollector {
    public logInfos: LogInfo[];
    private static instance: LogCollector;
    private ignoreError: boolean;

    private constructor() {
        this.logInfos = [];
        this.ignoreError = false;
    }

    static getInstance(): LogCollector {
        if (!this.instance) {
            this.instance = new LogCollector();
        }
        return this.instance;
    }

    private reportDiagnostic(log: LogInfo): void {
        const args = log.args ?? [];
        const position = log.position ?? arkts.getStartPosition(log.node);
        const suggestion = log.suggestion;
        if (!suggestion) {
            const kind = generateDiagnosticKind(log);
            arkts.Diagnostic.logDiagnostic(kind, position, ...args);
        } else {
            const info = generateDiagnosticInfo(log, position);
            const suggestionRange = generateSuggestionRange(suggestion);
            const suggestionInfo = generateSuggestionInfo(suggestion, log.message, suggestionRange);
            arkts.Diagnostic.logDiagnosticWithSuggestion(info, suggestionInfo);
        }
    }

    reset(): void {
        this.logInfos = [];
        this.ignoreError = false;
    }

    collectLogInfo(logItem: LogInfo): void {
        this.logInfos.push(logItem);
    }

    emitLogInfo(): void {
        if (this.ignoreError) {
            return;
        }
        this.logInfos.forEach((logItem: LogInfo) => {
            this.reportDiagnostic(logItem);
        });
    }

    shouldIgnoreError(ignoreError: boolean | undefined): void {
        if (!!ignoreError) {
            this.ignoreError = true;
        }
    }
}
