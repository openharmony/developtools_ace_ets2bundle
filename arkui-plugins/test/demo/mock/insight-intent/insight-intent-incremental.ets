/*
 * Copyright (c) 2026 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 */

import { InsightIntentEntry } from "@ohos.app.ability.InsightIntentDecorator";
import { insightIntent } from "@kit.AbilityKit";
import InsightIntentExecutor from "@ohos.app.ability.InsightIntentEntryExecutor";
import { RecordData } from "@ohos.base";

const parameters = {
  'type': 'object'
} as Record<string, RecordData>;

const result = {

} as Record<string, RecordData>;

@InsightIntentEntry({
  intentName: 'IncrementalIntent1',
  domain: 'control',
  intentVersion: '1.0.0',
  displayName: 'IncrementalTest1',
  displayDescription: 'TestDescription',
  icon: "$r('app.media.startIcon')",
  llmDescription: 'Description',
  keywords: ['incremental', 'test1'],
  abilityName: 'EntryAbility',
  executeMode: [
    insightIntent.ExecuteMode.UI_ABILITY_FOREGROUND,
    insightIntent.ExecuteMode.UI_ABILITY_BACKGROUND,
    insightIntent.ExecuteMode.UI_EXTENSION_ABILITY,
    insightIntent.ExecuteMode.SERVICE_EXTENSION_ABILITY
  ],
  parameters: 'parameters',
  result: 'result'
})
export class IncrementalTestClass1 extends InsightIntentExecutor<string> {
  public entityId: string = 'entityId1'
  public data: string = 'testData1'
}

@InsightIntentEntry({
  intentName: 'IncrementalIntent2',
  domain: 'control',
  intentVersion: '1.0.0',
  displayName: 'IncrementalTest2',
  displayDescription: 'TestDescription',
  icon: "$r('app.media.startIcon')",
  llmDescription: 'Description',
  keywords: ['incremental', 'test2'],
  abilityName: 'EntryAbility',
  executeMode: [
    insightIntent.ExecuteMode.UI_ABILITY_FOREGROUND,
    insightIntent.ExecuteMode.UI_ABILITY_BACKGROUND,
    insightIntent.ExecuteMode.UI_EXTENSION_ABILITY,
    insightIntent.ExecuteMode.SERVICE_EXTENSION_ABILITY
  ],
  parameters: 'parameters',
  result: 'result'
})
export class IncrementalTestClass2 extends InsightIntentExecutor<string> {
  public entityId: string = 'entityId2'
  public data: string = 'testData2'
}