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

import { UISyntaxRule } from './ui-syntax-rule';
import AttributeNoInvoke from './attribute-no-invoke';
import BuilderparamDecoratorCheck from './builderparam-decorator-check.ts';
import BuildRootNode from './build-root-node';
import CheckConstructPrivateParameter from './check-construct-private-parameter';
import CheckDecoratedPropertyType from './check-decorated-property-type';
import ComponentComponentV2MixUseCheck from './component-componentV2-mix-use-check';
import ComponentV2MixCheck from './componentV2-mix-check';
import ConstructParameterLiteral from './construct-parameter-literal';
import ConstructParameter from './construct-parameter';
import ConsumerProviderDecoratorCheck from './consumer-provider-decorator-check';
import ComponentV2StateUsageValidation from './componentV2-state-usage-validation';
import CustomDialogMissingController from './custom-dialog-missing-controller';
import DecoratorsInUIComponentOnly from './decorators-in-ui-component-only';
import EntryLoacalStorageCheck from './entry-localstorage-check';
import EntryStructNoExport from './entry-struct-no-export';
import LocalBuilderCheck from './local-builder-check';
import MonitorDecoratorCheck from './monitor-decorator-check';
import NestedRelationship from './nested-relationship';
import NoChildInButton from './no-child-in-button';
import NoDuplicateDecorators from './no-duplicate-decorators';
import NoDuplicateEntry from './no-duplicate-entry';
import NoDuplicateId from './no-duplicate-id';
import NoDuplicatePreview from './no-duplicate-preview';
import NoDuplicateStateManager from './no-duplicate-state-manager';
import NoPropLinkObjectlinkInEntry from './no-prop-link-objectlink-in-entry';
import NoSameAsBuiltInAttribute from './no-same-as-built-in-attribute';
import ReuseAttributeCheck from './reuse-attribute-check';
import StructMissingDecorator from './struct-missing-decorator';
import StructPropertyDecorator from './struct-property-decorator';
import StructVariableInitialization from './struct-variable-initialization';
import TrackDecoratorCheck from './track-decorator-check';
import TypeDecoratorCheck from './type-decorator-check';
import ValidateBuildInStruct from './validate-build-in-struct';
import VariableInitializationViaComponentCons from './variable-initialization-via-component-cons';
import WatchDecoratorFunction from './watch-decorator-function';
import WatchDecoratorRegular from './watch-decorator-regular';
import WrapBuilderCheck from './wrap-builder-check';
import ObservedHeritageCompatibleCheck from './observed-heritage-compatible-check';
import ObservedObservedV2 from './observed-observedV2-check';
import ObservedV2TraceUsageValidation from './observedV2-trace-usage-validation';
import OnceDecoratorCheck from './once-decorator-check';
import OneDecoratorOnFunctionMethod from './one-decorator-on-function-method';
import OldNewDecoratorMixUseCheck from './old-new-decorator-mix-use-check';

const rules: UISyntaxRule[] = [
  AttributeNoInvoke,
  BuilderparamDecoratorCheck,
  BuildRootNode,
  CheckConstructPrivateParameter,
  CheckDecoratedPropertyType,
  ComponentComponentV2MixUseCheck,
  ComponentV2MixCheck,
  ConstructParameterLiteral,
  ConstructParameter,
  ConsumerProviderDecoratorCheck,
  ComponentV2StateUsageValidation,
  CustomDialogMissingController,
  DecoratorsInUIComponentOnly,
  EntryLoacalStorageCheck,
  EntryStructNoExport,
  LocalBuilderCheck,
  MonitorDecoratorCheck,
  NestedRelationship,
  NoChildInButton,
  NoDuplicateDecorators,
  NoDuplicateEntry,
  NoDuplicateId,
  NoDuplicatePreview,
  NoDuplicateStateManager,
  NoPropLinkObjectlinkInEntry,
  NoSameAsBuiltInAttribute,
  ReuseAttributeCheck,
  StructMissingDecorator,
  StructPropertyDecorator,
  StructVariableInitialization,
  TrackDecoratorCheck,
  TypeDecoratorCheck,
  ValidateBuildInStruct,
  VariableInitializationViaComponentCons,
  WatchDecoratorFunction,
  WatchDecoratorRegular,
  WrapBuilderCheck,
  ObservedHeritageCompatibleCheck,
  ObservedObservedV2,
  ObservedV2TraceUsageValidation,
  OnceDecoratorCheck,
  OneDecoratorOnFunctionMethod,
  OldNewDecoratorMixUseCheck,
];

export default rules;
