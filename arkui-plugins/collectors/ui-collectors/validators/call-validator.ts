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
import { BaseValidator } from './base';
import {
    checkBuilderParam,
    checkComponentV2StateUsage,
    checkComputedDecorator,
    checkConsumerProviderDecorator,
    checkComponentComponentV2Init,
    checkConstructPrivateParameter,
    checkReusableComponentInV2,
    checkNestedReuseComponent,
    checkConstructParameter,
    checkSpecificComponentChildren,
    checkConstructParameterLiteral,
    checkVariableInitializationPassing,
    checkReuseAttribute,
    checkWrapBuilder,
    checkUIConsistent,
    checkAttributeNoInvoke,
    checkNestedRelationship,
    checkNoChildInButton,
    checkStaticParamRequire,
    checkNoDuplicateId,
    resetNoDuplicateId,
} from './rules';
import { CallInfo } from '../records';
import { checkIsCustomComponentFromInfo } from '../utils';

export class CallValidator extends BaseValidator<arkts.CallExpression, CallInfo> {
    reset(): void {
        super.reset();
        resetNoDuplicateId();
    }

    reportIfViolated(node: arkts.CallExpression): void {
        const metadata = this.context ?? {};
        checkNoDuplicateId.bind(this)(node);
        if (!checkIsCustomComponentFromInfo(metadata.structDeclInfo) || !metadata.structDeclInfo?.definitionPtr) {
            reportInNonStructCall.bind(this)(node, metadata);
            return;
        }
        reportInStructCall.bind(this)(node, metadata);
    }
}

/**
 * 只处理自定义组件 CallExpression的场景
 */
function reportInStructCall(this: CallValidator, node: arkts.CallExpression, metadata: CallInfo): void {
    checkComponentV2StateUsage.bind(this)(node);
    checkComputedDecorator.bind(this)(node);
    checkConsumerProviderDecorator.bind(this)(node);
    checkConstructParameterLiteral.bind(this)(node);
    checkConstructParameter.bind(this)(node);
    checkReuseAttribute.bind(this)(node);
    checkAttributeNoInvoke.bind(this)(node);

    const struct = arkts.unpackNonNullableNode<arkts.ClassDefinition>(metadata.structDeclInfo!.definitionPtr!);
    checkBuilderParam.bind(this)(node, struct);
    checkComponentComponentV2Init.bind(this)(node, struct);
    checkReusableComponentInV2.bind(this)(struct);
    checkNestedReuseComponent.bind(this)(struct);
    checkConstructPrivateParameter.bind(this)(struct);
    checkStaticParamRequire.bind(this)(struct);
    checkVariableInitializationPassing.bind(this)(node, struct);
}

/**
 * 只处理*非*自定义组件 CallExpression的场景
 */
function reportInNonStructCall(this: CallValidator, node: arkts.CallExpression, metadata: CallInfo): void {
    checkSpecificComponentChildren.bind(this)(node);
    checkWrapBuilder.bind(this)(node);
    checkUIConsistent.bind(this)(node);
    checkAttributeNoInvoke.bind(this)(node);
    checkNestedRelationship.bind(this)(node);
    checkNoChildInButton.bind(this)(node);
}
