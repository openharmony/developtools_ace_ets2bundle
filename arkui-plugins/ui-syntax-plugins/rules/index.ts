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

import { UISyntaxRule, UISyntaxRuleConfig } from './ui-syntax-rule';
import ConstructParameterLinkSourceDataRule from './construct-parameter-link-source-data';
import ConstructParameterRule from './construct-parameter';
import ConsumerProviderDecoratorCheckRule from './consumer-provider-decorator-check';
import ComputedDecoratorCheckRule from './computed-decorator-check';
import EnvDecoratorCheckRule from './env-decorator-check';
import LifecycleDecoratorCheckRule from './lifecycle-decoretor-check';
import MonitorDecoratorCheckRule from './monitor-decorator-check';
import NestedRelationshipRule from './nested-relationship';
import NoDuplicateEntryRule from './no-duplicate-entry';
import NoVariablesChangeInBuildRule from './no-variables-change-in-build';
import ReuseAttributeCheckRule from './reuse-attribute-check';
import StaticParamRequireRule from './static-param-require';
import StructMissingDecoratorRule from './struct-missing-decorator';
import ValidateBuildInStructRule from './validate-build-in-struct';
import StructVariableInitializationRule from './struct-variable-initialization';
import ValidateDecoratorTargetRule from './validate-decorator-target';
import WatchDecoratorFunctionRule from './watch-decorator-function';
import StructV1DecoratorFunctionRule from './struct-v1-decorator-function';
import ObservedV2TraceUsageValidationRule from './observedV2-trace-usage-validation';
import OnceDecoratorCheckRule from './once-decorator-check';
import OneDecoratorOnFunctionMethodRule from './one-decorator-on-function-method';
import PropertyTypeRule from './property-type';
import StructNoExtendsRule from './struct-no-extends';
import OldNewDecoratorMixUseCheckRule from './old-new-decorator-mix-use-check';
import EntryComponentV2InvalidParamsRule from './entry-componentv2-invalid-params';
import StructAttributeNoTypeRule from './struct-attribute-no-type';
import CheckObjectLinkUseLiteralRule from './check-objectlink-use-literal';
import SyncMonitorDecoratorCheckRule from './sync-monitor-decorator-check';

const rules: Array<UISyntaxRule | UISyntaxRuleConfig> = [
    // [CheckObjectLinkUseLiteralRule, 'error'],
    // [ComputedDecoratorCheckRule, 'error'],
    // [ConstructParameterRule, 'error'],
    // [ConstructParameterLinkSourceDataRule, 'error'],
    // [ConsumerProviderDecoratorCheckRule, 'error'],
    // [EntryComponentV2InvalidParamsRule, 'error'],
    // [EnvDecoratorCheckRule, 'error'],
    // [LifecycleDecoratorCheckRule, 'error'],
    // [MonitorDecoratorCheckRule, 'error'],
    // [NestedRelationshipRule, 'error'],
    // [NoDuplicateEntryRule, 'error'],
    // [NoVariablesChangeInBuildRule, 'error'],
    // [ObservedV2TraceUsageValidationRule, 'error'],
    // [OldNewDecoratorMixUseCheckRule, 'error'],
    // [OnceDecoratorCheckRule, 'error'],
    // [OneDecoratorOnFunctionMethodRule, 'error'],
    // [PropertyTypeRule, 'error'],
    // [ReuseAttributeCheckRule, 'error'],
    // [StaticParamRequireRule, 'warn'],
    // [StructAttributeNoTypeRule, 'error'],
    // [StructMissingDecoratorRule, 'error'],
    // [StructNoExtendsRule, 'error'],
    // [StructVariableInitializationRule, 'error'],
    // [ValidateBuildInStructRule, 'error'],
    // [ValidateDecoratorTargetRule, 'error'],
    // [WatchDecoratorFunctionRule, 'error'],
    // [StructV1DecoratorFunctionRule, 'error'],
    [SyncMonitorDecoratorCheckRule, 'error'],
];

export default rules;