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

const STATE_DIR_PATH: string = 'decorators/monitor';

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, STATE_DIR_PATH, 'monitor-wildcard-index.ets'),
];

const projectConfig: ProjectConfig = mockProjectConfig();
projectConfig.compatibleSdkVersion = 26;

const pluginTester = new PluginTester(
    'test @Monitor index-wildcard path validation (Collector + validators)',
    buildConfig,
    projectConfig
);

const parsedTransform: Plugins = {
    name: 'parsedTrans',
    parsed: uiTransform().parsed
};

const MONITOR_TARGET_INVALID_MESSAGE = 'The Monitor decorator needs to monitor the state variables that exist.';

// Path strings reported as invalid by the validator layer
// (checkMonitorDecorator -> MonitorPathStringCache).
let capturedPaths: string[] = [];

function isMonitorTargetInvalid(logItem: LogInfo): boolean {
    return logItem.message === MONITOR_TARGET_INVALID_MESSAGE;
}

function captureInvalidMonitorPath(logItem: LogInfo): void {
    // Resolve eagerly: native nodes are freed after the compile job ends.
    capturedPaths.push(logItem.node.dumpSrc().replace(/["']/g, ''));
}

// Runs the ui-syntax linter flow at the checked state while capturing @Monitor path
// validation reports instead of emitting them as es2panda diagnostics.
const monitorPathValidationTransform: Plugins = {
    name: 'monitor-path-validation',
    checked(this: PluginContext): arkts.ETSModule | undefined {
        capturedPaths = [];
        return runCheckedLinterCapture(
            monitorPathValidationTransform.name,
            this,
            isMonitorTargetInvalid,
            captureInvalidMonitorPath
        );
    },
};

/** Path strings of @Monitor paths reported as invalid by the validator layer. */
function reportedInvalidMonitorPaths(): string[] {
    return capturedPaths;
}

function testParsedAndCheckedTransformer(this: PluginTestContext): void {
    // Valid paths: wildcard after a named property and after an array index
    // (multi-dimensional and one-dimensional arrays) must not be reported.
    const reported: string[] = reportedInvalidMonitorPaths();
    expect(reported).not.toContain('topArray.1.*');
    expect(reported).not.toContain('topArray.*');
    expect(reported).not.toContain('arr.0.*');
    // Invalid paths must still be reported:
    // unknown state variable, wildcard on primitive element, wildcard not at the end
    expect(reported).toContain('nonExist.*');
    expect(reported).toContain('nums.0.*');
    expect(reported).toContain('arr.0.*.b');
}

pluginTester.run(
    'test @Monitor index-wildcard path validation (Collector + validators)',
    [parsedTransform, monitorPathValidationTransform],
    {
        checked: [testParsedAndCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
