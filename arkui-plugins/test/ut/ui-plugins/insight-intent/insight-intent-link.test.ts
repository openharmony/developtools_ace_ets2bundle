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

const TEST_SOURCE_FILE_PATH: string = 
    path.resolve(getRootPath(), MOCK_ENTRY_DIR_PATH, INSIGHT_INTENT_DIR_PATH, 'insight-intent-link.ets');

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
            "decoratorClass": "PlayMusicLink",
            "intentName": "TestIntentLink",
            "domain": "MusicDomain",
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
                "type": "object",
                "items": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "propertyNames": {
                            "enum": [
                                "entityId",
                                "entityGroupId",
                                "gameType"
                            ]
                        },
                        "required": [
                            "entityId"
                        ],
                        "properties": {
                            "entityId": {
                                "description": "游戏唯一实体 id",
                                "type": "string"
                            },
                            "entityGroupId": {
                                "description": "用于确定游戏的更新形式（每日游戏）",
                                "type": "string"
                            },
                            "gameType": {
                                "description": "游戏类型",
                                "type": "string",
                                "enum": [
                                    "3D",
                                    "2D",
                                    "RPG"
                                ]
                            }
                        }
                    }
                }
            },
            "result": {
                "type": "object",
                "propertyNames": {
                    "enum": [
                        "code",
                        "result"
                    ]
                },
                "required": [
                    "code",
                    "result"
                ],
                "properties": {
                    "code": {
                        "description": "执行结果码",
                        "type": "number"
                    },
                    "result": {}
                }
            },
            "uri": "https://www.example.com/music/1",
            "paramMappings": [
                {
                    "paramName": "aaa",
                    "paramMappingName": "bbb",
                    "paramCategory": "link"
                }
            ],
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