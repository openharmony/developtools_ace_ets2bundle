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

import { insightIntent, InsightIntentEntry, InsightIntentEntity } from '@kit.AbilityKit';
import { RecordData } from '@ohos.base';
import InsightIntentEntryExecutor from '@ohos.app.ability.InsightIntentEntryExecutor';

const intentEntryParameters: Record<string, RecordData> = {
  "type": "object"
};

const intentEntityParameters: Record<string, RecordData> = {
  "type": "object"
};

@InsightIntentEntity({
  entityCategory: 'artist entity category',
  parameters: "intentEntityParameters",
})
export class ArtistClassDef implements insightIntent.IntentEntity {
  public entityId: string = '0x11';
  public country?: string = '111111';
  public city?: string = '222222';
  public name: string = '333333';
}

@InsightIntentEntry({
  intentName: "TestIntentNameEntity",
  domain: "control",
  intentVersion: "1.0.0",
  displayName: "TestName",
  displayDescription: 'TestDescription',
  icon: "$r('app.media.startIcon')",
  llmDescription: "Description",
  keywords: ['keywords', 'testKeywords'],
  abilityName: "EntryAbility",
  executeMode: [insightIntent.ExecuteMode.UI_ABILITY_BACKGROUND],
  parameters :"intentEntryParameters"
})
export default class Entity extends InsightIntentEntryExecutor<string> {
  public artist?: ArtistClassDef;
  public entityId: string = 'entry';
}