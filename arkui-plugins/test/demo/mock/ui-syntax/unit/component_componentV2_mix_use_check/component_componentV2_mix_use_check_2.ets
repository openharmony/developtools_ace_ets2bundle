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

import { ComponentV2, ObservedV2, Column, Text, If } from '@ohos.arkui.component';
import { State, Prop, Link } from "@ohos.arkui.stateManagement";

// Expected: In this mixed-use validation, V1 decorators (@Prop, @Link) must not be used with '@ObservedV2' types.
// Actual: Properties 'user' and 'selected' use '@ObservedV2' types (directly or via alias), violating the rule.

@ObservedV2
class UserModel {
  id: number = 1;
  username: string = "admin";
}

type UserAlias = UserModel;

@ComponentV2
struct Demo2Card {
  @Prop user: UserModel;
  @Link selected: UserAlias;

  build() {
    Column() {
      Text(this.user.username)
      If(this.selected != null) {
        Text("Selected")
      }
    }
  }
}

@ComponentV2
struct Demo2List {
  @State listTitle: string = "User List";

  build() {
    Column() {
      Text(this.listTitle)
      Demo2Card({
        user: new UserModel(),
        selected: new UserModel()
      })
    }
  }
}