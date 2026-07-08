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
import { Entry, Text, Component } from '@ohos.arkui.component';
import { InsightIntentLink, LinkIntentParamMapping,LinkParamCategory } from '@ohos.app.ability.InsightIntentDecorator';

@Entry
@Component

@InsightIntentLink({
  intentName: 'TestIntentNameLink',
  domain: 'game',
  intentVersion: '1.0.0',
  displayName: 'TestName',
  displayDescription: 'TestDescription',
  icon: "$r('app.media.startIcon')",
  llmDescription: 'Description',
  keywords: ['keywords', 'testKeywords'],
  uri: 'https://www.example.com/music/1'
})

struct ModifyNonClass {
  build() {
    Text("ModifyNonClass")
    .height('100%')
    .width('100%')
  }
}