/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
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

import { RecordData } from '@ohos.base';
import { InsightIntentLink, LinkIntentParamMapping,LinkParamCategory } from '@ohos.app.ability.InsightIntentDecorator';
import insightIntent from '@ohos.app.ability.insightIntent';

const playMusicParameters: Record<string, RecordData> = {
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
      } as Record<string, RecordData>,
      "required": [
        "entityId"
      ],
      "properties": {
        "entityId": {
          "description": "游戏唯一实体 id",
          "type": "string"
        } as Record<string, RecordData>,
        "entityGroupId": {
          "description": "用于确定游戏的更新形式（每日游戏）",
          "type": "string"
        } as Record<string, RecordData>,
        "gameType": {
          "description": "游戏类型",
          "type": "string",
          "enum": [
            "3D",
            "2D",
            "RPG"
          ]
        } as Record<string, RecordData>,
      } as Record<string, RecordData>,
    } as Record<string, RecordData>,
  } as Record<string, RecordData>,
};

const playMusicResult: Record<string, RecordData> = {
  "type": "object",
  "propertyNames": {
    "enum": ["code", "result"]
  } as Record<string, RecordData>,
  "required": ["code", "result"],
  "properties": {
    "code": {
      "description": "执行结果码",
      "type": "number"
    } as Record<string, RecordData>,
    "result": {}
  } as Record<string, RecordData>
};

const playMusicParamMappings: LinkIntentParamMapping[] = [
  {
    paramName: "aaa",
    paramMappingName: "bbb",
    paramCategory: LinkParamCategory.LINK
  }
];

@InsightIntentLink({
  intentName: 'TestIntentLink',
  domain: 'MusicDomain',
  intentVersion: '1.0.0',
  displayName: 'TestName',
  displayDescription: 'TestDescription',
  icon: "$r('app.media.startIcon')",
  llmDescription: 'Description',
  keywords: ['keywords', 'testKeywords'],
  uri: 'https://www.example.com/music/1',
  parameters: "playMusicParameters",
  result: "playMusicResult",
  paramMappings: "playMusicParamMappings"
})
export class PlayMusicLink {}