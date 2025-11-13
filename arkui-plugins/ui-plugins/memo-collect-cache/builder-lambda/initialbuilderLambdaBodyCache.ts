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
import { BaseCacheInfo, BaseMemoCollectCache } from '../base';

export interface InitialBuilderLambdaBodyInfo extends BaseCacheInfo<arkts.Identifier | arkts.CallExpression> {}

export class InitialBuilderLambdaBodyCache extends BaseMemoCollectCache<
    arkts.Identifier | arkts.CallExpression,
    InitialBuilderLambdaBodyInfo
> {
    private static instance: InitialBuilderLambdaBodyCache | null = null;

    static getInstance(): InitialBuilderLambdaBodyCache {
        if (!this.instance) {
            this.instance = new InitialBuilderLambdaBodyCache();
        }
        return this.instance;
    }
}
