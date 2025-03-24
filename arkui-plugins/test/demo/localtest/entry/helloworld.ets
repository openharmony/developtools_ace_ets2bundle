/*
 * Copyright (c) 2025 Huawei Device Co., Ltd.
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

import { Text, Component } from "@ohos.arkui.component"
import { memo, __memo_context_type, __memo_id_type } from "@ohos.arkui.stateManagement.runtime"  // 临时加，需要使用UI Plugin添加
// 当前缺少memo plugin

@Component
struct MyStateSample {
    build() {
        Text("Hello World")
    }
}


// declare interface TextAttribute {
//     fontSize1(value: number | string): this;
// }


// declare function XXX(style?: string | ((instance: TextAttribute)=> void) | undefined, value?: string, options?: string, content?: (()=> void)): TextAttribute;

// class A {
//   public build() {
//     XXX((instance: TextAttribute): void => { }, "Hello World", undefined, undefined);
//   }

//   public constructor() {}
  
// }