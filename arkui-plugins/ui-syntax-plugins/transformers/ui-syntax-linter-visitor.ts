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
import { UISyntaxRuleProcessor } from '../processor';

export abstract class UISyntaxLinterVisitor extends AbstractVisitor {
    constructor(protected processor: UISyntaxRuleProcessor) {
        super();
    }

    visitor(node: arkts.AstNode): arkts.AstNode {
        this.handle(node);
        node = this.visitEachChild(node);
        return node;
    }

    transform(node: arkts.AstNode): arkts.AstNode {
        this.processor.beforeTransform();
        const transformedNode = this.visitor(node);
        this.processor.afterTransform();
        return transformedNode;
    }

    abstract handle(node: arkts.AstNode): void;
}
