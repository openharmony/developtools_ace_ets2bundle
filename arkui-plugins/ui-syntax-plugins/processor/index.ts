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
import * as path from 'node:path';
import {
    AbstractUISyntaxRule,
    ReportOptions,
    UISyntaxRule,
    UISyntaxRuleConfig,
    UISyntaxRuleContext,
    UISyntaxRuleHandler,
} from '../rules/ui-syntax-rule';
import { ProjectConfig, UIComponents } from '../../common/plugin-context';
import { getUIComponents } from '../../common/arkts-utils';

export type UISyntaxRuleProcessor = {
    setProjectConfig(projectConfig: ProjectConfig): void;
    beforeTransform(): void;
    afterTransform(): void;
    parsed(node: arkts.AstNode): void;
    checked(node: arkts.AstNode): void;
};

type ModuleConfig = {
    module: {
        pages: string;
    };
};

type MainPages = {
    src: string[];
};

const BASE_RESOURCE_PATH = 'src/main/resources/base';
const ETS_PATH = 'src/main/ets';

class ConcreteUISyntaxRuleContext implements UISyntaxRuleContext {
    public componentsInfo: UIComponents | undefined;
    public projectConfig?: ProjectConfig;

    constructor() {
        this.componentsInfo = getUIComponents();
    }

    public report(options: ReportOptions): void {
        let message: string;
        if (!options.data) {
            message = options.message;
        } else {
            message = this.format(options.message, options.data);
        }

        const diagnosticKind: arkts.DiagnosticKind = arkts.createDiagnosticKind(
            message,
            options.level === 'error'
                ? arkts.Es2pandaPluginDiagnosticType.ES2PANDA_PLUGIN_ERROR
                : arkts.Es2pandaPluginDiagnosticType.ES2PANDA_PLUGIN_WARNING
        );
        if (options.fix) {
            const diagnosticInfo: arkts.DiagnosticInfo = arkts.createDiagnosticInfo(diagnosticKind,
                options.node.startPosition);
            const fixSuggestion = options.fix(options.node);
            const suggestionKind: arkts.DiagnosticKind = arkts.createDiagnosticKind(
                message,
                arkts.Es2pandaPluginDiagnosticType.ES2PANDA_PLUGIN_SUGGESTION
            );
            const [startPosition, endPosition] = fixSuggestion.range;
            const sourceRange: arkts.SourceRange = arkts.createSourceRange(startPosition, endPosition);
            const suggestionInfo: arkts.SuggestionInfo = arkts.createSuggestionInfo(
                suggestionKind,
                fixSuggestion.code,
                fixSuggestion.title ? fixSuggestion.title : '',
                sourceRange
            );
            arkts.logDiagnosticWithSuggestion(diagnosticInfo, suggestionInfo);
        } else {
            arkts.logDiagnostic(diagnosticKind, options.node.startPosition);
        }
    }

    private format(content: string, placeholders: object): string {
        return Object.entries(placeholders).reduce((content, [placehoderName, placehoderValue]) => {
            // Fixed a bug where $$ was converted to $
            placehoderValue = placehoderValue.split('$$').join('$$$$');
            return content.replace(`{{${placehoderName}}}`, placehoderValue);
        }, content);
    }
}

class ConcreteUISyntaxRuleProcessor implements UISyntaxRuleProcessor {
    protected context: UISyntaxRuleContext;
    protected handlers: UISyntaxRuleHandler[];

    constructor(rules: Array<UISyntaxRule | UISyntaxRuleConfig>) {
        this.context = new ConcreteUISyntaxRuleContext();
        this.handlers = rules.reduce<UISyntaxRuleHandler[]>((handlers, rule) => {
            if (Array.isArray(rule)) {
                const [RuleConstructor, level] = rule;
                if (level !== 'none') {
                    handlers.push(new RuleConstructor(this.context, level));
                }
            } else {
                handlers.push(rule.setup(this.context));
            }
            return handlers;
        }, []);
    }

    beforeTransform(): void {
        for (const handler of this.handlers) {
            if (handler instanceof AbstractUISyntaxRule) {
                handler.beforeTransform();
            }
        }
    }

    afterTransform(): void {
        for (const handler of this.handlers) {
            if (handler instanceof AbstractUISyntaxRule) {
                handler.afterTransform();
            }
        }
    }

    parsed(node: arkts.AstNode): void {
        for (const handler of this.handlers) {
            handler.parsed?.(node);
        }
    }

    checked(node: arkts.AstNode): void {
        for (const handler of this.handlers) {
            handler.checked?.(node);
        }
    }

    setProjectConfig(projectConfig: ProjectConfig): void {
        this.context.projectConfig = projectConfig;
    }
}

export function createUISyntaxRuleProcessor(rules: Array<UISyntaxRule | UISyntaxRuleConfig>): UISyntaxRuleProcessor {
    return new ConcreteUISyntaxRuleProcessor(rules);
}
