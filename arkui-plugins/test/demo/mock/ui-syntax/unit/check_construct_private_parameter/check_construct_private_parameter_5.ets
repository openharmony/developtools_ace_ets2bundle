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

import { Entry, Component, Column, Text, Button } from '@ohos.arkui.component';
import { State } from "@ohos.arkui.stateManagement";

// Expected: Private property 'statusFlag' in 'StatusIndicator' cannot be initialized externally inside If statement.
// Actual: 'ConditionalPage' initializes private property inside a conditional rendering block.

@Component
struct StatusIndicator {
    private statusFlag: boolean = false;

    build() {
        Column() {
            Text(this.statusFlag ? "Active" : "Inactive")
        }
    }
}

@Entry
@Component
struct ConditionalPage {
    @State isVisible: boolean = true;

    build() {
        Column() {
            Button("Toggle").onClick(() => { this.isVisible = !this.isVisible })

            if (this.isVisible) {
                StatusIndicator({
                    statusFlag: true
                })
            } else {
                StatusIndicator({
                    statusFlag: false
                })
            }
        }
    }
}