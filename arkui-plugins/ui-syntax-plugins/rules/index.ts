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
import AttributeNoInvoke from './attribute-no-invoke';
import BuilderparamDecoratorCheck from './builderparam-decorator-check';
import BuildRootNodeRule from './build-root-node';
import CheckConstructPrivateParameter from './check-construct-private-parameter';
import CheckDecoratedPropertyTypeRule from './check-decorated-property-type';
import ComponentComponentV2MixUseCheckRule from './component-componentV2-mix-use-check';
import ComponentV2MixCheckRule from './componentV2-mix-check';
import ConstructParameterLiteral from './construct-parameter-literal';
import ConstructParameterRule from './construct-parameter';
import ConsumerProviderDecoratorCheckRule from './consumer-provider-decorator-check';
import ComputedDecoratorCheckRule from './computed-decorator-check';
import ComponentV2StateUsageValidationRule from './componentV2-state-usage-validation';
import CustomDialogMissingControllerRule from './custom-dialog-missing-controller';
import EntryLoacalStorageCheck from './entry-localstorage-check';
import EntryStructNoExport from './entry-struct-no-export';
import MainPagesEntryCheckRule from './main-pages-entry-check';
import MonitorDecoratorCheckRule from './monitor-decorator-check';
import NestedRelationshipRule from './nested-relationship';
import NestedReuseComponentCheckRule from './nested-reuse-component-check';
import NoChildInButtonRule from './no-child-in-button';
import NoDuplicateDecorators from './no-duplicate-decorators';
import NoDuplicateEntryRule from './no-duplicate-entry';
import NoDuplicateId from './no-duplicate-id';
import NoDuplicatePreviewRule from './no-duplicate-preview';
import NoDuplicateStateManagerRule from './no-duplicate-state-manager';
import NoPropLinkObjectlinkInEntry from './no-prop-link-objectlink-in-entry';
import NoSameAsBuiltInAttributeRule from './no-same-as-built-in-attribute';
import ReuseAttributeCheck from './reuse-attribute-check';
import StructMissingDecorator from './struct-missing-decorator';
import StructPropertyDecorator from './struct-property-decorator';
import StructPropertyOptional from './struct-property-optional';
import StructVariableInitialization from './struct-variable-initialization';
import TrackDecoratorCheck from './track-decorator-check';
import TypeDecoratorCheck from './type-decorator-check';
import ValidateBuildInStruct from './validate-build-in-struct';
import ValidateDecoratorTarget from './validate-decorator-target';
import WatchDecoratorFunction from './watch-decorator-function';
import WatchDecoratorRegular from './watch-decorator-regular';
import WrapBuilderCheck from './wrap-builder-check';
import ObservedHeritageCompatibleCheckRule from './observed-heritage-compatible-check';
import ObservedObservedV2Rule from './observed-observedV2-check';
import ObservedV2TraceUsageValidation from './observedV2-trace-usage-validation';
import OnceDecoratorCheck from './once-decorator-check';
import OneDecoratorOnFunctionMethod from './one-decorator-on-function-method';
import OldNewDecoratorMixUseCheck from './old-new-decorator-mix-use-check';
import ReusableV2DecoratorCheck from './reusableV2-decorator-check';
import RequireDecoratorRegular from './require-decorator-regular';
import ReusableComponentInV2Check from './reusable-component-in-V2-check';
import VariableInitializationViaComponentConstructor from './variable-initialization-via-component-constructor';
import ComponentComponentV2InitCheckRule from './component-componentV2-init-check';
import SpecificComponentChildren from './specific-component-children';
import StructNoExtends from './struct-no-extends';

const rules: Array<UISyntaxRule | UISyntaxRuleConfig> = [
    AttributeNoInvoke,
    BuilderparamDecoratorCheck,
    [BuildRootNodeRule, 'error'],
    CheckConstructPrivateParameter,
    [CheckDecoratedPropertyTypeRule, 'error'],
    [ComponentComponentV2MixUseCheckRule, 'error'],
    [ComponentV2MixCheckRule, 'error'],
    ConstructParameterLiteral,
    [ConstructParameterRule, 'error'],
    [ConsumerProviderDecoratorCheckRule, 'error'],
    [ComponentV2StateUsageValidationRule, 'error'],
    [CustomDialogMissingControllerRule, 'error'],
    EntryLoacalStorageCheck,
    EntryStructNoExport,
    [MainPagesEntryCheckRule, 'error'],
    [MonitorDecoratorCheckRule, 'error'],
    [NestedRelationshipRule, 'error'],
    [NestedReuseComponentCheckRule, 'error'],
    [NoChildInButtonRule, 'error'],
    NoDuplicateDecorators,
    [NoDuplicateEntryRule, 'error'],
    NoDuplicateId,
    [NoDuplicatePreviewRule, 'error'],
    [NoDuplicateStateManagerRule, 'error'],
    NoPropLinkObjectlinkInEntry,
    [NoSameAsBuiltInAttributeRule, 'error'],
    ReuseAttributeCheck,
    StructMissingDecorator,
    StructPropertyDecorator,
    StructPropertyOptional,
    StructVariableInitialization,
    TrackDecoratorCheck,
    TypeDecoratorCheck,
    ValidateBuildInStruct,
    ValidateDecoratorTarget,
    WatchDecoratorFunction,
    WatchDecoratorRegular,
    WrapBuilderCheck,
    [ObservedHeritageCompatibleCheckRule, 'error'],
    [ObservedObservedV2Rule, 'error'],
    ObservedV2TraceUsageValidation,
    OnceDecoratorCheck,
    OneDecoratorOnFunctionMethod,
    OldNewDecoratorMixUseCheck,
    [ComputedDecoratorCheckRule, 'error'],
    ReusableV2DecoratorCheck,
    RequireDecoratorRegular,
    ReusableComponentInV2Check,
    VariableInitializationViaComponentConstructor,
    [ComponentComponentV2InitCheckRule, 'error'],
    SpecificComponentChildren,
    StructNoExtends,
];

export default rules;
