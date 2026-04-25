/*
 * Copyright (C) 2026 Huawei Device Co., Ltd.
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

import { Component, ResourceStr, Builder, ComponentV2, BuilderParam, Entry } from "@ohos.arkui.component"
import { PropRef, State, Local, Monitor, Computed, ComponentInit, ComponentAppear } from "@ohos.arkui.stateManagement"

@Component
export declare struct SwipeRefresher {
  @PropRef content?: ResourceStr;
  @PropRef isLoading: boolean;

  @Builder build(): void;
}

@Entry
@ComponentV2
export declare struct DeclaredComponentV2 {
  @Local content: number;

  @BuilderParam builderParamContent: () => void;

  @Monitor(["content"])
  onContentChange(): void;

  @Computed
  get text(): string;

  @ComponentInit
  onComponentInit(): void;

  @ComponentAppear
  onComponentAppear(): void;

  @Builder build(): void;
}