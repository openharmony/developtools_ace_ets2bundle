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

import { Memo } from "arkui.incremental.annotation";

interface IComponent {
    @Memo
    builder: () => void;

    itemBuilder: @Memo () => void;

    @Memo
    builderFunc(): void;
}

class PeerNode {
    constructor() {}
}

function createPeerNode(factory: () => PeerNode, @Memo update: () => void): PeerNode {
    return factory();
}

class A {
    public nonMemoMethod(component: IComponent): void {
        const updater: (() => PeerNode) = () => {
            return createPeerNode((): PeerNode => {
                return new PeerNode();
            }, () => {
                component.builder();
                component.itemBuilder();
                component.builderFunc();
            })
        }
    }
}
