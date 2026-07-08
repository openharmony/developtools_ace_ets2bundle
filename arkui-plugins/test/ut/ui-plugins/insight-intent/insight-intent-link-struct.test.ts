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
import { PluginTester } from '../../../utils/plugin-tester';
import { mockBuildConfig } from '../../../utils/artkts-config';
import { getInsightIntentJsonPath, getRootPath, loadJson, MOCK_ENTRY_DIR_PATH } from '../../../utils/path-config';
import { beforeInsightIntentNoRecheck, insightIntentNoRecheck, recheck } from '../../../utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { uiTransform } from '../../../../ui-plugins';
import { Plugins } from '../../../../common/plugin-context';

const INSIGHT_INTENT_DIR_PATH: string = 'insight-intent';

// Normalize path separators for cross-platform compatibility
const TEST_SOURCE_FILE_PATH: string = 
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, INSIGHT_INTENT_DIR_PATH, 'insight-intent-link-struct.ets');

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [TEST_SOURCE_FILE_PATH];

const pluginTester = new PluginTester('test insight-intent @InsightIntentLink', buildConfig);

const parsedTransform: Plugins = {
    name: 'insight-intent',
    parsed: uiTransform().parsed,
};

const insightIntentJson = {
  "extractInsightIntents": [
    {
      "decoratorFile": TEST_SOURCE_FILE_PATH,
      "decoratorType": "@InsightIntentLink",
      "moduleName": "entry",
      "packageName": "",
      "bundleName": "com.example.mock",
      "decoratorClass": "ModifyNonClass",
      "intentName": "TestIntentNameLink",
      "domain": "game",
      "intentVersion": "1.0.0",
      "displayName": "TestName",
      "displayDescription": "TestDescription",
      "icon": "$r('app.media.startIcon')",
      "llmDescription": "Description",
      "keywords": [
        "keywords",
        "testKeywords"
      ],
      "uri": "https://www.example.com/music/1"
    }
  ]
}

function testCheckedTransformer(this: PluginTestContext): void {
    expect(loadJson(getInsightIntentJsonPath(pluginTester.aceProfilePath))).toEqual(insightIntentJson);
}

pluginTester.run(
    'insight-intent @InsightIntentLink',
    [parsedTransform, beforeInsightIntentNoRecheck, insightIntentNoRecheck, recheck],
    {
        'checked:insight-intent-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
