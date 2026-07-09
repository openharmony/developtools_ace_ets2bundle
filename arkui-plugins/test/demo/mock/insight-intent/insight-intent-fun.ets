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

import hilog from '@ohos.hilog';
import { RecordData } from '@ohos.base';
import { InsightIntentFunction, InsightIntentFunctionMethod } from '@ohos.app.ability.InsightIntentDecorator';
import insightIntent from '@ohos.app.ability.insightIntent';

const intentFunctionParameters: Record<string, RecordData> = {
  'schema': 'http://json-schema.org/draft-07/schema#',
  'type': 'object',
  'title': 'Weather Schema',
  'description': 'A schema for get weather of an location',
  'properties': {
    'location': {
      'type': 'string',
      'description': 'The city and state, e.g. Hangzhou',
      'minLength': 1
    } as Record<string, RecordData>
  } as Record<string, RecordData>,
  'required': ['location'],
  'additionalProperties': false
};

@InsightIntentFunction()
export class ClassForFunc {
  @InsightIntentFunctionMethod({
    intentName: "TestIntentNameFunction",
    domain: "game",
    intentVersion: "1.0.0",
    displayName: "TestName",
    displayDescription: 'TestDescription',
    icon: "$r('app.media.startIcon')",
    llmDescription: 'Description',
    keywords: ['keywords', 'testKeywords'],
    parameters: "intentFunctionParameters"
  })
  static Function1(location:string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const result: string = 'The current temperature in Hangzhou is 24℃';
      resolve(result);
    });
  }
}