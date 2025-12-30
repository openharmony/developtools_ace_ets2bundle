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
import { Watch, Observed } from "@ohos.arkui.stateManagement";

// Expected: '@Watch' can only be applied to reactive properties such as '@State' variables.
// Actual: 'username' and 'email' are regular variables, so they cannot use the '@Watch' decorator.

@Entry
@Component
struct WatchDecoratorDemo {
    build() {
    }
}

@Observed
@Component
struct UserProfile {
    @Watch
    username: string;

    @Watch
    email: string;

    constructor(username: string, email: string, age: number, isActive: boolean, score: number) {
        this.username = username;
        this.email = email;
    }
}