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
import { expectNameInTypeReference } from '../../../common/arkts-utils';
import { isDeclFromArkUI } from '../utils';
import { BaseRecord, RecordOptions } from './base';

export type NewClassInstanceInfo = {
    name?: string;
    declName?: string;
};

export class NewClassInstanceRecord extends BaseRecord<arkts.ETSNewClassInstanceExpression, NewClassInstanceInfo> {
    protected name?: string;
    protected declName?: string;

    constructor(options: RecordOptions) {
        super(options);
    }

    collectFromNode(node: arkts.ETSNewClassInstanceExpression): void {
        const typeRef = node.typeRef;
        if (!typeRef || !arkts.isETSTypeReference(typeRef)) {
            return;
        }
        const nameNode = expectNameInTypeReference(typeRef);
        if (!nameNode) {
            return;
        }
        const decl = arkts.getPeerIdentifierDecl(nameNode.peer);
        if (!decl || !arkts.isClassDefinition(decl)) {
            return;
        }
        if (!this.shouldIgnoreDecl && !isDeclFromArkUI(decl)) {
            return;
        }
        this.name = nameNode.name;
        this.declName = decl.ident?.name;
    }

    refreshOnce(): void {
        let currInfo = this.info ?? {};
        currInfo = {
            ...currInfo,
            ...(this.name && { name: this.name }),
            ...(this.declName && { declName: this.declName }),
        };
        this.info = currInfo;
    }

    toJSON(): NewClassInstanceInfo {
        this.refresh();
        return {
            ...(this.info?.name && { name: this.info.name }),
            ...(this.info?.declName && { declName: this.info.declName }),
        };
    }
}
