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
    checkComponentComponentV2Init,
    checkConstructPrivateParameter,
    checkReusableComponentInV2,
    checkNestedReuseComponent,
    checkSpecificComponentChildren,
    checkConstructParameterLiteral,
    checkVariableInitializationPassing,
    checkWrapBuilder,
    checkUIConsistent,
    checkAttributeNoInvoke,
    checkNestedRelationship,
    checkNoChildInButton,
    checkNoDuplicateId,
    checkEnvDecorator,
    resetNoDuplicateId,
} from './rules';
import { CallInfo } from '../records';
import {
    checkIsCustomComponentFromInfo,
    checkIsCallFromLegacyBuilderFromInfo,
    checkIsInteropComponentCallFromInfo,
} from '../utils';

export class CallValidator extends BaseValidator<arkts.CallExpression, CallInfo> {
    reset(): void {
        super.reset();
        resetNoDuplicateId();
    }

    reportIfViolated(node: arkts.CallExpression): void {
        const metadata = this.context ?? {};
        checkNoDuplicateId.bind(this)(node);
        if (
            (!(metadata.isDeclFromLegacy && canCollectLegacyCallFromInfo(metadata)) &&
            !checkIsCustomComponentFromInfo(metadata.structDeclInfo)) ||
            !metadata.structDeclInfo?.definitionPtr
        ) {
            reportInNonStructCall.bind(this)(node, metadata);
            return;
        }
        reportInStructCall.bind(this)(node, metadata);
    }
}

function canCollectLegacyCallFromInfo(info: CallInfo): boolean {
    const rootCallInfo = info;
    if (checkIsCallFromLegacyBuilderFromInfo(rootCallInfo)) {
        return true;
    }
    if (checkIsInteropComponentCallFromInfo(rootCallInfo)) {
        return true;
    }
    return false;
}

/**
 * 只处理自定义组件 CallExpression的场景
 */
function reportInStructCall(this: CallValidator, node: arkts.CallExpression, metadata: CallInfo): void {
    checkComponentV2StateUsage.bind(this)(node);
    checkConstructParameterLiteral.bind(this)(node);
    checkAttributeNoInvoke.bind(this)(node);
    checkEnvDecorator.bind(this)(node);

    const struct = arkts.classByPeer<arkts.ClassDefinition>(metadata.structDeclInfo!.definitionPtr);
    checkBuilderParam.bind(this)(node, struct);
    checkComponentComponentV2Init.bind(this)(node, struct);
    checkReusableComponentInV2.bind(this)(struct);
    checkNestedReuseComponent.bind(this)(struct);
    checkConstructPrivateParameter.bind(this)(struct);
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
