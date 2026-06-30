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

/**
 * @BuilderParam in V2 context
 */

@Builder
function v2Builder() { Text("v2 builder") }
@ComponentV2
struct BuilderParamV2Init {
  @BuilderParam content: () => void = v2Builder;
  build() { Column() { this.content() } }
}
@ComponentV2
struct BuilderParamV2NoInit {
  @BuilderParam content: () => void;
  build() { Column() { Text("no init") } }
}

@Entry
@Component
struct BuilderParamV2Entry {
  build() {
    Column() {
      Text('Test')
    }
  }
}
