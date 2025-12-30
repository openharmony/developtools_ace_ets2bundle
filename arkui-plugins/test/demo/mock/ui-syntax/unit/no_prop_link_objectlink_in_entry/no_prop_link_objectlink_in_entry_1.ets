/*
 * Copyright (C) 2025 Huawei Device Co., Ltd.
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

import { Entry, Component } from '@ohos.arkui.component';
import { Observed, Link, ObjectLink } from "@ohos.arkui.stateManagement";

// Expected: An '@Entry' component must not declare any properties decorated with '@PropRef', '@Link', or 
// '@ObjectLink'; these decorators are forbidden on fields inside the entry component.
// Actual: The '@Entry' component 'Child2struct05' defines the properties 'link_value' and 'objectLink_value' using 
// '@Link' and '@ObjectLink', which violates the restriction on decorators inside entry components.

@Observed
class Struct05A {}
@Entry
@Component
struct Child2struct05 {
  @Link private link_value: string;
  @ObjectLink private objectLink_value: Struct05A;
  build() {}
}