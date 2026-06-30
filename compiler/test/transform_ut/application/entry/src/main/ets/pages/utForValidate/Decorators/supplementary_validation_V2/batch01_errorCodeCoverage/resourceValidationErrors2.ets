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

// Test resource errors - triggers 10903329, 10903330, 10903331, 10904333, 10906334

@Entry
@Component
struct ResourceValidationErrors {
  // Unknown resource source - 10903331
  @State invalidSrc: Resource = $r('unknown.color.test');
  
  // Unknown resource type - 10903330
  @State invalidType: Resource = $r('app.unknown.test');
  
  // Unknown resource name - 10903329
  @State invalidName: Resource = $r('app.color.nonexistent');
  
  // No such resource in module - 10904333
  @State noResource: Resource = $r('app.media.nonexistent_file.png');
  
  // Resource type not supported - 10906334
  @State unsupportedType: Resource = $r('app.font.custom_font');

  build() {
    Column() {
      Text('Resource Validation')
        .fontColor(this.invalidSrc)
    }
  }
}
