/*
 * Copyright (c) 2022-2025 Huawei Device Co., Ltd.
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
import { FunctionTransformer } from './function-transformer';
import { PositionalIdTracker } from './utils';
import { factory } from './memo-factory';
import { ReturnTransformer } from './return-transformer';
import { ParameterTransformer } from './parameter-transformer';
import { EtsglobalRemover } from '../common/etsglobal-remover';
import { SignatureTransformer } from './signature-transformer';

export interface TransformerOptions {
    trace?: boolean;
    removeEtsglobal?: boolean;
}

export default function memoTransformer(userPluginOptions?: TransformerOptions) {
    return (node0: arkts.ETSModule) => {
        const node = (
            userPluginOptions?.removeEtsglobal ? new EtsglobalRemover().visitor(node0) : node0
        ) as arkts.ETSModule;
        const positionalIdTracker = new PositionalIdTracker(arkts.getFileName(), false);
        const parameterTransformer = new ParameterTransformer({
            positionalIdTracker,
        });
        const returnTransformer = new ReturnTransformer();
        const signatureTransformer = new SignatureTransformer();
        const functionTransformer = new FunctionTransformer({
            positionalIdTracker,
            parameterTransformer,
            returnTransformer,
            signatureTransformer,
        });
        factory.createContextTypesImportDeclaration(arkts.arktsGlobal.compilerContext?.program);
        return functionTransformer.visitor(arkts.factory.updateETSModule(node, node.statements, node.ident, node.getNamespaceFlag(), node.program));
    };
}
