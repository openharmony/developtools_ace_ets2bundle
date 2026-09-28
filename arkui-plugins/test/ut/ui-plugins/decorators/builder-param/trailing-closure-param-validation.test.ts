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

import * as path from 'path';
import * as arkts from '@koalaui/libarkts';
import { PluginTester } from '../../../../utils/plugin-tester';
import { runCheckedLinterCapture } from '../../../../utils/checked-linter-capture';
import { mockBuildConfig, mockProjectConfig } from '../../../../utils/artkts-config';
import { getRootPath, MOCK_ENTRY_DIR_PATH } from '../../../../utils/path-config';
import { BuildConfig, PluginTestContext } from '../../../../utils/shared-types';
import { ProjectConfig, PluginContext, Plugins } from '../../../../../common/plugin-context';
import { LogInfo } from '../../../../../common/log-collector';
import { uiTransform } from '../../../../../ui-plugins';

const BUILDER_PARAM_DIR_PATH: string = 'decorators/builder-param';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, BUILDER_PARAM_DIR_PATH, 'trailing-closure-param-validation.ets'),
];

const projectConfig: ProjectConfig = mockProjectConfig();
projectConfig.compatibleSdkVersion = 26;

const pluginTester = new PluginTester(
    'test @BuilderParam trailing closure parameter validation (Collector + validators)',
    buildConfig,
    projectConfig
);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const TRAILING_CLOSURE_PARAM_MESSAGE = 'is used as a trailing closure so the function cannot have any parameters.';
const EXPECTED_CLOSE1_MESSAGE = `@BuilderParam decorated parameter 'close1' ${TRAILING_CLOSURE_PARAM_MESSAGE}`;

// Messages of @BuilderParam trailing-closure reports captured from the validator layer
// (checkBuilderParam).
let capturedMessages: string[] = [];

function isTrailingClosureParamReport(logItem: LogInfo): boolean {
    return logItem.message.includes(TRAILING_CLOSURE_PARAM_MESSAGE);
}

function captureTrailingClosureParamReport(logItem: LogInfo): void {
    capturedMessages.push(logItem.message);
}

// Runs the ui-syntax linter flow at the checked state while capturing @BuilderParam
// trailing-closure reports instead of emitting them as es2panda diagnostics.
const builderParamValidationTransform: Plugins = {
    name: 'builder-param-validation',
    checked(this: PluginContext): arkts.ETSModule | undefined {
        capturedMessages = [];
        return runCheckedLinterCapture(
            builderParamValidationTransform.name,
            this,
            isTrailingClosureParamReport,
            captureTrailingClosureParamReport
        );
    },
};

function testTrailingClosureParamValidation(this: PluginTestContext): void {
    // ChildRequiredParam declares @BuilderParam close1: (a: number, b?: number) => void and is
    // called as a trailing closure: exactly one error must be reported, for 'close1'.
    // ChildNoParam (() => void), ChildOptionalParam ((a?: number) => void) and
    // ChildNonLastParam (required params on a non-last @BuilderParam) must not be reported.
    expect(capturedMessages).toHaveLength(1);
    expect(capturedMessages[0]).toBe(EXPECTED_CLOSE1_MESSAGE);
}

pluginTester.run(
    'test @BuilderParam trailing closure parameter validation (Collector + validators)',
    [parsedTransform, builderParamValidationTransform],
    {
        checked: [testTrailingClosureParamValidation],
    },
    {
        stopAfter: 'checked',
    }
);
