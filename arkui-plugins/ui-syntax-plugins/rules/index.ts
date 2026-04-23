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
import BuilderParamDecoratorCheckRule from './builderparam-decorator-check';
import AttributeNoInvokeRule from './attribute-no-invoke';
import BuildRootNodeRule from './build-root-node';
import CheckConstructPrivateParameterRule from './check-construct-private-parameter';
import CheckDecoratedPropertyTypeRule from './check-decorated-property-type';
import CheckPropertyModifiersRule from './check-property-modifiers';
import ComponentComponentV2MixUseCheckRule from './component-componentV2-mix-use-check';
import ComponentV2MixCheckRule from './componentV2-mix-check';
import ConstructParameterLinkSourceDataRule from './construct-parameter-link-source-data';
import ConstructParameterLiteralRule from './construct-parameter-literal';
import ConstructParameterRule from './construct-parameter';
import ConsumerProviderDecoratorCheckRule from './consumer-provider-decorator-check';
import ComputedDecoratorCheckRule from './computed-decorator-check';
import ComponentV2StateUsageValidationRule from './componentV2-state-usage-validation';
import CustomDialogMissingControllerRule from './custom-dialog-missing-controller';
import EntryLocalStorageCheckRule from './entry-localstorage-check';
import EntryStructNoExportRule from './entry-struct-no-export';
import EnvDecoratorCheckRule from './env-decorator-check';
import LifecycleDecoratorCheckRule from './lifecycle-decoretor-check';
import MainPagesEntryCheckRule from './main-pages-entry-check';
import MonitorDecoratorCheckRule from './monitor-decorator-check';
import NestedRelationshipRule from './nested-relationship';
import NestedReuseComponentCheckRule from './nested-reuse-component-check';
import NoChildInButtonRule from './no-child-in-button';
import NoDuplicateEntryRule from './no-duplicate-entry';
import NoDuplicateIdRule from './no-duplicate-id';
import NoDuplicatePreviewRule from './no-duplicate-preview';
import NoPropLinkObjectLinkInEntryRule from './no-prop-link-objectlink-in-entry';
import NoSameAsBuiltInAttributeRule from './no-same-as-built-in-attribute';
import NoVariablesChangeInBuildRule from './no-variables-change-in-build';
import ReuseAttributeCheckRule from './reuse-attribute-check';
import StaticParamRequireRule from './static-param-require';
import StructMissingDecoratorRule from './struct-missing-decorator';
import StructPropertyDecoratorRule from './struct-property-decorator';
import TrackDecoratorCheckRule from './track-decorator-check';
import ValidateBuildInStructRule from './validate-build-in-struct';
import WrapBuilderCheckRule from './wrap-builder-check';
import StructPropertyOptionalRule from './struct-property-optional';
import StructVariableInitializationRule from './struct-variable-initialization';
import UiConsistentCheckRule from './ui-consistent-check';
import ValidateDecoratorTargetRule from './validate-decorator-target';
import WatchDecoratorFunctionRule from './watch-decorator-function';
import StructV1DecoratorFunctionRule from './struct-v1-decorator-function';
import WatchDecoratorRegularRule from './watch-decorator-regular';
import ObservedHeritageCompatibleCheckRule from './observed-heritage-compatible-check';
import ObservedObservedV2Rule from './observed-observedV2-check';
import ObservedV2TraceUsageValidationRule from './observedV2-trace-usage-validation';
import OnceDecoratorCheckRule from './once-decorator-check';
import OneDecoratorOnFunctionMethodRule from './one-decorator-on-function-method';
import PropertyTypeRule from './property-type';
import ReusableV2DecoratorCheckRule from './reusableV2-decorator-check';
import VariableInitializationViaComponentConstructorRule from './variable-initialization-via-component-constructor';
import ComponentComponentV2InitCheckRule from './component-componentV2-init-check';
import StructNoExtendsRule from './struct-no-extends';
import OldNewDecoratorMixUseCheckRule from './old-new-decorator-mix-use-check';
import RequireDecoratorRegularRule from './require-decorator-regular';
import ReusableComponentInV2CheckRule from './reusable-component-in-V2-check';
import SpecificComponentChildrenRule from './specific-component-children';
import EntryComponentV2InvalidParamsRule from './entry-componentv2-invalid-params';
import StructAttributeNoTypeRule from './struct-attribute-no-type';
import CheckObjectLinkUseLiteralRule from './check-objectlink-use-literal';
import SyncMonitorDecoratorCheckRule from './sync-monitor-decorator-check';

const rules: Array<UISyntaxRule | UISyntaxRuleConfig> = [
    [CheckObjectLinkUseLiteralRule, 'error'],
    [ComputedDecoratorCheckRule, 'error'],
    [ConstructParameterRule, 'error'],
    [ConstructParameterLinkSourceDataRule, 'error'],
    [ConsumerProviderDecoratorCheckRule, 'error'],
    [EntryComponentV2InvalidParamsRule, 'error'],
    [EnvDecoratorCheckRule, 'error'],
    [LifecycleDecoratorCheckRule, 'error'],
    [MonitorDecoratorCheckRule, 'error'],
    [NestedRelationshipRule, 'error'],
    [NoDuplicateEntryRule, 'error'],
    [NoVariablesChangeInBuildRule, 'error'],
    [ObservedV2TraceUsageValidationRule, 'error'],
    [OldNewDecoratorMixUseCheckRule, 'error'],
    [OnceDecoratorCheckRule, 'error'],
    [OneDecoratorOnFunctionMethodRule, 'error'],
    [PropertyTypeRule, 'error'],
    [ReuseAttributeCheckRule, 'error'],
    [StaticParamRequireRule, 'warn'],
    [StructAttributeNoTypeRule, 'error'],
    [StructMissingDecoratorRule, 'error'],
    [StructNoExtendsRule, 'error'],
    [StructVariableInitializationRule, 'error'],
    [ValidateBuildInStructRule, 'error'],
    [ValidateDecoratorTargetRule, 'error'],
    [WatchDecoratorFunctionRule, 'error'],
    [StructV1DecoratorFunctionRule, 'error'],
    [SyncMonitorDecoratorCheckRule, 'error'],
];

export default rules;