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

import { Memo } from "@ohos.arkui.stateManagement" // should be insert by ui-plugins
import { Text, TextAttribute, Column, Component} from "@ohos.arkui.component"
import hilog from '@ohos.hilog'

@Memo function cardStyle(this: TextAttribute, num: number, str: string): TextAttribute {
	this.fontSize(num);
	this.backgroundColor(str);
	return this;
}

@Memo function style22(this: TextAttribute): TextAttribute {
	this.fontWeight(700);
	return this;
}

@Component
struct MM {
	build() {
		Column() {
			Text('hello world')
				.height(200)
				.fontColor('#000000')
				.cardStyle(600, '#eeeeee')
				.fontSize(60)
				.fontWeight(400)
				.style22()
				.width(900)
			Text('hello world')
				.cardStyle(600, '#eeeeee')
		}
	}
}