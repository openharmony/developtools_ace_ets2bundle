/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as arkts from '@koalaui/libarkts';
import { BaseRecord, RecordOptions } from './base';

export type NormalInterfaceInfo = {
    name?: string;
};

export class NormalInterfaceRecord extends BaseRecord<arkts.TSInterfaceDeclaration, NormalInterfaceInfo> {
    protected name?: string;

    constructor(options: RecordOptions) {
        super(options);
    }

    collectFromNode(node: arkts.TSInterfaceDeclaration): void {
        const interfaceBody: arkts.TSInterfaceBody | undefined = node.body;
        if (!interfaceBody || !node.id?.name) {
            return;
        }
        this.name = node.id.name;
    }

    refreshOnce(): void {
        let currInfo = this.info ?? {};
        currInfo = {
            ...currInfo,
            ...(this.name && { name: this.name }),
        };
        this.info = currInfo;
    }

    toJSON(): NormalInterfaceInfo {
        this.refresh();
        return {
            ...(this.info?.name && { name: this.info.name }),
        };
    }
}
