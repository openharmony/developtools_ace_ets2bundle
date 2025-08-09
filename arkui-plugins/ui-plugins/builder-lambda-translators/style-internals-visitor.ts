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
import { AbstractVisitor } from '../../common/abstract-visitor';
import { AstNodePointer } from '../../common/safe-types';

export class StyleInternalsVisitor extends AbstractVisitor {
    private initCallPtr: AstNodePointer | undefined;
    private initCallArgs: arkts.AstNode[] | undefined;
    private initCallTypeArguments: readonly arkts.TypeNode[] | undefined;

    registerInitCall(initCallPtr: AstNodePointer): this {
        this.initCallPtr = initCallPtr;
        return this;
    }

    registerInitCallArgs(initCallArgs: arkts.AstNode[]): this {
        this.initCallArgs = initCallArgs;
        return this;
    }

    registerInitCallTypeArguments(initCallTypeArguments: readonly arkts.TypeNode[] | undefined): this {
        this.initCallTypeArguments = initCallTypeArguments;
        return this;
    }

    visitor(node: arkts.CallExpression): arkts.AstNode {
        if (!!this.initCallPtr && !!this.initCallArgs && node.peer === this.initCallPtr) {
            return arkts.factory.updateCallExpression(
                node,
                node.expression,
                this.initCallTypeArguments ?? node.typeArguments,
                this.initCallArgs
            );
        }
        return this.visitEachChild(node);
    }
}
