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

@InsightIntentForm({
  intentName: 'PlayMusic78',
  domain: 'MusicDomain',
  intentVersion: '1.0.1',
  displayName: '播放歌曲',
  displayDescription: '播放音乐意图',
  icon: "",
  llmDescription: '支持传递歌曲名称，播放音乐',
  keywords: ['音乐播放', '播放歌曲', 'PlayMusic'],
  parameters: {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "title": "Song Schema",
    "description": "A schema for describing songs and their artists",
    "properties": {
      "songName": {
        "type": "string",
        "description": "The name of the song",
        "minLength": 1
      },
      "artist": {
        "type": "object",
        "description": "Information about the artist",
        "properties": {
          "country": {
            "type": "string",
            "description": "The artist's country of origin",
            "default": "zh"
          },
          "city": {
            "type": "object",
            "description": "The artist's city of origin"
          },
          "name": {
            "type": "string",
            "description": "The name of the artist",
            "minLength": 1
          }
        },
        "required": ["name"]
      }
    },
    "required": ["songName"]
  },
  formName: 'widget'
})
export default class EntryFormAbilityaa extends FormExtensionAbility {
  songName: string = ""

  onAddForm(want: Want) {
    // Called to return a FormBindingData object.
    let formData = '';
    return formBindingData.createFormBindingData(formData);
  }

  onCastToNormalForm(formId: string) {
    // Called when the form provider is notified that a temporary form is successfully
    // converted to a normal form.
  }

  onUpdateForm(formId: string) {
    // Called to notify the form provider to update a specified form.
  }

  onFormEvent(formId: string, message: string) {
    // Called when a specified message event defined by the form provider is triggered.
  }

  onRemoveForm(formId: string) {
    // Called to notify the form provider that a specified form has been destroyed.
  }

  onAcquireFormState(want: Want) {
    // Called to return a {@link FormState} object.
    return formInfo.FormState.READY;
  }
};
