/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

import { InsightIntentEntryExecutor,InsightIntentEntry } from '@ohos.app.ability.InsightIntentDecorator';

@InsightIntentEntry({
  intentName: 'PlayMusic',
  domain: 'MusicDomain',
  intentVersion: '1.0.1',
  displayName: '播放歌曲',
  displayDescription: '播放音乐意图',
  icon: $r("app.media.app_icon"),
  llmDescription: '支持传递歌曲名称，播放音乐',
  keywords: ['音乐播放', '播放歌曲', 'PlayMusic'],
  abilityName: "EntryAbility",
  executeMode: [1],
})

export default class PlayMusicDemo extends InsightIntentEntryExecutor<string> {
}