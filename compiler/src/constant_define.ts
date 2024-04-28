/*
 * Copyright (c) 2024 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const NAVIGATION_BUILDER_REGISTER: string = 'NavigationBuilderRegister';

const MONITOR: string = 'Monitor';
const COMPUTED: string = 'Computed';
const REQUIRE: string = 'Require';
const BUILDER_PARAM: string = 'BuilderParam';
const MONITOR_DECORATOR: string = '@Monitor';
const COMPUTED_DECORATOR: string = '@Computed';

const COMPONENT_MEMBER_DECORATOR_V1: string[] = [
  '@State', '@Prop', '@Link', '@Provide', '@Consume', '@Watch', '@StorageLink', '@StorageProp',
  '@LocalStorageLink', '@LocalStorageProp', '@ObjectLink'
];

const COMPONENT_MEMBER_DECORATOR_V2: string[] = [
  '@Local', '@Param', '@Once', '@Event', '@Provider', '@Consumer'
];
const STRUCT_CLASS_MEMBER_DECORATOR_V2: string[] = [
  '@Monitor', '@Computed'
];
const DECORATOR_V2: string[] = [
  ...COMPONENT_MEMBER_DECORATOR_V2, ...STRUCT_CLASS_MEMBER_DECORATOR_V2
];

const STRUCT_PARENT: string = 'ViewV2';
const INIT_PARAM: string = 'initParam';
const UPDATE_PARAM: string = 'updateParam';
const UPDATE_STATE_VARS: string = 'updateStateVars';

export default {
  NAVIGATION_BUILDER_REGISTER,
  MONITOR,
  COMPUTED,
  STRUCT_PARENT,
  COMPONENT_MEMBER_DECORATOR_V1,
  COMPONENT_MEMBER_DECORATOR_V2,
  INIT_PARAM,
  UPDATE_PARAM,
  UPDATE_STATE_VARS,
  REQUIRE,
  MONITOR_DECORATOR,
  COMPUTED_DECORATOR,
  DECORATOR_V2,
  BUILDER_PARAM
};
