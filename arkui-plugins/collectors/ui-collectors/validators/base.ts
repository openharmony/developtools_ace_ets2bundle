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
import { LogCollector, LogInfo, SuggestionOptions } from '../../../common/log-collector';

export interface Validator<TargetNode extends arkts.AstNode = arkts.AstNode, ContextMetadata extends Object = Object> {
    checkIsViolated(node: TargetNode, metadata?: ContextMetadata): void;
    collectContext(context: ContextMetadata): this;
    withShouldSkip(shouldSkip?: boolean): this;
    reset(): void;
}

export abstract class BaseValidator<T extends arkts.AstNode, R extends Object> implements Validator<T, R> {
    protected context?: R;
    protected shouldSkip: boolean;

    constructor() {
        this.shouldSkip = false;
    }

    withShouldSkip(shouldSkip?: boolean): this {
        if (!!shouldSkip) {
            this.shouldSkip = shouldSkip;
        }
        return this;
    }

    reset(): void {
        this.context = undefined;
    }

    checkIsViolated(node: T, metadata?: R | undefined): void {
        if (this.shouldSkip) {
            return;
        }
        if (!!metadata) {
            this.collectContext(metadata);
        }
        this.reportIfViolated(node);
    }

    collectContext(context: R): this {
        this.context = context;
        return this;
    }

    protected report(logInfo: LogInfo): void {
        LogCollector.getInstance().collectLogInfo(logInfo);
    }

    abstract reportIfViolated(node: T): void;
}

// TODO: remove this
function formatReport(logInfo: LogInfo): string {
    const node = logInfo.node.dumpSrc();
    return JSON.stringify(
        {
            node,
            level: logInfo.level,
            message: logInfo.message,
            args: logInfo.args,
            suggestion: formatSuggestion(logInfo.suggestion),
            code: logInfo.code,
        },
        null,
        2
    );
}

// TODO: remove this
function formatSuggestion(suggestion: SuggestionOptions | undefined): Object | undefined {
    if (!suggestion) {
        return undefined;
    }
    const startRange = `(${suggestion.range[0].index()}, ${suggestion.range[0].line()})`;
    const endRange = `(${suggestion.range[1].index()}, ${suggestion.range[1].line()})`;
    const range = `${startRange} - ${endRange}`;
    return { code: suggestion.code, range, args: suggestion.args };
}
