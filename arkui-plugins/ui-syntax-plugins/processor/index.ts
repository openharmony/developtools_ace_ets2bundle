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
import { getUIComponents, readJSON, UISyntaxRuleComponents } from '../utils';
import { ProjectConfig } from 'common/plugin-context';

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
    public componentsInfo: UISyntaxRuleComponents | undefined;
    public projectConfig?: ProjectConfig;

    constructor() {
        this.componentsInfo = getUIComponents('../../components/');
    }

    public report(options: ReportOptions): void {
        let message: string;
        if (!options.data) {
            message = options.message;
        } else {
            message = this.format(options.message, options.data);
        }

        const diagnosticKind: arkts.DiagnosticKind = arkts.DiagnosticKind.create(
            message,
            options.level === 'error'
                ? arkts.PluginDiagnosticType.ES2PANDA_PLUGIN_ERROR
                : arkts.PluginDiagnosticType.ES2PANDA_PLUGIN_WARNING
        );
        if (options.fix) {
            const diagnosticInfo: arkts.DiagnosticInfo = arkts.DiagnosticInfo.create(diagnosticKind);
            const fixSuggestion = options.fix(options.node);
            const suggestionKind: arkts.DiagnosticKind = arkts.DiagnosticKind.create(
                message,
                arkts.PluginDiagnosticType.ES2PANDA_PLUGIN_SUGGESTION
            );
            const suggestionInfo: arkts.SuggestionInfo = arkts.SuggestionInfo.create(
                suggestionKind,
                fixSuggestion.code
            );
            const [startPosition, endPosition] = fixSuggestion.range;
            const sourceRange: arkts.SourceRange = arkts.SourceRange.create(startPosition, endPosition);
            arkts.Diagnostic.logDiagnosticWithSuggestion(diagnosticInfo, suggestionInfo, sourceRange);
        } else {
            arkts.Diagnostic.logDiagnostic(diagnosticKind, arkts.getStartPosition(options.node));
        }

        // todo
        const position = arkts.getStartPosition(options.node);
        if (options.fix) {
            const suggestion = options.fix(options.node);
            console.log(`syntax-${options.level ?? 'error'}: ${message}  (${position.index()},${position.line()})`);
            console.log(
                `range: (${suggestion.range[0].index()}, ${suggestion.range[0].line()}) - (${suggestion.range[1].index()}, ${suggestion.range[1].line()})`,
                `code: ${suggestion.code}`
            );
        } else {
            console.log(`syntax-${options.level ?? 'error'}: ${message}  (${position.index()},${position.line()})`);
        }
    }

    getMainPages(): string[] {
        if (!this.projectConfig) {
            return [];
        }
        const { moduleRootPath, aceModuleJsonPath } = this.projectConfig;
        if (!aceModuleJsonPath) {
            return [];
        }
        const moduleConfig = readJSON<ModuleConfig>(aceModuleJsonPath);
        if (!moduleConfig) {
            return [];
        }
        if (!moduleConfig.module || !moduleConfig.module.pages) {
            return [];
        }
        const pagesPath = moduleConfig.module.pages;
        const matcher = /\$(?<directory>[_A-Za-z]+):(?<filename>[_A-Za-z]+)/.exec(pagesPath);
        if (matcher && matcher.groups) {
            const { directory, filename } = matcher.groups;
            const mainPagesPath = path.resolve(moduleRootPath, BASE_RESOURCE_PATH, directory, `${filename}.json`);
            const mainPages = readJSON<MainPages>(mainPagesPath);
            if (!mainPages) {
                return [];
            }
            if (!mainPages.src || !Array.isArray(mainPages.src)) {
                return [];
            }
            return mainPages.src.map((page) => path.resolve(moduleRootPath, ETS_PATH, `${page}.ets`));
        } else {
            return [];
        }
    }

    private format(content: string, placeholders: object): string {
        return Object.entries(placeholders).reduce((content, [placehoderName, placehoderValue]) => {
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
