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
import { beforeInsightIntentNoRecheck, insightIntentNoRecheck, recheck } from '../../..//utils/plugins';
import { BuildConfig, PluginTestContext } from '../../../utils/shared-types';
import { uiTransform } from '../../../../ui-plugins';
import { Plugins } from '../../../../common/plugin-context';

const INSIGHT_INTENT_DIR_PATH: string = 'insight-intent';

const TEST_SOURCE_FILE_PATH: string = 
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, INSIGHT_INTENT_DIR_PATH, 'insight-intent-fun.ets');

const buildConfig: BuildConfig = mockBuildConfig();
buildConfig.compileFiles = [TEST_SOURCE_FILE_PATH];

const pluginTester = new PluginTester('test insight-intent @InsightIntentFunction', buildConfig);

const parsedTransform: Plugins = {
    name: 'insight-intent',
    parsed: uiTransform().parsed,
};

const insightIntentJson = {
  "extractInsightIntents": [
    {
      "decoratorFile": TEST_SOURCE_FILE_PATH,
      "decoratorType": "@InsightIntentFunctionMethod",
      "packageName": "",
      "moduleName": "entry",
      "bundleName": "com.example.mock",
			"decoratorClass": "ClassForFunc",
			"functionName": "Function1",
			"functionReturnType": "Promise<string>",
			"functionParamList": [
				"location"
			],
      "intentName": "TestIntentNameFunction",
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
      "parameters": {
				"schema": "http://json-schema.org/draft-07/schema#",
				"type": "object",
				"title": "Weather Schema",
				"description": "A schema for get weather of an location",
				"properties": {
					"location": {
						"type": "string",
						"description": "The city and state, e.g. Hangzhou",
						"minLength": 1
					}
				},
				"required": [
					"location"
				],
				"additionalProperties": false
			},
    }
  ]
}

function testCheckedTransformer(this: PluginTestContext): void {
    expect(loadJson(getInsightIntentJsonPath(pluginTester.aceProfilePath))).toEqual(insightIntentJson);
}

pluginTester.run(
    'insight-intent @InsightIntentFunction',
    [parsedTransform, beforeInsightIntentNoRecheck, insightIntentNoRecheck, recheck],
    {
        'checked:insight-intent-no-recheck': [testCheckedTransformer],
    },
    {
        stopAfter: 'checked',
    }
);
