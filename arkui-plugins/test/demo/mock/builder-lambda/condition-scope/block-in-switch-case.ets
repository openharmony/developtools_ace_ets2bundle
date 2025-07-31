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
struct SwitchCase {
    num: int = 2;

	build() {
		Column() {
            switch (this.num) {
                case 0:
                    break;
                case 1:
                    break;
                    Text('111');
                case 2:
                    break;
                    {
                        Text('111');
                    }
                case 3:
                    {
                        Text('111');
                    }
                    break;
                    {
                        Text('111');
                    }
                case 4:
                    {
                        Text('111');
                        break;
                    }
                case 5:
                    {
                        Text('111');
                    }
                    break;
                case 6:
                    {
                        break;
                    }
                default:
                    break;
            }
			Text('hello world')
		}
	}
}