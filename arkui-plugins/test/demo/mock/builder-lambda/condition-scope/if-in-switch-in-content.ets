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

import { Text, Column, Component } from "@ohos.arkui.component" 

@Component
struct IfInSwitch {
    num: string = '1';

	build() {
		Column() {
            switch (this.num) {
                case '-1': {
                    if (true) {
                        Text('case 1')
                    } else if (false) {
                        Text('case 2')
                    } else {
                        Text('case 3')
                    }
                }
                case '2':
                    if (true) {
                        Text('case 4')
                    }
            }
		}
	}
}