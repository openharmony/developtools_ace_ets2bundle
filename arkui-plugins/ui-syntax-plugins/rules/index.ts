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
import BuildRootNode from './build-root-node';
import CheckConstructPrivateParameter from './check-construct-private-parameter';
import ComponentV2MixCheck from './componentV2-mix-check';
import CustomDialogMissingController from './custom-dialog-missing-controller';
import DecoratorsInUIComponentOnly from './decorators-in-ui-component-only';
import EntryLoacalStorageCheck from './entry-localstorage-check';
import EntryStructNoExport from './entry-struct-no-export';
import LocalBuilderCheck from './local-builder-check';
import NoDuplicateDecorators from './no-duplicate-decorators';
import NoDuplicateStateManager from './no-duplicate-state-manager';
import NoPropLinkObjectlinkInEntry from './no-prop-link-objectlink-in-entry';
import NoSameAsBuiltInAttribute from './no-same-as-built-in-attribute';

const rules: UISyntaxRule[] = [
  BuildRootNode,
  CheckConstructPrivateParameter,
  ComponentV2MixCheck,
  CustomDialogMissingController,
  DecoratorsInUIComponentOnly,
  EntryLoacalStorageCheck,
  EntryStructNoExport,
  LocalBuilderCheck,
  NoDuplicateDecorators,
  NoDuplicateStateManager,
  NoPropLinkObjectlinkInEntry,
  NoSameAsBuiltInAttribute,
];

export default rules;
