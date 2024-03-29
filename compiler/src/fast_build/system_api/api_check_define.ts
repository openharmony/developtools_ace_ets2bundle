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

export const PERMISSION_TAG_CHECK_NAME: string = 'permission';
export const PERMISSION_TAG_CHECK_ERROR: string = "'{0}' is incompatible";
export const SYSTEM_API_TAG_CHECK_NAME: string = 'systemapi';
export const SYSTEM_API_TAG_CHECK_WARNING: string = "'{0}' is system api";
export const TEST_TAG_CHECK_NAME: string = 'test';
export const TEST_TAG_CHECK_ERROR: string = "'{0}' can only be used for testing directories ";
export const SYSCAP_TAG_CHECK_NAME: string = 'syscap';
export const SYSCAP_TAG_CHECK_WARNING: string = "The default system capabilities of devices $DT do not include system capability of '{0}'. Configure the capabilities in syscap.json. It may cause your application crush in some devices. Attention: Such illegal interface call will lead to compilation error in the future version!";
export const SYSCAP_TAG_CONDITION_CHECK_WARNING: string = 'The API is not supported on all devices. Use the canIUse condition to determine whether the API is supported.';
export const CANIUSE_FUNCTION_NAME: string = 'canIUse';