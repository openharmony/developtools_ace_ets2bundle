/*
 * Copyright (C) 2025 Huawei Device Co., Ltd.
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

import { Entry, Component } from '@ohos.arkui.component';
import { Observed, ObservedV2 } from "@ohos.arkui.stateManagement";

// Expected: A class cannot be decorated by both '@Observed' and '@ObservedV2' simultaneously. These two reactivity 
// systems are mutually exclusive.
// Actual: The class 'Demo3ProfileModel' applies both '@Observed' and '@ObservedV2' which should trigger the 
// conflictingDecorators rule.

@Entry
@Component
struct Test {
  build() {
  }
}

@Observed
@ObservedV2
class Demo3ProfileModel {
  username: string = "";
  bio: string = "";
  followers: number = 0;

  constructor(username: string, bio: string) {
    this.username = username;
    this.bio = bio;
  }

  updateBio(newBio: string) {
    this.bio = newBio;
  }

  addFollower() {
    this.followers++;
  }

  removeFollower() {
    this.followers--;
  }
}