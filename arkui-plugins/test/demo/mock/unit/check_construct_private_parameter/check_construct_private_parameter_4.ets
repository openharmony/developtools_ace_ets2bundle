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

import { Entry, Component, Column, Text } from '@ohos.arkui.component';

// Expected: The private property 'secretKey' cannot be initialized via constructor. 'publicKey' is valid.
// Actual: 'MixedInitComponent' initializes both. Linter should catch 'secretKey' but allow 'publicKey'.

@Component
struct TokenComponent {
    public publicKey: string = "";
    private secretKey: string = "";

    build() {
        Column() {
            Text("Public: " + this.publicKey)
            Text("Secret is hidden")
        }
    }
}

@Entry
@Component
struct MixedInitComponent {
    build() {
        Column() {
            TokenComponent({
                publicKey: "valid_public_key_123",
                secretKey: "invalid_private_key_456"
            })
        }
    }
}