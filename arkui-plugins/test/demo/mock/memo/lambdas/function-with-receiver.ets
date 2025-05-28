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

import { memo } from "@ohos.arkui.stateManagement"

class B {
	@memo internal_call(): B {
		this.foo1('morning');
    	return this.foo2('afternoon')
	}
}

@memo function foo1(this: B, str: string): void {
  console.log('Good', str);
}

@memo function foo2(this: B, str: string): this {
  console.log('Good', str);
  return this;
}
