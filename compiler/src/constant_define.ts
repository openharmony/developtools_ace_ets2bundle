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

const GLOBAL_DECLARE_WHITE_LIST: Set<string> = new Set(['Context', 'PointerStyle', 'PixelMap',
  'UnifiedData', 'Summary', 'UniformDataType', 'IntentionCode', 'NavDestinationInfo', 'UIContext',
  'Resource', 'WebviewController']);

const NAVIGATION_BUILDER_REGISTER: string = 'NavigationBuilderRegister';

export default {
  GLOBAL_DECLARE_WHITE_LIST,
  NAVIGATION_BUILDER_REGISTER
};
